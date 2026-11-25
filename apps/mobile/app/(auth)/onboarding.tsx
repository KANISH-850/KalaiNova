import { useState } from "react";
import { Alert, ScrollView, Text, TextInput, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function OnboardingScreen() {
  const router = useRouter();
  const { refreshMe } = useAuthStore();
  const [craftCategory, setCraftCategory] = useState("Handloom & Textiles");
  const [businessType, setBusinessType] = useState("Individual Artisan");
  const [location, setLocation] = useState("Kanchipuram, Tamil Nadu");
  const [experienceYears, setExperienceYears] = useState("5");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");

  const saveProfile = async () => {
    try {
      await api.put("/auth/profile", {
        craft_category: craftCategory,
        business_type: businessType,
        location,
        experience_years: parseInt(experienceYears || "1", 10),
        upi_id: upiId || undefined,
        bank_account_number: bankAccount || undefined,
        bank_ifsc: bankIfsc || undefined,
        bank_name: bankName || undefined,
      });
      await refreshMe();
      router.replace("/(artisan)");
    } catch (err: any) {
      Alert.alert("Error", err?.response?.data?.detail || "Could not save profile");
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: COLORS.warmCream, flexGrow: 1 }}>
      <Text style={{ fontSize: 22, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 14 }}>Artisan Business Setup</Text>

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Craft Category</Text>
      <TextInput value={craftCategory} onChangeText={setCraftCategory} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Business Type (Individual Artisan / SHG / Cooperative)</Text>
      <TextInput value={businessType} onChangeText={setBusinessType} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Location</Text>
      <TextInput value={location} onChangeText={setLocation} style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Experience (Years)</Text>
      <TextInput value={experienceYears} onChangeText={setExperienceYears} keyboardType="numeric" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>UPI ID (for instant buyer payments)</Text>
      <TextInput value={upiId} onChangeText={setUpiId} placeholder="name@okaxis" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Bank Account Number (Encrypted at rest)</Text>
      <TextInput value={bankAccount} onChangeText={setBankAccount} secureTextEntry style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 12 }} />

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>IFSC Code & Bank Name</Text>
      <TextInput value={bankIfsc} onChangeText={setBankIfsc} placeholder="IFSC" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 8 }} />
      <TextInput value={bankName} onChangeText={setBankName} placeholder="Bank Name" style={{ backgroundColor: "#fff", padding: 12, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 }} />

      <TouchableOpacity onPress={saveProfile} style={{ backgroundColor: COLORS.teal, padding: 16, borderRadius: 14, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Complete Onboarding</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
