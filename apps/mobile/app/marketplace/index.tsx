import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function MarketplaceScreen() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    api.get("/marketplace/products").then((r) => setProducts(r.data)).catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      {products.map((p) => (
        <View key={p.id} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: "800", fontSize: 16, color: COLORS.deepNavy }}>{p.title}</Text>
          <Text style={{ color: COLORS.mutedText, fontSize: 12 }}>{p.artisan_name} • {p.artisan_location}</Text>
          <Text style={{ color: COLORS.teal, fontWeight: "800", marginTop: 6 }}>₹{p.selling_price.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
