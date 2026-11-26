import React from "react";
import { View } from "react-native";
import { PALETTE, SPACING } from "../constants/theme";

export function Skeleton({ rows = 3 }: { rows?: number }) {
  return (
    <View style={{ gap: SPACING.xs }}>
      {Array.from({ length: rows }).map((_, i) => (
        <View
          key={i}
          style={{
            height: 64,
            borderRadius: 12,
            backgroundColor: PALETTE.surfaceAlt,
            borderWidth: 1,
            borderColor: PALETTE.border,
          }}
        />
      ))}
    </View>
  );
}
