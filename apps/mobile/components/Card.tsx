import React from "react";
import { View, ViewStyle } from "react-native";
import { PALETTE, RADIUS, SPACING } from "../constants/theme";

export function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return (
    <View
      style={[
        {
          backgroundColor: PALETTE.surface,
          borderRadius: RADIUS.card,
          borderWidth: 1,
          borderColor: PALETTE.border,
          padding: SPACING.sm,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
