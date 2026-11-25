import { useEffect, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, LABELS } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function ArtisanHomeScreen() {
  const router = useRouter();
  const { user, language } = useAuthStore();
  const [finance, setFinance] = useState<any>(null);
  const t = LABELS[language] || LABELS.en;

  useEffect(() => {
    api.get("/finance/dashboard").then((r) => setFinance(r.data)).catch(() => {});
  }, []);

  const tiles = [
    { title: "Product Camera", sub: "Capture & Enhance", icon: "camera", route: "/catalog/camera", color: COLORS.artisanOrange },
    { title: "AI Image Studio", sub: "BiRefNet Studio", icon: "color-wand", route: "/catalog/studio", color: COLORS.teal },
    { title: t.voice, sub: "Speak in Tamil/Hindi", icon: "mic", route: "/catalog/voice", color: COLORS.deepNavy },
    { title: t.pricing, sub: "XGBoost + CatBoost", icon: "pricetag", route: "/pricing", color: "#B45309" },
    { title: t.finance, sub: "Ledger & Profit", icon: "wallet", route: "/finance", color: COLORS.teal },
    { title: t.assistant, sub: "5 Specialized Agents", icon: "sparkles", route: "/assistant", color: COLORS.deepNavy },
    { title: "Smart Invoices", sub: "PDF & UPI QR", icon: "document-text", route: "/finance/invoices", color: COLORS.artisanOrange },
    { title: "Scheme Readiness", sub: "PM Vishwakarma / MUDRA", icon: "shield-checkmark", route: "/finance/assistance", color: "#15803D" },
  ];

  return (
    <ScrollView contentContainerStyle={{ padding: 18, backgroundColor: COLORS.lightBg }}>
      <View style={{ backgroundColor: COLORS.deepNavy, padding: 20, borderRadius: 18, marginBottom: 18 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Text style={{ color: COLORS.warmCream, fontSize: 20, fontWeight: "800" }}>
              Namaste, {user?.full_name || "Artisan"}
            </Text>
            <Text style={{ color: "#CBD5E1", fontSize: 13, marginTop: 4 }}>
              {user?.artisan_profile?.craft_category || "Handicrafts"} • {user?.artisan_profile?.location || "India"}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => Speech.speak(`Welcome ${user?.full_name || "Artisan"}. Your total revenue is ${finance?.total_revenue || 0} rupees.`)}
            style={{ backgroundColor: COLORS.artisanOrange, padding: 10, borderRadius: 12 }}
          >
            <Ionicons name="volume-high" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: "row", marginTop: 18, gap: 12 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 12 }}>
            <Text style={{ color: "#CBD5E1", fontSize: 12 }}>Total Revenue</Text>
            <Text style={{ color: COLORS.warmCream, fontSize: 20, fontWeight: "800", marginTop: 4 }}>
              ₹{(finance?.total_revenue ?? 0).toLocaleString()}
            </Text>
          </View>
          <View style={{ flex: 1, backgroundColor: "rgba(255,255,255,0.1)", padding: 12, borderRadius: 12 }}>
            <Text style={{ color: "#CBD5E1", fontSize: 12 }}>Net Profit</Text>
            <Text style={{ color: "#4ADE80", fontSize: 20, fontWeight: "800", marginTop: 4 }}>
              ₹{(finance?.net_profit ?? 0).toLocaleString()}
            </Text>
          </View>
        </View>
      </View>

      <Text style={{ fontSize: 17, fontWeight: "800", color: COLORS.primaryText, marginBottom: 12 }}>
        Quick Actions
      </Text>

      <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 }}>
        {tiles.map((item) => (
          <TouchableOpacity
            key={item.title}
            onPress={() => router.push(item.route as any)}
            style={{
              width: "48%",
              backgroundColor: COLORS.white,
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: COLORS.border,
              marginBottom: 4,
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: item.color, justifyContent: "center", alignItems: "center", marginBottom: 10 }}>
              <Ionicons name={item.icon as any} size={22} color="#fff" />
            </View>
            <Text style={{ fontSize: 15, fontWeight: "700", color: COLORS.primaryText }}>{item.title}</Text>
            <Text style={{ fontSize: 12, color: COLORS.mutedText, marginTop: 2 }}>{item.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
}
