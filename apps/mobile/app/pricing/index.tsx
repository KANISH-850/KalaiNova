import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { PALETTE, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { StepIndicator } from "../../components/StepIndicator";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

export default function DynamicPricingScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const { language } = useAuthStore();
  const [category, setCategory] = useState("Handloom & Textiles");
  const [materialCost, setMaterialCost] = useState("3200");
  const [labourCost, setLabourCost] = useState("2400");
  const [packagingCost, setPackagingCost] = useState("150");
  const [otherCost, setOtherCost] = useState("150");
  const [hours, setHours] = useState("42");
  const [margin, setMargin] = useState("30");
  const [prediction, setPrediction] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runPrediction = async () => {
    setLoading(true);
    try {
      const res = await api.post("/ai/pricing/predict", {
        product_id: productId ? parseInt(productId, 10) : undefined,
        category_name: category,
        material_cost: parseFloat(materialCost || "0"),
        labour_cost: parseFloat(labourCost || "0"),
        packaging_cost: parseFloat(packagingCost || "0"),
        other_cost: parseFloat(otherCost || "0"),
        production_hours: parseFloat(hours || "8"),
        desired_margin_pct: parseFloat(margin || "25"),
      });
      setPrediction(res.data);
    } catch (err: any) {
      Alert.alert("Could not calculate price", err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const acceptPrice = async () => {
    if (!prediction) return;
    await api.post("/ai/pricing/accept", {
      prediction_id: prediction.prediction_id,
      product_id: productId ? parseInt(productId, 10) : undefined,
      accepted_price: prediction.recommended_price,
    });
    Alert.alert("Price saved", `₹${prediction.recommended_price.toLocaleString()} is now set for this craft.`);
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <StepIndicator currentStep={4} language={language} />
        <Header
          title="Check a fair price"
          subtitle="Enter what you spent on materials and labour. We will suggest a safe selling price."
          speakText="Enter your material cost, labour cost, and hours worked to see a fair selling price."
          language={language}
        />

        <Input label="Craft category" value={category} onChangeText={setCategory} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Input label="Material (₹)" value={materialCost} onChangeText={setMaterialCost} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Input label="Labour (₹)" value={labourCost} onChangeText={setLabourCost} keyboardType="numeric" /></View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Input label="Packing (₹)" value={packagingCost} onChangeText={setPackagingCost} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Input label="Other (₹)" value={otherCost} onChangeText={setOtherCost} keyboardType="numeric" /></View>
        </View>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}><Input label="Hours worked" value={hours} onChangeText={setHours} keyboardType="numeric" /></View>
          <View style={{ flex: 1 }}><Input label="Profit %" value={margin} onChangeText={setMargin} keyboardType="numeric" /></View>
        </View>

        {prediction ? (
          <Card style={{ marginTop: SPACING.xs, gap: 8 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
              Suggested selling price
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 28, fontWeight: "700", color: PALETTE.primary }}>
              ₹{prediction.recommended_price.toLocaleString()}
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.text }}>
              Your cost: ₹{prediction.total_production_cost.toLocaleString()} · Profit: ₹{prediction.expected_profit.toLocaleString()} ({prediction.profit_margin_pct}%)
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
              Bulk / wholesale price: ₹{prediction.wholesale_price.toLocaleString()} · Minimum safe price: ₹{prediction.min_profitable_price.toLocaleString()}
            </Text>
            <Button title="Use this price" variant="accent" onPress={acceptPrice} style={{ marginTop: 8 }} />
          </Card>
        ) : null}
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button title="Calculate fair price" variant="primary" loading={loading} onPress={runPrediction} />
      </View>
    </View>
  );
}
