export const questionsForMaleExclusive = ["Was your scrotum always wet?"];
export const questionsForFemaleExclusive = [
  "Was your vaginal discharge yellowish?",
];
export const questionsForAllSex = [
  "Were you energetic?",
  "Did you get tired easily?",
  "Did you suffer from shortness of breath?",
  "Did you get palpitations?",
  "Did you get dizziness easily or become giddy when standing up?",
  "Did you prefer quietness and do not like to talk?",
  "Did you feel weak when talking?",
  "Did you forget things easily?",
  "Did you feel gloomy and depressed?",
  "Did you get anxious and worried easily?",
  "Did you feel sensitive, vulnerable or emotionally upset?",
  "Were you easily scared or frightened?",
  "Did you experience distention in the underarm or breast?",
  "Did you feel chest or stomach stuffiness?",
  "Did you sigh for no reason?",
  "Did your body feel heavy or lethargic?",
  "Did the palms of your hands or soles of your feet feel hot?",
  "Did your hands or feet feel cold or clammy?",
  "Did you feel cold easily in your abdomen, back, lower back or knees?",
  "Were you sensitive to cold and tend to wear more clothes than others?",
  "Did your body and face feel hot?",
  "Did you feel more vulnerable to the cold than others (winter coldness, air conditioners, fans, etc.)?",
  "Did you catch colds more easily than others?",
  "Did you sneeze even when you did not have a cold?",
  "Did you have runny or stuffy nose even when you did not have a cold?",
  "Did you cough due to seasonal change, temperature change, or unpleasant odor?",
  "Did you sweat easily when you had a slightly increased physical activity?",
  "Did you have an excessively oily forehead and/or T-zone?",
  "Did your skin or lips feel dry?",
  "Did you have allergies?(E.g. medicine, food, odors, pollen, pet dander, or during seasonal or weather change etc.)",
  "Did your skin get hives/urticaria easily?",
  "Did your skin have purpura(purple spots, ecchymosis)due to allergies?",
  "Did black or purple bruises appear on your skin for no reason?",
  "Did you skin turn red and show traces when you scratched it?",
  "Were your lips redder than others?",
  "Did you have visible capillary/thread veins on your cheeks?",
  "Did you feel pain somewhere in your body?",
  "Did you get hot flashes?",
  "Did your nose or your face feel greasy, oily, or shiny?",
  "Did you have a dark face or get brown spots easily?",
  "Did you get acne or sores easily?",
  "Did you have upper eyelid swelling?",
  "Did you get dark circles under the eyes easily?",
  "Did your eyes feel dry and use eye drops?",
  "Did your lips darker or purple than usual?",
  "Did you often feel parched and need to drink water?",
  "Did your throat feel strange(i.e. like something was stuck or there was a lump in your throat)?",
  "Did you have bitterness or a strange taste in your mouth?",
  "Did your mouth feel sticky?",
  "Did your tongue have a thick coating?",
  "Did you have lots of phlegm, especially in your throat?",
  "Did you feel uncomfortable when you drank or ate something cold, or do you avoid to drinking or eating something cold?",
  "Could you adapt yourself to external natural or social environment change?",
  "Did you suffer from insomnia?",
  "Did you easily contract diarrhea when you were exposed to cold or eat (or drink) something cold?",
  "Did you pass sticky stools and/or feel that your bowel movement is incomplete?",
  "Did you get constipated easily or have dry stools?",
  "Was your stomach/belly flabby?",
  "Did your urethral canal feel hot when you urinated, or did your urine have a dark color?",
];
export const questionsForMale = [
  ...questionsForAllSex,
  ...questionsForMaleExclusive,
] as const;
export const questionsForFemale = [
  ...questionsForAllSex,
  ...questionsForFemaleExclusive,
] as const;
export const unbalancedConstitutions = [
  "yangDeficient",
  "yinDeficient",
  "qiDeficient",
  "phlegmDampness",
  "dampHeat",
  "stagnantBlood",
  "stagnantQi",
  "inheritedSpecial",
] as const;

function reverse(score: number) {
  return 5 - score;
}
export function getResult(a: number[]) {
  const balancedOg =
    a[0] +
    reverse(a[1]) +
    reverse(a[6]) +
    reverse(a[7]) +
    reverse(a[8]) +
    reverse(a[21]) +
    a[52] +
    reverse(a[53]);
  const balanced = convert(balancedOg, 8);

  const yangDeficientOg = a[17] + a[18] + a[19] + a[21] + a[22] + a[51] + a[54];
  const yangDeficient = convert(yangDeficientOg, 7);

  const yinDeficientOg =
    a[16] + a[20] + a[28] + a[34] + a[37] + a[43] + a[45] + a[56];
  const yinDeficient = convert(yinDeficientOg, 8);

  const qiDeficientOg = a[1] + a[2] + a[3] + a[4] + a[5] + a[6] + a[22] + a[26];
  const qiDeficient = convert(qiDeficientOg, 8);

  const phlegmDampnessOg =
    a[13] + a[15] + a[27] + a[41] + a[48] + a[49] + a[50] + a[57];
  const phlegmDampness = convert(phlegmDampnessOg, 8);

  const dampHeatOg = a[38] + a[40] + a[47] + a[55] + a[58] + a[59];
  const dampHeat = convert(dampHeatOg, 6);

  const stagnantBloodOg = a[7] + a[32] + a[35] + a[36] + a[39] + a[42] + a[44];
  const stagnantBlood = convert(stagnantBloodOg, 7);

  const stagnantQiOg = a[8] + a[9] + a[10] + a[11] + a[12] + a[14] + a[46];
  const stagnantQi = convert(stagnantQiOg, 7);

  const inheritedSpecialOg =
    a[23] + a[24] + a[25] + a[29] + a[30] + a[31] + a[33];
  const inheritedSpecial = convert(inheritedSpecialOg, 8);

  return {
    balanced,
    yangDeficient,
    yinDeficient,
    qiDeficient,
    phlegmDampness,
    dampHeat,
    stagnantBlood,
    stagnantQi,
    inheritedSpecial,
  };
}

function convert(score: number, count: number) {
  return ((score - count) / count) * 4 * 100;
}
