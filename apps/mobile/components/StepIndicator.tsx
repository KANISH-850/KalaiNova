import React from "react";
import { Text, View } from "react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../constants/theme";
import { t } from "../constants/i18n";

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5;
  language?: string;
}

export function StepIndicator({ currentStep, language = "ta" }: StepIndicatorProps) {
  const steps = [
    t(language, "stepPhoto"),
    t(language, "stepClean"),
    t(language, "stepSpeak"),
    t(language, "stepPrice"),
    t(language, "stepSave"),
  ];

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: SPACING.sm,
        paddingVertical: 10,
        paddingHorizontal: 12,
        backgroundColor: PALETTE.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: PALETTE.border,
      }}
    >
      {steps.map((label, idx) => {
        const stepNum = idx + 1;
        const active = stepNum === currentStep;
        const done = stepNum < currentStep;
        return (
          <View key={label} style={{ alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 26,
                height: 26,
                borderRadius: 13,
                backgroundColor: active
                  ? PALETTE.highlight
                  : done
                  ? PALETTE.success
                  : PALETTE.surfaceAlt,
                justifyContent: "center",
                alignItems: "center",
                marginBottom: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "700",
                  color: active || done ? PALETTE.surface : PALETTE.textSecondary,
                }}
              >
                {stepNum}
              </Text>
            </View>
            <Text
              numberOfLines={1}
              style={{
                fontFamily: TYPOGRAPHY.sansFamily,
                fontSize: 12,
                fontWeight: active ? "700" : "500",
                color: active ? PALETTE.text : PALETTE.textSecondary,
              }}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
