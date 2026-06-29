import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import {
  questionsForFemale,
  questionsForMale,
} from "@/constants/questionnaire-questions";

export type Sex = "m" | "f";

export type Answer = {
  title: string;
  answer: string;
};

export const QUESTIONS_PER_PAGE = 12;
export const TOTAL_PAGES = 5;
const TOTAL_QUESTIONS = QUESTIONS_PER_PAGE * TOTAL_PAGES;

type QuestionnaireContextValue = {
  answers: Answer[];
  resetForSex: (sex: Sex) => void;
  setAnswer: (index: number, answer: string) => void;
  sex: Sex | null;
};

const QuestionnaireContext = createContext<QuestionnaireContextValue | null>(
  null,
);

function getDefaultAnswer(question: string): Answer {
  return {
    title: question,
    answer: "3",
  };
}

function getDefaultAnswersForSex(sex: Sex) {
  return (sex === "m" ? questionsForMale : questionsForFemale)
    .slice(0, TOTAL_QUESTIONS)
    .map(getDefaultAnswer);
}

function isValidAnswer(answer: string) {
  return ["1", "2", "3", "4", "5"].includes(answer);
}

export function QuestionnaireContextProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [sex, setSex] = useState<Sex | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  const resetForSex = useCallback((nextSex: Sex) => {
    setSex(nextSex);
    setAnswers(getDefaultAnswersForSex(nextSex));
  }, []);

  const setAnswer = useCallback((index: number, answer: string) => {
    if (!isValidAnswer(answer)) {
      return;
    }

    setAnswers((prev) => {
      if (!prev[index]) {
        return prev;
      }

      return prev.map((item, itemIndex) =>
        itemIndex === index ? { ...item, answer } : item,
      );
    });
  }, []);

  const value = useMemo(
    () => ({
      answers,
      resetForSex,
      setAnswer,
      sex,
    }),
    [answers, resetForSex, setAnswer, sex],
  );

  return (
    <QuestionnaireContext.Provider value={value}>
      {children}
    </QuestionnaireContext.Provider>
  );
}

export function useQuestionnaireContext() {
  const context = useContext(QuestionnaireContext);

  if (!context) {
    throw new Error(
      "useQuestionnaireContext must be used inside QuestionnaireContextProvider",
    );
  }

  return context;
}
