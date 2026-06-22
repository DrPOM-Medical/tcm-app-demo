import { Host, Picker } from "@expo/ui";
import { router, useLocalSearchParams } from "expo-router";
import {
  createContext,
  type Dispatch,
  type SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  Button,
  FlatList,
  Text as RNText,
  ScrollView,
  View,
} from "react-native";
import { RadioGroup, RadioGroupOption } from "@/components/radio-group";
import {
  getResult,
  questionsForFemale,
  questionsForMale,
} from "@/constants/questionnaire-questions";

type Answer = {
  title: string;
  answer: string;
};

function getDefaultAnswer(question: string) {
  return {
    title: question,
    answer: "3",
  };
}

const QuestionnaireContext = createContext<{
  answers: Answer[];
  setAnswers: Dispatch<SetStateAction<Answer[]>>;
} | null>(null);

function useQuestionnaireContext() {
  return useContext(QuestionnaireContext);
}

function QuestionnaireContextProvider({
  sex,
  children,
}: {
  sex: "m" | "f";
  children: React.ReactNode;
}) {
  const [answers, setAnswers] = useState<Answer[]>(
    sex === "m"
      ? questionsForMale.map(getDefaultAnswer)
      : questionsForFemale.map(getDefaultAnswer),
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAnswers(
      sex === "m"
        ? questionsForMale.map(getDefaultAnswer)
        : questionsForFemale.map(getDefaultAnswer),
    );
  }, [sex]);

  return (
    <QuestionnaireContext.Provider value={{ answers, setAnswers }}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export default function QuestionnaireScreen() {
  const { page } = useLocalSearchParams<{ page: string }>();
  let pageInt: number;
  try {
    pageInt = Number.parseInt(page, 10);
  } catch {
    pageInt = 0;
  }
  const [sex, setSex] = useState<"m" | "f" | "unknown">("unknown");

  if (sex === "unknown") {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <RNText>Sex: </RNText>
        <Host matchContents>
          <Picker onValueChange={setSex} selectedValue={sex}>
            <Picker.Item label="Male" value="m" />
            <Picker.Item label="Female" value="f" />
            <Picker.Item label="Unspecified" value="unknown" />
          </Picker>
        </Host>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={{
        paddingBottom: 120,
      }}
      style={{
        paddingTop: 16,
        paddingHorizontal: 16,
      }}
    >
      <RNText>Sex: </RNText>
      <Host matchContents>
        <Picker onValueChange={setSex} selectedValue={sex}>
          <Picker.Item label="Male" value="m" />
          <Picker.Item label="Female" value="f" />
        </Picker>
      </Host>
      <QuestionnaireContextProvider sex={sex}>
        <QuestionnairePage key={sex} page={pageInt} />
      </QuestionnaireContextProvider>
    </ScrollView>
  );
}

function QuestionnairePage({ page: _page }: { page: number }) {
  const ctx = useQuestionnaireContext();
  if (!ctx) {
    return null;
  }
  const { answers } = ctx;
  const computeResult = (answers: Answer[]) => {
    try {
      const parsedAnswers = answers.map((q) => {
        return Number.parseInt(q.answer, 10);
      });
      return getResult(parsedAnswers);
    } catch (e) {
      console.error("Something went wrong when parsing the answers: ", e);
    }
  };

  return (
    <View>
      <FlatList
        data={ctx.answers}
        ItemSeparatorComponent={
          <View
            style={{
              borderTopWidth: 1,
              borderColor: "#8f8f8f",
            }}
          />
        }
        renderItem={({ index }) => <Question index={index} />}
        scrollEnabled={false}
      />

      <Button
        onPress={() => {
          router.navigate({
            pathname: "/questionnaire/result",
            params: computeResult(answers),
          });
        }}
        title="Get Result"
      />
    </View>
  );
}

function Question({ index }: { index: number }) {
  const ctx = useQuestionnaireContext();
  const setAnswer = useCallback(
    (answer: string) => {
      if (!ctx) {
        return;
      }
      if (!isValidAnswer(answer)) {
        return;
      }
      ctx.setAnswers((prev) => {
        prev[index].answer = answer;
        return [...prev];
      });
    },
    [ctx, index],
  );

  if (!ctx) {
    return;
  }

  const question = ctx.answers[index];

  return (
    <View
      style={{
        paddingVertical: 8,
      }}
    >
      <RNText>
        {index + 1}: {question.title}
      </RNText>
      <RadioGroup onValueChange={setAnswer} value={question.answer}>
        <RadioGroupOption label="None" value="1" />
        <RadioGroupOption label="Rarely" value="2" />
        <RadioGroupOption label="Sometimes" value="3" />
        <RadioGroupOption label="Often" value="4" />
        <RadioGroupOption label="Always" value="5" />
      </RadioGroup>
    </View>
  );
}

function isValidAnswer(answer: string) {
  if (["1", "2", "3", "4", "5"].some((opt) => opt !== answer)) {
    return true;
  }
  return false;
}
