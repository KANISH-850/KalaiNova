import { useState } from "react";
import { Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Languages } from "lucide-react-native";
import { LANGUAGES, PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { useAuthStore } from "../../store/authStore";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, language, setLanguage } = useAuthStore();
  const [isRegister, setIsRegister] = useState(false);
  const [identifier, setIdentifier] = useState("kavitha.weaver@kalainova.demo");
  const [password, setPassword] = useState("Kalai@123");
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState<"artisan" | "buyer">("artisan");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const user = isRegister
        ? await register({
            email: identifier.includes("@") ? identifier : undefined,
            phone: !identifier.includes("@") ? identifier : undefined,
            password,
            full_name: fullName || "Kavitha Sundaram",
            role,
            preferred_language: language,
          })
        : await login(identifier, password);

      if (isRegister && user.role === "artisan") {
        router.replace("/(auth)/onboarding");
      } else if (user.role === "buyer") {
        router.replace("/(buyer)");
      } else {
        router.replace("/(artisan)");
      }
    } catch (err: any) {
      Alert.alert("Sign in failed", err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingTop: SPACING.lg, paddingBottom: 110 }}>
        {/* Visible language switcher on the very first screen (Tamil default) */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: SPACING.sm }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Languages size={18} strokeWidth={1.75} color={PALETTE.textSecondary} />
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
              Language
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {LANGUAGES.slice(0, 3).map((l) => {
              const active = language === l.code;
              return (
                <TouchableOpacity
                  key={l.code}
                  onPress={() => setLanguage(l.code)}
                  style={{
                    minHeight: 40,
                    paddingHorizontal: 12,
                    borderRadius: RADIUS.control,
                    backgroundColor: active ? PALETTE.primary : PALETTE.surface,
                    borderWidth: 1,
                    borderColor: active ? PALETTE.primary : PALETTE.border,
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ fontSize: 15, fontWeight: "600", color: active ? PALETTE.surface : PALETTE.text }}>
                    {l.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Header
          title={isRegister ? t(language, "register") : t(language, "brand")}
          subtitle={t(language, "tagline")}
          speakText={t(language, "tagline")}
          language={language}
        />

        {isRegister ? (
          <>
            <Input
              label={t(language, "fullName")}
              value={fullName}
              onChangeText={setFullName}
              placeholder="e.g. Kavitha Sundaram"
            />
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: PALETTE.text, marginBottom: 8 }}>
              Account type
            </Text>
            <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.sm }}>
              {(["artisan", "buyer"] as const).map((r) => {
                const active = role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={{
                      flex: 1,
                      minHeight: 48,
                      borderRadius: RADIUS.control,
                      backgroundColor: active ? PALETTE.primary : PALETTE.surface,
                      borderWidth: 1,
                      borderColor: active ? PALETTE.primary : PALETTE.border,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "600", color: active ? PALETTE.surface : PALETTE.text }}>
                      {r === "artisan" ? t(language, "roleArtisan") : t(language, "roleBuyer")}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </>
        ) : null}

        <Input
          label={t(language, "emailOrPhone")}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
        />

        <Input
          label={t(language, "password")}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          onPress={() => setIsRegister(!isRegister)}
          style={{ minHeight: 48, justifyContent: "center", alignItems: "center", marginBottom: SPACING.sm }}
        >
          <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: PALETTE.accent }}>
            {isRegister ? "Already have an account? Sign in" : "New shop? Create an account"}
          </Text>
        </TouchableOpacity>

        <Card>
          <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: PALETTE.text, marginBottom: 8 }}>
            Demo accounts (Password: Kalai@123)
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button
              title={t(language, "demoArtisan")}
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => {
                setIsRegister(false);
                setIdentifier("kavitha.weaver@kalainova.demo");
                setPassword("Kalai@123");
              }}
            />
            <Button
              title={t(language, "demoBuyer")}
              variant="secondary"
              style={{ flex: 1 }}
              onPress={() => {
                setIsRegister(false);
                setIdentifier("ananya.boutique@kalainova.demo");
                setPassword("Kalai@123");
              }}
            />
          </View>
        </Card>
      </ScrollView>

      {/* Bottom-anchored single primary indigo button */}
      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button
          title={isRegister ? t(language, "register") : t(language, "signIn")}
          onPress={handleSubmit}
          loading={loading}
          variant="primary"
        />
      </View>
    </View>
  );
}
