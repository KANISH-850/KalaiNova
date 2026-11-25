import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function PaymentManagementScreen() {
  const [qrData, setQrData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    api.get("/finance/payments/qr").then((r) => setQrData(r.data)).catch(() => {});
    api.get("/finance/payments").then((r) => setPayments(r.data)).catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      {qrData && (
        <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 16, alignItems: "center", marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 8 }}>Artisan UPI QR Code</Text>
          <Image source={{ uri: qrData.qr_data_url }} style={{ width: 180, height: 180 }} />
          <Text style={{ marginTop: 8, fontWeight: "700", color: COLORS.teal }}>{qrData.upi_id}</Text>
        </View>
      )}

      <Text style={{ fontSize: 17, fontWeight: "800", marginBottom: 10 }}>Payment Records</Text>
      {payments.map((p) => (
        <View key={p.id} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontWeight: "700" }}>Order #{p.order_id} ({p.payment_method})</Text>
            <Text style={{ fontSize: 12, color: COLORS.mutedText }}>Ref: {p.upi_reference || "Pending"}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontWeight: "800" }}>₹{p.amount.toLocaleString()}</Text>
            <Text style={{ fontSize: 12, color: p.status === "paid" ? COLORS.success : COLORS.artisanOrange, fontWeight: "700" }}>{p.status.toUpperCase()}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
