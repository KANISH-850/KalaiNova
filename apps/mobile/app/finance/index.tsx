import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { BookOpen, FileText, QrCode, ShieldCheck } from "lucide-react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { ListItem } from "../../components/ListItem";
import { Skeleton } from "../../components/Skeleton";
import { SimpleBarChart } from "../../components/SimpleBarChart";

export default function FinancialDashboardScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/finance/dashboard")
      .then((r) => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const revenue = data?.total_revenue ?? 0;
  const expenses = data?.total_expenses ?? 0;
  const profit = data?.net_profit ?? 0;
  const pending = data?.pending_payments ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: PALETTE.bg }}
      contentContainerStyle={{ padding: SPACING.sm, paddingBottom: SPACING.lg }}
    >
      <Header
        title="Money Book"
        subtitle="Track what you earned, spent, and what buyers still owe you."
        speakText={`Earned this month: ${revenue} rupees. Profit: ${profit} rupees. To receive: ${pending} rupees.`}
        language={language}
      />

      {loading ? (
        <Skeleton rows={3} />
      ) : (
        <>
          <Card style={{ marginBottom: SPACING.sm }}>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
              {t(language, "earnedMonth")}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 28, fontWeight: "700", color: PALETTE.primary, marginTop: 4 }}>
              ₹{revenue.toLocaleString()}
            </Text>

            <View style={{ flexDirection: "row", marginTop: SPACING.sm, gap: SPACING.sm }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, color: PALETTE.textSecondary }}>Profit kept</Text>
                <Text style={{ fontSize: 20, fontWeight: "700", color: PALETTE.success }}>₹{profit.toLocaleString()}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, color: PALETTE.textSecondary }}>{t(language, "toReceive")}</Text>
                <Text style={{ fontSize: 20, fontWeight: "700", color: PALETTE.accent }}>₹{pending.toLocaleString()}</Text>
              </View>
            </View>

            <SimpleBarChart
              data={[
                { label: "Earned", value: revenue },
                { label: "Spent", value: expenses },
                { label: "Profit", value: Math.max(0, profit) },
                { label: "Pending", value: pending },
              ]}
            />
          </Card>

          <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border, marginBottom: SPACING.md }}>
            <ListItem
              title="Daily ledger"
              subtitle="Add today's sales or material expenses"
              leftIcon={<BookOpen size={20} strokeWidth={1.75} color={PALETTE.primary} />}
              onPress={() => router.push("/finance/ledger")}
              showChevron
            />
            <ListItem
              title="Bills & receipts (PDF)"
              subtitle="Create a clean bill for your buyer"
              leftIcon={<FileText size={20} strokeWidth={1.75} color={PALETTE.accent} />}
              onPress={() => router.push("/finance/invoices")}
              showChevron
            />
            <ListItem
              title="UPI QR & payments"
              subtitle="Show your QR code and check paid orders"
              leftIcon={<QrCode size={20} strokeWidth={1.75} color={PALETTE.primary} />}
              onPress={() => router.push("/finance/payments")}
              showChevron
            />
            <ListItem
              title="Govt. scheme readiness"
              subtitle="PM Vishwakarma, MUDRA & SHG checklist"
              leftIcon={<ShieldCheck size={20} strokeWidth={1.75} color={PALETTE.success} />}
              onPress={() => router.push("/finance/assistance")}
              showChevron
            />
          </View>

          {(data?.product_profitability || []).length > 0 ? (
            <>
              <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 20, fontWeight: "700", color: PALETTE.text, marginBottom: 8 }}>
                Profit by craft
              </Text>
              <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
                {data.product_profitability.map((p: any, idx: number) => (
                  <ListItem
                    key={idx}
                    title={p.title}
                    subtitle={`${p.units_sold} sold · Sales ₹${p.revenue.toLocaleString()}`}
                    rightText={`₹${p.profit.toLocaleString()}`}
                    rightColor={PALETTE.success}
                  />
                ))}
              </View>
            </>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}
