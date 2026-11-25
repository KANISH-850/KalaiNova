import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function NotificationsScreen() {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    api.get("/marketplace/notifications").then((r) => setItems(r.data)).catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      {items.length === 0 ? (
        <Text style={{ color: COLORS.mutedText, textAlign: "center", marginTop: 40 }}>No notifications yet.</Text>
      ) : (
        items.map((n) => (
          <View key={n.id} style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }}>
            <Text style={{ fontWeight: "700", fontSize: 15, color: COLORS.deepNavy }}>{n.title}</Text>
            <Text style={{ color: COLORS.primaryText, marginTop: 4 }}>{n.message}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
