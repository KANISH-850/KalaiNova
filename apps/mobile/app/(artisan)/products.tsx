import { useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Camera, Package } from "lucide-react-native";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { api, SERVER_ROOT } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function ProductManagementScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/products?mine=true");
      setProducts(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Could not load your crafts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView
        contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {loading ? (
          <Skeleton rows={4} />
        ) : error ? (
          <EmptyState
            icon={<Package size={32} strokeWidth={1.75} color={PALETTE.error} />}
            message={error}
            actionLabel="Try again"
            onAction={load}
          />
        ) : products.length === 0 ? (
          <EmptyState
            icon={<Package size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
            message={t(language, "emptyProducts")}
            actionLabel={t(language, "addProduct")}
            onAction={() => router.push("/catalog/camera")}
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
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.serifFamily,
                      fontSize: 20,
                      fontWeight: "700",
                      color: PALETTE.text,
                    }}
                  >
                    {p.title}
                  </Text>
                  <Text
                    style={{
                      fontFamily: TYPOGRAPHY.sansFamily,
                      fontSize: 16,
                      color: PALETTE.textSecondary,
                      marginTop: 4,
                    }}
                  >
                    {p.category_name} · {p.stock_quantity} in stock
                  </Text>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: SPACING.xs }}>
                    <Text
                      style={{
                        fontFamily: TYPOGRAPHY.serifFamily,
                        fontSize: 22,
                        fontWeight: "700",
                        color: PALETTE.primary,
                      }}
                    >
                      ₹{p.selling_price.toLocaleString()}
                    </Text>
                    <View
                      style={{
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: RADIUS.control,
                        backgroundColor: PALETTE.surfaceAlt,
                      }}
                    >
                      <Text style={{ fontSize: 14, fontWeight: "600", color: PALETTE.textSecondary, textTransform: "capitalize" }}>
                        {p.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button
          title={t(language, "addProduct")}
          variant="primary"
          icon={<Camera size={20} strokeWidth={1.75} color={PALETTE.surface} />}
          onPress={() => router.push("/catalog/camera")}
        />
      </View>
    </View>
  );
}
