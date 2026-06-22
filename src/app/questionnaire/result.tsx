import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { unbalancedConstitutions } from "@/constants/questionnaire-questions";

export default function QuestionnaireResultScreen() {
  const convertedScores = useLocalSearchParams<{
    balanced: string;
    yangDeficient: string;
    yinDeficient: string;
    qiDeficient: string;
    phlegmDampness: string;
    dampHeat: string;
    stagnantBlood: string;
    stagnantQi: string;
    inheritedSpecial: string;
  }>();

  const result = convertedScoreToDetermination(convertedScores);
  if (!result) {
    return <Text>Something went wrong</Text>;
  }

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Balanced: {result.balanced}</Text>
      <Text>Yang Deficient: {result.yangDeficient}</Text>
      <Text>Yin Deficient: {result.yinDeficient}</Text>
      <Text>Qi Deficient: {result.qiDeficient}</Text>
      <Text>Phlegm Dampness: {result.phlegmDampness}</Text>
      <Text>Damp Heat: {result.dampHeat}</Text>
      <Text>Stagnant Blood: {result.stagnantBlood}</Text>
      <Text>Stagnant Qi: {result.stagnantQi}</Text>
      <Text>Inherited Special: {result.inheritedSpecial}</Text>
    </View>
  );
}

function convertedScoreToDetermination(scores: {
  balanced: string;
  yangDeficient: string;
  yinDeficient: string;
  qiDeficient: string;
  phlegmDampness: string;
  dampHeat: string;
  stagnantBlood: string;
  stagnantQi: string;
  inheritedSpecial: string;
}) {
  try {
    let balanced: "Yes" | "Basically Yes" | "No" = "No";
    const unbalancedDeterminations = unbalancedConstitutions.map(
      (constitution) => {
        if (Number.parseInt(scores[constitution], 10) >= 40) {
          return "Yes";
        }
        if (Number.parseInt(scores[constitution], 10) >= 30) {
          return "Tend To";
        }
        return "No";
      },
    );
    const normalizedBalanced = Number.parseInt(scores.balanced, 10);

    if (normalizedBalanced >= 60) {
      if (
        unbalancedConstitutions.every(
          (constitution) => Number.parseInt(scores[constitution], 10) < 30,
        )
      ) {
        balanced = "Yes";
      }
      if (
        unbalancedConstitutions.every(
          (constitution) => Number.parseInt(scores[constitution], 10) < 40,
        )
      ) {
        balanced = "Basically Yes";
      }
    }

    return {
      balanced,
      yangDeficient: unbalancedDeterminations[0],
      yinDeficient: unbalancedDeterminations[1],
      qiDeficient: unbalancedDeterminations[2],
      phlegmDampness: unbalancedDeterminations[3],
      dampHeat: unbalancedDeterminations[4],
      stagnantBlood: unbalancedDeterminations[5],
      stagnantQi: unbalancedDeterminations[6],
      inheritedSpecial: unbalancedDeterminations[7],
    };
  } catch (e) {
    console.error("Something went wrong: ", e);
    return undefined;
  }
}
