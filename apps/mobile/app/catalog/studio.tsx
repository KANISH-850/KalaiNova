import { useState } from "react";
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { api, SERVER_ROOT } from "../../services/api";

export default function AIImageStudioScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const processImage = async (removeBg: boolean) => {
    if (!imageUri) {
      Alert.alert("No Image", "Please capture or select an image first.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", { uri: imageUri, name: "product.jpg", type: "image/jpeg" } as any);
      const endpoint = removeBg ? "/ai/image/remove-background" : "/ai/image/enhance";
      const res = await api.post(endpoint, form, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
      if (removeBg && res.data.status === "unavailable") {
        Alert.alert("BiRefNet Notice", res.data.error || "BiRefNet model unavailable; OpenCV enhancement applied.");
      }
    } catch (err: any) {
      Alert.alert("Processing Failed", err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 12 }}>
        AI Image Studio (OpenCV + BiRefNet)
      </Text>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <TouchableOpacity onPress={() => processImage(false)} style={{ flex: 1, backgroundColor: COLORS.deepNavy, padding: 14, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Enhance Lighting</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => processImage(true)} style={{ flex: 1, backgroundColor: COLORS.teal, padding: 14, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Remove Background</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color={COLORS.artisanOrange} style={{ marginVertical: 20 }} />}

      {result && (
        <View style={{ backgroundColor: "#fff", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, gap: 12 }}>
          <Text style={{ fontWeight: "700" }}>Before vs After Comparison</Text>
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.mutedText, marginBottom: 4 }}>Original</Text>
              <Image source={{ uri: `${SERVER_ROOT}${result.original_url}` }} style={{ width: "100%", height: 150, borderRadius: 10 }} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 12, color: COLORS.teal, marginBottom: 4 }}>Processed</Text>
              <Image
                source={{ uri: `${SERVER_ROOT}${result.bg_removed_url || result.enhanced_url}` }}
                style={{ width: "100%", height: 150, borderRadius: 10, backgroundColor: "#F1F5F9" }}
              />
            </View>
          </View>
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/catalog/voice",
                params: { imageUrl: result.bg_removed_url || result.enhanced_url || result.original_url },
              })
            }
            style={{ backgroundColor: COLORS.artisanOrange, padding: 14, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Use Image & Describe Product</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
