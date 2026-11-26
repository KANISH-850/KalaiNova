import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Check } from "lucide-react-native";
import { LANGUAGES, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";

export default function LanguageSelectionScreen() {
  const router = useRouter();
  const { language, setLanguage } = useAuthStore();

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <Header
          title={t(language, "chooseLang")}
          subtitle="தமிழ் (Tamil) is set as default. You can change this anytime."
          speakText="Choose your preferred language. Tamil is selected by default."
          language={language}
        />

        <View style={{ gap: SPACING.xs }}>
          {LANGUAGES.map((lang) => {
            const selected = language === lang.code;
            return (
              <TouchableOpacity
                key={lang.code}
                onPress={() => setLanguage(lang.code)}
                style={{
                  minHeight: 56,
                  paddingHorizontal: SPACING.sm,
                  borderRadius: RADIUS.control,
                  backgroundColor: PALETTE.surface,
                  borderWidth: selected ? 2 : 1,
                  borderColor: selected ? PALETTE.primary : PALETTE.border,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <View>
                  <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 18, fontWeight: "700", color: PALETTE.text }}>
                    {lang.name}
                  </Text>
                  <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
                    {lang.englishName}
                  </Text>
                </View>
                {selected ? <Check size={22} strokeWidth={2} color={PALETTE.primary} /> : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button title={t(language, "continue")} onPress={() => router.back()} variant="primary" />
      </View>
    </View>
  );
}
