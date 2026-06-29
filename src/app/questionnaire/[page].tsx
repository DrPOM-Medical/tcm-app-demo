import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import {
  Button,
  FlatList,
  Text as RNText,
  ScrollView,
  View,
} from "react-native";
import { RadioGroup, RadioGroupOption } from "@/components/radio-group";
import { getResult } from "@/constants/questionnaire-questions";
import {
  type Answer,
  QUESTIONS_PER_PAGE,
  TOTAL_PAGES,
  useQuestionnaireContext,
} from "./questionnaire-context";

type PageAnswer = Answer & {
  index: number;
};

export default function QuestionnairePageScreen() {
  const { page } = useLocalSearchParams<{ page?: string }>();
  const questionnaire = useQuestionnaireContext();
  const pageNumber = getPageNumber(page);
  const shouldRedirectToStart =
    !questionnaire.sex || questionnaire.answers.length === 0;

  useEffect(() => {
    if (shouldRedirectToStart) {
      router.replace("/questionnaire");
      return;
    }

    if (!pageNumber) {
      router.replace("/questionnaire/1");
    }
  }, [pageNumber, shouldRedirectToStart]);

  if (shouldRedirectToStart || !pageNumber) {
    return null;
  }

  const startIndex = (pageNumber - 1) * QUESTIONS_PER_PAGE;
  const pageAnswers = questionnaire.answers
    .slice(startIndex, startIndex + QUESTIONS_PER_PAGE)
    .map((answer, offset) => ({
      ...answer,
      index: startIndex + offset,
    }));

  return (
    <ScrollView
      style={{
        paddingHorizontal: 16,
        paddingTop: 16,
      }}
    >
      <RNText>
        Page {pageNumber} of {TOTAL_PAGES}
      </RNText>
      <FlatList
        data={pageAnswers}
        ItemSeparatorComponent={
          <View
            style={{
              borderColor: "#8f8f8f",
              borderTopWidth: 1,
            }}
          />
        }
        keyExtractor={(item) => item.index.toString()}
        renderItem={({ item }) => <Question question={item} />}
        scrollEnabled={false}
      />
      <View
        style={{
          flexDirection: "row",
          gap: 8,
          justifyContent: "space-between",
          paddingTop: 16,
        }}
      >
        <Button
          disabled={pageNumber === 1}
          onPress={() => {
            router.back();
          }}
          title="Back"
        />
        <Button
          onPress={() => {
            if (pageNumber < TOTAL_PAGES) {
              router.push(`/questionnaire/${pageNumber + 1}`);
              return;
            }

            router.navigate({
              pathname: "/questionnaire/result",
              params: computeResult(questionnaire.answers),
            });
          }}
          title={pageNumber < TOTAL_PAGES ? "Next" : "Get Result"}
        />
      </View>
    </ScrollView>
  );
}

function Question({ question }: { question: PageAnswer }) {
  const questionnaire = useQuestionnaireContext();
  const setAnswer = useCallback(
    (answer: string) => {
      questionnaire.setAnswer(question.index, answer);
    },
    [questionnaire, question.index],
  );

  return (
    <View
      style={{
        paddingVertical: 8,
      }}
    >
      <RNText>
        {question.index + 1}: {question.title}
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

function getPageNumber(page: string | undefined) {
  if (!page) {
    return undefined;
  }

  const parsedPage = Number(page);

  if (Number.isNaN(parsedPage) || parsedPage < 1 || parsedPage > TOTAL_PAGES) {
    return undefined;
  }

  return Number.isInteger(parsedPage) ? parsedPage : undefined;
}

function computeResult(answers: Answer[]) {
  try {
    const parsedAnswers = answers.map((question) =>
      Number.parseInt(question.answer, 10),
    );

    return getResult(parsedAnswers);
  } catch (e) {
    console.error("Something went wrong when parsing the answers: ", e);
  }
}
