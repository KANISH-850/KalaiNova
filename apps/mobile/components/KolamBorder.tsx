import React from "react";
import Svg, { Path, Circle } from "react-native-svg";
import { View } from "react-native";
import { PALETTE } from "../constants/theme";

export function KolamBorder({ width = 320 }: { width?: number }) {
  return (
    <View style={{ overflow: "hidden", alignItems: "center", opacity: 0.45 }}>
      <Svg width={width} height={14} viewBox="0 0 320 14">
        <Path
          d="M0 7 Q 10 1, 20 7 T 40 7 T 60 7 T 80 7 T 100 7 T 120 7 T 140 7 T 160 7 T 180 7 T 200 7 T 220 7 T 240 7 T 260 7 T 280 7 T 300 7 T 320 7"
          fill="none"
          stroke={PALETTE.accent}
          strokeWidth={1.25}
        />
        {[20, 60, 100, 140, 180, 220, 260, 300].map((cx) => (
          <Circle key={cx} cx={cx} cy={7} r={1.8} fill={PALETTE.highlight} />
        ))}
      </Svg>
    </View>
  );
}
