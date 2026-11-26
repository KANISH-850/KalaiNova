import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { Package } from "lucide-react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api, SERVER_ROOT } from "../../services/api";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function MarketplaceScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/marketplace/products")
      .then((r) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm }}>
      {loading ? (
        <Skeleton rows={3} />
      ) : products.length === 0 ? (
        <EmptyState
          icon={<Package size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message="No crafts listed in the market yet."
        />
      ) : (
        <View style={{ gap: SPACING.sm }}>
          {products.map((p) => (
            <Card key={p.id} style={{ padding: 0, overflow: "hidden" }}>
              {p.primary_image_url ? (
                <Image source={{ uri: `${SERVER_ROOT}${p.primary_image_url}` }} style={{ width: "100%", height: 180, backgroundColor: PALETTE.surfaceAlt }} />
              ) : null}
              <View style={{ padding: SPACING.sm }}>
                <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 20, fontWeight: "700", color: PALETTE.text }}>
                  {p.title}
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary, marginTop: 2 }}>
                  {p.artisan_name} · {p.artisan_location}
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 20, fontWeight: "700", color: PALETTE.primary, marginTop: 6 }}>
                  ₹{p.selling_price.toLocaleString()}
                </Text>
              </View>
            </Card>
          ))}
        </View>
      )}
    </ScrollView>
  );
}
