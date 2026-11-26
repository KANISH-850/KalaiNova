import { Stack } from "expo-router";
import { PALETTE, TYPOGRAPHY } from "../constants/theme";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: PALETTE.bg },
        headerShadowVisible: false,
        headerTintColor: PALETTE.text,
        headerTitleStyle: {
          fontFamily: TYPOGRAPHY.serifFamily,
          fontWeight: "700",
          fontSize: 20,
        },
        contentStyle: { backgroundColor: PALETTE.bg },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/language" options={{ title: "Language" }} />
      <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)/onboarding" options={{ title: "Shop Setup" }} />
      <Stack.Screen name="(artisan)" options={{ headerShown: false }} />
      <Stack.Screen name="(buyer)" options={{ headerShown: false }} />
      <Stack.Screen name="catalog/camera" options={{ title: "Step 1: Photo" }} />
      <Stack.Screen name="catalog/studio" options={{ title: "Step 2: Clean Photo" }} />
      <Stack.Screen name="catalog/voice" options={{ title: "Step 3: Speak" }} />
      <Stack.Screen name="catalog/preview" options={{ title: "Step 5: Save Craft" }} />
      <Stack.Screen name="pricing/index" options={{ title: "Step 4: Fair Price" }} />
      <Stack.Screen name="finance/index" options={{ title: "Money Book" }} />
      <Stack.Screen name="finance/ledger" options={{ title: "Daily Ledger" }} />
      <Stack.Screen name="finance/invoices" options={{ title: "Bills & Receipts" }} />
      <Stack.Screen name="finance/payments" options={{ title: "UPI & Payments" }} />
      <Stack.Screen name="finance/assistance" options={{ title: "Govt. Schemes" }} />
      <Stack.Screen name="marketplace/index" options={{ title: "Craft Market" }} />
      <Stack.Screen name="marketplace/orders" options={{ title: "Orders" }} />
      <Stack.Screen name="assistant/index" options={{ title: "Shop Helper" }} />
    </Stack>
  );
}
