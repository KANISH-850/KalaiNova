import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, LANGUAGES } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { language, setLanguage } = useAuthStore();

  const speakGuidance = () => {
    Speech.speak("Welcome to KalaiNova. Please tap your preferred language to continue.", { language: "en-IN" });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: COLORS.warmCream, flexGrow: 1 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <View>
          <Text style={{ fontSize: 24, fontWeight: "800", color: COLORS.deepNavy }}>Choose Language</Text>
          <Text style={{ fontSize: 14, color: COLORS.mutedText, marginTop: 4 }}>Select your preferred regional language</Text>
        </View>
        <TouchableOpacity onPress={speakGuidance} style={{ backgroundColor: COLORS.teal, padding: 12, borderRadius: 12 }}>
          <Ionicons name="volume-high" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {LANGUAGES.map((lang) => {
        const selected = language === lang.code;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => setLanguage(lang.code)}
            style={{
              backgroundColor: selected ? COLORS.deepNavy : COLORS.white,
              padding: 18,
              borderRadius: 14,
              marginBottom: 12,
              borderWidth: 2,
              borderColor: selected ? COLORS.artisanOrange : COLORS.border,
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 18, fontWeight: "700", color: selected ? COLORS.warmCream : COLORS.primaryText }}>
              {lang.name}
            </Text>
            {selected && <Ionicons name="checkmark-circle" size={24} color={COLORS.artisanOrange} />}
          </TouchableOpacity>
        );
      })}

      <TouchableOpacity
        onPress={() => router.push("/(auth)/login")}
        style={{ backgroundColor: COLORS.artisanOrange, padding: 18, borderRadius: 14, alignItems: "center", marginTop: 12 }}
      >
        <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
