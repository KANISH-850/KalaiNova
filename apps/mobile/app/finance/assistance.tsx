import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { CheckCircle2, AlertCircle } from "lucide-react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { ListItem } from "../../components/ListItem";
import { Skeleton } from "../../components/Skeleton";

export default function FinancialAssistanceScreen() {
  const { language } = useAuthStore();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/finance/reports")
      .then((r) => setReport(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm, paddingBottom: SPACING.lg }}>
      <Header
        title="Government Schemes"
        subtitle="Check your documents and see which artisan support schemes fit your shop."
        speakText={report ? `Your readiness score is ${report.readiness_score} out of 100.` : undefined}
        language={language}
      />

      {loading || !report ? (
        <Skeleton rows={4} />
      ) : (
        <>
          <Card style={{ marginBottom: SPACING.md }}>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
              Readiness score
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 28, fontWeight: "700", color: PALETTE.success, marginTop: 4 }}>
              {report.readiness_score} / 100
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary, marginTop: 6 }}>
              {report.notice}
            </Text>
          </Card>

          <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 20, fontWeight: "700", color: PALETTE.text, marginBottom: 8 }}>
            Document checklist
          </Text>
          <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border, marginBottom: SPACING.md }}>
            {report.document_checklist.map((d: any, i: number) => (
              <ListItem
                key={i}
                title={d.document}
                rightText={d.ready ? "Ready" : "Missing"}
                rightColor={d.ready ? PALETTE.success : PALETTE.error}
                leftIcon={
                  d.ready ? (
                    <CheckCircle2 size={20} strokeWidth={1.75} color={PALETTE.success} />
                  ) : (
                    <AlertCircle size={20} strokeWidth={1.75} color={PALETTE.error} />
                  )
                }
              />
            ))}
          </View>

          <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 20, fontWeight: "700", color: PALETTE.text, marginBottom: 8 }}>
            Schemes for artisans
          </Text>
          <View style={{ gap: SPACING.xs }}>
            {report.eligible_schemes.map((s: any, i: number) => (
              <Card key={i}>
                <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 18, fontWeight: "700", color: PALETTE.text }}>
                  {s.scheme_name}
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: PALETTE.primary, marginVertical: 4 }}>
                  {s.eligibility_status}
                </Text>
                <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
                  {s.benefits}
                </Text>
              </Card>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
