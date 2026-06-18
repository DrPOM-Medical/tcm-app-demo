import { Button, Column, Host, Text } from "@expo/ui";
import Constants from "expo-constants";
import { File } from "expo-file-system";
import { Image } from "expo-image";
import { SaveFormat, useImageManipulator } from "expo-image-manipulator";
import {
  launchCameraAsync,
  launchImageLibraryAsync,
  useCameraPermissions,
} from "expo-image-picker";
import { useCallback, useState } from "react";
import { Button as RNButton, Text as RNText, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";

function getApiBaseUrl() {
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const [host] = hostUri.split(":");
    return `http://${host}:8000`;
  }
  return "http://localhost:8000";
}

type ImageAsset = {
  uri: string;
  mimeType: string;
  fileName: string;
};

export default function HomeScreen() {
  const [imageAsset, setImageAsset] = useState<ImageAsset | null>(null);
  const [cameraPermission, requestPermission] = useCameraPermissions();
  const imageManipulatorCtx = useImageManipulator(imageAsset?.uri ?? "");

  const pickFromGallery = useCallback(async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 1,
    });
    if (result.canceled || !result.assets?.at(0)?.uri) {
      return;
    }
    const asset = result.assets[0];
    setImageAsset({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
    });
  }, []);

  const takePhoto = useCallback(async () => {
    if (
      cameraPermission?.granted !== true &&
      (await requestPermission()).granted !== true
    ) {
      console.error("Camera permission required");
      return;
    }
    const result = await launchCameraAsync({
      mediaTypes: ["images"],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.at(0)?.uri) {
      return;
    }
    const asset = result.assets[0];
    setImageAsset({
      uri: asset.uri,
      mimeType: asset.mimeType ?? "image/jpeg",
      fileName: asset.fileName ?? `photo_${Date.now()}.jpg`,
    });
  }, [cameraPermission, requestPermission]);

  const uploadImage = useCallback(
    async (asset: ImageAsset) => {
      let imageUri = asset.uri;
      let imageFileName = asset.fileName;
      if (asset.mimeType === "image/heic") {
        console.log("image is heic");
        const renderedImage = await imageManipulatorCtx.renderAsync();
        const convertedImage = await renderedImage.saveAsync({
          format: SaveFormat.JPEG,
        });
        imageUri = convertedImage.uri;
        if (imageFileName.endsWith(".heic")) {
          imageFileName = imageFileName.replace(".heic", ".jpg");
        }
      }
      const file = new File(imageUri);
      console.debug("image file name", file.name);
      const base64 = await file.base64();
      const binaryString = atob(base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(`${getApiBaseUrl()}/analyze-tongue`, {
        method: "POST",
        body: formData,
      });
      file.delete();
      if (!response.ok) {
        console.error("Failed to upload image", response.statusText);
      }
      console.log("Response: ", await response.json());
    },
    [imageManipulatorCtx],
  );

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Welcome to TCM</ThemedText>
        <Host matchContents>
          <Column alignment="center" spacing={16}>
            <Button onPress={takePhoto}>
              <Text>Take a photo</Text>
            </Button>
            <Button onPress={pickFromGallery}>
              <Text>Upload your tongue image</Text>
            </Button>
          </Column>
        </Host>
        {imageAsset && (
          <>
            <RNText>Selected image:</RNText>
            <Image
              contentFit="contain"
              source={{ uri: imageAsset?.uri }}
              style={styles.image}
            />
            <RNButton
              onPress={() => uploadImage(imageAsset)}
              title="Upload Image"
            />
          </>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    flexDirection: "row",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    alignItems: "center",
    gap: Spacing.three,
    paddingBottom: BottomTabInset + Spacing.three,
    maxWidth: MaxContentWidth,
  },
  image: {
    width: 80,
    height: 80,
  },
  uploadButton: {
    marginTop: Spacing.three,
  },
});
