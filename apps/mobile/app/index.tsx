import { useEffect } from "react";
import { Text, View } from "react-native";
import { useRouter } from "expo-router";
import { PALETTE, SPACING, TYPOGRAPHY } from "../constants/theme";
import { KolamBorder } from "../components/KolamBorder";

export default function SplashScreen() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/(auth)/login"), 900);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: PALETTE.bg,
        justifyContent: "center",
        alignItems: "center",
        padding: SPACING.md,
      }}
    >
      <KolamBorder width={240} />
      <Text
        style={{
          fontFamily: TYPOGRAPHY.serifFamily,
          fontSize: 32,
          fontWeight: "700",
          color: PALETTE.primary,
          marginTop: SPACING.sm,
        }}
      >
        கலைநோவா · KALAINOVA
      </Text>
      <Text
        style={{
          fontFamily: TYPOGRAPHY.sansFamily,
          fontSize: TYPOGRAPHY.body.fontSize,
          color: PALETTE.textSecondary,
          textAlign: "center",
          marginTop: SPACING.xs,
        }}
      >
        கைவினைஞர் கடை & கணக்குப் புத்தகம்
      </Text>
    </View>
  );
}
