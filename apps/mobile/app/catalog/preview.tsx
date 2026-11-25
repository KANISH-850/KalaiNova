import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function CatalogPreviewScreen() {
  const { catalogJson, transcript, imageUrl } = useLocalSearchParams<{
    catalogJson?: string;
    transcript?: string;
    imageUrl?: string;
  }>();
  const router = useRouter();
  const parsed = catalogJson ? JSON.parse(catalogJson) : {};

  const [titleEn, setTitleEn] = useState(parsed.title_en || "Handcrafted Artisan Product");
  const [descEn, setDescEn] = useState(parsed.description_en || "");
  const [titleHi, setTitleHi] = useState(parsed.title_hi || "");
  const [descHi, setDescHi] = useState(parsed.description_hi || "");
  const [price, setPrice] = useState("1500");

  const saveProduct = async () => {
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
      Alert.alert("Saved", "Product added to your KalaiNova catalogue!");
      router.replace({ pathname: "/pricing", params: { productId: String(res.data.id) } });
    } catch (err: any) {
      Alert.alert("Save Failed", err?.response?.data?.detail || err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.deepNavy }}>AI Catalogue Preview</Text>
        <TouchableOpacity onPress={() => Speech.speak(`${titleEn}. ${descEn}`)} style={{ backgroundColor: COLORS.teal, padding: 10, borderRadius: 10 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Read Aloud</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ fontWeight: "700", marginBottom: 4 }}>English Title</Text>
      <TextInput value={titleEn} onChangeText={setTitleEn} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 4 }}>English Description</Text>
      <TextInput value={descEn} onChangeText={setDescEn} multiline style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 4 }}>Hindi Title (हिन्दी)</Text>
      <TextInput value={titleHi} onChangeText={setTitleHi} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 4 }}>Hindi Description</Text>
      <TextInput value={descHi} onChangeText={setDescHi} multiline style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 4 }}>Initial Selling Price (₹)</Text>
      <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 18 }} />

      <TouchableOpacity onPress={saveProduct} style={{ backgroundColor: COLORS.artisanOrange, padding: 16, borderRadius: 14, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Save & Get AI Price Recommendation</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
