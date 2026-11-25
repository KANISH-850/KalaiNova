import { useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Audio } from "expo-av";
import { useLocalSearchParams, useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";
import { api } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export default function VoiceCataloguingScreen() {
  const { imageUrl } = useLocalSearchParams<{ imageUrl?: string }>();
  const router = useRouter();
  const { language, user } = useAuthStore();
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState(
    "This is a handmade Kanchipuram silk saree with traditional zari work."
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
            Alert.alert("IndicConformer Status", res.data.error || "ASR model not enabled locally. You can edit the text directly.");
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
      Alert.alert("Audio Error", err.message);
    }
  };

  const generateCatalog = async () => {
    setLoading(true);
    try {
      const form = new FormData();
      form.append("transcript", transcript);
      form.append("source_language", language);
      form.append("craft_category", user?.artisan_profile?.craft_category || "Handloom & Textiles");
      form.append("artisan_location", user?.artisan_profile?.location || "India");

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
      Alert.alert("Catalogue Error", err?.response?.data?.detail || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 8 }}>
        Multilingual Voice Cataloguing ({language.toUpperCase()})
      </Text>
      <Text style={{ color: COLORS.mutedText, marginBottom: 16 }}>
        Tap the microphone to record in Tamil, Hindi, Telugu, Kannada, Malayalam, or English.
      </Text>

      <TouchableOpacity
        onPress={toggleRecording}
        style={{
          backgroundColor: recording ? COLORS.danger : COLORS.teal,
          padding: 20,
          borderRadius: 16,
          alignItems: "center",
          marginBottom: 18,
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>
          {recording ? "Stop Recording & Transcribe" : "Start Voice Recording"}
        </Text>
      </TouchableOpacity>

      <Text style={{ fontWeight: "700", marginBottom: 6 }}>Transcript / Product Description</Text>
      <TextInput
        value={transcript}
        onChangeText={setTranscript}
        multiline
        numberOfLines={4}
        style={{ backgroundColor: "#fff", padding: 14, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, minHeight: 100, textAlignVertical: "top", marginBottom: 16 }}
      />

      {loading && <ActivityIndicator size="large" color={COLORS.artisanOrange} style={{ marginBottom: 12 }} />}

      <TouchableOpacity onPress={generateCatalog} style={{ backgroundColor: COLORS.artisanOrange, padding: 16, borderRadius: 14, alignItems: "center" }}>
        <Text style={{ color: "#fff", fontWeight: "800", fontSize: 16 }}>Generate Multilingual Catalogue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
