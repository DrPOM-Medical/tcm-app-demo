import { Stack } from "expo-router";

export default function QuestionnaiareStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="result" />
    </Stack>
  );
}
