import { WORD_BANK, WordCategory, WordEntry } from '../data/wordBank';

export interface DefinitionSlot {
  id: string;
  definition: string;
  correctItemNumber: number; // 1 to 6
  wordId: string;
}

export interface TestQuestion {
  questionNumber: number;
  categoryLabel: string;
  items: {
    number: number; // 1 to 6
    word: WordEntry;
  }[];
  definitions: DefinitionSlot[]; // 3 definitions on the right
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const QUESTION_CATEGORIES: { category: WordCategory; label: string }[] = [
  { category: 'noun', label: 'Nouns' },
  { category: 'adjective', label: 'Adjectives' },
  { category: 'verb', label: 'Verbs' },
  { category: 'adverb', label: 'Adverbs' },
  { category: 'chunk', label: 'Chunks & Expressions' },
];

/**
 * Generates a fresh 5-question vocabulary test using the 110 words from the NEW WORDS bank.
 * Following the official test structure:
 * - 5 questions (grouped by grammatical category: Nouns, Adjectives, Verbs, Adverbs, Chunks)
 * - 6 items per question (numbered 1-6) on the left
 * - 3 definitions per question on the right
 */
export function generateRandomTest(usedWordIds: Set<string> = new Set()): TestQuestion[] {
  const questions: TestQuestion[] = [];

  QUESTION_CATEGORIES.forEach((qCat, idx) => {
    const allInCategory = WORD_BANK.filter((w) => w.category === qCat.category);

    // Prefer words not recently used as target definitions if possible
    const unusedInCategory = allInCategory.filter((w) => !usedWordIds.has(w.id));
    const pool = unusedInCategory.length >= 6 ? unusedInCategory : allInCategory;

    const selectedSix = shuffleArray(pool).slice(0, 6);

    const items = selectedSix.map((word, i) => ({
      number: i + 1,
      word,
    }));

    // Pick 3 random items out of the 6 to be the definitions on the right
    const targetItems = shuffleArray(items).slice(0, 3);

    const definitions: DefinitionSlot[] = targetItems.map((target, defIdx) => ({
      id: `q${idx + 1}-def${defIdx + 1}-${target.word.id}`,
      definition: target.word.definition,
      correctItemNumber: target.number,
      wordId: target.word.id,
    }));

    questions.push({
      questionNumber: idx + 1,
      categoryLabel: qCat.label,
      items,
      definitions,
    });
  });

  return questions;
}

/**
 * Creates a preset test mirroring the exact example test from the textbook screenshot,
 * using words from the NEW WORDS list (and exact items from the example image).
 */
export function generateExamplePresetTest(): TestQuestion[] {
  const findWord = (id: string, fallbackDisplay: string, fallbackCategory: WordCategory, fallbackDef: string): WordEntry => {
    const found = WORD_BANK.find((w) => w.id === id);
    if (found) return found;
    return {
      id,
      rawLabel: fallbackDisplay,
      testDisplay: fallbackDisplay,
      category: fallbackCategory,
      definition: fallbackDef,
      hebrew: '',
    };
  };

  // Q1 (9 in screenshot): purchase, society, brand, fame, item, marketing
  const q1Words: WordEntry[] = [
    findWord('purchase', 'purchase', 'noun', 'something that you buy, or the act of buying'),
    findWord('society', 'society', 'noun', 'people living together in an organized community'),
    findWord('brand', 'brand', 'noun', 'a type of product made by a specific company'),
    findWord('fame', 'fame', 'noun', 'the state of being known by many people'),
    findWord('item', 'item', 'noun', 'a thing or object'),
    findWord('marketing', 'marketing', 'noun', 'promoting and selling products'),
  ];

  // Q2 (10 in screenshot): instant + adjectives from the NEW WORDS list (plus optional textbook exacts)
  const q2Words: WordEntry[] = [
    findWord('instant', 'instant', 'adjective', 'immediate or direct'),
    findWord('controversial', 'controversial', 'adjective', 'causing a lot of public disagreement or argument'),
    findWord('private', 'private', 'adjective', 'for the use of one person or group only, not public'),
    findWord('impressive', 'impressive', 'adjective', 'causing admiration because of size, quality, or skill'),
    findWord('promising', 'promising', 'adjective', 'showing signs of future success'),
    findWord('limited', 'limited', 'adjective', 'small in amount or number, restricted'),
  ];

  // Q3 (11 in screenshot): to avoid, to launch, to promote, to process, to expand, to determine (all 6 in NEW WORDS!)
  const q3Words: WordEntry[] = [
    findWord('avoid', 'to avoid', 'verb', 'stop oneself from doing something'),
    findWord('launch', 'to launch', 'verb', 'start or set in motion'),
    findWord('promote', 'to promote', 'verb', 'encourage the popularity, sales, or development of something'),
    findWord('process', 'to process', 'verb', 'treat or prepare materials or information through a series of steps'),
    findWord('expand', 'to expand', 'verb', 'become larger'),
    findWord('determine', 'to determine', 'verb', 'discover the facts closely or officially decide something'),
  ];

  // Q4 (12 in screenshot): increasingly, practically, primarily, hardly, artificially, currently (all 6 in NEW WORDS!)
  const q4Words: WordEntry[] = [
    findWord('increasingly', 'increasingly', 'adverb', 'happening more and more'),
    findWord('practically', 'practically', 'adverb', 'almost completely, or in a realistic and useful way'),
    findWord('primarily', 'primarily', 'adverb', 'mainly, for the most part'),
    findWord('hardly', 'hardly', 'adverb', 'barely, almost not at all'),
    findWord('artificially', 'artificially', 'adverb', 'not naturally, made by human skill'),
    findWord('currently', 'currently', 'adverb', 'now, in the present'),
  ];

  // Q5 (13 in screenshot): human rights, with regard to, in the long run, keep track of, pros and cons, set an example (all 6 in NEW WORDS!)
  const q5Words: WordEntry[] = [
    findWord('human_rights', 'human rights', 'chunk', 'basic freedoms that every person in the world should have'),
    findWord('with_regard_to', 'with regard to', 'chunk', 'concerning or about a particular subject'),
    findWord('in_the_long_run', 'in the long run', 'chunk', 'after a period of time, eventually'),
    findWord('keep_track_of', 'keep track of', 'chunk', 'stay informed about someone or something over time'),
    findWord('pros_and_cons', 'pros and cons', 'chunk', 'advantages and disadvantages'),
    findWord('set_an_example', 'set an example', 'chunk', 'behave in a way that other people should copy'),
  ];

  return [
    {
      questionNumber: 1,
      categoryLabel: 'Nouns',
      items: q1Words.map((word, idx) => ({ number: idx + 1, word })),
      definitions: [
        { id: 'preset-q1-d1', definition: 'a type of product made by a specific company', correctItemNumber: 3, wordId: 'brand' },
        { id: 'preset-q1-d2', definition: 'a thing or object', correctItemNumber: 5, wordId: 'item' },
        { id: 'preset-q1-d3', definition: 'promoting and selling products', correctItemNumber: 6, wordId: 'marketing' },
      ],
    },
    {
      questionNumber: 2,
      categoryLabel: 'Adjectives',
      items: q2Words.map((word, idx) => ({ number: idx + 1, word })),
      definitions: [
        { id: 'preset-q2-d1', definition: 'small in amount or number, restricted', correctItemNumber: 6, wordId: 'limited' },
        { id: 'preset-q2-d2', definition: 'immediate or direct', correctItemNumber: 1, wordId: 'instant' },
        { id: 'preset-q2-d3', definition: 'for the use of one person or group only, not public', correctItemNumber: 3, wordId: 'private' },
      ],
    },
    {
      questionNumber: 3,
      categoryLabel: 'Verbs',
      items: q3Words.map((word, idx) => ({ number: idx + 1, word })),
      definitions: [
        { id: 'preset-q3-d1', definition: 'stop oneself from doing something', correctItemNumber: 1, wordId: 'avoid' },
        { id: 'preset-q3-d2', definition: 'become larger', correctItemNumber: 5, wordId: 'expand' },
        { id: 'preset-q3-d3', definition: 'start or set in motion', correctItemNumber: 2, wordId: 'launch' },
      ],
    },
    {
      questionNumber: 4,
      categoryLabel: 'Adverbs',
      items: q4Words.map((word, idx) => ({ number: idx + 1, word })),
      definitions: [
        { id: 'preset-q4-d1', definition: 'happening more and more', correctItemNumber: 1, wordId: 'increasingly' },
        { id: 'preset-q4-d2', definition: 'barely, almost not at all', correctItemNumber: 4, wordId: 'hardly' },
        { id: 'preset-q4-d3', definition: 'now, in the present', correctItemNumber: 6, wordId: 'currently' },
      ],
    },
    {
      questionNumber: 5,
      categoryLabel: 'Chunks & Expressions',
      items: q5Words.map((word, idx) => ({ number: idx + 1, word })),
      definitions: [
        { id: 'preset-q5-d1', definition: 'after a period of time, eventually', correctItemNumber: 3, wordId: 'in_the_long_run' },
        { id: 'preset-q5-d2', definition: 'advantages and disadvantages', correctItemNumber: 5, wordId: 'pros_and_cons' },
        { id: 'preset-q5-d3', definition: 'behave in a way that other people should copy', correctItemNumber: 6, wordId: 'set_an_example' },
      ],
    },
  ];
}
