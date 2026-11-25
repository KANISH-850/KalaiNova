import json
from sqlalchemy.orm import Session

from ai.catalog.llm_cataloguer import generate_multilingual_catalog
from ai.matching.semantic_matcher import score_products_for_buyer
from ai.pricing.predictor import predict_craft_price
from app.models import AIAgentAction, AIConversation, ArtisanProfile, BuyerProfile, Product, User
from app.services.finance_service import compute_artisan_financial_summary


async def run_agent(
    db: Session,
    user: User,
    agent_type: str,
    message: str,
    product_id: int | None = None,
    confirm_action_id: int | None = None,
) -> dict:
    artisan = db.query(ArtisanProfile).filter(ArtisanProfile.user_id == user.id).first()

    # Handle confirmation of a pending mutating action
    if confirm_action_id is not None:
        action = db.query(AIAgentAction).filter(
            AIAgentAction.id == confirm_action_id,
            AIAgentAction.user_id == user.id,
        ).first()
        if not action:
            return {"error": "Pending action not found", "status": "not_found"}
        if not action.executed:
            payload = json.loads(action.payload_json)
            if action.action_name == "update_product_price" and payload.get("product_id"):
                prod = db.query(Product).filter(Product.id == payload["product_id"]).first()
                if prod and artisan and prod.artisan_id == artisan.id:
                    prod.selling_price = float(payload["new_price"])
                    db.commit()
            action.confirmed = True
            action.executed = True
            action.result_json = json.dumps({"status": "executed", **payload})
            db.commit()
        return {
            "agent_type": action.agent_type,
            "response": f"Confirmed and executed action '{action.action_name}'.",
            "executed_action": json.loads(action.result_json),
            "requires_confirmation": False,
        }

    response_text = ""
    tool_data = {}
    pending_action = None

    if agent_type == "catalog":
        cat = artisan.craft_category if artisan else "Handicrafts"
        loc = artisan.location if artisan else "India"
        catalog_out = await generate_multilingual_catalog(
            transcript=message,
            source_language=user.preferred_language,
            craft_category=cat,
            artisan_location=loc,
        )
        tool_data = catalog_out
        missing = []
        if not product_id:
            missing.append("Product image & cost breakdown for dynamic pricing")
        response_text = (
            f"Generated catalogue draft: '{catalog_out['title_en']}' (Category: {catalog_out['suggested_category']}). "
            f"Hindi title: '{catalog_out['title_hi']}'. Tags: {', '.join(catalog_out['tags'])}."
        )
        if missing:
            response_text += f" Missing info: {', '.join(missing)}."

    elif agent_type == "pricing":
        prod = db.query(Product).filter(Product.id == product_id).first() if product_id else None
        if not prod and artisan:
            prod = db.query(Product).filter(Product.artisan_id == artisan.id).first()
        if not prod:
            response_text = "No product found to price. Please create a product or pass a product_id."
        else:
            pred = predict_craft_price({
                "category_name": prod.category_name,
                "craft_complexity": prod.craft_complexity,
                "material_cost": prod.material_cost,
                "labour_cost": prod.labour_cost,
                "packaging_cost": prod.packaging_cost,
                "other_cost": prod.other_cost,
                "production_hours": prod.production_hours,
                "desired_margin_pct": 30.0,
            })
            tool_data = {"product_id": prod.id, "product_title": prod.title, **pred}
            response_text = (
                f"For '{prod.title}' (current price ₹{prod.selling_price:,.0f}), our XGBoost+CatBoost model "
                f"recommends ₹{pred['recommended_price']:,.0f} (wholesale ₹{pred['wholesale_price']:,.0f}, "
                f"profit margin {pred['profit_margin_pct']}%). Confirm below if you want to update the product price."
            )
            action = AIAgentAction(
                user_id=user.id,
                agent_type="pricing",
                action_name="update_product_price",
                payload_json=json.dumps({"product_id": prod.id, "new_price": pred["recommended_price"]}),
                requires_confirmation=True,
            )
            db.add(action)
            db.flush()
            pending_action = {"action_id": action.id, "action_name": action.action_name, "new_price": pred["recommended_price"]}

    elif agent_type == "finance":
        if not artisan:
            response_text = "Financial records are available for registered artisan profiles."
        else:
            summary = compute_artisan_financial_summary(db, artisan.id)
            tool_data = summary
            top_prod = summary["product_profitability"][0] if summary["product_profitability"] else None
            q = message.lower()
            if "highest profit" in q or "top product" in q or "which" in q:
                if top_prod:
                    response_text = (
                        f"Your highest-profit product is '{top_prod['title']}' with ₹{top_prod['profit']:,.2f} "
                        f"profit across {top_prod['units_sold']} units (revenue ₹{top_prod['revenue']:,.2f}). "
                        f"Overall net profit is ₹{summary['net_profit']:,.2f} ({summary['profit_margin_pct']}% margin)."
                    )
                else:
                    response_text = f"Total revenue is ₹{summary['total_revenue']:,.2f} and net profit is ₹{summary['net_profit']:,.2f}. No product sales recorded yet."
            elif "pending" in q:
                response_text = f"You currently have ₹{summary['pending_payments']:,.2f} in pending payments across {summary['total_orders']} orders."
            else:
                response_text = (
                    f"Financial Summary: Revenue ₹{summary['total_revenue']:,.2f}, Expenses ₹{summary['total_expenses']:,.2f}, "
                    f"Net Profit ₹{summary['net_profit']:,.2f} ({summary['profit_margin_pct']}% margin), "
                    f"Pending Payments ₹{summary['pending_payments']:,.2f}."
                )

    elif agent_type == "market-intelligence":
        products = db.query(Product).filter(Product.status == "approved").all()
        buyers = db.query(BuyerProfile).all()
        prod_dicts = [
            {
                "id": p.id,
                "title": p.title,
                "category_name": p.category_name,
                "description": p.description,
                "tags": p.tags or "",
                "selling_price": p.selling_price,
                "stock_quantity": p.stock_quantity,
                "artisan_location": p.artisan.location if p.artisan else "",
            }
            for p in products
        ]
        matched = score_products_for_buyer(prod_dicts, query=message, top_k=5) if prod_dicts else []
        tool_data = {
            "active_buyers_count": len(buyers),
            "buyer_segments": [b.buyer_type for b in buyers],
            "top_matched_products": matched[:3],
        }
        response_text = (
            f"Market Intelligence: {len(buyers)} active institutional/boutique buyers on KalaiNova. "
            f"Top matching craft demand aligns with '{matched[0]['title']}' (score {matched[0]['match_score']})."
            if matched
            else "No approved products available for demand matching yet."
        )

    elif agent_type == "business-growth":
        if not artisan:
            response_text = "Business growth insights require an artisan profile."
        else:
            summary = compute_artisan_financial_summary(db, artisan.id)
            products = db.query(Product).filter(Product.artisan_id == artisan.id).all()
            low_stock = [p.title for p in products if p.stock_quantity <= 5]
            tool_data = {"summary": summary, "total_products": len(products), "low_stock_products": low_stock}
            recs = [
                f"Maintain buffer stock for fast-moving items ({', '.join(low_stock) if low_stock else 'all items stocked'}).",
                f"Target wholesale B2B buyers (Boutiques & Institutional) at 15% bulk discount to increase order volume.",
                f"Current profit margin is {summary['profit_margin_pct']}%; bundle packaging materials to cut unit cost by 8-12%.",
            ]
            tool_data["recommendations"] = recs
            response_text = "Business Growth Plan: " + " ".join(recs)
    else:
        response_text = f"Unknown agent type '{agent_type}'."

    db.add(
        AIConversation(
            user_id=user.id,
            agent_type=agent_type,
            user_message=message,
            assistant_response=response_text,
        )
    )
    db.commit()

    return {
        "agent_type": agent_type,
        "response": response_text,
        "data": tool_data,
        "requires_confirmation": pending_action is not None,
        "pending_action": pending_action,
    }
