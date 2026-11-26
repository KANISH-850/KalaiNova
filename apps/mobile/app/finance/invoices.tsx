import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { FileText } from "lucide-react-native";
import { PALETTE, SPACING } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { ListItem } from "../../components/ListItem";
import { EmptyState } from "../../components/EmptyState";
import { Skeleton } from "../../components/Skeleton";

export default function InvoiceGeneratorScreen() {
  const { language } = useAuthStore();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyerName, setBuyerName] = useState("Deccan Heritage Boutique");
  const [itemName, setItemName] = useState("Kanchipuram Pure Silk Saree");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("8500");
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    api
      .get("/finance/invoices")
      .then((r) => setInvoices(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const createInvoice = async () => {
    setSaving(true);
    try {
      const res = await api.post("/finance/invoices", {
        buyer_name: buyerName,
        tax_rate_pct: 5,
        items: [{ description: itemName, quantity: parseInt(qty || "1", 10), unit_price: parseFloat(unitPrice || "100") }],
      });
      Alert.alert("Bill ready", `Bill ${res.data.invoice_number} saved as PDF.`);
      load();
    } catch (err: any) {
      Alert.alert("Could not create bill", err?.response?.data?.detail || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm, paddingBottom: SPACING.lg }}>
      <Header title="Bills & Receipts" subtitle="Create a clean PDF bill for any buyer." language={language} />

      <Card style={{ marginBottom: SPACING.md }}>
        <Input label="Buyer name" value={buyerName} onChangeText={setBuyerName} />
        <Input label="Craft item" value={itemName} onChangeText={setItemName} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Input label="Qty" value={qty} onChangeText={setQty} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Input label="Price each (₹)" value={unitPrice} onChangeText={setUnitPrice} keyboardType="numeric" /></View>
        </View>
        <Button title="Create PDF bill" variant="primary" loading={saving} onPress={createInvoice} />
      </Card>

      {loading ? (
        <Skeleton rows={3} />
      ) : invoices.length === 0 ? (
        <EmptyState
          icon={<FileText size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          message="No bills created yet."
        />
      ) : (
        <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
          {invoices.map((inv) => (
            <ListItem
              key={inv.id}
              title={inv.invoice_number}
              subtitle={`${inv.buyer_name} · PDF saved`}
              rightText={`₹${inv.total_amount.toLocaleString()}`}
              rightColor={PALETTE.primary}
              leftIcon={<FileText size={20} strokeWidth={1.75} color={PALETTE.accent} />}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
