import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/theme";

export default function BuyerTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.teal,
        headerStyle: { backgroundColor: COLORS.deepNavy },
        headerTintColor: COLORS.warmCream,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover Crafts",
          tabBarIcon: ({ color, size }) => <Ionicons name="search" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="enquiries"
        options={{
          title: "Enquiries & Orders",
          tabBarIcon: ({ color, size }) => <Ionicons name="briefcase" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
