import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function FinancialAssistanceScreen() {
  const [report, setReport] = useState<any>(null);

  useEffect(() => {
    api.get("/finance/reports").then((r) => setReport(r.data)).catch(() => {});
  }, []);

  if (!report) {
    return <Text style={{ padding: 20 }}>Loading readiness report...</Text>;
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      <View style={{ backgroundColor: COLORS.deepNavy, padding: 18, borderRadius: 16, marginBottom: 16 }}>
        <Text style={{ color: "#CBD5E1", fontSize: 13 }}>Financial Readiness Score</Text>
        <Text style={{ color: "#4ADE80", fontSize: 32, fontWeight: "800" }}>{report.readiness_score} / 100</Text>
        <Text style={{ color: "#CBD5E1", fontSize: 12, marginTop: 6 }}>{report.notice}</Text>
      </View>

      <Text style={{ fontSize: 17, fontWeight: "800", marginBottom: 8 }}>Document Checklist</Text>
      {report.document_checklist.map((d: any, i: number) => (
        <View key={i} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, marginBottom: 6, flexDirection: "row", justifyContent: "space-between", borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ flex: 1 }}>{d.document}</Text>
          <Text style={{ fontWeight: "700", color: d.ready ? COLORS.success : COLORS.danger }}>{d.ready ? "READY" : "MISSING"}</Text>
        </View>
      ))}

      <Text style={{ fontSize: 17, fontWeight: "800", marginTop: 14, marginBottom: 8 }}>Government Scheme Pre-Screening</Text>
      {report.eligible_schemes.map((s: any, i: number) => (
        <View key={i} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 10, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: "800", color: COLORS.deepNavy }}>{s.scheme_name}</Text>
          <Text style={{ color: COLORS.teal, fontWeight: "700", fontSize: 12, marginVertical: 4 }}>{s.eligibility_status}</Text>
          <Text style={{ fontSize: 13 }}>{s.benefits}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
