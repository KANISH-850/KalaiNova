import { useState } from "react";
import { Alert, Image, ScrollView, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Camera, Image as ImageIcon } from "lucide-react-native";
import { PALETTE, RADIUS, SPACING } from "../../constants/theme";
import { useAuthStore } from "../../store/authStore";
import { StepIndicator } from "../../components/StepIndicator";
import { Header } from "../../components/Header";
import { Button } from "../../components/Button";
import { Card } from "../../components/Card";
import { EmptyState } from "../../components/EmptyState";

export default function ProductCameraScreen() {
  const router = useRouter();
  const { language } = useAuthStore();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert("Permission needed", "Please allow camera or photo access to add your craft.");
      return;
    }

    const res = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.85 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.85 });

    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <StepIndicator currentStep={1} language={language} />
        <Header
          title="Take a photo of your craft"
          subtitle="Use good daylight. We will clean the background in the next step."
          speakText="Take a clear photo of your craft in daylight, or choose one from your phone gallery."
          language={language}
        />

        <View style={{ flexDirection: "row", gap: 8, marginBottom: SPACING.sm }}>
          <Button
            title="Camera"
            variant="secondary"
            icon={<Camera size={20} strokeWidth={1.75} color={PALETTE.primary} />}
            onPress={() => pickImage(true)}
            style={{ flex: 1 }}
          />
          <Button
            title="Gallery"
            variant="secondary"
            icon={<ImageIcon size={20} strokeWidth={1.75} color={PALETTE.primary} />}
            onPress={() => pickImage(false)}
            style={{ flex: 1 }}
          />
        </View>

        {imageUri ? (
          <Card style={{ padding: 8 }}>
            <Image source={{ uri: imageUri }} style={{ width: "100%", height: 280, borderRadius: RADIUS.control }} resizeMode="cover" />
          </Card>
        ) : (
          <EmptyState
            icon={<Camera size={32} strokeWidth={1.75} color={PALETTE.textSecondary} />}
            message="No photo chosen yet. Tap Camera or Gallery above."
          />
        )}
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button
          title="Next: Clean Photo"
          variant="primary"
          disabled={!imageUri}
          onPress={() => router.push({ pathname: "/catalog/studio", params: { imageUri: imageUri! } })}
        />
      </View>
    </View>
  );
}
