import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { Volume2 } from "lucide-react-native";
import * as Speech from "expo-speech";
import { PALETTE, SPACING, TYPOGRAPHY } from "../constants/theme";
import { KolamBorder } from "./KolamBorder";

interface HeaderProps {
  title: string;
  subtitle?: string;
  speakText?: string;
  language?: string;
  showKolam?: boolean;
}

export function Header({
  title,
  subtitle,
  speakText,
  language = "ta",
  showKolam = true,
}: HeaderProps) {
  const handleSpeak = () => {
    if (!speakText) return;
    Speech.speak(speakText, {
      language: language === "ta" ? "ta-IN" : language === "hi" ? "hi-IN" : "en-IN",
    });
  };

  return (
    <View style={{ marginBottom: SPACING.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.serifFamily,
              fontSize: TYPOGRAPHY.display.fontSize,
              lineHeight: TYPOGRAPHY.display.lineHeight,
              fontWeight: "700",
              color: PALETTE.text,
            }}
          >
            {title}
          </Text>
          {subtitle ? (
            <Text
              style={{
                fontFamily: TYPOGRAPHY.sansFamily,
                fontSize: TYPOGRAPHY.body.fontSize,
                lineHeight: TYPOGRAPHY.body.lineHeight,
                color: PALETTE.textSecondary,
                marginTop: 4,
              }}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>
        {speakText ? (
          <TouchableOpacity
            onPress={handleSpeak}
            accessibilityLabel="Listen to guidance"
            style={{
              width: 48,
              height: 48,
              borderRadius: 8,
              backgroundColor: PALETTE.surfaceAlt,
              borderWidth: 1,
              borderColor: PALETTE.border,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Volume2 size={22} strokeWidth={1.75} color={PALETTE.primary} />
          </TouchableOpacity>
        ) : null}
      </View>
      {showKolam ? (
        <View style={{ marginTop: 10 }}>
          <KolamBorder />
        </View>
      ) : null}
    </View>
  );
}
