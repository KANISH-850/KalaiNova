import { ScrollView, View } from "react-native";
import { useRouter } from "expo-router";
import { Languages, LogOut, User } from "lucide-react-native";
import { PALETTE, SPACING } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";
import { ListItem } from "../../components/ListItem";
import { Button } from "../../components/Button";

export default function SettingsScreen() {
  const router = useRouter();
  const { logout, language } = useAuthStore();

  return (
    <ScrollView style={{ flex: 1, backgroundColor: PALETTE.bg }} contentContainerStyle={{ padding: SPACING.sm, gap: SPACING.sm }}>
      <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
        <ListItem
          title="App Language"
          subtitle={`Current: ${language.toUpperCase()}`}
          leftIcon={<Languages size={20} strokeWidth={1.75} color={PALETTE.primary} />}
          onPress={() => router.push("/(auth)/language")}
          showChevron
        />
        <ListItem
          title="My Shop Details"
          subtitle="UPI ID, craft category, and bank details"
          leftIcon={<User size={20} strokeWidth={1.75} color={PALETTE.accent} />}
          onPress={() => router.push("/(artisan)/profile")}
          showChevron
        />
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
