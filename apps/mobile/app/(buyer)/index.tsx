import { useEffect, useState } from "react";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { Search, Package } from "lucide-react-native";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api, SERVER_ROOT } from "../../services/api";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function BuyerDiscoveryScreen() {
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const searchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.post("/marketplace/match-buyers", { query: query || undefined, top_k: 15 });
      setProducts(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchProducts();
  }, []);

  const sendEnquiry = async (product: any) => {
    try {
      await api.post("/marketplace/enquiries", {
        product_id: product.id,
        quantity: 10,
        message: `Bulk order enquiry for 10 units of ${product.title}.`,
      });
      Alert.alert("Enquiry sent", `Your bulk enquiry has been sent to ${product.artisan_name}.`);
    } catch (err: any) {
      Alert.alert("Could not send", err?.response?.data?.detail || "Please try again.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm, paddingBottom: SPACING.lg }}>
      <View style={{ flexDirection: "row", gap: 8, alignItems: "flex-start", marginBottom: SPACING.sm }}>
        <View style={{ flex: 1 }}>
          <Input
            value={query}
            onChangeText={setQuery}
            placeholder="Search Kanchipuram saree, pottery..."
            style={{ marginBottom: 0 }}
          />
        </View>
        <Button
          title="Find"
          variant="primary"
          icon={<Search size={18} strokeWidth={1.75} color={PALETTE.surface} />}
          onPress={searchProducts}
        />
      </View>

      {loading ? (
        <Skeleton rows={3} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message="No matching crafts found. Try another search."
        />
      ) : (
        <View style={{ gap: SPACING.sm }}>
          {products.map((p) => (
            <Card key={p.id} style={{ padding: 0, overflow: "hidden" }}>
              {p.primary_image_url ? (
                <Image
                  source={{ uri: `${SERVER_ROOT}${p.primary_image_url}` }}
                  style={{ width: "100%", height: 190, backgroundColor: PALETTE.surfaceAlt }}
                  resizeMode="cover"
                />
              ) : null}
              <View style={{ padding: SPACING.sm }}>
                <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 20, fontWeight: "700", color: PALETTE.text }}>
                  {p.title}
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary, marginTop: 2 }}>
                  {p.artisan_name} · {p.artisan_location}
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.text, marginTop: 6 }}>
                  {p.description}
                </Text>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: SPACING.sm }}>
                  <View>
                    <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 22, fontWeight: "700", color: PALETTE.primary }}>
                      ₹{p.selling_price.toLocaleString()}
                    </Text>
                    <Text style={{ fontSize: 14, color: PALETTE.success, fontWeight: "600" }}>
                      {Math.round((p.match_score || 0.8) * 100)}% match
                    </Text>
                  </View>
                  <Button
                    title="Bulk enquiry (10+)"
                    variant="accent"
                    onPress={() => sendEnquiry(p)}
                    style={{ borderRadius: RADIUS.control }}
                  />
                </View>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
