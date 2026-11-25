import { ScrollView, Text, View } from "react-native";
import { COLORS } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

export default function ArtisanProfileScreen() {
  const { user } = useAuthStore();
  const ap = user?.artisan_profile;

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <View style={{ backgroundColor: "#fff", padding: 20, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.deepNavy }}>{user?.full_name}</Text>
        <Text style={{ color: COLORS.mutedText, marginTop: 4 }}>{user?.email || user?.phone}</Text>
        <View style={{ marginTop: 16, gap: 8 }}>
          <Text><Text style={{ fontWeight: "700" }}>Craft:</Text> {ap?.craft_category || "N/A"}</Text>
          <Text><Text style={{ fontWeight: "700" }}>Business Type:</Text> {ap?.business_type || "Individual"}</Text>
          <Text><Text style={{ fontWeight: "700" }}>Location:</Text> {ap?.location || "India"}</Text>
          <Text><Text style={{ fontWeight: "700" }}>Experience:</Text> {ap?.experience_years || 0} years</Text>
          <Text><Text style={{ fontWeight: "700" }}>UPI ID:</Text> {ap?.upi_id || "Not set"}</Text>
          <Text><Text style={{ fontWeight: "700" }}>Bank:</Text> {ap?.bank_name || "N/A"} ({ap?.bank_account_masked || "Not set"})</Text>
        </View>
      </View>
    </ScrollView>
  );
}
