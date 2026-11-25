import { useEffect, useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function InvoiceGeneratorScreen() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [buyerName, setBuyerName] = useState("Deccan Heritage Boutique");
  const [itemName, setItemName] = useState("Kanchipuram Pure Silk Saree");
  const [qty, setQty] = useState("1");
  const [unitPrice, setUnitPrice] = useState("8500");

  const load = () => api.get("/finance/invoices").then((r) => setInvoices(r.data)).catch(() => {});

  useEffect(() => {
    load();
  }, []);

  const createInvoice = async () => {
    try {
      const res = await api.post("/finance/invoices", {
        buyer_name: buyerName,
        tax_rate_pct: 5,
        items: [{ description: itemName, quantity: parseInt(qty || "1", 10), unit_price: parseFloat(unitPrice || "100") }],
      });
      Alert.alert("Invoice Generated", `Invoice ${res.data.invoice_number} (PDF saved at ${res.data.pdf_url})`);
      load();
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.detail || err.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 18 }}>
      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 14, marginBottom: 16, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontWeight: "800", fontSize: 16, marginBottom: 10 }}>Generate Smart PDF Invoice</Text>
        <TextInput value={buyerName} onChangeText={setBuyerName} placeholder="Buyer Name" style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginBottom: 8 }} />
        <TextInput value={itemName} onChangeText={setItemName} placeholder="Product" style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10, marginBottom: 8 }} />
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <TextInput value={qty} onChangeText={setQty} placeholder="Qty" keyboardType="numeric" style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10 }} />
          <TextInput value={unitPrice} onChangeText={setUnitPrice} placeholder="Unit Price" keyboardType="numeric" style={{ flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, padding: 10 }} />
        </View>
        <TouchableOpacity onPress={createInvoice} style={{ backgroundColor: COLORS.deepNavy, padding: 14, borderRadius: 10, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Generate PDF Invoice</Text>
        </TouchableOpacity>
      </View>

      {invoices.map((inv) => (
        <View key={inv.id} style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border }}>
          <Text style={{ fontWeight: "700", color: COLORS.deepNavy }}>{inv.invoice_number} — {inv.buyer_name}</Text>
          <Text style={{ color: COLORS.teal, fontWeight: "800", marginTop: 4 }}>Total: ₹{inv.total_amount.toLocaleString()}</Text>
          <Text style={{ fontSize: 12, color: COLORS.mutedText }}>PDF: {inv.pdf_url}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
