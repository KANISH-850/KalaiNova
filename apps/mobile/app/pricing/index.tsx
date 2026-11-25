import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";

export default function DynamicPricingScreen() {
  const { productId } = useLocalSearchParams<{ productId?: string }>();
  const [category, setCategory] = useState("Handloom & Textiles");
  const [materialCost, setMaterialCost] = useState("500");
  const [labourCost, setLabourCost] = useState("300");
  const [packagingCost, setPackagingCost] = useState("50");
  const [otherCost, setOtherCost] = useState("50");
  const [hours, setHours] = useState("10");
  const [margin, setMargin] = useState("30");
  const [prediction, setPrediction] = useState<any>(null);

  const runPrediction = async () => {
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
      Alert.alert("Pricing Error", err?.response?.data?.detail || err.message);
    }
  };

  const acceptPrice = async () => {
    if (!prediction) return;
    await api.post("/ai/pricing/accept", {
      prediction_id: prediction.prediction_id,
      product_id: productId ? parseInt(productId, 10) : undefined,
      accepted_price: prediction.recommended_price,
    });
    Alert.alert("Price Accepted", `Applied ₹${prediction.recommended_price} to your product.`);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 12 }}>
        AI Dynamic Pricing (XGBoost + CatBoost)
      </Text>

      <Text style={{ fontWeight: "700", marginBottom: 4 }}>Category</Text>
      <TextInput value={category} onChangeText={setCategory} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 10 }} />

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>Material (₹)</Text>
          <TextInput value={materialCost} onChangeText={setMaterialCost} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>Labour (₹)</Text>
          <TextInput value={labourCost} onChangeText={setLabourCost} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border }} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>Packaging (₹)</Text>
          <TextInput value={packagingCost} onChangeText={setPackagingCost} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>Other (₹)</Text>
          <TextInput value={otherCost} onChangeText={setOtherCost} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border }} />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>Hours</Text>
          <TextInput value={hours} onChangeText={setHours} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border }} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "700", marginBottom: 4 }}>Desired Margin %</Text>
          <TextInput value={margin} onChangeText={setMargin} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border }} />
        </View>
      </View>

      <TouchableOpacity onPress={runPrediction} style={{ backgroundColor: COLORS.deepNavy, padding: 16, borderRadius: 12, alignItems: "center", marginBottom: 16 }}>
        <Text style={{ color: "#fff", fontWeight: "800" }}>Predict Optimal Price</Text>
      </TouchableOpacity>

      {prediction && (
        <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border, gap: 6 }}>
          <Text style={{ fontSize: 18, fontWeight: "800", color: COLORS.teal }}>Recommended Price: ₹{prediction.recommended_price}</Text>
          <Text>Production Cost: ₹{prediction.total_production_cost}</Text>
          <Text>Min Profitable: ₹{prediction.min_profitable_price} | Wholesale: ₹{prediction.wholesale_price} | Retail: ₹{prediction.retail_price}</Text>
          <Text>Expected Profit: ₹{prediction.expected_profit} ({prediction.profit_margin_pct}% margin)</Text>
          <Text style={{ fontSize: 12, color: COLORS.mutedText, marginTop: 4 }}>{prediction.explanation}</Text>
          <TouchableOpacity onPress={acceptPrice} style={{ backgroundColor: COLORS.artisanOrange, padding: 14, borderRadius: 10, alignItems: "center", marginTop: 10 }}>
            <Text style={{ color: "#fff", fontWeight: "800" }}>Accept & Apply Price</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
