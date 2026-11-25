from datetime import datetime, timedelta, timezone
from pathlib import Path
from PIL import Image, ImageDraw
from sqlalchemy.orm import Session

from app.core.config import STORAGE_DIR
from app.core.security import encrypt_sensitive, get_password_hash, mask_account_number
from app.models import (
    ArtisanProfile,
    BuyerEnquiry,
    BuyerProfile,
    Expense,
    FinancialLedger,
    ModelMetadata,
    Notification,
    Order,
    OrderItem,
    PaymentRecord,
    Product,
    ProductCategory,
    ProductImage,
    ProductTranslation,
    SHGGroup,
    Transaction,
    User,
)


def _ensure_demo_image(filename: str, bg_color: tuple, accent_color: tuple, label: str) -> str:
    path = STORAGE_DIR / "uploads" / filename
    if not path.exists():
        img = Image.new("RGB", (600, 600), bg_color)
        draw = ImageDraw.Draw(img)
        # Draw a clean studio-style craft card illustration
        draw.rectangle([40, 40, 560, 560], outline=accent_color, width=6)
        draw.ellipse([150, 130, 450, 430], fill=accent_color)
        draw.text((180, 470), label, fill=(28, 39, 54))
        img.save(path, format="PNG")
    return f"/storage/uploads/{filename}"


