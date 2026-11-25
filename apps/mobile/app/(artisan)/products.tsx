import { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { api, SERVER_ROOT } from "../../services/api";

export default function ProductManagementScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    setRefreshing(true);
    try {
      const res = await api.get("/products?mine=true");
      setProducts(res.data);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      contentContainerStyle={{ padding: 18 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={load} />}
    >
      <TouchableOpacity
        onPress={() => router.push("/catalog/voice")}
        style={{ backgroundColor: COLORS.artisanOrange, padding: 15, borderRadius: 12, alignItems: "center", marginBottom: 16 }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>+ Add New Craft via Voice & AI</Text>
      </TouchableOpacity>

      {products.map((p) => (
        <View key={p.id} style={{ backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", gap: 12, borderWidth: 1, borderColor: COLORS.border }}>
          {p.primary_image_url ? (
            <Image source={{ uri: `${SERVER_ROOT}${p.primary_image_url}` }} style={{ width: 76, height: 76, borderRadius: 10, backgroundColor: "#eee" }} />
          ) : null}
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: "700", color: COLORS.primaryText }}>{p.title}</Text>
            <Text style={{ fontSize: 12, color: COLORS.mutedText, marginTop: 2 }}>{p.category_name} • Stock: {p.stock_quantity}</Text>
            <Text style={{ fontSize: 16, fontWeight: "800", color: COLORS.teal, marginTop: 6 }}>₹{p.selling_price.toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
