import { Tabs } from "expo-router";
import { Search, Briefcase } from "lucide-react-native";
import { PALETTE, TYPOGRAPHY } from "../../constants/theme";

export default function BuyerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PALETTE.primary,
        tabBarInactiveTintColor: PALETTE.textSecondary,
        tabBarStyle: {
          backgroundColor: PALETTE.surface,
          borderTopColor: PALETTE.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontFamily: TYPOGRAPHY.sansFamily,
          fontSize: 13,
          fontWeight: "600",
        },
        headerStyle: { backgroundColor: PALETTE.bg },
        headerShadowVisible: false,
        headerTintColor: PALETTE.text,
        headerTitleStyle: {
          fontFamily: TYPOGRAPHY.serifFamily,
          fontWeight: "700",
          fontSize: 20,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover Crafts",
          tabBarIcon: ({ color }) => <Search size={22} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="enquiries"
        options={{
          title: "Enquiries",
          tabBarIcon: ({ color }) => <Briefcase size={22} strokeWidth={1.75} color={color} />,
        }}
      />
    </Tabs>
  );
}
