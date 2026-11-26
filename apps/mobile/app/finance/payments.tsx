import { useEffect, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { QrCode } from "lucide-react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { ListItem } from "../../components/ListItem";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function PaymentManagementScreen() {
  const { language } = useAuthStore();
  const [qrData, setQrData] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get("/finance/payments/qr").then((r) => setQrData(r.data)).catch(() => {}),
      api.get("/finance/payments").then((r) => setPayments(r.data)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm, paddingBottom: SPACING.lg }}>
      <Header title="UPI & Payments" subtitle="Show this QR code to receive money directly." language={language} />

      {qrData ? (
        <Card style={{ alignItems: "center", marginBottom: SPACING.md }}>
          <Image source={{ uri: qrData.qr_data_url }} style={{ width: 180, height: 180 }} />
          <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "700", color: PALETTE.primary, marginTop: 8 }}>
            {qrData.upi_id}
          </Text>
        </Card>
      ) : null}

      {loading ? (
        <Skeleton rows={3} />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={<QrCode size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message="No payment records yet."
        />
      ) : (
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
          {payments.map((p) => (
            <ListItem
              key={p.id}
              title={`Order #${p.order_id} (${p.payment_method})`}
              subtitle={p.upi_reference ? `Ref: ${p.upi_reference}` : "Waiting for payment"}
              rightText={`₹${p.amount.toLocaleString()}`}
              rightColor={p.status === "paid" ? PALETTE.success : PALETTE.accent}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
