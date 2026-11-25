import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, language } = useAuthStore();

  return (
    <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }}>
      <View style={{ backgroundColor: "#fff", padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontWeight: "700", fontSize: 15 }}>Current Language: {language.toUpperCase()}</Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/language")} style={{ marginTop: 10 }}>
          <Text style={{ color: COLORS.teal, fontWeight: "700" }}>Change Regional Language</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => { logout(); router.replace("/(auth)/login"); }}
        style={{ backgroundColor: COLORS.danger, padding: 16, borderRadius: 12, alignItems: "center" }}
      >
        <Text style={{ color: "#fff", fontWeight: "800" }}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
