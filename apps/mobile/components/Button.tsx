import React from "react";
import { ActivityIndicator, Text, TouchableOpacity, ViewStyle } from "react-native";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../constants/theme";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = "primary",
  loading = false,
  disabled = false,
  icon,
  style,
}: ButtonProps) {
  const bg =
    variant === "primary"
      ? PALETTE.primary
      : variant === "accent"
      ? PALETTE.accent
      : variant === "secondary"
      ? PALETTE.surface
      : "transparent";

  const textColor =
    variant === "primary" || variant === "accent" ? PALETTE.surface : PALETTE.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[
        {
          minHeight: 48,
          borderRadius: RADIUS.control,
          backgroundColor: bg,
          borderWidth: variant === "secondary" ? 1 : 0,
          borderColor: PALETTE.border,
          paddingHorizontal: SPACING.sm,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: SPACING.xs,
          opacity: disabled ? 0.55 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <>
          {icon}
          <Text
            style={{
              fontFamily: TYPOGRAPHY.sansFamily,
              fontSize: TYPOGRAPHY.bodyBold.fontSize,
              fontWeight: "600",
              color: textColor,
            }}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}
