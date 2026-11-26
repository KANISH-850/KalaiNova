import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react-native";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { ListItem } from "../../components/ListItem";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function DigitalLedgerScreen() {
  const { language } = useAuthStore();
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [txType, setTxType] = useState<"income" | "expense">("income");
  const [category, setCategory] = useState("Craft Sale");
  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/finance/ledger")
      .then((r) => setEntries(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const addEntry = async () => {
    if (!amount) return Alert.alert("Amount needed", "Please enter the rupee amount.");
    setSaving(true);
    try {
      await api.post("/finance/transactions", {
        tx_type: txType,
        category,
        amount: parseFloat(amount),
        description: desc || category,
      });
      setAmount("");
      setDesc("");
      load();
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm, paddingBottom: SPACING.lg }}>
      <Header title="Daily Ledger" subtitle="Write down money received or spent." language={language} />

      <Card style={{ marginBottom: SPACING.md }}>
        <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.sm }}>
          {(["income", "expense"] as const).map((t) => {
            const active = txType === t;
            return (
              <TouchableOpacity
                key={t}
                onPress={() => setTxType(t)}
                style={{
                  flex: 1,
                  minHeight: 48,
                  borderRadius: RADIUS.control,
                  backgroundColor: active ? PALETTE.primary : PALETTE.surfaceAlt,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: active ? PALETTE.surface : PALETTE.text }}>
                  {t === "income" ? "Money in (+)" : "Money spent (-)"}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <Input label="Category" value={category} onChangeText={setCategory} />
        <Input label="Amount (₹)" value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="e.g. 1200" />
        <Input label="Note" value={desc} onChangeText={setDesc} placeholder="e.g. Sold 2 terracotta lamps" />
        <Button title="Save entry" variant="primary" loading={saving} onPress={addEntry} />
      </Card>

      {loading ? (
        <Skeleton rows={4} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={<ArrowDownLeft size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message="No ledger entries yet."
        />
      ) : (
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
          {entries.map((e) => (
            <ListItem
              key={e.id}
              title={e.category}
              subtitle={`${e.narration} · Bal: ₹${e.balance_after.toLocaleString()}`}
              rightText={`${e.entry_type === "credit" ? "+" : "-"}₹${e.amount.toLocaleString()}`}
              rightColor={e.entry_type === "credit" ? PALETTE.success : PALETTE.error}
              leftIcon={
                e.entry_type === "credit" ? (
                  <ArrowDownLeft size={20} strokeWidth={1.75} color={PALETTE.success} />
                ) : (
                  <ArrowUpRight size={20} strokeWidth={1.75} color={PALETTE.error} />
                )
              }
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
