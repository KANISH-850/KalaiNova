import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../constants/theme";

interface ListItemProps {
  title: string;
  subtitle?: string;
  rightText?: string;
  rightColor?: string;
  leftIcon?: React.ReactNode;
  onPress?: () => void;
  showChevron?: boolean;
}

export function ListItem({
  title,
  subtitle,
  rightText,
  rightColor = PALETTE.text,
  leftIcon,
  onPress,
  showChevron = false,
}: ListItemProps) {
  const Container: any = onPress ? TouchableOpacity : View;
  return (
    <Container
      onPress={onPress}
      activeOpacity={0.75}
      style={{
        minHeight: 56,
        paddingVertical: 12,
        paddingHorizontal: SPACING.sm,
        backgroundColor: PALETTE.surface,
        borderBottomWidth: 1,
        borderBottomColor: PALETTE.border,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {leftIcon ? <View style={{ width: 28, alignItems: "center" }}>{leftIcon}</View> : null}
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: TYPOGRAPHY.sansFamily,
            fontSize: TYPOGRAPHY.body.fontSize,
            fontWeight: "600",
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
              color: PALETTE.textSecondary,
              marginTop: 2,
            }}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
      {rightText ? (
        <Text
          style={{
            fontFamily: TYPOGRAPHY.sansFamily,
            fontSize: TYPOGRAPHY.body.fontSize,
            fontWeight: "700",
            color: rightColor,
          }}
        >
          {rightText}
        </Text>
      ) : null}
      {showChevron ? <ChevronRight size={20} strokeWidth={1.75} color={PALETTE.textSecondary} /> : null}
    </Container>
  );
}
