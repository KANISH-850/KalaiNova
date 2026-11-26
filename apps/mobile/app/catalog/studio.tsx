import { useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Sparkles, Scissors } from "lucide-react-native";
import { PALETTE, SPACING, TYPOGRAPHY } from "../../constants/theme";
import { api, SERVER_ROOT } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { StepIndicator } from "../../components/StepIndicator";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { Skeleton } from "../../components/Skeleton";
import { BeforeAfterSlider } from "../../components/BeforeAfterSlider";

export default function AIImageStudioScreen() {
  const { imageUri } = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();
  const { language } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const processImage = async (removeBg: boolean) => {
    if (!imageUri) {
      Alert.alert("Photo needed", "Please go back and pick a craft photo first.");
      return;
    }
    setLoading(true);
    try {
      const form = new FormData();
      form.append("file", { uri: imageUri, name: "product.jpg", type: "image/jpeg" } as any);
      const endpoint = removeBg ? "/ai/image/remove-background" : "/ai/image/enhance";
      const res = await api.post(endpoint, form, { headers: { "Content-Type": "multipart/form-data" } });
      setResult(res.data);
      if (removeBg && res.data.status === "unavailable") {
        Alert.alert("Studio note", res.data.error || "Background removal model is offline; lighting enhancement applied.");
      }
    } catch (err: any) {
      Alert.alert("Could not process photo", err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  const processedPath = result?.bg_removed_url || result?.enhanced_url;

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <StepIndicator currentStep={2} language={language} />
        <Header
          title="Clean your product photo"
          subtitle="Improve lighting or remove the background. Drag the slider to compare."
          speakText="Tap Improve Light or Remove Background, then slide across the photo to compare."
          language={language}
        />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.sm }}>
          <Button
            title="Improve light"
            variant="secondary"
            icon={<Sparkles size={18} strokeWidth={1.75} color={PALETTE.primary} />}
            onPress={() => processImage(false)}
            style={{ flex: 1 }}
          />
          <Button
            title="Remove background"
            variant="secondary"
            icon={<Scissors size={18} strokeWidth={1.75} color={PALETTE.accent} />}
            onPress={() => processImage(true)}
            style={{ flex: 1 }}
          />
        </View>

        {loading ? (
          <Skeleton rows={3} />
        ) : result && processedPath ? (
          <Card>
            <Text style={{ fontFamily: TYPOGRAPHY.sansFamily, fontSize: 16, fontWeight: "600", color: PALETTE.text, marginBottom: 8 }}>
              Slide to compare Before & After
            </Text>
            <BeforeAfterSlider
              beforeUri={`${SERVER_ROOT}${result.original_url}`}
              afterUri={`${SERVER_ROOT}${processedPath}`}
            />
          </Card>
        ) : null}
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button
          title="Next: Speak about craft"
          variant="primary"
          onPress={() =>
            router.push({
              pathname: "/catalog/voice",
              params: { imageUrl: processedPath || result?.original_url || "" },
            })
          }
        />
      </View>
    </View>
  );
}
