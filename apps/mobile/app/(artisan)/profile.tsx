import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { MapPin, Landmark, Smartphone, Languages, LogOut } from "lucide-react-native";
import { LANGUAGES, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { ListItem } from "../../components/ListItem";
import { Button } from "../../components/Button";

export default function ArtisanProfileScreen() {
  const router = useRouter();
  const { user, language, setLanguage, logout } = useAuthStore();
  const ap = user?.artisan_profile;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm, paddingBottom: SPACING.lg }}>
      <Header
        title={user?.full_name || "Artisan Shop"}
        subtitle={`${ap?.craft_category || "Handicrafts"} · ${ap?.business_type || "Individual Artisan"}`}
        language={language}
      />

      <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border, marginBottom: SPACING.md }}>
        <ListItem
          title="Town & District"
          subtitle={ap?.location || "Tamil Nadu"}
          leftIcon={<MapPin size={20} strokeWidth={1.75} color={PALETTE.primary} />}
        />
        <ListItem
          title="UPI ID"
          subtitle={ap?.upi_id || "Not added yet"}
          leftIcon={<Smartphone size={20} strokeWidth={1.75} color={PALETTE.accent} />}
        />
        <ListItem
          title="Bank Account"
          subtitle={`${ap?.bank_name || "Not linked"} ${ap?.bank_account_masked ? `(${ap.bank_account_masked})` : ""}`}
          leftIcon={<Landmark size={20} strokeWidth={1.75} color={PALETTE.primary} />}
        />
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: SPACING.xs }}>
        <Languages size={20} strokeWidth={1.75} color={PALETTE.text} />
        <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "700", color: PALETTE.text }}>
          App Language
        </Text>
      </View>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: SPACING.md }}>
        {LANGUAGES.map((l) => {
          const active = language === l.code;
          return (
            <TouchableOpacity
              key={l.code}
              onPress={() => setLanguage(l.code)}
              style={{
                minHeight: 48,
                paddingHorizontal: 14,
                borderRadius: RADIUS.control,
                backgroundColor: active ? PALETTE.primary : PALETTE.surface,
                borderWidth: 1,
                borderColor: active ? PALETTE.primary : PALETTE.border,
                justifyContent: "center",
              }}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: active ? PALETTE.surface : PALETTE.text }}>
                {l.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Button
        title="Sign out"
        variant="secondary"
        icon={<LogOut size={18} strokeWidth={1.75} color={PALETTE.primary} />}
        onPress={() => {
          logout();
          router.replace("/(auth)/login");
        }}
      />
    </ScrollView>
  );
}
