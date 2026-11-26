import { useEffect, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useRouter } from "expo-router";
import { Camera, Tag, BookOpen, MessageSquare, User, Bell } from "lucide-react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Card } from "../../components/Card";
import { Button } from "../../components/Button";
import { ListItem } from "../../components/ListItem";
import { Skeleton } from "../../components/Skeleton";

export default function ArtisanHomeScreen() {
  const router = useRouter();
  const { user, language } = useAuthStore();
  const [finance, setFinance] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/finance/dashboard")
      .then((r) => setFinance(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const earned = finance?.total_revenue ?? 0;
  const pending = finance?.pending_payments ?? 0;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: PALETTE.bg }}
      contentContainerStyle={{ padding: SPACING.sm, paddingTop: SPACING.lg, paddingBottom: SPACING.lg }}
    >
      <Header
        title={user?.full_name || "Artisan Shop"}
        subtitle={`${user?.artisan_profile?.craft_category || "Handloom"} · ${user?.artisan_profile?.location || "Tamil Nadu"}`}
        speakText={`${user?.full_name || "Artisan"}. ${t(language, "earnedMonth")}: ${earned} rupees. ${t(language, "toReceive")}: ${pending} rupees.`}
        language={language}
      />

      {/* Plain-word rupee summary */}
      {loading ? (
        <Skeleton rows={2} />
      ) : (
        <Card style={{ marginBottom: SPACING.sm }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", gap: SPACING.sm }}>
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
                {t(language, "earnedMonth")}
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 26, fontWeight: "700", color: PALETTE.success, marginTop: 4 }}>
                ₹{earned.toLocaleString()}
              </Text>
            </View>
            <View style={{ width: 1, backgroundColor: PALETTE.border }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
                {t(language, "toReceive")}
              </Text>
              <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 26, fontWeight: "700", color: PALETTE.accent, marginTop: 4 }}>
                ₹{pending.toLocaleString()}
              </Text>
            </View>
          </View>
        </Card>
      )}

      {/* Primary full-width action for adding a craft */}
      <Card style={{ marginBottom: SPACING.md, backgroundColor: PALETTE.surfaceAlt }}>
        <Text style={{ fontFamily: TYPOGRAPHY.serifFamily, fontSize: 20, fontWeight: "700", color: PALETTE.text, marginBottom: 4 }}>
          {t(language, "addProduct")}
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary, marginBottom: SPACING.sm }}>
          {t(language, "addProductHint")}
        </Text>
        <Button
          title={t(language, "addProduct")}
          variant="primary"
          icon={<Camera size={20} strokeWidth={1.75} color={PALETTE.surface} />}
          onPress={() => router.push("/catalog/camera")}
        />
      </Card>

      {/* Clean full-width action rows (not a repetitive card grid) */}
      <View style={{ borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: PALETTE.border }}>
        <ListItem
          title={t(language, "checkPrice")}
          subtitle="Calculate material, labour, and fair selling price"
          leftIcon={<Tag size={20} strokeWidth={1.75} color={PALETTE.primary} />}
          onPress={() => router.push("/pricing")}
          showChevron
        />
        <ListItem
          title={t(language, "viewMoney")}
          subtitle="Daily income, expenses, bills, and UPI QR"
          leftIcon={<BookOpen size={20} strokeWidth={1.75} color={PALETTE.accent} />}
          onPress={() => router.push("/finance")}
          showChevron
        />
        <ListItem
          title={t(language, "askAssistant")}
          subtitle="Ask about profit, buyers, or schemes in plain words"
          leftIcon={<MessageSquare size={20} strokeWidth={1.75} color={PALETTE.primary} />}
          onPress={() => router.push("/assistant")}
          showChevron
        />
        <ListItem
          title="Buyer alerts"
          subtitle="New enquiries and order updates"
          leftIcon={<Bell size={20} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          onPress={() => router.push("/(artisan)/notifications")}
          showChevron
        />
        <ListItem
          title="My shop & language"
          subtitle="Profile, UPI ID, bank details, Tamil / EN"
          leftIcon={<User size={20} strokeWidth={1.75} color={PALETTE.textSecondary} />}
          onPress={() => router.push("/(artisan)/profile")}
          showChevron
        />
      </View>
    </ScrollView>
  );
}
