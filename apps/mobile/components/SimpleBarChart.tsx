import React from "react";
import { Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { PALETTE, TYPOGRAPHY } from "../constants/theme";

interface BarPoint {
  label: string;
  value: number;
}

export function SimpleBarChart({ data }: { data: BarPoint[] }) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 96;

  return (
    <View style={{ paddingTop: 8 }}>
      <View style={{ flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", height: chartHeight + 28 }}>
        {data.map((item) => {
          const barH = Math.max(8, Math.round((item.value / maxVal) * chartHeight));
          return (
            <View key={item.label} style={{ alignItems: "center", flex: 1 }}>
              <Svg width={28} height={chartHeight}>
                <Rect
                  x={2}
                  y={chartHeight - barH}
                  width={24}
                  height={barH}
                  rx={4}
                  fill={PALETTE.primary}
                />
              </Svg>
              <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 14, color: PALETTE.textSecondary, marginTop: 4 }}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
