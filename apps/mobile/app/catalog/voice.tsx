import { useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Mic, Square } from "lucide-react-native";
import { PALETTE, SPACING } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { StepIndicator } from "../../components/StepIndicator";
import { Header } from "../../components/Header";
import { Input } from "../../components/Input";
import { Button } from "../../components/Button";

export default function VoiceCataloguingScreen() {
  const { imageUrl } = useLocalSearchParams<{ imageUrl?: string }>();
  const router = useRouter();
  const { language, user } = useAuthStore();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState(
    "Handwoven Kanchipuram pure silk saree with traditional temple zari border."
  );
  const [loading, setLoading] = useState(false);

  const toggleRecording = async () => {
    try {
      if (recording) {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
          setLoading(true);
          const form = new FormData();
          form.append("file", { uri, name: "voice.m4a", type: "audio/m4a" } as any);
          form.append("language_code", language);
          const res = await api.post("/ai/speech/transcribe", form, {
            headers: { "Content-Type": "multipart/form-data" },
          });
          setLoading(false);
          if (res.data.success) {
            setTranscript(res.data.transcript);
          } else {
            Alert.alert("Voice note", res.data.error || "Voice transcription is offline. You can type or edit below.");
          }
        }
      } else {
        const perm = await Audio.requestPermissionsAsync();
        if (!perm.granted) return Alert.alert("Microphone permission needed");
        await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
        const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
        setRecording(rec);
      }
    } catch (err: any) {
      setLoading(false);
      Alert.alert("Microphone error", err.message);
    }
  };

  const generateCatalog = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("transcript", transcript);
      form.append("source_language", language);
      form.append("craft_category", user?.artisan_profile?.craft_category || "Handloom & Textiles");
      form.append("artisan_location", user?.artisan_profile?.location || "Kanchipuram, Tamil Nadu");

      const res = await api.post("/ai/catalog/generate", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push({
        pathname: "/catalog/preview",
        params: {
          catalogJson: JSON.stringify(res.data),
          transcript,
          imageUrl: imageUrl || "",
        },
      });
    } catch (err: any) {
      Alert.alert("Could not prepare listing", err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: PALETTE.bg }}>
      <ScrollView contentContainerStyle={{ padding: SPACING.sm, paddingBottom: 100 }}>
        <StepIndicator currentStep={3} language={language} />
        <Header
          title="Describe your craft"
          subtitle="Tap the mic and speak in Tamil, Hindi, or English. We will write the listing for you."
          speakText="Tap Start Speaking and describe your craft, material, and size."
          language={language}
        />

        <Button
          title={recording ? "Stop speaking" : "Start speaking"}
          variant={recording ? "accent" : "secondary"}
          icon={recording ? <Square size={20} strokeWidth={1.75} color={PALETTE.surface} /> : <Mic size={20} strokeWidth={1.75} color={PALETTE.primary} />}
          onPress={toggleRecording}
          style={{ marginBottom: SPACING.sm }}
        />

        <Input
          label="Your craft description"
          value={transcript}
          onChangeText={setTranscript}
          multiline
          numberOfLines={4}
          style={{ minHeight: 110, textAlignVertical: "top" }}
        />
      </ScrollView>

      <View style={{ padding: SPACING.sm, backgroundColor: PALETTE.bg, borderTopWidth: 1, borderTopColor: PALETTE.border }}>
        <Button
          title="Prepare listing"
          variant="primary"
          loading={loading}
          onPress={generateCatalog}
        />
      </View>
    </View>
  );
}
