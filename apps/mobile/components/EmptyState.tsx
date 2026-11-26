import React from "react";
import { Text, View } from "react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../constants/theme";
import { Button } from "./Button";
import { KolamBorder } from "./KolamBorder";

interface EmptyStateProps {
  icon: React.ReactNode;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, message, actionLabel, onAction }: EmptyStateProps) {
  return (
    <View
      style={{
        backgroundColor: PALETTE.surface,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: PALETTE.border,
        padding: SPACING.md,
        alignItems: "center",
        gap: SPACING.sm,
      }}
    >
      <KolamBorder width={200} />
      <View style={{ marginTop: 4 }}>{icon}</View>
      <Text
        style={{
          fontFamily: TYPOGRAPHY.sansFamily,
          fontSize: TYPOGRAPHY.body.fontSize,
          lineHeight: TYPOGRAPHY.body.lineHeight,
          color: PALETTE.textSecondary,
          textAlign: "center",
        }}
      >
        {message}
      </Text>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} variant="primary" style={{ alignSelf: "stretch" }} />
      ) : null}
    </View>
  );
}
