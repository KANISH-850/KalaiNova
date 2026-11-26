import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { ClipboardList } from "lucide-react-native";
import { PALETTE, SPACING } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { ListItem } from "../../components/ListItem";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function ArtisanOrdersTab() {
  const { language } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/marketplace/orders")
      .then((r) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: PALETTE.bg }}
      contentContainerStyle={{ padding: SPACING.sm }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {loading ? (
        <Skeleton rows={4} />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message={t(language, "emptyOrders")}
        />
      ) : (
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
          {orders.map((o) => (
            <ListItem
              key={o.id}
              title={o.order_number}
              subtitle={`${o.buyer_name || "Buyer"} · ${o.status} · Payment: ${o.payment_status}`}
              rightText={`₹${o.total_amount.toLocaleString()}`}
              rightColor={o.payment_status === "paid" ? PALETTE.success : PALETTE.accent}
              leftIcon={<ClipboardList size={20} strokeWidth={1.75} color={PALETTE.primary} />}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
