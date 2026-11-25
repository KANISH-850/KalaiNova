import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function FinancialDashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get("/finance/dashboard").then((r) => setData(r.data)).catch(() => {});
  }, []);

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      <View style={{ backgroundColor: COLORS.deepNavy, padding: 18, borderRadius: 16, marginBottom: 16 }}>
        <Text style={{ color: "#CBD5E1", fontSize: 13 }}>Gross / Net Profit</Text>
        <Text style={{ color: "#4ADE80", fontSize: 30, fontWeight: "800", marginTop: 4 }}>
          ₹{(data?.net_profit ?? 0).toLocaleString()}
        </Text>
        <Text style={{ color: COLORS.warmCream, marginTop: 6 }}>
          Revenue: ₹{(data?.total_revenue ?? 0).toLocaleString()} • Expenses: ₹{(data?.total_expenses ?? 0).toLocaleString()} • Margin: {data?.profit_margin_pct ?? 0}%
        </Text>
        <Text style={{ color: "#FBBF24", marginTop: 4 }}>
          Pending Payments: ₹{(data?.pending_payments ?? 0).toLocaleString()}
        </Text>
      </View>

      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
        {[
          { label: "Digital Ledger", route: "/finance/ledger" },
          { label: "Invoice PDF", route: "/finance/invoices" },
          { label: "UPI QR & Pay", route: "/finance/payments" },
          { label: "Scheme Readiness", route: "/finance/assistance" },
        ].map((btn) => (
          <TouchableOpacity
            key={btn.label}
            onPress={() => router.push(btn.route as any)}
            style={{ width: "48%", backgroundColor: COLORS.teal, padding: 14, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "700" }}>{btn.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={{ fontSize: 17, fontWeight: "800", marginBottom: 10 }}>Product Profitability</Text>
      {(data?.product_profitability || []).map((p: any, idx: number) => (
        <View key={idx} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: "700" }}>{p.title}</Text>
          <Text style={{ color: COLORS.mutedText, fontSize: 12 }}>Units: {p.units_sold} • Revenue: ₹{p.revenue.toLocaleString()}</Text>
          <Text style={{ color: COLORS.teal, fontWeight: "800", marginTop: 4 }}>Profit: ₹{p.profit.toLocaleString()}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
