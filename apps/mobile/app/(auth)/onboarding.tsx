import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { PALETTE, SPACING } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function OnboardingScreen() {
  const router = useRouter();
  const { refreshMe, language } = useAuthStore();
  const [craftCategory, setCraftCategory] = useState("Handloom & Textiles");
  const [businessType, setBusinessType] = useState("Individual Artisan");
  const [location, setLocation] = useState("Kanchipuram, Tamil Nadu");
  const [experienceYears, setExperienceYears] = useState("10");
  const [upiId, setUpiId] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [bankIfsc, setBankIfsc] = useState("");
  const [bankName, setBankName] = useState("");
  const [saving, setSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
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
      Alert.alert("Could not save", err?.response?.data?.detail || "Please check your details and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <Header
          title="Set up your craft shop"
          subtitle="Tell us what you make and where buyers can pay you."
          speakText="Tell us what craft you make, your town, and your UPI ID for payments."
          language={language}
        />

        <Input label="What do you craft?" value={craftCategory} onChangeText={setCraftCategory} />
        <Input label="Shop type (Individual / SHG / Cooperative)" value={businessType} onChangeText={setBusinessType} />
        <Input label="Town & District" value={location} onChangeText={setLocation} />
        <Input label="Years of experience" value={experienceYears} onChangeText={setExperienceYears} keyboardType="numeric" />
        <Input label="UPI ID (for receiving payments)" value={upiId} onChangeText={setUpiId} placeholder="kavitha@okaxis" />
        <Input label="Bank account number (stored encrypted)" value={bankAccount} onChangeText={setBankAccount} secureTextEntry />
        <Input label="IFSC code" value={bankIfsc} onChangeText={setBankIfsc} placeholder="IDIB000K012" />
        <Input label="Bank name" value={bankName} onChangeText={setBankName} placeholder="Indian Bank" />
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button title="Save shop details" onPress={saveProfile} loading={saving} variant="primary" />
      </View>
    </View>
  );
}
