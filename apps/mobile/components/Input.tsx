import React from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";
import { PALETTE, RADIUS, SPACING, TYPOGRAPHY } from "../constants/theme";

interface InputProps extends TextInputProps {
  label?: string;
}

export function Input({ label, style, ...props }: InputProps) {
  return (
    <View style={{ marginBottom: SPACING.sm }}>
      {label ? (
        <Text
          style={{
            fontFamily: TYPOGRAPHY.sansFamily,
            fontSize: TYPOGRAPHY.body.fontSize,
            fontWeight: "600",
            color: PALETTE.text,
            marginBottom: SPACING.xs,
          }}
        >
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={PALETTE.textSecondary}
        style={[
          {
            minHeight: 48,
            backgroundColor: PALETTE.surface,
            borderWidth: 1,
            borderColor: PALETTE.border,
            borderRadius: RADIUS.control,
            paddingHorizontal: SPACING.sm,
            paddingVertical: 12,
            fontSize: TYPOGRAPHY.body.fontSize,
            fontFamily: TYPOGRAPHY.sansFamily,
            color: PALETTE.text,
          },
          style,
        ]}
        {...props}
      />
    </View>
  );
}
