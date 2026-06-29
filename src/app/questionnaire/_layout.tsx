import { Stack } from "expo-router";
import { QuestionnaireContextProvider } from "./questionnaire-context";

export default function QuestionnaiareStackLayout() {
  return (
    <QuestionnaireContextProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: "Questionnaire" }} />
        <Stack.Screen name="[page]" options={{ title: "Questionnaire" }} />
        <Stack.Screen name="result" options={{ title: "Result" }} />
      </Stack>
    </QuestionnaireContextProvider>
  );
}
