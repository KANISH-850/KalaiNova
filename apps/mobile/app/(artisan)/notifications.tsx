import { useEffect, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Bell } from "lucide-react-native";
import { PALETTE, SPACING } from "../../constants/theme";
import { api } from "../../services/api";
import { ListItem } from "../../components/ListItem";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function NotificationsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/marketplace/notifications")
      .then((r) => setItems(r.data))
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
      ) : items.length === 0 ? (
        <EmptyState
          icon={<Bell size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message="No new alerts right now. Buyer enquiries will appear here."
        />
      ) : (
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
          {items.map((n) => (
            <ListItem
              key={n.id}
              title={n.title}
              subtitle={n.message}
              leftIcon={<Bell size={20} strokeWidth={1.75} color={PALETTE.accent} />}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
