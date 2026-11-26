import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PALETTE, SPACING } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { StepIndicator } from "../../components/StepIndicator";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function CatalogPreviewScreen() {
  const { catalogJson, transcript, imageUrl } = useLocalSearchParams<{
    catalogJson?: string;
    transcript?: string;
    imageUrl?: string;
  }>();
  const router = useRouter();
  const { language } = useAuthStore();
  const parsed = catalogJson ? JSON.parse(catalogJson) : {};

  const [titleEn, setTitleEn] = useState(parsed.title_en || "Handwoven Kanchipuram Silk Saree");
  const [descEn, setDescEn] = useState(parsed.description_en || "");
  const [titleHi, setTitleHi] = useState(parsed.title_hi || "");
  const [descHi, setDescHi] = useState(parsed.description_hi || "");
  const [price, setPrice] = useState("8500");
  const [saving, setSaving] = useState(false);

  const saveProduct = async () => {
    setSaving(true);
    try {
      const res = await api.post("/products", {
        title: titleEn,
        category_name: parsed.suggested_category || "Handloom & Textiles",
        description: descEn,
        original_transcript: transcript,
        tags: parsed.keywords || "handmade,artisan",
        selling_price: parseFloat(price || "1500"),
        image_url: imageUrl || undefined,
        enhanced_image_url: imageUrl || undefined,
        translations: [
          { language_code: "en", title: titleEn, description: descEn, keywords: parsed.keywords },
          { language_code: "hi", title: titleHi, description: descHi, keywords: parsed.keywords },
        ],
      });
      Alert.alert("Saved", "Your craft is now in your shop.");
      router.replace({ pathname: "/pricing", params: { productId: String(res.data.id) } });
    } catch (err: any) {
      Alert.alert("Could not save", err?.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <StepIndicator currentStep={5} language={language} />
        <Header
          title="Review and save craft"
          subtitle="Check the title and description before saving to your shop."
          speakText={`${titleEn}. ${descEn}`}
          language={language}
        />

        <Input label="Product name (English)" value={titleEn} onChangeText={setTitleEn} />
        <Input label="Description (English)" value={descEn} onChangeText={setDescEn} multiline style={{ minHeight: 84, textAlignVertical: "top" }} />
        <Input label="Product name (Hindi)" value={titleHi} onChangeText={setTitleHi} />
        <Input label="Description (Hindi)" value={descHi} onChangeText={setDescHi} multiline style={{ minHeight: 84, textAlignVertical: "top" }} />
        <Input label="Starting price (₹)" value={price} onChangeText={setPrice} keyboardType="numeric" />
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button title="Save & check fair price" variant="primary" loading={saving} onPress={saveProduct} />
      </View>
    </View>
  );
}
