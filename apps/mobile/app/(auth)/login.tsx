import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";

export default function LoginScreen() {
  const router = useRouter();
  const { login, register, language } = useAuthStore();
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
            full_name: fullName || "Artisan User",
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
      Alert.alert("Authentication Failed", err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20, backgroundColor: COLORS.warmCream, flexGrow: 1 }}>
      <Text style={{ fontSize: 26, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 6 }}>
        {isRegister ? "Create Account" : "Welcome Back"}
      </Text>
      <Text style={{ fontSize: 14, color: COLORS.mutedText, marginBottom: 20 }}>
        Sign in with email or phone number
      </Text>

      {isRegister && (
        <>
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>Full Name</Text>
          <TextInput
            value={fullName}
            onChangeText={setFullName}
            placeholder="e.g. Kavitha Sundaram"
            style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 }}
          />
          <Text style={{ fontWeight: "700", marginBottom: 6 }}>Account Role</Text>
          <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
            {(["artisan", "buyer"] as const).map((r) => (
              <TouchableOpacity
                key={r}
                onPress={() => setRole(r)}
                style={{
                  flex: 1,
                  padding: 14,
                  borderRadius: 12,
                  backgroundColor: role === r ? COLORS.deepNavy : "#fff",
                  borderWidth: 1,
                  borderColor: COLORS.border,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: role === r ? "#fff" : COLORS.primaryText, fontWeight: "700", textTransform: "capitalize" }}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Email or Phone</Text>
      <TextInput
        value={identifier}
        onChangeText={setIdentifier}
        autoCapitalize="none"
        style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 14 }}
      />

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Password</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 20 }}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        style={{ backgroundColor: COLORS.artisanOrange, padding: 16, borderRadius: 14, alignItems: "center", marginBottom: 14 }}
      >
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: "#fff", fontSize: 17, fontWeight: "800" }}>{isRegister ? "Register" : "Sign In"}</Text>}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsRegister(!isRegister)} style={{ alignItems: "center", padding: 10 }}>
        <Text style={{ color: COLORS.teal, fontWeight: "700" }}>
          {isRegister ? "Already have an account? Sign In" : "New to KalaiNova? Register"}
        </Text>
      </TouchableOpacity>

      <View style={{ marginTop: 20, backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border }}>
        <Text style={{ fontWeight: "700", color: COLORS.deepNavy, marginBottom: 8 }}>Quick Demo Accounts (Password: Kalai@123)</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TouchableOpacity
            onPress={() => { setIsRegister(false); setIdentifier("kavitha.weaver@kalainova.demo"); setPassword("Kalai@123"); }}
            style={{ flex: 1, backgroundColor: COLORS.deepNavy, padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>Demo Artisan</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => { setIsRegister(false); setIdentifier("ananya.boutique@kalainova.demo"); setPassword("Kalai@123"); }}
            style={{ flex: 1, backgroundColor: COLORS.teal, padding: 10, borderRadius: 8, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "600", fontSize: 12 }}>Demo Buyer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}