def seed_database(db: Session) -> None:
    if db.query(User).first() is not None:
        return

    now = datetime.now(timezone.utc)

    # 1. Categories
    categories_data = [
        ("Handloom & Textiles", "handloom-textiles", "Traditional handwoven sarees, dupattas, and fabrics", "shirt"),
        ("Folk Paintings", "folk-paintings", "Madhubani, Warli, Tanjore, and Pattachitra art", "palette"),
        ("Terracotta & Pottery", "terracotta-pottery", "Handcrafted clay lamps, vessels, and sculptures", "flame"),
        ("Handmade Jewellery", "handmade-jewellery", "Temple, terracotta, beaded, and silver jewellery", "sparkles"),
        ("Bamboo & Cane Craft", "bamboo-cane", "Eco-friendly woven baskets, trays, and home decor", "leaf"),
    ]
    cat_map = {}
    for name, slug, desc, icon in categories_data:
        c = ProductCategory(name=name, slug=slug, description=desc, icon_name=icon)
        db.add(c)
        db.flush()
        cat_map[name] = c.id

    # 2. SHG Groups
    shg1 = SHGGroup(
        name="Kanchipuram Magalir Handloom SHG",
        registration_number="TN-SHG-2021-0482",
        district="Kanchipuram",
        state="Tamil Nadu",
        member_count=18,
        focus_craft="Handloom & Textiles",
        is_verified=True,
        is_demo=True,
    )
    shg2 = SHGGroup(
        name="Mithila Kala Women Cooperative",
        registration_number="BR-COOP-2020-0119",
        district="Madhubani",
        state="Bihar",
        member_count=24,
        focus_craft="Folk Paintings",
        is_verified=True,
        is_demo=True,
    )
    db.add_all([shg1, shg2])
    db.flush()

    # 3. Demo Users + Artisans
    demo_pw = get_password_hash("Kalai@123")
    artisans_spec = [
        {
            "email": "kavitha.weaver@kalainova.demo",
            "phone": "+919840100001",
            "full_name": "Kavitha Sundaram",
            "lang": "ta",
            "craft": "Handloom & Textiles",
            "btype": "SHG",
            "shg_id": shg1.id,
            "exp": 14,
            "loc": "Kanchipuram, Tamil Nadu",
            "district": "Kanchipuram",
            "state": "Tamil Nadu",
            "upi": "kavitha.silk@okaxis",
            "acct": "319845001234",
            "ifsc": "IDIB000K012",
            "bank": "Indian Bank",
            "bio": "Third-generation Kanchipuram pure mulberry silk weaver specializing in traditional korvai zari borders.",
        },
        {
            "email": "sunita.madhubani@kalainova.demo",
            "phone": "+919840100002",
            "full_name": "Sunita Devi",
            "lang": "hi",
            "craft": "Folk Paintings",
            "btype": "Cooperative",
            "shg_id": shg2.id,
            "exp": 11,
            "loc": "Madhubani, Bihar",
            "district": "Madhubani",
            "state": "Bihar",
            "upi": "sunitadevi.art@sbi",
            "acct": "204512349876",
            "ifsc": "SBIN0001245",
            "bank": "State Bank of India",
            "bio": "Mithila artist creating natural-pigment Madhubani paintings on handmade paper and tussar silk.",
        },
        {
            "email": "murugan.terracotta@kalainova.demo",
            "phone": "+919840100003",
            "full_name": "Murugan Velan",
            "lang": "ta",
            "craft": "Terracotta & Pottery",
            "btype": "Individual Artisan",
            "shg_id": None,
            "exp": 19,
            "loc": "Manamadurai, Tamil Nadu",
            "district": "Sivaganga",
            "state": "Tamil Nadu",
            "upi": "murugan.clay@ybl",
            "acct": "601234987654",
            "ifsc": "IOBA0000456",
            "bank": "Indian Overseas Bank",
            "bio": "Traditional potter crafting kiln-fired terracotta lamps, water pots, and festive diyas.",
        },
        {
            "email": "lakshmi.jewels@kalainova.demo",
            "phone": "+919840100004",
            "full_name": "Lakshmi Narayanan",
            "lang": "te",
            "craft": "Handmade Jewellery",
            "btype": "Individual Artisan",
            "shg_id": None,
            "exp": 8,
            "loc": "Kondapalli, Andhra Pradesh",
            "district": "NTR",
            "state": "Andhra Pradesh",
            "upi": "lakshmi.jewels@okicici",
            "acct": "445566778899",
            "ifsc": "ICIC0001122",
            "bank": "ICICI Bank",
            "bio": "Artisan crafting hand-painted terracotta and brass-filigree temple jewellery.",
        },
        {
            "email": "bimala.bamboo@kalainova.demo",
            "phone": "+919840100005",
            "full_name": "Bimala Das",
            "lang": "en",
            "craft": "Bamboo & Cane Craft",
            "btype": "SHG",
            "shg_id": None,
            "exp": 12,
            "loc": "Barpeta, Assam",
            "district": "Barpeta",
            "state": "Assam",
            "upi": "bimala.bamboo@paytm",
            "acct": "778899001122",
            "ifsc": "PUNB0123400",
            "bank": "Punjab National Bank",
            "bio": "Eco-craft weaver producing durable split-bamboo storage baskets and decorative trays.",
        },
    ]

    artisan_profiles = []
    for spec in artisans_spec:
        u = User(
            email=spec["email"],
            phone=spec["phone"],
            password_hash=demo_pw,
            full_name=spec["full_name"],
            role="artisan",
            preferred_language=spec["lang"],
            is_verified=True,
            is_demo=True,
        )
        db.add(u)
        db.flush()
        ap = ArtisanProfile(
            user_id=u.id,
            shg_group_id=spec["shg_id"],
            craft_category=spec["craft"],
            business_type=spec["btype"],
            experience_years=spec["exp"],
            location=spec["loc"],
            district=spec["district"],
            state=spec["state"],
            bio=spec["bio"],
            upi_id=spec["upi"],
            bank_account_encrypted=encrypt_sensitive(spec["acct"]),
            bank_ifsc_encrypted=encrypt_sensitive(spec["ifsc"]),
            bank_name=spec["bank"],
            bank_account_masked=mask_account_number(spec["acct"]),
            is_demo=True,
        )
        db.add(ap)
        db.flush()
        artisan_profiles.append(ap)

    # 4. Demo Buyers & Admin
    buyer_user = User(
        email="ananya.boutique@kalainova.demo",
        phone="+919840200001",
        password_hash=demo_pw,
        full_name="Ananya Krishnan",
        role="buyer",
        preferred_language="en",
        is_verified=True,
        is_demo=True,
    )
    db.add(buyer_user)
    db.flush()
    buyer1 = BuyerProfile(
        user_id=buyer_user.id,
        business_name="Deccan Heritage Boutique",
        buyer_type="Boutique",
        location="Bengaluru, Karnataka",
        preferred_categories="Handloom & Textiles,Handmade Jewellery,Folk Paintings",
        min_order_qty=5,
        max_budget_per_unit=15000,
        gst_number="29AABCU9603R1ZM",
        is_demo=True,
    )
    db.add(buyer1)
    db.flush()

    admin_user = User(
        email="admin@kalainova.demo",
        phone="+919840300001",
        password_hash=demo_pw,
        full_name="KalaiNova Platform Admin",
        role="admin",
        preferred_language="en",
        is_verified=True,
        is_demo=True,
    )
    db.add(admin_user)
    db.flush()

    # 5. Demo Products (5 authentic craft products)
    products_spec = [
        {
            "artisan": artisan_profiles[0],
            "title": "Kanchipuram Pure Silk Saree with Zari Border",
            "category": "Handloom & Textiles",
            "desc": "Handwoven pure mulberry Kanchipuram silk saree featuring traditional temple zari border and rich pallu craftsmanship.",
            "transcript": "இது பாரம்பரிய ஜரிகை வேலைப்பாடு கொண்ட கைத்தறி காஞ்சிபுரம் பட்டுப் புடவை.",
            "lang": "ta",
            "tags": "kanchipuram,silk,saree,handloom,zari,wedding",
            "mat": 3200.0,
            "lab": 2400.0,
            "pack": 150.0,
            "other": 150.0,
            "price": 8500.0,
            "wholesale": 7200.0,
            "stock": 6,
            "complexity": "Heritage",
            "hours": 42.0,
            "dims": "6.2m x 1.15m",
            "img": ("demo_kanchipuram_saree.png", (255, 244, 230), (190, 48, 48), "Kanchipuram Silk"),
            "hi_title": "पारंपरिक ज़री बॉर्डर वाली कांचीपुरम शुद्ध रेशम साड़ी",
            "hi_desc": "पारंपरिक मंदिर ज़री बॉर्डर और समृद्ध पल्लू कारीगरी के साथ हाथ से बुनी शुद्ध शहतूत कांचीपुरम रेशम साड़ी।",
        },
        {
            "artisan": artisan_profiles[1],
            "title": "Madhubani Tree of Life Hand Painting",
            "category": "Folk Paintings",
            "desc": "Authentic Mithila Madhubani painting depicting the Tree of Life using natural mineral and vegetable dyes on handmade paper.",
            "transcript": "यह हस्तनिर्मित कागज पर प्राकृतिक रंगों से बनी मधुबनी जीवन वृक्ष पेंटिंग है।",
            "lang": "hi",
            "tags": "madhubani,mithila,painting,folk-art,handmade-paper",
            "mat": 450.0,
            "lab": 1100.0,
            "pack": 120.0,
            "other": 80.0,
            "price": 2650.0,
            "wholesale": 2100.0,
            "stock": 12,
            "complexity": "High",
            "hours": 18.0,
            "dims": "18in x 24in",
            "img": ("demo_madhubani.png", (255, 248, 239), (229, 138, 66), "Madhubani Art"),
            "hi_title": "मधुबनी जीवन वृक्ष हस्तनिर्मित पेंटिंग",
            "hi_desc": "हस्तनिर्मित कागज पर प्राकृतिक खनिज और वनस्पति रंगों से बनी प्रामाणिक मिथिला मधुबनी पेंटिंग।",
        },
        {
            "artisan": artisan_profiles[2],
            "title": "Handcrafted Manamadurai Terracotta Lamp Set",
            "category": "Terracotta & Pottery",
            "desc": "Eco-friendly kiln-fired terracotta hanging and table lamps sculpted with traditional Tamil motifs.",
            "transcript": "இது களிமண்ணால் செய்யப்பட்ட பாரம்பரிய மண்பாண்ட விளக்கு தொகுப்பு.",
            "lang": "ta",
            "tags": "terracotta,lamp,pottery,diya,eco-friendly,decor",
            "mat": 220.0,
            "lab": 380.0,
            "pack": 90.0,
            "other": 60.0,
            "price": 1150.0,
            "wholesale": 880.0,
            "stock": 35,
            "complexity": "Medium",
            "hours": 6.5,
            "dims": "22cm x 14cm",
            "img": ("demo_terracotta_lamp.png", (250, 240, 232), (176, 82, 48), "Terracotta Lamp"),
            "hi_title": "हस्तनिर्मित मनामदुरै टेराकोटा लैंप सेट",
            "hi_desc": "पारंपरिक तमिल रूपांकनों के साथ भट्टी में पकाया गया पर्यावरण-अनुकूल टेराकोटा लैंप।",
        },
        {
            "artisan": artisan_profiles[3],
            "title": "Hand-Painted Terracotta Temple Necklace Set",
            "category": "Handmade Jewellery",
            "desc": "Lightweight hand-molded and hand-painted terracotta necklace with matching jhumka earrings in antique gold finish.",
            "transcript": "Handmade terracotta temple jewellery set with antique gold finish.",
            "lang": "en",
            "tags": "jewellery,terracotta,necklace,jhumka,handmade",
            "mat": 280.0,
            "lab": 450.0,
            "pack": 50.0,
            "other": 40.0,
            "price": 1350.0,
            "wholesale": 1050.0,
            "stock": 20,
            "complexity": "Medium",
            "hours": 7.0,
            "dims": "Necklace 24cm",
            "img": ("demo_jewellery.png", (255, 248, 240), (22, 140, 136), "Temple Jewellery"),
            "hi_title": "हस्त-चित्रित टेराकोटा मंदिर हार सेट",
            "hi_desc": "एंटीक गोल्ड फिनिश में मैचिंग झुमके के साथ हल्का हाथ से बना टेराकोटा हार सेट।",
        },
        {
            "artisan": artisan_profiles[4],
            "title": "Assam Split-Bamboo Woven Storage Basket",
            "category": "Bamboo & Cane Craft",
            "desc": "Sturdy handwoven split-bamboo multipurpose basket treated naturally for durability and home organization.",
            "transcript": "Handwoven Assam split-bamboo storage basket for home decor.",
            "lang": "en",
            "tags": "bamboo,basket,eco-friendly,assam,woven",
            "mat": 180.0,
            "lab": 320.0,
            "pack": 60.0,
            "other": 40.0,
            "price": 920.0,
            "wholesale": 720.0,
            "stock": 40,
            "complexity": "Medium",
            "hours": 5.0,
            "dims": "32cm x 28cm",
            "img": ("demo_bamboo_basket.png", (244, 249, 244), (46, 125, 80), "Bamboo Basket"),
            "hi_title": "असम स्प्लिट-बांस बुनी हुई भंडारण टोकरी",
            "hi_desc": "मजबूती और घरेलू सजावट के लिए प्राकृतिक रूप से उपचारित हाथ से बुनी बांस की टोकरी।",
        },
    ]

    created_products = []
    for p in products_spec:
        prod = Product(
            artisan_id=p["artisan"].id,
            category_id=cat_map[p["category"]],
            title=p["title"],
            category_name=p["category"],
            description=p["desc"],
            original_transcript=p["transcript"],
            source_language=p["lang"],
            tags=p["tags"],
            material_cost=p["mat"],
            labour_cost=p["lab"],
            packaging_cost=p["pack"],
            other_cost=p["other"],
            selling_price=p["price"],
            wholesale_price=p["wholesale"],
            stock_quantity=p["stock"],
            craft_complexity=p["complexity"],
            production_hours=p["hours"],
            dimensions=p["dims"],
            status="approved",
            is_demo=True,
        )
        db.add(prod)
        db.flush()
        img_url = _ensure_demo_image(*p["img"])
        db.add(ProductImage(product_id=prod.id, original_url=img_url, enhanced_url=img_url, is_primary=True))
        db.add(
            ProductTranslation(
                product_id=prod.id,
                language_code="en",
                title=p["title"],
                description=p["desc"],
                keywords=p["tags"],
            )
        )
        db.add(
            ProductTranslation(
                product_id=prod.id,
                language_code="hi",
                title=p["hi_title"],
                description=p["hi_desc"],
                keywords=p["tags"],
            )
        )
        created_products.append(prod)

    # 6. Sample Orders, Enquiries, Financial Ledger, Transactions, Expenses
    order1 = Order(
        order_number="KN-ORD-2026-1001",
        buyer_id=buyer1.id,
        artisan_id=artisan_profiles[0].id,
        total_amount=17000.0,
        status="delivered",
        payment_status="paid",
        shipping_address="Indiranagar, Bengaluru, Karnataka 560038",
        is_demo=True,
        created_at=now - timedelta(days=6),
    )
    db.add(order1)
    db.flush()
    db.add(
        OrderItem(
            order_id=order1.id,
            product_id=created_products[0].id,
            product_title=created_products[0].title,
            quantity=2,
            unit_price=8500.0,
            line_total=17000.0,
        )
    )

    order2 = Order(
        order_number="KN-ORD-2026-1002",
        buyer_id=buyer1.id,
        artisan_id=artisan_profiles[0].id,
        total_amount=8500.0,
        status="confirmed",
        payment_status="pending",
        shipping_address="Indiranagar, Bengaluru, Karnataka 560038",
        is_demo=True,
        created_at=now - timedelta(days=2),
    )
    db.add(order2)
    db.flush()
    db.add(
        OrderItem(
            order_id=order2.id,
            product_id=created_products[0].id,
            product_title=created_products[0].title,
            quantity=1,
            unit_price=8500.0,
            line_total=8500.0,
        )
    )

    db.add(
        PaymentRecord(
            order_id=order1.id,
            artisan_id=artisan_profiles[0].id,
            amount=17000.0,
            payment_method="UPI",
            upi_reference="UPI-4321987654",
            status="paid",
            paid_at=now - timedelta(days=5),
            is_demo=True,
        )
    )
    db.add(
        PaymentRecord(
            order_id=order2.id,
            artisan_id=artisan_profiles[0].id,
            amount=8500.0,
            payment_method="UPI",
            status="pending",
            is_demo=True,
        )
    )

    db.add(
        Transaction(
            artisan_id=artisan_profiles[0].id,
            order_id=order1.id,
            tx_type="income",
            category="Product Sale",
            amount=17000.0,
            description="Sale of 2 Kanchipuram Pure Silk Sarees",
            reference_id="UPI-4321987654",
            status="completed",
            is_demo=True,
            tx_date=now - timedelta(days=5),
        )
    )
    db.add(
        Expense(
            artisan_id=artisan_profiles[0].id,
            product_id=created_products[0].id,
            category="raw_material",
            amount=6400.0,
            notes="Pure mulberry silk yarn and zari thread batch",
            expense_date=now - timedelta(days=10),
            is_demo=True,
        )
    )
    db.add(
        Transaction(
            artisan_id=artisan_profiles[0].id,
            tx_type="expense",
            category="raw_material",
            amount=6400.0,
            description="Pure mulberry silk yarn and zari thread batch",
            status="completed",
            is_demo=True,
            tx_date=now - timedelta(days=10),
        )
    )
    db.add_all([
        FinancialLedger(
            artisan_id=artisan_profiles[0].id,
            entry_type="debit",
            category="raw_material",
            amount=6400.0,
            balance_after=-6400.0,
            reference_type="expense",
            narration="Mulberry silk & zari procurement",
            entry_date=now - timedelta(days=10),
            is_demo=True,
        ),
        FinancialLedger(
            artisan_id=artisan_profiles[0].id,
            entry_type="credit",
            category="Product Sale",
            amount=17000.0,
            balance_after=10600.0,
            reference_type="order",
            reference_id=order1.id,
            narration="Order KN-ORD-2026-1001 payment received via UPI",
            entry_date=now - timedelta(days=5),
            is_demo=True,
        ),
    ])

    db.add(
        BuyerEnquiry(
            buyer_id=buyer1.id,
            artisan_id=artisan_profiles[0].id,
            product_id=created_products[0].id,
            quantity=10,
            offered_price_per_unit=7400.0,
            message="Interested in 10 Kanchipuram sarees for festive boutique collection.",
            match_score=0.92,
            status="pending",
            is_demo=True,
        )
    )

    db.add(
        Notification(
            user_id=artisan_profiles[0].user_id,
            title="New Bulk Enquiry Received",
            message="Deccan Heritage Boutique enquired about 10 units of Kanchipuram Pure Silk Saree.",
            notif_type="enquiry",
        )
    )

    # 7. Initial AI Model Registry
    models_spec = [
        ("BiRefNet", "1.0", "ZhengPeng7/BiRefNet_lite", "MIT", "Background Removal", "RGB Image (PNG/JPEG)", "RGBA Cutout PNG", "CPU or CUDA GPU (~2GB VRAM)", "ready"),
        ("OpenCV-Studio", "4.10", "OpenCV Image Processing", "Apache-2.0", "Lighting, Sharpness & Contrast Enhancement", "RGB Image", "Enhanced RGB Image", "CPU", "ready"),
        ("IndicConformer", "600M", "ai4bharat/indic-conformer-600m-multilingual", "MIT", "Multilingual Indian ASR", "WAV/Audio 16kHz", "Regional Text Transcript", "GPU/CPU + HF Token", "adapter_configured"),
        ("IndicTrans2", "200M", "ai4bharat/indictrans2-indic-en-dist-200M", "MIT", "Indic-to-English/Hindi Translation", "Regional Text", "Translated Text", "GPU/CPU", "adapter_configured"),
        ("Multilingual-LLM", "Configurable", "OpenAI / Gemini / HF via ENV", "Provider License", "Structured Catalogue Generation", "Transcript + Craft Context", "Title, EN/HI Descriptions, Tags", "API / Local", "adapter_configured"),
        ("Pricing-XGBoost-CatBoost", "1.0", "Trained on KalaiNova Craft Pricing Dataset", "MIT", "Dynamic Craft Price Prediction", "10 Engineered Features", "Recommended, Wholesale, Retail & Margin", "CPU", "ready"),
        ("SentenceTransformer-MiniLM", "L6-v2", "sentence-transformers/all-MiniLM-L6-v2", "Apache-2.0", "Semantic Buyer-Product Matching", "Text Query & Product Corpus", "384-d Embeddings + Cosine Score", "CPU", "ready"),
    ]
    for name, ver, src, lic, task, inp, outp, hw, status in models_spec:
        db.add(
            ModelMetadata(
                model_name=name,
                model_version=ver,
                source=src,
                license=lic,
                task=task,
                input_format=inp,
                output_format=outp,
                hardware_requirements=hw,
                loading_status=status,
            )
        )

    db.commit()
