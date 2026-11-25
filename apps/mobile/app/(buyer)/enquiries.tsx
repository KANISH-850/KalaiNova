import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function BuyerEnquiriesScreen() {
  const [enquiries, setEnquiries] = useState<any[]>([]);

  useEffect(() => {
    api.get("/marketplace/enquiries").then((r) => setEnquiries(r.data)).catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      {enquiries.map((e) => (
        <View key={e.id} style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: "700", color: COLORS.deepNavy }}>Qty: {e.quantity} • Status: {e.status.toUpperCase()}</Text>
          <Text style={{ color: COLORS.primaryText, marginTop: 4 }}>{e.message}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
