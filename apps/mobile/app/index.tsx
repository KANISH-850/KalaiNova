import { useEffect } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants/theme";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const t = setTimeout(() => router.replace("/(auth)/language"), 1200);
    return () => clearTimeout(t);
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.deepNavy, justifyContent: "center", alignItems: "center", padding: 28 }}>
      <View style={{ width: 88, height: 88, borderRadius: 24, backgroundColor: COLORS.artisanOrange, justifyContent: "center", alignItems: "center", marginBottom: 20 }}>
        <Ionicons name="sparkles" size={44} color={COLORS.warmCream} />
      </View>
      <Text style={{ fontSize: 34, fontWeight: "800", color: COLORS.warmCream, letterSpacing: 1.5 }}>KALAINOVA</Text>
      <Text style={{ fontSize: 15, color: "#CBD5E1", textAlign: "center", marginTop: 10, lineHeight: 22 }}>
        From Traditional Craftsmanship to Intelligent Digital Commerce
      </Text>
      <TouchableOpacity
        onPress={() => router.replace("/(auth)/language")}
        style={{ marginTop: 32, backgroundColor: COLORS.teal, paddingHorizontal: 28, paddingVertical: 14, borderRadius: 12 }}
      >
        <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}
