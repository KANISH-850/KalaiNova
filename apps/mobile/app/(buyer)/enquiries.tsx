import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Briefcase } from "lucide-react-native";
import { PALETTE, SPACING } from "../../constants/theme";
import { api } from "../../services/api";
import { ListItem } from "../../components/ListItem";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function BuyerEnquiriesScreen() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/marketplace/enquiries")
      .then((r) => setEnquiries(r.data))
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
        <Skeleton rows={3} />
      ) : enquiries.length === 0 ? (
        <EmptyState
          icon={<Briefcase size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message="No bulk enquiries sent yet."
        />
      ) : (
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
          {enquiries.map((e) => (
            <ListItem
              key={e.id}
              title={`Qty: ${e.quantity} units`}
              subtitle={e.message}
              rightText={e.status}
              rightColor={e.status === "accepted" ? PALETTE.success : PALETTE.primary}
              leftIcon={<Briefcase size={20} strokeWidth={1.75} color={PALETTE.accent} />}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
