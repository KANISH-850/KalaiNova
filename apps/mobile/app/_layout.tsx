import { Stack } from "expo-router";
import { COLORS } from "../constants/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.deepNavy },
        headerTintColor: COLORS.warmCream,
        headerTitleStyle: { fontWeight: "700" },
        contentStyle: { backgroundColor: COLORS.lightBg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/language" options={{ title: "Select Language" }} />
      <Stack.Screen name="(auth)/login" options={{ title: "KALAINOVA Sign In" }} />
      <Stack.Screen name="(auth)/onboarding" options={{ title: "Artisan Onboarding" }} />
      <Stack.Screen name="(artisan)" options={{ headerShown: false }} />
      <Stack.Screen name="(buyer)" options={{ headerShown: false }} />
      <Stack.Screen name="catalog/camera" options={{ title: "Product Camera" }} />
      <Stack.Screen name="catalog/studio" options={{ title: "AI Image Studio" }} />
      <Stack.Screen name="catalog/voice" options={{ title: "Voice Cataloguing" }} />
      <Stack.Screen name="catalog/preview" options={{ title: "AI Catalogue Preview" }} />
      <Stack.Screen name="pricing/index" options={{ title: "AI Dynamic Pricing" }} />
      <Stack.Screen name="finance/index" options={{ title: "Financial Dashboard" }} />
      <Stack.Screen name="finance/ledger" options={{ title: "Digital Ledger" }} />
      <Stack.Screen name="finance/invoices" options={{ title: "Smart Invoice Generator" }} />
      <Stack.Screen name="finance/payments" options={{ title: "UPI & Payment Tracking" }} />
      <Stack.Screen name="finance/assistance" options={{ title: "Financial Assistance" }} />
      <Stack.Screen name="marketplace/index" options={{ title: "Craft Marketplace" }} />
      <Stack.Screen name="marketplace/orders" options={{ title: "Order Management" }} />
      <Stack.Screen name="assistant/index" options={{ title: "AI Business Assistant" }} />
    </Stack>
  );
}
