import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api, SERVER_ROOT } from "../../services/api";

export default function BuyerDiscoveryScreen() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);

  const searchProducts = async () => {
    const res = await api.post("/marketplace/match-buyers", { query: query || undefined, top_k: 15 });
    setProducts(res.data);
  };

  useEffect(() => {
    searchProducts();
  }, []);

  const sendEnquiry = async (product: any) => {
    try {
      await api.post("/marketplace/enquiries", {
        product_id: product.id,
        quantity: 10,
        message: `Interested in bulk order of 10 units of ${product.title}.`,
      });
      Alert.alert("Enquiry Sent", `Bulk enquiry sent to ${product.artisan_name}!`);
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.detail || "Could not send enquiry");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Semantic search (e.g. Kanchipuram silk saree)"
          style={{ flex: 1, backgroundColor: "#fff", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}
        />
        <TouchableOpacity onPress={searchProducts} style={{ backgroundColor: COLORS.teal, paddingHorizontal: 16, justifyContent: "center", borderRadius: 12 }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Match</Text>
        </TouchableOpacity>
      </View>

      {products.map((p) => (
        <View key={p.id} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border }}>
          {p.primary_image_url && (
            <Image source={{ uri: `${SERVER_ROOT}${p.primary_image_url}` }} style={{ width: "100%", height: 160, borderRadius: 12, marginBottom: 10, backgroundColor: "#eee" }} />
          )}
          <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.deepNavy }}>{p.title}</Text>
          <Text style={{ fontSize: 12, color: COLORS.mutedText, marginTop: 2 }}>{p.artisan_name} • {p.artisan_location} • Match: {(p.match_score * 100).toFixed(0)}%</Text>
          <Text style={{ fontSize: 13, color: COLORS.primaryText, marginTop: 6 }}>{p.description}</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.teal }}>₹{p.selling_price.toLocaleString()}</Text>
            <TouchableOpacity onPress={() => sendEnquiry(p)} style={{ backgroundColor: COLORS.artisanOrange, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10 }}>
              <Text style={{ color: "#fff", fontWeight: "700" }}>Bulk Enquiry (10+)</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
