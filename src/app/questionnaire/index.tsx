import { Host, Picker } from "@expo/ui";
import { router } from "expo-router";
import { useState } from "react";
import { Button, Text as RNText, View } from "react-native";
import { type Sex, useQuestionnaireContext } from "./questionnaire-context";

export default function QuestionnaireScreen() {
  const questionnaire = useQuestionnaireContext();
  const [sex, setSex] = useState<Sex | "unknown">(
    questionnaire.sex ?? "unknown",
  );

  return (
    <View
      style={{
        alignItems: "center",
        flex: 1,
        gap: 16,
        justifyContent: "center",
        padding: 16,
      }}
    >
      <RNText>Sex: </RNText>
      <Host matchContents>
        <Picker onValueChange={setSex} selectedValue={sex}>
          <Picker.Item label="Male" value="m" />
          <Picker.Item label="Female" value="f" />
          <Picker.Item label="Unspecified" value="unknown" />
        </Picker>
      </Host>
      <Button
        disabled={sex === "unknown"}
        onPress={() => {
          if (sex === "unknown") {
            return;
          }

          questionnaire.resetForSex(sex);
          router.push("/questionnaire/1");
        }}
        title="Start"
      />
    </View>
  );
}
