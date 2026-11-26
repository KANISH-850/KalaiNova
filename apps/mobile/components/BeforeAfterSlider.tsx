import React, { useState } from "react";
import { Image, PanResponder, Text, View } from "react-native";
import { MoveHorizontal } from "lucide-react-native";
import { PALETTE, RADIUS, TYPOGRAPHY } from "../constants/theme";

interface BeforeAfterSliderProps {
  beforeUri: string;
  afterUri: string;
}

export function BeforeAfterSlider({ beforeUri, afterUri }: BeforeAfterSliderProps) {
  const [containerWidth, setContainerWidth] = useState(300);
  const [sliderX, setSliderX] = useState(150);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (_, gestureState) => {
      const next = Math.max(24, Math.min(containerWidth - 24, sliderX + gestureState.dx));
      setSliderX(next);
    },
  });

  const ratio = containerWidth > 0 ? Math.round((sliderX / containerWidth) * 100) : 50;

  return (
    <View>
      <View
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setContainerWidth(w);
          setSliderX(w / 2);
        }}
        style={{
          width: "100%",
          height: 260,
          borderRadius: RADIUS.card,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: PALETTE.border,
          backgroundColor: PALETTE.surfaceAlt,
          position: "relative",
        }}
      >
        <Image source={{ uri: afterUri }} style={{ width: "100%", height: "100%", position: "absolute" }} resizeMode="cover" />
        <View style={{ width: sliderX, height: "100%", overflow: "hidden", position: "absolute", left: 0, top: 0 }}>
          <Image source={{ uri: beforeUri }} style={{ width: containerWidth, height: "100%" }} resizeMode="cover" />
        </View>

        <View
          {...panResponder.panHandlers}
          style={{
            position: "absolute",
            left: sliderX - 20,
            top: 0,
            bottom: 0,
            width: 40,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View style={{ width: 2, height: "100%", backgroundColor: PALETTE.surface }} />
          <View
            style={{
              position: "absolute",
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: PALETTE.primary,
              borderWidth: 2,
              borderColor: PALETTE.surface,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MoveHorizontal size={18} strokeWidth={1.75} color={PALETTE.surface} />
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 8 }}>
        <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, color: PALETTE.textSecondary }}>
          Before ({ratio}%)
        </Text>
        <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: PALETTE.primary }}>
          After ({100 - ratio}%)
        </Text>
      </View>
    </View>
  );
}
