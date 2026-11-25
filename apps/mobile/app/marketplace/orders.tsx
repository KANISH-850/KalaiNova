import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function OrdersScreen() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    api.get("/marketplace/orders").then((r) => setOrders(r.data)).catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      {orders.map((o) => (
        <View key={o.id} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: "800", color: COLORS.deepNavy }}>{o.order_number}</Text>
          <Text style={{ color: COLORS.mutedText, fontSize: 12 }}>Status: {o.status} • Payment: {o.payment_status}</Text>
          <Text style={{ color: COLORS.teal, fontWeight: "800", marginTop: 6 }}>₹{o.total_amount.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
