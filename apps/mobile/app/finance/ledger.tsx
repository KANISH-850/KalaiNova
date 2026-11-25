import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function DigitalLedgerScreen() {
  const [entries, setEntries] = useState<any[]>([]);
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Product Sale");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");

  const load = () => api.get("/finance/ledger").then((r) => setEntries(r.data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const addEntry = async () => {
    if (!amount) return Alert.alert("Enter amount");
    await api.post("/finance/transactions", {
      tx_type: txType,
      category,
      amount: parseFloat(amount),
      description: desc || category,
    });
    setAmount("");
    setDesc("");
    load();
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 10 }}>Record Daily Entry</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
          {(["income", "expense"] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTxType(t)} style={{ flex: 1, padding: 10, borderRadius: 8, backgroundColor: txType === t ? COLORS.deepNavy : "#F1F5F9", alignItems: "center" }}>
              <Text style={{ color: txType === t ? "#fff" : COLORS.primaryText, fontWeight: "700", textTransform: "capitalize" }}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput value={category} onChangeText={setCategory} placeholder="Category" style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginBottom: 8 }} />
        <TextInput value={amount} onChangeText={setAmount} placeholder="Amount (₹)" keyboardType="numeric" style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginBottom: 8 }} />
        <TextInput value={desc} onChangeText={setDesc} placeholder="Notes" style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginBottom: 10 }} />
        <TouchableOpacity onPress={addEntry} style={{ backgroundColor: COLORS.artisanOrange, padding: 12, borderRadius: 10, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Save to Ledger</Text>
        </TouchableOpacity>
      </View>

      {entries.map((e) => (
        <View key={e.id} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border, flexDirection: "row", justifyContent: "space-between" }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontWeight: "700" }}>{e.category}</Text>
            <Text style={{ fontSize: 12, color: COLORS.mutedText }}>{e.narration}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={{ fontWeight: "800", color: e.entry_type === "credit" ? COLORS.success : COLORS.danger }}>
              {e.entry_type === "credit" ? "+" : "-"}₹{e.amount.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 11, color: COLORS.mutedText }}>Bal: ₹{e.balance_after.toLocaleString()}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}
