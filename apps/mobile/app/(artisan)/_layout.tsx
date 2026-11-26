import { Tabs } from "expo-router";
import { Home, Package, ClipboardList, IndianRupee, HelpCircle } from "lucide-react-native";
import { PALETTE, TYPOGRAPHY } from "../../constants/theme";
import { t } from "../../constants/i18n";
import { useAuthStore } from "../../store/authStore";

export default function ArtisanTabLayout() {
  const { language } = useAuthStore();

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
          title: t(language, "tabHome"),
          headerShown: false,
          tabBarIcon: ({ color }) => <Home size={22} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: t(language, "tabProducts"),
          tabBarIcon: ({ color }) => <Package size={22} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: t(language, "tabOrders"),
          tabBarIcon: ({ color }) => <ClipboardList size={22} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="money"
        options={{
          title: t(language, "tabMoney"),
          tabBarIcon: ({ color }) => <IndianRupee size={22} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          title: t(language, "tabHelp"),
          tabBarIcon: ({ color }) => <HelpCircle size={22} strokeWidth={1.75} color={color} />,
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null, title: "My Shop" }} />
      <Tabs.Screen name="notifications" options={{ href: null, title: "Alerts" }} />
      <Tabs.Screen name="settings" options={{ href: null, title: "Settings" }} />
    </Tabs>
  );
}
