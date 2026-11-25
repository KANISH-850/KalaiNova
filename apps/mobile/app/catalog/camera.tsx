import { useState } from "react";
import { Alert, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { COLORS } from "../../constants/theme";

export default function ProductCameraScreen() {
  const router = useRouter();
  const [imageUri, setImageUri] = useState<string | null>(null);

  const pickImage = async (fromCamera: boolean) => {
    const perm = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!perm.granted) {
      Alert.alert("Permission Required", "Please allow camera/gallery access.");
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
    <ScrollView contentContainerStyle={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: "800", color: COLORS.deepNavy, marginBottom: 12 }}>
        Capture or Upload Craft Photo
      </Text>

      <View style={{ flexDirection: "row", gap: 12, marginBottom: 18 }}>
        <TouchableOpacity onPress={() => pickImage(true)} style={{ flex: 1, backgroundColor: COLORS.artisanOrange, padding: 16, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Open Camera</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => pickImage(false)} style={{ flex: 1, backgroundColor: COLORS.deepNavy, padding: 16, borderRadius: 12, alignItems: "center" }}>
          <Text style={{ color: "#fff", fontWeight: "700" }}>Gallery Upload</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={{ backgroundColor: "#fff", padding: 14, borderRadius: 14, borderWidth: 1, borderColor: COLORS.border }}>
          <Image source={{ uri: imageUri }} style={{ width: "100%", height: 260, borderRadius: 12, marginBottom: 14 }} />
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/catalog/studio", params: { imageUri } })}
            style={{ backgroundColor: COLORS.teal, padding: 15, borderRadius: 12, alignItems: "center" }}
          >
            <Text style={{ color: "#fff", fontWeight: "800" }}>Open in AI Image Studio</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
