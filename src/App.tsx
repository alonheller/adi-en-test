import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Sparkles,
  BookOpen,
  Award,
  Search,
  Check,
  AlertCircle,
  FileText,
  HelpCircle,
  Trophy,
  User,
  ArrowRight,
  ArrowLeft,
  Play,
  Trash2,
  Languages,
  ListChecks,
  Settings,
  X,
  Flame,
  Gamepad2,
  Image as ImageIcon,
  History as HistoryIcon,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react';
import { WORD_BANK, WordCategory } from './data/wordBank';
import {
  TestQuestion,
  generateRandomTest,
  generateExamplePresetTest,
} from './utils/testGenerator';

type ActiveTab = 'test' | 'leaderboard' | 'history' | 'words';
export type AppTheme = 'classic' | 'gta6';

export interface SavedDefinitionAnswer {
  id: string;
  definition: string;
  correctItemNumber: number;
  userItemNumber: number | null;
  isCorrect: boolean;
  correctWord: {
    testDisplay: string;
    hebrew: string;
  };
  userWord?: {
    testDisplay: string;
    hebrew: string;
  };
}

export interface SavedQuestionRecord {
  questionNumber: number;
  categoryLabel: string;
  items: {
    number: number;
    testDisplay: string;
    hebrew: string;
  }[];
  definitions: SavedDefinitionAnswer[];
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;       // Out of 100
  correctCount: number; // Out of 15
  totalCount: number;   // 15
  testType: string;
  date: string;
  theme?: AppTheme;
  questions?: TestQuestion[];
  answers?: Record<string, string>;
  detailedHistory?: SavedQuestionRecord[];
}

export interface GtaWallpaper {
  id: string;
  title: string;
  subtitle: string;
  src: string;
}

export const GTA6_WALLPAPERS: GtaWallpaper[] = [
  {
    id: 'sunset-drive',
    title: 'Ocean View Sunset',
    subtitle: 'Neon Sunset Street & Sports Car',
    src: '/gta6/bg-1.jpg',
  },
  {
    id: 'beach-strip',
    title: 'Vice Beach Strip',
    subtitle: 'Art Deco Hotels & Palm Glow',
    src: '/gta6/bg-2.jpg',
  },
  {
    id: 'bay-skyline',
    title: 'Vice Bay Skyline',
    subtitle: 'Night Skyline & Speedboat',
    src: '/gta6/bg-3.jpg',
  },
];

const LEADERBOARD_STORAGE_KEY = 'adi_en_test_leaderboard_v1';
const LAST_PLAYER_NAME_KEY = 'adi_en_test_player_name_v1';
const APP_THEME_STORAGE_KEY = 'adi_en_test_theme_v1';
const GTA_BG_MODE_KEY = 'adi_en_test_gta_bg_mode_v1';
const GTA_BG_OPACITY_KEY = 'adi_en_test_gta_bg_opacity_v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('test');

  // Theme & Settings Modal
  const [theme, setTheme] = useState<AppTheme>(() => {
    const saved = localStorage.getItem(APP_THEME_STORAGE_KEY);
    return saved === 'gta6' ? 'gta6' : 'classic';
  });
  // 'auto' rotates background image per question/tab, or user can lock one of the 3 GTA 6 wallpapers
  const [gtaBgMode, setGtaBgMode] = useState<string>(() => {
    return localStorage.getItem(GTA_BG_MODE_KEY) || 'auto';
  });
  // Background image opacity percentage (15% to 85%, default 45%)
  const [gtaBgOpacity, setGtaBgOpacity] = useState<number>(() => {
    const saved = parseInt(localStorage.getItem(GTA_BG_OPACITY_KEY) || '', 10);
    return !isNaN(saved) && saved >= 10 && saved <= 90 ? saved : 45;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const isGta = theme === 'gta6';

  useEffect(() => {
    try {
      localStorage.setItem(APP_THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  useEffect(() => {
    try {
      localStorage.setItem(GTA_BG_MODE_KEY, gtaBgMode);
    } catch {
      // Ignore storage errors
    }
  }, [gtaBgMode]);

  useEffect(() => {
    try {
      localStorage.setItem(GTA_BG_OPACITY_KEY, String(gtaBgOpacity));
    } catch {
      // Ignore storage errors
    }
  }, [gtaBgOpacity]);

  // Player name & test start flow
  const [playerName, setPlayerName] = useState<string>(() => {
    return localStorage.getItem(LAST_PLAYER_NAME_KEY) || '';
  });
  const [nameInput, setNameInput] = useState<string>(() => {
    return localStorage.getItem(LAST_PLAYER_NAME_KEY) || '';
  });
  const [hasStartedTest, setHasStartedTest] = useState<boolean>(false);

  // Questions & step-by-step pagination
  const [questions, setQuestions] = useState<TestQuestion[]>(() =>
    generateRandomTest()
  );
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [viewAllQuestions, setViewAllQuestions] = useState<boolean>(false);

  // Map of definitionSlot.id -> user entered number (1-6) or ''
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedLeftItem, setSelectedLeftItem] = useState<{
    questionNumber: number;
    itemNumber: number;
  } | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [usedWordIds, setUsedWordIds] = useState<Set<string>>(new Set());
  const [testModeLabel, setTestModeLabel] = useState<
    'Random Generated Test' | 'Sample Exam Preset'
  >('Random Generated Test');

  // Leaderboard state persisted on the server (/api/leaderboard JSON store) + localStorage fallback
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isSyncingLeaderboard, setIsSyncingLeaderboard] =
    useState<boolean>(false);

  // Word Bank filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<WordCategory | 'all'>(
    'all'
  );

  // History view states: expanded test entry ID & optional student filter
  const [expandedHistoryId, setExpandedHistoryId] = useState<string | null>(
    null
  );
  const [historyPlayerFilter, setHistoryPlayerFilter] = useState<string>('all');

  // Sync with server-side persistent JSON store (/api/leaderboard) and merge any existing local mobile/desktop entries
  const syncLeaderboardWithServer = async () => {
    setIsSyncingLeaderboard(true);
    try {
      let localEntries: LeaderboardEntry[] = [];
      try {
        const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
        if (saved) localEntries = JSON.parse(saved);
      } catch {
        // ignore
      }

      if (localEntries.length > 0) {
        // Push any local entries to the server so mobile tests already taken are automatically uploaded
        const res = await fetch('/api/leaderboard', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ entries: localEntries }),
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data?.entries)) {
            setLeaderboard(data.entries);
            localStorage.setItem(
              LEADERBOARD_STORAGE_KEY,
              JSON.stringify(data.entries)
            );
            return;
          }
        }
      }

      const res = await fetch('/api/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data?.entries)) {
          setLeaderboard(data.entries);
          localStorage.setItem(
            LEADERBOARD_STORAGE_KEY,
            JSON.stringify(data.entries)
          );
        }
      }
    } catch {
      // Offline fallback uses localStorage
    } finally {
      setIsSyncingLeaderboard(false);
    }
  };

  useEffect(() => {
    syncLeaderboardWithServer();
  }, []);

  // Refresh from server whenever switching to the Leaderboard or History tab
  useEffect(() => {
    if (activeTab === 'leaderboard' || activeTab === 'history') {
      syncLeaderboardWithServer();
    }
  }, [activeTab]);

  // Determine active GTA 6 wallpaper index
  const activeGtaWallpaperIndex = useMemo(() => {
    if (gtaBgMode !== 'auto') {
      const idx = GTA6_WALLPAPERS.findIndex((w) => w.id === gtaBgMode);
      return idx >= 0 ? idx : 0;
    }
    if (activeTab === 'leaderboard') return 2;
    if (activeTab === 'words') return 1;
    if (!hasStartedTest) return 0;
    return currentQuestionIdx % GTA6_WALLPAPERS.length;
  }, [gtaBgMode, activeTab, hasStartedTest, currentQuestionIdx]);

  const totalDefinitions = questions.reduce(
    (acc, q) => acc + q.definitions.length,
    0
  );

  const answeredCount = useMemo(() => {
    let count = 0;
    questions.forEach((q) => {
      q.definitions.forEach((def) => {
        const val = answers[def.id];
        if (val && ['1', '2', '3', '4', '5', '6'].includes(val)) {
          count++;
        }
      });
    });
    return count;
  }, [questions, answers]);

  const scoreInfo = useMemo(() => {
    let correct = 0;
    questions.forEach((q) => {
      q.definitions.forEach((def) => {
        const userVal = parseInt(answers[def.id] || '', 10);
        if (userVal === def.correctItemNumber) {
          correct++;
        }
      });
    });
    const points = Math.round((correct / totalDefinitions) * 100);
    return { correct, total: totalDefinitions, points };
  }, [questions, answers, totalDefinitions]);

  const handleStartTest = (
    e?: React.FormEvent,
    mode: 'random' | 'sample' = 'random'
  ) => {
    if (e) e.preventDefault();
    const trimmedName = nameInput.trim();
    if (!trimmedName) return;

    setPlayerName(trimmedName);
    localStorage.setItem(LAST_PLAYER_NAME_KEY, trimmedName);

    const newQuestions =
      mode === 'sample'
        ? generateExamplePresetTest()
        : generateRandomTest(usedWordIds);
    setQuestions(newQuestions);
    setTestModeLabel(
      mode === 'sample' ? 'Sample Exam Preset' : 'Random Generated Test'
    );
    setAnswers({});
    setIsSubmitted(false);
    setSelectedLeftItem(null);
    setCurrentQuestionIdx(0);
    setHasStartedTest(true);
    setActiveTab('test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleChangePlayer = () => {
    setHasStartedTest(false);
    setIsSubmitted(false);
    setSelectedLeftItem(null);
  };

  const handleAnswerChange = (
    questionNumber: number,
    defId: string,
    rawValue: string
  ) => {
    if (isSubmitted) return;

    const trimmed = rawValue.trim().slice(-1);
    if (trimmed === '' || ['1', '2', '3', '4', '5', '6'].includes(trimmed)) {
      setAnswers((prev) => {
        const updated = { ...prev };
        if (trimmed !== '') {
          const question = questions.find(
            (q) => q.questionNumber === questionNumber
          );
          if (question) {
            question.definitions.forEach((d) => {
              if (d.id !== defId && updated[d.id] === trimmed) {
                delete updated[d.id];
              }
            });
          }
        }
        if (trimmed === '') {
          delete updated[defId];
        } else {
          updated[defId] = trimmed;
        }
        return updated;
      });
      setSelectedLeftItem(null);
    }
  };

  const handleLeftItemClick = (questionNumber: number, itemNumber: number) => {
    if (isSubmitted) return;
    if (
      selectedLeftItem?.questionNumber === questionNumber &&
      selectedLeftItem?.itemNumber === itemNumber
    ) {
      setSelectedLeftItem(null);
    } else {
      setSelectedLeftItem({ questionNumber, itemNumber });
    }
  };

  const handleDefinitionBoxClick = (questionNumber: number, defId: string) => {
    if (isSubmitted) return;
    if (
      selectedLeftItem &&
      selectedLeftItem.questionNumber === questionNumber
    ) {
      handleAnswerChange(
        questionNumber,
        defId,
        String(selectedLeftItem.itemNumber)
      );
    }
  };

  const handleSubmitTest = () => {
    if (isSubmitted) return;
    setIsSubmitted(true);
    setSelectedLeftItem(null);

    const nextUsed = new Set(usedWordIds);
    questions.forEach((q) =>
      q.definitions.forEach((d) => nextUsed.add(d.wordId))
    );
    if (nextUsed.size > 85) {
      nextUsed.clear();
    }
    setUsedWordIds(nextUsed);

    let correct = 0;
    questions.forEach((q) => {
      q.definitions.forEach((def) => {
        if (parseInt(answers[def.id] || '', 10) === def.correctItemNumber) {
          correct++;
        }
      });
    });
    const points = Math.round((correct / totalDefinitions) * 100);

    // Build detailed question & answer history for this test attempt
    const detailedHistory: SavedQuestionRecord[] = questions.map((q) => ({
      questionNumber: q.questionNumber,
      categoryLabel: q.categoryLabel,
      items: q.items.map((it) => ({
        number: it.number,
        testDisplay: it.word.testDisplay,
        hebrew: it.word.hebrew,
      })),
      definitions: q.definitions.map((def) => {
        const rawAns = answers[def.id] || '';
        const parsedNum = parseInt(rawAns, 10);
        const userItemNumber = !isNaN(parsedNum) ? parsedNum : null;
        const correctItem = q.items.find(
          (i) => i.number === def.correctItemNumber
        );
        const userItem =
          userItemNumber !== null
            ? q.items.find((i) => i.number === userItemNumber)
            : undefined;

        return {
          id: def.id,
          definition: def.definition,
          correctItemNumber: def.correctItemNumber,
          userItemNumber,
          isCorrect: userItemNumber === def.correctItemNumber,
          correctWord: {
            testDisplay: correctItem?.word.testDisplay || '',
            hebrew: correctItem?.word.hebrew || '',
          },
          userWord: userItem
            ? {
                testDisplay: userItem.word.testDisplay,
                hebrew: userItem.word.hebrew,
              }
            : undefined,
        };
      }),
    }));

    const newEntry: LeaderboardEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: playerName || 'Student',
      points,
      correctCount: correct,
      totalCount: totalDefinitions,
      testType: testModeLabel,
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
      theme,
      questions,
      answers: { ...answers },
      detailedHistory,
    };

    const nextLeaderboard = [newEntry, ...leaderboard].sort(
      (a, b) => b.points - a.points
    );
    setLeaderboard(nextLeaderboard);
    try {
      localStorage.setItem(
        LEADERBOARD_STORAGE_KEY,
        JSON.stringify(nextLeaderboard)
      );
    } catch {
      // ignore
    }

    // Save persistently to the server JSON store (/api/leaderboard)
    fetch('/api/leaderboard', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entry: newEntry }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.entries)) {
          setLeaderboard(data.entries);
          localStorage.setItem(
            LEADERBOARD_STORAGE_KEY,
            JSON.stringify(data.entries)
          );
        }
      })
      .catch(() => {
        // Offline fallback keeps localStorage
      });

    if (points >= 70) {
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.6 },
        colors: isGta
          ? ['#ff2a85', '#ff8a00', '#00f0ff', '#a855f7']
          : undefined,
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGenerateNewTest = () => {
    const newQuestions = generateRandomTest(usedWordIds);
    setQuestions(newQuestions);
    setAnswers({});
    setIsSubmitted(false);
    setSelectedLeftItem(null);
    setCurrentQuestionIdx(0);
    setTestModeLabel('Random Generated Test');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRetrySameTest = () => {
    setAnswers({});
    setIsSubmitted(false);
    setSelectedLeftItem(null);
    setCurrentQuestionIdx(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleClearLeaderboard = () => {
    setLeaderboard([]);
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
    fetch('/api/leaderboard', { method: 'DELETE' }).catch(() => {});
  };

  const getUsedNumbersForQuestion = (q: TestQuestion): Set<number> => {
    const set = new Set<number>();
    q.definitions.forEach((d) => {
      const val = parseInt(answers[d.id] || '', 10);
      if (!isNaN(val)) {
        set.add(val);
      }
    });
    return set;
  };

  const isQuestionComplete = (q: TestQuestion): boolean => {
    return q.definitions.every((d) => {
      const val = answers[d.id];
      return val && ['1', '2', '3', '4', '5', '6'].includes(val);
    });
  };

  const filteredWordBank = useMemo(() => {
    return WORD_BANK.filter((word) => {
      const matchesCategory =
        categoryFilter === 'all' || word.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        word.rawLabel.toLowerCase().includes(q) ||
        word.testDisplay.toLowerCase().includes(q) ||
        word.definition.toLowerCase().includes(q) ||
        word.hebrew.includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, categoryFilter]);

  const questionsToRender =
    isSubmitted || viewAllQuestions
      ? questions
      : [questions[currentQuestionIdx]];

  return (
    <div
      className={`relative min-h-screen flex flex-col transition-colors duration-300 ${
        isGta ? 'gta-bg text-pink-50' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* GTA 6 FULL-SCREEN TRANSPARENT BACKGROUND IMAGES LAYER */}
      {isGta && (
        <div
          className="fixed inset-0 z-0 pointer-events-none overflow-hidden select-none"
          aria-hidden="true"
        >
          {GTA6_WALLPAPERS.map((wp, idx) => {
            const isActive = idx === activeGtaWallpaperIndex;
            return (
              <img
                key={wp.id}
                src={wp.src}
                alt={wp.title}
                style={{
                  opacity: isActive ? gtaBgOpacity / 100 : 0,
                }}
                className="absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-1000 ease-in-out scale-105"
              />
            );
          })}
          {/* Ambient Vice City Sunset Gradient & Vignette Overlay for Contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0316]/75 via-[#180730]/45 to-[#080212]/85" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(7,2,16,0.75)_100%)]" />
        </div>
      )}

      {/* Top Navigation Bar */}
      <header
        className={`sticky top-0 z-30 backdrop-blur-md border-b shadow-sm transition-colors ${
          isGta
            ? 'bg-[#120623]/75 border-pink-500/35 shadow-pink-500/10'
            : 'bg-white/95 border-slate-200'
        }`}
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0 ${
                isGta ? 'gta-btn-gradient' : 'bg-indigo-600'
              }`}
            >
              {isGta ? (
                <Flame className="w-5 h-5" />
              ) : (
                <BookOpen className="w-5 h-5" />
              )}
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1
                  className={`font-bold text-sm sm:text-lg leading-tight truncate ${
                    isGta
                      ? 'gta-font gta-text-gradient uppercase tracking-wider'
                      : 'text-slate-900'
                  }`}
                >
                  {isGta ? 'GTA VI • Vice Vocab' : 'English Vocabulary Test'}
                </h1>
                {isGta && (
                  <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-widest rounded bg-pink-500/20 text-pink-300 border border-pink-500/40">
                    VI EDITION
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] hidden sm:block ${
                  isGta ? 'text-cyan-300/80' : 'text-slate-500'
                }`}
              >
                110 New Words • 5 Questions • Match 3 of 6 Items
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <div
              className={`p-1 rounded-xl flex items-center ${
                isGta
                  ? 'bg-[#1f0b3a]/85 border border-pink-500/30'
                  : 'bg-slate-100'
              }`}
            >
              <button
                onClick={() => setActiveTab('test')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'test'
                    ? isGta
                      ? 'gta-btn-gradient text-white font-bold'
                      : 'bg-white text-indigo-700 shadow-sm'
                    : isGta
                    ? 'text-pink-200/75 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Test</span>
              </button>
              <button
                onClick={() => setActiveTab('leaderboard')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'leaderboard'
                    ? isGta
                      ? 'gta-btn-gradient text-white font-bold'
                      : 'bg-white text-indigo-700 shadow-sm'
                    : isGta
                    ? 'text-pink-200/75 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Trophy
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                    isGta ? 'text-amber-300' : 'text-amber-500'
                  }`}
                />
                <span className="hidden sm:inline">Leaderboard</span>
                {leaderboard.length > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isGta
                        ? 'bg-cyan-400/20 text-cyan-200 border border-cyan-400/40'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {leaderboard.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'history'
                    ? isGta
                      ? 'gta-btn-gradient text-white font-bold'
                      : 'bg-white text-indigo-700 shadow-sm'
                    : isGta
                    ? 'text-pink-200/75 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <HistoryIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>History</span>
              </button>
              <button
                onClick={() => setActiveTab('words')}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                  activeTab === 'words'
                    ? isGta
                      ? 'gta-btn-gradient text-white font-bold'
                      : 'bg-white text-indigo-700 shadow-sm'
                    : isGta
                    ? 'text-pink-200/75 hover:text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden md:inline">New Words</span>
                <span className="md:hidden">Words</span>
              </button>
            </div>

            {/* Settings Button for Optional GTA 6 Theme & Transparent Backgrounds */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="Open Settings"
              title="Settings & Themes (GTA 6)"
              className={`p-2 sm:px-3 sm:py-2 rounded-xl border text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-all ${
                isGta
                  ? 'bg-[#260e47]/90 border-cyan-400/50 text-cyan-300 hover:bg-[#32135c] shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </button>
          </div>
        </div>
      </header>

      {/* SETTINGS MODAL WITH OPTIONAL GTA 6 THEME & TRANSPARENT BACKGROUND PICKER */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
          <div
            className={`w-full max-w-lg rounded-3xl p-5 sm:p-6 border shadow-2xl transition-all my-auto ${
              isGta
                ? 'gta-card text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-200/20">
              <div className="flex items-center gap-2.5">
                <Settings
                  className={`w-5 h-5 ${
                    isGta ? 'text-pink-400' : 'text-indigo-600'
                  }`}
                />
                <h3
                  className={`text-lg font-bold ${
                    isGta ? 'gta-font tracking-wide' : ''
                  }`}
                >
                  Settings & Theme
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className={`p-1.5 rounded-xl transition-colors ${
                  isGta
                    ? 'hover:bg-white/10 text-pink-200'
                    : 'hover:bg-slate-100 text-slate-500'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-5 space-y-5">
              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2.5 ${
                    isGta ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  Choose App Theme
                </label>

                <div className="grid grid-cols-1 gap-3">
                  {/* Classic Theme Option */}
                  <button
                    type="button"
                    onClick={() => setTheme('classic')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      !isGta
                        ? 'border-indigo-600 bg-indigo-50/70 ring-2 ring-indigo-500/30'
                        : 'border-white/15 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <div
                          className={`font-bold text-sm sm:text-base ${
                            isGta ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          Classic Exam Paper
                        </div>
                        <p
                          className={`text-xs ${
                            isGta ? 'text-pink-200/70' : 'text-slate-500'
                          }`}
                        >
                          Clean textbook look with serif typography
                        </p>
                      </div>
                    </div>
                    {!isGta && (
                      <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
                    )}
                  </button>

                  {/* GTA 6 Vice City Optional Theme */}
                  <button
                    type="button"
                    onClick={() => setTheme('gta6')}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                      isGta
                        ? 'border-pink-500 bg-gradient-to-r from-pink-500/25 via-orange-500/20 to-cyan-500/25 ring-2 ring-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]'
                        : 'border-slate-200 bg-slate-900 text-white hover:border-pink-500/60'
                    }`}
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl gta-btn-gradient text-white flex items-center justify-center shrink-0">
                        <Gamepad2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="gta-font font-extrabold text-sm sm:text-base gta-text-gradient">
                            GTA VI • Vice City
                          </span>
                          <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase rounded bg-pink-500/30 text-pink-200 border border-pink-400/40">
                            Neon + Art
                          </span>
                        </div>
                        <p className="text-xs text-pink-100/80 mt-0.5">
                          Transparent Vice City sunset background artwork & HUD
                        </p>
                      </div>
                    </div>
                    {isGta && (
                      <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                    )}
                  </button>
                </div>
              </div>

              {/* GTA 6 Background Image & Transparency Controls */}
              {isGta && (
                <div className="p-4 rounded-2xl bg-black/35 border border-pink-500/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                      <ImageIcon className="w-3.5 h-3.5" />
                      GTA VI Background Artwork
                    </span>
                    <button
                      type="button"
                      onClick={() => setGtaBgMode('auto')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                        gtaBgMode === 'auto'
                          ? 'bg-cyan-400/25 border-cyan-400 text-cyan-200'
                          : 'bg-white/5 border-white/15 text-pink-200/75 hover:bg-white/10'
                      }`}
                    >
                      Auto-Rotate Per Question
                    </button>
                  </div>

                  {/* Thumbnail Gallery of the 3 GTA 6 Wallpapers */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {GTA6_WALLPAPERS.map((wp, idx) => {
                      const isSelected =
                        gtaBgMode === wp.id ||
                        (gtaBgMode === 'auto' &&
                          idx === activeGtaWallpaperIndex);
                      return (
                        <button
                          key={wp.id}
                          type="button"
                          onClick={() => setGtaBgMode(wp.id)}
                          className={`group relative rounded-xl overflow-hidden border text-left transition-all ${
                            isSelected
                              ? 'border-cyan-400 ring-2 ring-cyan-400/50'
                              : 'border-white/20 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <div className="aspect-video w-full bg-purple-950 overflow-hidden">
                            <img
                              src={wp.src}
                              alt={wp.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="p-1.5 bg-[#120422]/90">
                            <div className="text-[11px] font-bold text-white truncate">
                              {wp.title}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Background Transparency / Opacity Slider */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-pink-200 font-medium">
                        Background Artwork Visibility (Transparency)
                      </span>
                      <span className="font-bold text-cyan-300">
                        {gtaBgOpacity}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={15}
                      max={85}
                      step={5}
                      value={gtaBgOpacity}
                      onChange={(e) =>
                        setGtaBgOpacity(parseInt(e.target.value, 10))
                      }
                      className="w-full accent-pink-500 cursor-pointer"
                    />
                  </div>
                </div>
              )}

              <div>
                <label
                  className={`block text-xs font-bold uppercase tracking-wider mb-2 ${
                    isGta ? 'text-cyan-300' : 'text-slate-500'
                  }`}
                >
                  Question Display Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setViewAllQuestions(false)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      !viewAllQuestions
                        ? isGta
                          ? 'bg-pink-500/30 border-pink-400 text-white'
                          : 'bg-indigo-600 border-indigo-600 text-white'
                        : isGta
                        ? 'bg-white/5 border-white/15 text-pink-200'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    Step-by-Step (Next Button)
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewAllQuestions(true)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-bold border transition-all ${
                      viewAllQuestions
                        ? isGta
                          ? 'bg-pink-500/30 border-pink-400 text-white'
                          : 'bg-indigo-600 border-indigo-600 text-white'
                        : isGta
                        ? 'bg-white/5 border-white/15 text-pink-200'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    All 5 Questions Together
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200/20 flex justify-end">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${
                  isGta
                    ? 'gta-btn-gradient'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content (z-10 so it sits cleanly over the transparent GTA 6 background images) */}
      <main className="relative z-10 flex-1 max-w-5xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        {activeTab === 'test' && !hasStartedTest ? (
          /* 1. WELCOME & NAME ENTRY SCREEN BEFORE STARTING TEST */
          <div className="max-w-lg mx-auto mt-4 sm:mt-10">
            <div
              className={`rounded-3xl overflow-hidden transition-all ${
                isGta
                  ? 'gta-card'
                  : 'bg-white border border-slate-200/90 paper-shadow'
              }`}
            >
              <div
                className={`relative px-6 py-8 text-white text-center overflow-hidden ${
                  isGta
                    ? 'bg-gradient-to-br from-pink-600/60 via-orange-500/50 to-purple-900/75 border-b border-pink-500/40'
                    : 'bg-gradient-to-br from-indigo-600 to-violet-700'
                }`}
              >
                {isGta && (
                  <img
                    src={GTA6_WALLPAPERS[activeGtaWallpaperIndex].src}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-35 mix-blend-lighten pointer-events-none"
                  />
                )}
                <div className="relative z-10">
                  <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mx-auto mb-4 shadow-inner">
                    {isGta ? (
                      <Gamepad2 className="w-9 h-9 text-cyan-300" />
                    ) : (
                      <Award className="w-9 h-9 text-white" />
                    )}
                  </div>
                  <h2
                    className={`text-2xl sm:text-3xl font-bold tracking-tight ${
                      isGta ? 'gta-font uppercase tracking-wider drop-shadow' : ''
                    }`}
                  >
                    {isGta
                      ? 'VICE CITY VOCAB MISSION'
                      : 'Ready for the English Test?'}
                  </h2>
                  <p className="text-white/95 text-sm sm:text-base mt-2 max-w-md mx-auto">
                    5 questions • 6 words on the left • Match 3 definitions on
                    the right to earn up to 100 points!
                  </p>
                </div>
              </div>

              <form
                onSubmit={(e) => handleStartTest(e, 'random')}
                className="p-6 sm:p-8 space-y-6"
              >
                <div>
                  <label
                    htmlFor="student-name"
                    className={`block text-sm font-semibold mb-2 ${
                      isGta
                        ? 'text-cyan-300 gta-font text-xs uppercase'
                        : 'text-slate-700'
                    }`}
                  >
                    Enter your name to begin:
                  </label>
                  <div className="relative">
                    <User
                      className={`w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 ${
                        isGta ? 'text-pink-400' : 'text-slate-400'
                      }`}
                    />
                    <input
                      id="student-name"
                      type="text"
                      required
                      autoFocus
                      value={nameInput}
                      onChange={(e) => setNameInput(e.target.value)}
                      placeholder="e.g. Adi"
                      className={`w-full pl-11 pr-4 py-3.5 rounded-xl border text-base font-medium focus:outline-none focus:ring-2 transition-all ${
                        isGta
                          ? 'bg-[#120524]/80 border-pink-500/50 text-white placeholder:text-pink-300/40 focus:ring-cyan-400 focus:border-cyan-400'
                          : 'bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-indigo-600 focus:border-indigo-600'
                      }`}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={!nameInput.trim()}
                    className={`w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl text-base font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                      isGta
                        ? 'gta-btn-gradient gta-font uppercase tracking-wider'
                        : 'bg-indigo-600 hover:bg-indigo-700 shadow-md hover:shadow-lg'
                    }`}
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>
                      {isGta ? 'Launch Mission' : 'Start Vocabulary Test'}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={!nameInput.trim()}
                    onClick={() => handleStartTest(undefined, 'sample')}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      isGta
                        ? 'bg-white/10 hover:bg-white/15 text-cyan-200 border border-cyan-400/30'
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Start with Sample Textbook Exam</span>
                  </button>
                </div>

                {/* Quick Theme Switcher on Welcome Card */}
                <div
                  className={`pt-4 border-t flex items-center justify-between text-xs ${
                    isGta ? 'border-pink-500/20' : 'border-slate-100'
                  }`}
                >
                  <span
                    className={isGta ? 'text-pink-200/80' : 'text-slate-500'}
                  >
                    Visual Theme:
                  </span>
                  <div className="flex items-center gap-2">
                    {isGta && (
                      <button
                        type="button"
                        onClick={() => setIsSettingsOpen(true)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-semibold bg-white/10 text-pink-200 hover:bg-white/15 border border-pink-400/30"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Backgrounds</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() =>
                        setTheme((t) => (t === 'gta6' ? 'classic' : 'gta6'))
                      }
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all ${
                        isGta
                          ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40'
                          : 'bg-slate-900 text-pink-400 hover:bg-slate-800'
                      }`}
                    >
                      <Gamepad2 className="w-3.5 h-3.5" />
                      <span>
                        {isGta ? 'Classic Theme' : 'Try GTA VI Theme'}
                      </span>
                    </button>
                  </div>
                </div>

                {leaderboard.length > 0 && (
                  <div
                    className={`pt-4 border-t ${
                      isGta ? 'border-pink-500/20' : 'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider mb-2.5">
                      <span
                        className={`flex items-center gap-1.5 ${
                          isGta ? 'text-amber-300' : 'text-slate-500'
                        }`}
                      >
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        Top Scores
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('leaderboard')}
                        className={`hover:underline capitalize font-medium ${
                          isGta ? 'text-cyan-300' : 'text-indigo-600'
                        }`}
                      >
                        View All ({leaderboard.length})
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {leaderboard.slice(0, 3).map((entry, idx) => (
                        <div
                          key={entry.id}
                          className={`flex items-center justify-between text-xs sm:text-sm px-3 py-2 rounded-lg ${
                            isGta
                              ? 'bg-white/10 border border-pink-500/20 text-white'
                              : 'bg-slate-50 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2 font-medium">
                            <span
                              className={`w-5 text-center font-bold ${
                                isGta ? 'text-pink-400' : 'text-slate-400'
                              }`}
                            >
                              #{idx + 1}
                            </span>
                            <span>{entry.name}</span>
                          </div>
                          <span
                            className={`font-bold ${
                              isGta ? 'text-cyan-300' : 'text-indigo-700'
                            }`}
                          >
                            {entry.points} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        ) : activeTab === 'test' && hasStartedTest ? (
          /* ACTIVE TEST OR RESULTS VIEW */
          <div className="space-y-4 sm:space-y-6">
            {/* Player Info & Action Toolbar */}
            <div
              className={`flex flex-wrap items-center justify-between gap-2.5 p-3 sm:p-4 rounded-2xl border shadow-sm ${
                isGta ? 'gta-card' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                <button
                  onClick={handleChangePlayer}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    isGta
                      ? 'bg-pink-500/25 hover:bg-pink-500/35 text-white border border-pink-500/40'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                  }`}
                  title="Click to change player name"
                >
                  <User
                    className={`w-3.5 h-3.5 ${
                      isGta ? 'text-cyan-300' : 'text-indigo-600'
                    }`}
                  />
                  <span>{playerName}</span>
                  <span
                    className={`text-[10px] underline ml-1 ${
                      isGta ? 'text-cyan-300' : 'text-indigo-600'
                    }`}
                  >
                    Change
                  </span>
                </button>

                <span
                  className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${
                    isGta
                      ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
                      : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {testModeLabel}
                </span>

                {!isSubmitted && (
                  <span
                    className={`text-xs sm:text-sm font-medium ${
                      isGta ? 'text-pink-200' : 'text-slate-600'
                    }`}
                  >
                    Matched:{' '}
                    <strong
                      className={isGta ? 'text-cyan-300' : 'text-slate-900'}
                    >
                      {answeredCount} / {totalDefinitions}
                    </strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {!isSubmitted && (
                  <button
                    type="button"
                    onClick={() => setViewAllQuestions((v) => !v)}
                    className={`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      isGta
                        ? 'bg-white/10 hover:bg-white/15 text-pink-100 border border-pink-400/30'
                        : 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                    }`}
                  >
                    <ListChecks className="w-3.5 h-3.5" />
                    <span>
                      {viewAllQuestions ? 'Step-by-Step View' : 'Show All 5'}
                    </span>
                  </button>
                )}

                <button
                  onClick={handleGenerateNewTest}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all ${
                    isGta
                      ? 'gta-btn-gradient'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>New Test</span>
                </button>
              </div>
            </div>

            {/* Results Banner after submission */}
            {isSubmitted && (
              <div
                className={`rounded-2xl p-5 sm:p-6 border shadow-md transition-all ${
                  isGta
                    ? 'gta-card border-cyan-400/60'
                    : scoreInfo.points >= 80
                    ? 'bg-emerald-50/90 border-emerald-200'
                    : scoreInfo.points >= 60
                    ? 'bg-amber-50/90 border-amber-200'
                    : 'bg-rose-50/90 border-rose-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 font-bold shadow-sm ${
                        isGta
                          ? 'gta-btn-gradient text-white'
                          : scoreInfo.points >= 80
                          ? 'bg-emerald-600 text-white'
                          : scoreInfo.points >= 60
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-600 text-white'
                      }`}
                    >
                      <span className="text-xl leading-none">
                        {scoreInfo.points}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider opacity-90 mt-0.5">
                        Points
                      </span>
                    </div>
                    <div>
                      <h2
                        className={`text-lg sm:text-xl font-bold ${
                          isGta
                            ? 'gta-font gta-text-gradient uppercase'
                            : 'text-slate-900'
                        }`}
                      >
                        {scoreInfo.points === 100
                          ? isGta
                            ? `MISSION PASSED! RESPECT +100, ${playerName}!`
                            : `Perfect Score, ${playerName}! 🎉`
                          : scoreInfo.points >= 80
                          ? `Great job, ${playerName}!`
                          : scoreInfo.points >= 60
                          ? `Good effort, ${playerName}!`
                          : `Keep practicing, ${playerName}!`}
                      </h2>
                      <p
                        className={`text-xs sm:text-sm mt-0.5 ${
                          isGta ? 'text-pink-100' : 'text-slate-700'
                        }`}
                      >
                        You matched{' '}
                        <strong className="font-bold">
                          {scoreInfo.correct} out of {scoreInfo.total}
                        </strong>{' '}
                        definitions correctly ({scoreInfo.points} / 100 points).
                        Your score has been saved to the Leaderboard!
                      </p>
                      <p
                        className={`text-xs font-medium mt-1.5 flex items-center gap-1 ${
                          isGta ? 'text-cyan-300' : 'text-indigo-700'
                        }`}
                      >
                        <Languages className="w-3.5 h-3.5" />
                        <span>
                          Hebrew translations for all items on the left are now
                          visible below.
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => setActiveTab('leaderboard')}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                        isGta
                          ? 'bg-amber-400/20 text-amber-200 border-amber-400/50 hover:bg-amber-400/30'
                          : 'text-amber-900 bg-amber-100 hover:bg-amber-200 border-amber-300'
                      }`}
                    >
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span>Leaderboard</span>
                    </button>
                    <button
                      onClick={handleRetrySameTest}
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold border shadow-sm transition-colors ${
                        isGta
                          ? 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                          : 'text-slate-700 bg-white hover:bg-slate-50 border-slate-300'
                      }`}
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Retry</span>
                    </button>
                    <button
                      onClick={handleGenerateNewTest}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all ${
                        isGta
                          ? 'gta-btn-gradient'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>New Test</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Authentic Exam Sheet Container */}
            <div
              className={`rounded-2xl overflow-hidden transition-all ${
                isGta
                  ? 'gta-card'
                  : 'bg-white border border-slate-200/90 paper-shadow'
              }`}
            >
              {/* Exam Paper Header */}
              <div
                className={`border-b px-4 sm:px-10 py-4 sm:py-6 ${
                  isGta
                    ? 'bg-[#17082c]/65 border-pink-500/30'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h2
                    className={`font-bold tracking-wide text-base sm:text-xl uppercase ${
                      isGta
                        ? 'gta-font gta-text-gradient'
                        : 'font-serif text-slate-900'
                    }`}
                  >
                    VOCABULARY
                  </h2>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-md border ${
                      isGta
                        ? 'bg-pink-500/20 text-pink-200 border-pink-500/40'
                        : 'text-slate-500 bg-white border-slate-200'
                    }`}
                  >
                    5 Questions • 100 Points
                  </span>
                </div>
                <p
                  className={`text-xs sm:text-base leading-relaxed ${
                    isGta ? 'text-pink-100/95' : 'font-serif text-slate-800'
                  }`}
                >
                  Below are five questions, <strong>(1)</strong> to{' '}
                  <strong>(5)</strong>. In each question there are six items
                  (words or chunks) and three definitions. In each question,
                  match <span className="underline font-semibold">three</span>{' '}
                  of the items 1–6 to the definitions on the right. Write the
                  number of the item next to its definition.
                </p>

                {/* Question Step Pills (when in step-by-step mode during test) */}
                {!isSubmitted && !viewAllQuestions && (
                  <div
                    className={`mt-4 pt-3 border-t flex items-center justify-between gap-2 ${
                      isGta ? 'border-pink-500/25' : 'border-slate-200/80'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1">
                      {questions.map((q, idx) => {
                        const complete = isQuestionComplete(q);
                        const isCurrent = idx === currentQuestionIdx;
                        return (
                          <button
                            key={q.questionNumber}
                            type="button"
                            onClick={() => {
                              setCurrentQuestionIdx(idx);
                              setSelectedLeftItem(null);
                            }}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                              isCurrent
                                ? isGta
                                  ? 'gta-btn-gradient text-white ring-2 ring-cyan-400/50'
                                  : 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200'
                                : complete
                                ? isGta
                                  ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-400/50'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isGta
                                ? 'bg-white/10 text-pink-200 border border-white/15 hover:bg-white/15'
                                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <span>Q{q.questionNumber}</span>
                            {complete && (
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                    <span
                      className={`text-xs font-semibold shrink-0 hidden sm:inline ${
                        isGta ? 'text-cyan-300' : 'text-slate-500'
                      }`}
                    >
                      Question {currentQuestionIdx + 1} of {questions.length}
                    </span>
                  </div>
                )}

                {!isSubmitted && (
                  <p
                    className={`mt-2.5 text-xs flex items-center gap-1.5 font-sans ${
                      isGta ? 'text-cyan-300' : 'text-indigo-600'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      <strong>Tip:</strong> Tap a word on the left (1–6) and
                      then tap its matching definition, or type the number
                      directly.
                    </span>
                  </p>
                )}
              </div>

              {/* Questions List */}
              <div
                className={`divide-y px-4 sm:px-10 ${
                  isGta ? 'divide-pink-500/25' : 'divide-slate-200'
                }`}
              >
                {questionsToRender.map((question) => {
                  const usedNumbers = getUsedNumbersForQuestion(question);
                  const questionCorrectCount = question.definitions.filter(
                    (d) =>
                      parseInt(answers[d.id] || '', 10) === d.correctItemNumber
                  ).length;

                  return (
                    <div
                      key={question.questionNumber}
                      className="py-5 sm:py-7 first:pt-5 sm:first:pt-7 last:pb-6 sm:last:pb-8"
                    >
                      <div className="flex flex-col md:flex-row md:items-start gap-5 md:gap-10">
                        {/* Left Side: Question Number + 6 Numbered Items */}
                        <div className="md:w-72 shrink-0">
                          <div
                            className={`flex items-center justify-between md:hidden mb-2.5 pb-2 border-b ${
                              isGta ? 'border-pink-500/20' : 'border-slate-100'
                            }`}
                          >
                            <span
                              className={`font-serif font-bold text-base ${
                                isGta ? 'text-white' : 'text-slate-900'
                              }`}
                            >
                              Question ({question.questionNumber}) —{' '}
                              <span
                                className={`font-sans text-xs uppercase tracking-wider ${
                                  isGta ? 'text-cyan-300' : 'text-indigo-600'
                                }`}
                              >
                                {question.categoryLabel}
                              </span>
                            </span>
                            {isSubmitted && (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                  questionCorrectCount === 3
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : questionCorrectCount >= 1
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {questionCorrectCount} / 3
                              </span>
                            )}
                          </div>

                          <div className="flex items-start gap-3 sm:gap-4">
                            <div className="hidden md:flex flex-col items-center pt-1">
                              <span
                                className={`font-serif font-bold text-lg select-none ${
                                  isGta ? 'text-pink-400' : 'text-slate-900'
                                }`}
                              >
                                ({question.questionNumber})
                              </span>
                              <span
                                className={`mt-1 text-[10px] font-semibold uppercase tracking-wider text-center max-w-[60px] ${
                                  isGta ? 'text-cyan-300/80' : 'text-slate-400'
                                }`}
                              >
                                {question.categoryLabel}
                              </span>
                            </div>

                            {/* Responsive grid on mobile (2 columns) and vertical list on desktop */}
                            <div className="flex-1 grid grid-cols-2 md:grid-cols-1 gap-1.5">
                              {question.items.map((item) => {
                                const isUsed = usedNumbers.has(item.number);
                                const isSelected =
                                  selectedLeftItem?.questionNumber ===
                                    question.questionNumber &&
                                  selectedLeftItem?.itemNumber === item.number;

                                const matchingTargetDef =
                                  question.definitions.find(
                                    (d) => d.correctItemNumber === item.number
                                  );

                                return (
                                  <button
                                    key={item.number}
                                    type="button"
                                    disabled={isSubmitted}
                                    onClick={() =>
                                      handleLeftItemClick(
                                        question.questionNumber,
                                        item.number
                                      )
                                    }
                                    className={`w-full text-left px-2.5 py-2 md:py-1.5 rounded-xl font-serif text-sm sm:text-base flex flex-col justify-center transition-all border ${
                                      isSubmitted
                                        ? isGta
                                          ? matchingTargetDef
                                            ? 'bg-pink-500/25 border-pink-400/60 text-white font-medium'
                                            : 'bg-black/35 border-white/10 text-pink-200/75'
                                          : matchingTargetDef
                                          ? 'bg-indigo-50/70 border-indigo-200 text-slate-900 font-medium'
                                          : 'bg-slate-50/60 border-slate-200/70 text-slate-700'
                                        : isSelected
                                        ? isGta
                                          ? 'gta-btn-gradient border-cyan-300 text-white ring-2 ring-cyan-400/50'
                                          : 'bg-indigo-600 border-indigo-600 text-white shadow-sm ring-2 ring-indigo-300'
                                        : isUsed
                                        ? isGta
                                          ? 'bg-black/30 border-white/10 text-pink-300/40'
                                          : 'bg-slate-100 border-slate-200 text-slate-400'
                                        : isGta
                                        ? 'bg-[#1b0833]/75 border-pink-500/35 hover:border-cyan-400/70 text-white'
                                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-slate-50 text-slate-900 shadow-2xs'
                                    }`}
                                  >
                                    <div className="w-full flex items-center justify-between gap-1.5">
                                      <span className="flex items-baseline gap-1.5 sm:gap-2 truncate">
                                        <span
                                          className={`font-bold shrink-0 ${
                                            isSelected
                                              ? 'text-white'
                                              : isUsed && !isSubmitted
                                              ? 'line-through opacity-50'
                                              : isGta
                                              ? 'text-pink-400'
                                              : 'text-slate-700'
                                          }`}
                                        >
                                          {item.number}.
                                        </span>
                                        <span
                                          className={`truncate ${
                                            isUsed &&
                                            !isSubmitted &&
                                            !isSelected
                                              ? 'line-through opacity-60'
                                              : ''
                                          }`}
                                        >
                                          {item.word.testDisplay}
                                        </span>
                                      </span>

                                      {!isSubmitted &&
                                        isUsed &&
                                        !isSelected && (
                                          <Check
                                            className={`w-3.5 h-3.5 shrink-0 ${
                                              isGta
                                                ? 'text-cyan-400'
                                                : 'text-indigo-500'
                                            }`}
                                          />
                                        )}
                                    </div>

                                    {/* 4. HEBREW TRANSLATION OF THE NEW WORDS ON THE LEFT AFTER FINISHING TEST */}
                                    {isSubmitted && item.word.hebrew && (
                                      <div
                                        dir="rtl"
                                        className={`mt-1 pt-1 border-t text-xs font-sans font-semibold text-right w-full ${
                                          isGta
                                            ? 'border-pink-500/30 text-cyan-300'
                                            : 'border-slate-200/70 text-indigo-700'
                                        }`}
                                      >
                                        {item.word.hebrew}
                                      </div>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Right Side: 3 Definitions with Number Input Blank */}
                        <div className="flex-1 space-y-3 sm:space-y-4 md:pl-2">
                          {question.definitions.map((def) => {
                            const userValue = answers[def.id] || '';
                            const userNum = parseInt(userValue, 10);
                            const isCorrect =
                              isSubmitted && userNum === def.correctItemNumber;

                            const correctWordObj = question.items.find(
                              (i) => i.number === def.correctItemNumber
                            )?.word;
                            const userChosenWordObj = question.items.find(
                              (i) => i.number === userNum
                            )?.word;

                            return (
                              <div
                                key={def.id}
                                onClick={() =>
                                  handleDefinitionBoxClick(
                                    question.questionNumber,
                                    def.id
                                  )
                                }
                                className={`p-3 sm:p-3.5 rounded-xl border transition-all ${
                                  isSubmitted
                                    ? isCorrect
                                      ? isGta
                                        ? 'bg-emerald-950/65 border-emerald-400/60'
                                        : 'bg-emerald-50/70 border-emerald-200'
                                      : isGta
                                      ? 'bg-rose-950/65 border-rose-400/60'
                                      : 'bg-rose-50/70 border-rose-200'
                                    : selectedLeftItem?.questionNumber ===
                                      question.questionNumber
                                    ? isGta
                                      ? 'bg-pink-500/25 border-cyan-400 cursor-pointer ring-1 ring-cyan-400/50'
                                      : 'bg-indigo-50/50 border-indigo-300 cursor-pointer hover:bg-indigo-50 ring-1 ring-indigo-200'
                                    : isGta
                                    ? 'bg-[#1a0833]/70 border-pink-500/35 hover:border-pink-400/70'
                                    : 'bg-slate-50/70 border-slate-200/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 sm:gap-3">
                                  {/* Status Icon on Review */}
                                  {isSubmitted && (
                                    <div className="shrink-0">
                                      {isCorrect ? (
                                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                      ) : (
                                        <XCircle className="w-5 h-5 text-rose-500" />
                                      )}
                                    </div>
                                  )}

                                  {/* Number Input Box */}
                                  <div className="relative shrink-0">
                                    <input
                                      type="text"
                                      inputMode="numeric"
                                      maxLength={2}
                                      disabled={isSubmitted}
                                      value={userValue}
                                      placeholder="1-6"
                                      aria-label={`Match number for definition: ${def.definition}`}
                                      onChange={(e) =>
                                        handleAnswerChange(
                                          question.questionNumber,
                                          def.id,
                                          e.target.value
                                        )
                                      }
                                      className={`w-11 sm:w-12 h-9 sm:h-10 text-center font-serif font-bold text-base sm:text-lg rounded-t-md border-b-2 focus:outline-none transition-colors ${
                                        isSubmitted
                                          ? isCorrect
                                            ? 'border-emerald-500 text-emerald-800 bg-emerald-100'
                                            : 'border-rose-500 text-rose-700 bg-rose-100 line-through'
                                          : isGta
                                          ? userValue
                                            ? 'border-cyan-400 text-cyan-300 bg-[#120422]/90'
                                            : 'border-pink-400/60 border-dotted text-white bg-[#120422]/75 placeholder:text-pink-300/40 placeholder:text-xs placeholder:font-sans focus:border-cyan-400 focus:border-solid'
                                          : userValue
                                          ? 'border-indigo-600 text-indigo-900 bg-white shadow-sm'
                                          : 'border-slate-400 border-dotted text-slate-800 bg-white placeholder:text-slate-300 placeholder:text-xs placeholder:font-sans focus:border-indigo-600 focus:border-solid'
                                      }`}
                                    />
                                  </div>

                                  {/* Definition Text */}
                                  <div className="flex-1 min-w-0">
                                    <span
                                      className={`font-serif text-sm sm:text-[17px] leading-snug block sm:inline ${
                                        isGta ? 'text-white' : 'text-slate-900'
                                      }`}
                                    >
                                      {def.definition}
                                    </span>

                                    {/* Show selected word badge while taking test */}
                                    {!isSubmitted && userChosenWordObj && (
                                      <span
                                        className={`mt-1 sm:mt-0 sm:ml-2.5 inline-flex items-center px-2 py-0.5 rounded text-xs font-sans font-medium border ${
                                          isGta
                                            ? 'bg-cyan-400/20 text-cyan-200 border-cyan-400/40'
                                            : 'bg-indigo-100 text-indigo-800 border-indigo-200'
                                        }`}
                                      >
                                        {userChosenWordObj.testDisplay}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Post-submission Feedback Row showing the right answer + Hebrew */}
                                {isSubmitted && (
                                  <div
                                    className={`mt-2.5 pt-2 border-t pl-1 sm:pl-8 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-sans ${
                                      isGta
                                        ? 'border-white/15'
                                        : 'border-slate-200/60'
                                    }`}
                                  >
                                    {isCorrect ? (
                                      <span
                                        className={`font-medium ${
                                          isGta
                                            ? 'text-emerald-300'
                                            : 'text-emerald-800'
                                        }`}
                                      >
                                        ✓ Correct:{' '}
                                        <strong>
                                          ({def.correctItemNumber}){' '}
                                          {correctWordObj?.testDisplay}
                                        </strong>
                                        {correctWordObj?.hebrew && (
                                          <span className="ml-2 opacity-90">
                                            ({correctWordObj.hebrew})
                                          </span>
                                        )}
                                      </span>
                                    ) : (
                                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                                        <span
                                          className={
                                            isGta
                                              ? 'text-rose-300'
                                              : 'text-rose-700'
                                          }
                                        >
                                          Your answer:{' '}
                                          <strong>
                                            {userValue
                                              ? `(${userValue}) ${
                                                  userChosenWordObj?.testDisplay ||
                                                  ''
                                                }`
                                              : 'No answer'}
                                          </strong>
                                        </span>
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300">
                                          <span>
                                            Right Answer: (
                                            {def.correctItemNumber}){' '}
                                            {correctWordObj?.testDisplay}
                                          </span>
                                          {correctWordObj?.hebrew && (
                                            <span className="text-emerald-700 font-normal">
                                              • {correctWordObj.hebrew}
                                            </span>
                                          )}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Score per question indicator on review (Desktop) */}
                        {isSubmitted && (
                          <div className="hidden md:flex md:w-20 shrink-0 flex-col items-center justify-center gap-1 text-right pt-2">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                questionCorrectCount === 3
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : questionCorrectCount >= 1
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {questionCorrectCount} / 3
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Exam Footer / Mobile-friendly Previous, Next & Submit Navigation */}
              <div
                className={`border-t px-4 sm:px-10 py-4 sm:py-5 ${
                  isGta
                    ? 'bg-[#140627]/70 border-pink-500/30'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                {!isSubmitted ? (
                  !viewAllQuestions ? (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                        <button
                          type="button"
                          disabled={currentQuestionIdx === 0}
                          onClick={() => {
                            setCurrentQuestionIdx((i) => Math.max(0, i - 1));
                            setSelectedLeftItem(null);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold border disabled:opacity-40 disabled:pointer-events-none transition-colors ${
                            isGta
                              ? 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                              : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          <span>Previous</span>
                        </button>

                        <span
                          className={`text-xs sm:text-sm font-semibold sm:px-3 ${
                            isGta ? 'text-pink-200' : 'text-slate-600'
                          }`}
                        >
                          Question {currentQuestionIdx + 1} of{' '}
                          {questions.length}
                        </span>

                        {currentQuestionIdx < questions.length - 1 ? (
                          <button
                            type="button"
                            onClick={() => {
                              setCurrentQuestionIdx((i) =>
                                Math.min(questions.length - 1, i + 1)
                              );
                              setSelectedLeftItem(null);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-sm transition-all ${
                              isGta
                                ? 'gta-btn-gradient'
                                : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                          >
                            <span>Next Question</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSubmitTest}
                            className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-colors"
                          >
                            <Award className="w-4 h-4" />
                            <span>Finish Test</span>
                          </button>
                        )}
                      </div>

                      <div
                        className={`w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 ${
                          isGta ? 'border-pink-500/20' : 'border-slate-200/70'
                        }`}
                      >
                        <span
                          className={`text-xs ${
                            isGta ? 'text-pink-200/80' : 'text-slate-500'
                          }`}
                        >
                          Total matched:{' '}
                          <strong>
                            {answeredCount}/{totalDefinitions}
                          </strong>
                        </span>
                        {currentQuestionIdx < questions.length - 1 && (
                          <button
                            type="button"
                            onClick={handleSubmitTest}
                            className={`text-xs font-semibold underline ${
                              isGta
                                ? 'text-cyan-300 hover:text-cyan-200'
                                : 'text-indigo-600 hover:text-indigo-800'
                            }`}
                          >
                            Finish & Grade Now
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div
                        className={`flex items-center gap-2 text-xs sm:text-sm ${
                          isGta ? 'text-pink-200' : 'text-slate-600'
                        }`}
                      >
                        {answeredCount < totalDefinitions ? (
                          <>
                            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                            <span>
                              Answered{' '}
                              <strong>
                                {answeredCount} of {totalDefinitions}
                              </strong>{' '}
                              definitions.
                            </span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="text-emerald-400 font-medium">
                              All 15 definitions matched! Ready to grade.
                            </span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={handleRetrySameTest}
                          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                            isGta
                              ? 'text-pink-200 hover:bg-white/10'
                              : 'text-slate-600 hover:bg-slate-200/70'
                          }`}
                        >
                          Clear
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmitTest}
                          className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm sm:text-base font-bold text-white shadow-md transition-all ${
                            isGta
                              ? 'gta-btn-gradient'
                              : 'bg-indigo-600 hover:bg-indigo-700'
                          }`}
                        >
                          <Award className="w-5 h-5" />
                          <span>Finish Test & Check Results</span>
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p
                      className={`text-xs sm:text-sm ${
                        isGta ? 'text-pink-200' : 'text-slate-600'
                      }`}
                    >
                      Review all 5 questions above with Hebrew translations and
                      right answers.
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveTab('leaderboard')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-colors"
                      >
                        <Trophy className="w-4 h-4 text-amber-600" />
                        <span>View Leaderboard</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRetrySameTest}
                        className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-colors ${
                          isGta
                            ? 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                            : 'text-slate-700 bg-white border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Retry Same Test</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleGenerateNewTest}
                        className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all ${
                          isGta
                            ? 'gta-btn-gradient'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Generate Another Test</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'leaderboard' ? (
          /* 2. LEADERBOARD VIEW */
          <div className="max-w-3xl mx-auto space-y-6">
            <div
              className={`p-5 sm:p-8 rounded-2xl border ${
                isGta ? 'gta-card' : 'bg-white border-slate-200 paper-shadow'
              }`}
            >
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
                  isGta ? 'border-pink-500/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                    <Trophy className="w-6 h-6" />
                  </div>
                  <div>
                    <h2
                      className={`text-xl sm:text-2xl font-bold ${
                        isGta
                          ? 'gta-font gta-text-gradient uppercase'
                          : 'text-slate-900'
                      }`}
                    >
                      Test Leaderboard
                    </h2>
                    <p
                      className={`text-xs sm:text-sm ${
                        isGta ? 'text-pink-200/80' : 'text-slate-500'
                      }`}
                    >
                      Rankings by student name and test points (out of 100)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={syncLeaderboardWithServer}
                    disabled={isSyncingLeaderboard}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      isGta
                        ? 'bg-white/10 text-cyan-200 border-cyan-400/30 hover:bg-white/15'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                    title="Sync latest scores from server"
                  >
                    <RotateCcw
                      className={`w-3.5 h-3.5 ${
                        isSyncingLeaderboard ? 'animate-spin' : ''
                      }`}
                    />
                    <span>{isSyncingLeaderboard ? 'Syncing...' : 'Refresh'}</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('test')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all ${
                      isGta
                        ? 'gta-btn-gradient'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Back to Test</span>
                  </button>
                  {leaderboard.length > 0 && (
                    <button
                      onClick={handleClearLeaderboard}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors"
                      title="Clear leaderboard history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Reset</span>
                    </button>
                  )}
                </div>
              </div>

              {leaderboard.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Trophy className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3
                    className={`text-base font-bold ${
                      isGta ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    No test results yet!
                  </h3>
                  <p
                    className={`text-sm mt-1 max-w-sm mx-auto ${
                      isGta ? 'text-pink-200/75' : 'text-slate-500'
                    }`}
                  >
                    Enter your name, complete a 5-question vocabulary test, and
                    your score will appear here on the leaderboard.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-2.5">
                  {leaderboard.map((entry, idx) => {
                    const rank = idx + 1;
                    const isTop3 = rank <= 3;
                    return (
                      <div
                        key={entry.id}
                        className={`flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl border transition-all ${
                          isGta
                            ? rank === 1
                              ? 'bg-pink-500/25 border-amber-400/70'
                              : 'bg-black/35 border-pink-500/25'
                            : rank === 1
                            ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                            : rank === 2
                            ? 'bg-slate-50 border-slate-300'
                            : rank === 3
                            ? 'bg-orange-50/40 border-orange-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                          <div
                            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              rank === 1
                                ? 'bg-amber-500 text-white shadow-2xs'
                                : rank === 2
                                ? 'bg-slate-400 text-white'
                                : rank === 3
                                ? 'bg-amber-700 text-white'
                                : isGta
                                ? 'bg-white/10 text-pink-200'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {rank}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span
                                className={`font-bold text-sm sm:text-base truncate ${
                                  isGta ? 'text-white' : 'text-slate-900'
                                }`}
                              >
                                {entry.name}
                              </span>
                              {isTop3 && (
                                <span className="text-xs">
                                  {rank === 1
                                    ? '🥇'
                                    : rank === 2
                                    ? '🥈'
                                    : '🥉'}
                                </span>
                              )}
                            </div>
                            <p
                              className={`text-xs ${
                                isGta ? 'text-pink-200/70' : 'text-slate-500'
                              }`}
                            >
                              {entry.correctCount}/{entry.totalCount} correct •{' '}
                              {entry.date}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {(entry.detailedHistory || entry.questions) && (
                            <button
                              type="button"
                              onClick={() => {
                                setExpandedHistoryId(entry.id);
                                setHistoryPlayerFilter('all');
                                setActiveTab('history');
                              }}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                                isGta
                                  ? 'bg-white/10 text-cyan-200 border-cyan-400/40 hover:bg-white/20'
                                  : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                              }`}
                              title="View full questions & answers history for this test"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">View Q&A</span>
                            </button>
                          )}
                          <span
                            className={`inline-block px-3 py-1 rounded-xl font-bold text-sm sm:text-base ${
                              entry.points >= 80
                                ? 'bg-emerald-100 text-emerald-800'
                                : entry.points >= 60
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {entry.points} pts
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ) : activeTab === 'history' ? (
          /* 3. TEST HISTORY VIEW (ALL SAVED QUESTIONS & ANSWERS FOR EACH TEST) */
          <div className="max-w-4xl mx-auto space-y-6">
            <div
              className={`p-5 sm:p-8 rounded-2xl border ${
                isGta ? 'gta-card' : 'bg-white border-slate-200 paper-shadow'
              }`}
            >
              <div
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b ${
                  isGta ? 'border-pink-500/30' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isGta
                        ? 'bg-pink-500/20 text-cyan-300 border border-pink-500/40'
                        : 'bg-indigo-100 text-indigo-600'
                    }`}
                  >
                    <HistoryIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h2
                      className={`text-xl sm:text-2xl font-bold ${
                        isGta
                          ? 'gta-font gta-text-gradient uppercase'
                          : 'text-slate-900'
                      }`}
                    >
                      Test Questions & Answers History
                    </h2>
                    <p
                      className={`text-xs sm:text-sm ${
                        isGta ? 'text-pink-200/80' : 'text-slate-500'
                      }`}
                    >
                      Click any completed test to review all 5 questions, the 6
                      words on the left, the user's answers, and the right
                      answers.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={syncLeaderboardWithServer}
                    disabled={isSyncingLeaderboard}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                      isGta
                        ? 'bg-white/10 text-cyan-200 border-cyan-400/30 hover:bg-white/15'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <RotateCcw
                      className={`w-3.5 h-3.5 ${
                        isSyncingLeaderboard ? 'animate-spin' : ''
                      }`}
                    />
                    <span>
                      {isSyncingLeaderboard ? 'Syncing...' : 'Refresh'}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('test')}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white shadow-sm transition-all ${
                      isGta
                        ? 'gta-btn-gradient'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Back to Test</span>
                  </button>
                </div>
              </div>

              {/* Player Filter Pills if there are multiple students */}
              {leaderboard.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  <span
                    className={`text-xs font-semibold mr-1 ${
                      isGta ? 'text-cyan-300' : 'text-slate-500'
                    }`}
                  >
                    Filter by student:
                  </span>
                  {['all', ...Array.from(new Set(leaderboard.map((e) => e.name)))].map(
                    (student) => (
                      <button
                        key={student}
                        type="button"
                        onClick={() => setHistoryPlayerFilter(student)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                          historyPlayerFilter === student
                            ? isGta
                              ? 'gta-btn-gradient text-white'
                              : 'bg-indigo-600 text-white'
                            : isGta
                            ? 'bg-white/10 text-pink-200 hover:bg-white/15'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {student === 'all' ? `All (${leaderboard.length})` : student}
                      </button>
                    )
                  )}
                </div>
              )}

              {leaderboard.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <HistoryIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <h3
                    className={`text-base font-bold ${
                      isGta ? 'text-white' : 'text-slate-700'
                    }`}
                  >
                    No test history yet!
                  </h3>
                  <p
                    className={`text-sm mt-1 max-w-sm mx-auto ${
                      isGta ? 'text-pink-200/75' : 'text-slate-500'
                    }`}
                  >
                    Complete a vocabulary test and every question and answer
                    from that test will be saved here for review.
                  </p>
                </div>
              ) : (
                <div className="mt-6 space-y-4">
                  {[...leaderboard]
                    .filter(
                      (e) =>
                        historyPlayerFilter === 'all' ||
                        e.name === historyPlayerFilter
                    )
                    // Order chronologically (newest first based on timestamp id prefix)
                    .sort((a, b) => {
                      const tA = parseInt(a.id.split('-')[0] || '0', 10);
                      const tB = parseInt(b.id.split('-')[0] || '0', 10);
                      return tB - tA;
                    })
                    .map((entry) => {
                      const isExpanded = expandedHistoryId === entry.id;

                      // Reconstruct detailedHistory from entry.detailedHistory or entry.questions + entry.answers
                      const historyRecords: SavedQuestionRecord[] =
                        entry.detailedHistory ||
                        (entry.questions
                          ? entry.questions.map((q) => ({
                              questionNumber: q.questionNumber,
                              categoryLabel: q.categoryLabel,
                              items: q.items.map((it) => ({
                                number: it.number,
                                testDisplay: it.word.testDisplay,
                                hebrew: it.word.hebrew,
                              })),
                              definitions: q.definitions.map((def) => {
                                const rawAns =
                                  (entry.answers && entry.answers[def.id]) || '';
                                const parsedNum = parseInt(rawAns, 10);
                                const userItemNumber = !isNaN(parsedNum)
                                  ? parsedNum
                                  : null;
                                const correctItem = q.items.find(
                                  (i) => i.number === def.correctItemNumber
                                );
                                const userItem =
                                  userItemNumber !== null
                                    ? q.items.find(
                                        (i) => i.number === userItemNumber
                                      )
                                    : undefined;
                                return {
                                  id: def.id,
                                  definition: def.definition,
                                  correctItemNumber: def.correctItemNumber,
                                  userItemNumber,
                                  isCorrect:
                                    userItemNumber === def.correctItemNumber,
                                  correctWord: {
                                    testDisplay:
                                      correctItem?.word.testDisplay || '',
                                    hebrew: correctItem?.word.hebrew || '',
                                  },
                                  userWord: userItem
                                    ? {
                                        testDisplay: userItem.word.testDisplay,
                                        hebrew: userItem.word.hebrew,
                                      }
                                    : undefined,
                                };
                              }),
                            }))
                          : []);

                      return (
                        <div
                          key={entry.id}
                          className={`rounded-2xl border overflow-hidden transition-all ${
                            isGta
                              ? isExpanded
                                ? 'bg-black/55 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                                : 'bg-black/35 border-pink-500/30 hover:border-pink-400/60'
                              : isExpanded
                              ? 'bg-white border-indigo-300 shadow-md'
                              : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          {/* Collapsible Test Attempt Header */}
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedHistoryId(isExpanded ? null : entry.id)
                            }
                            className="w-full flex items-center justify-between gap-3 p-4 sm:p-5 text-left"
                          >
                            <div className="flex items-center gap-3.5 min-w-0">
                              <div
                                className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold shrink-0 ${
                                  entry.points >= 80
                                    ? 'bg-emerald-600 text-white'
                                    : entry.points >= 60
                                    ? 'bg-amber-500 text-white'
                                    : 'bg-rose-600 text-white'
                                }`}
                              >
                                <span className="text-sm sm:text-base leading-none">
                                  {entry.points}
                                </span>
                                <span className="text-[9px] uppercase opacity-90">
                                  pts
                                </span>
                              </div>
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <span
                                    className={`font-bold text-base sm:text-lg truncate ${
                                      isGta ? 'text-white' : 'text-slate-900'
                                    }`}
                                  >
                                    {entry.name}
                                  </span>
                                  <span
                                    className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                      isGta
                                        ? 'bg-pink-500/20 text-pink-200 border border-pink-500/30'
                                        : 'bg-slate-200/80 text-slate-700'
                                    }`}
                                  >
                                    {entry.testType}
                                  </span>
                                </div>
                                <p
                                  className={`text-xs sm:text-sm mt-0.5 ${
                                    isGta
                                      ? 'text-pink-200/75'
                                      : 'text-slate-500'
                                  }`}
                                >
                                  Matched{' '}
                                  <strong>
                                    {entry.correctCount} / {entry.totalCount}
                                  </strong>{' '}
                                  definitions • {entry.date}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span
                                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                                  isGta
                                    ? 'bg-white/10 text-cyan-200 border-cyan-400/30'
                                    : 'bg-white text-indigo-700 border-slate-200 shadow-2xs'
                                }`}
                              >
                                <span>
                                  {isExpanded
                                    ? 'Hide Q&A'
                                    : 'View Questions & Answers'}
                                </span>
                                {isExpanded ? (
                                  <ChevronUp className="w-4 h-4" />
                                ) : (
                                  <ChevronDown className="w-4 h-4" />
                                )}
                              </span>
                            </div>
                          </button>

                          {/* Expanded Full 5 Questions & Answers Breakdown */}
                          {isExpanded && (
                            <div
                              className={`border-t px-4 sm:px-6 py-5 space-y-5 ${
                                isGta
                                  ? 'border-pink-500/30 bg-[#120422]/60'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              {historyRecords.length === 0 ? (
                                <p
                                  className={`text-sm italic ${
                                    isGta ? 'text-pink-200/70' : 'text-slate-500'
                                  }`}
                                >
                                  Detailed question history was not recorded for
                                  this older entry.
                                </p>
                              ) : (
                                historyRecords.map((qRec) => {
                                  const qCorrect = qRec.definitions.filter(
                                    (d) => d.isCorrect
                                  ).length;
                                  return (
                                    <div
                                      key={qRec.questionNumber}
                                      className={`p-4 rounded-xl border ${
                                        isGta
                                          ? 'bg-black/40 border-pink-500/25'
                                          : 'bg-slate-50/70 border-slate-200'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200/30">
                                        <span
                                          className={`font-serif font-bold text-sm sm:text-base ${
                                            isGta
                                              ? 'text-white'
                                              : 'text-slate-900'
                                          }`}
                                        >
                                          Question ({qRec.questionNumber}) —{' '}
                                          <span
                                            className={`font-sans text-xs uppercase tracking-wider ${
                                              isGta
                                                ? 'text-cyan-300'
                                                : 'text-indigo-600'
                                            }`}
                                          >
                                            {qRec.categoryLabel}
                                          </span>
                                        </span>
                                        <span
                                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                            qCorrect === 3
                                              ? 'bg-emerald-100 text-emerald-800'
                                              : qCorrect >= 1
                                              ? 'bg-amber-100 text-amber-800'
                                              : 'bg-rose-100 text-rose-800'
                                          }`}
                                        >
                                          {qCorrect} / 3 Correct
                                        </span>
                                      </div>

                                      <div className="flex flex-col md:flex-row gap-4 md:gap-8">
                                        {/* Left 6 Words with Hebrew */}
                                        <div className="md:w-64 shrink-0 grid grid-cols-2 md:grid-cols-1 gap-1.5">
                                          {qRec.items.map((item) => (
                                            <div
                                              key={item.number}
                                              className={`px-2.5 py-1.5 rounded-lg border text-xs sm:text-sm flex items-center justify-between gap-2 ${
                                                isGta
                                                  ? 'bg-white/5 border-white/10 text-white'
                                                  : 'bg-white border-slate-200 text-slate-800'
                                              }`}
                                            >
                                              <span className="font-serif font-medium truncate">
                                                <strong>{item.number}.</strong>{' '}
                                                {item.testDisplay}
                                              </span>
                                              {item.hebrew && (
                                                <span
                                                  dir="rtl"
                                                  className={`text-[11px] font-sans font-semibold shrink-0 ${
                                                    isGta
                                                      ? 'text-cyan-300'
                                                      : 'text-indigo-700'
                                                  }`}
                                                >
                                                  {item.hebrew}
                                                </span>
                                              )}
                                            </div>
                                          ))}
                                        </div>

                                        {/* Right 3 Definitions & User Answer vs Correct Answer */}
                                        <div className="flex-1 space-y-2.5">
                                          {qRec.definitions.map((def) => (
                                            <div
                                              key={def.id}
                                              className={`p-3 rounded-xl border ${
                                                def.isCorrect
                                                  ? isGta
                                                    ? 'bg-emerald-950/60 border-emerald-400/50'
                                                    : 'bg-emerald-50/80 border-emerald-200'
                                                  : isGta
                                                  ? 'bg-rose-950/60 border-rose-400/50'
                                                  : 'bg-rose-50/80 border-rose-200'
                                              }`}
                                            >
                                              <div className="flex items-start gap-2.5">
                                                {def.isCorrect ? (
                                                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                ) : (
                                                  <XCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <p
                                                    className={`font-serif text-sm sm:text-base ${
                                                      isGta
                                                        ? 'text-white'
                                                        : 'text-slate-900'
                                                    }`}
                                                  >
                                                    {def.definition}
                                                  </p>
                                                  <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs font-sans">
                                                    {def.isCorrect ? (
                                                      <span
                                                        className={`font-semibold ${
                                                          isGta
                                                            ? 'text-emerald-300'
                                                            : 'text-emerald-800'
                                                        }`}
                                                      >
                                                        ✓ Answered: (
                                                        {def.correctItemNumber}){' '}
                                                        {
                                                          def.correctWord
                                                            .testDisplay
                                                        }{' '}
                                                        {def.correctWord
                                                          .hebrew &&
                                                          `(${def.correctWord.hebrew})`}
                                                      </span>
                                                    ) : (
                                                      <>
                                                        <span
                                                          className={`font-medium ${
                                                            isGta
                                                              ? 'text-rose-300'
                                                              : 'text-rose-700'
                                                          }`}
                                                        >
                                                          User answered:{' '}
                                                          <strong>
                                                            {def.userItemNumber !==
                                                            null
                                                              ? `(${
                                                                  def.userItemNumber
                                                                }) ${
                                                                  def.userWord
                                                                    ?.testDisplay ||
                                                                  ''
                                                                }`
                                                              : 'No answer'}
                                                          </strong>
                                                        </span>
                                                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-semibold border border-emerald-300">
                                                          Right Answer: (
                                                          {
                                                            def.correctItemNumber
                                                          }
                                                          ){' '}
                                                          {
                                                            def.correctWord
                                                              .testDisplay
                                                          }{' '}
                                                          {def.correctWord
                                                            .hebrew &&
                                                            `• ${def.correctWord.hebrew}`}
                                                        </span>
                                                      </>
                                                    )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* WORD BANK EXPLORER VIEW */
          <div className="space-y-6">
            <div
              className={`p-4 sm:p-6 rounded-2xl border shadow-sm ${
                isGta ? 'gta-card' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2
                    className={`text-lg sm:text-xl font-bold ${
                      isGta
                        ? 'gta-font gta-text-gradient uppercase'
                        : 'text-slate-900'
                    }`}
                  >
                    NEW WORDS Vocabulary List ({WORD_BANK.length} items)
                  </h2>
                  <p
                    className={`text-xs sm:text-sm mt-0.5 ${
                      isGta ? 'text-pink-200/80' : 'text-slate-500'
                    }`}
                  >
                    Every word and chunk from the curriculum list with English
                    definitions and Hebrew translations.
                  </p>
                </div>

                {/* Search Box */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search English or Hebrew..."
                    className={`w-full pl-9 pr-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 ${
                      isGta
                        ? 'bg-[#120422]/85 border-pink-500/40 text-white placeholder:text-pink-300/40 focus:ring-cyan-400'
                        : 'border-slate-200 text-slate-900 focus:ring-indigo-500'
                    }`}
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-6">
                {(
                  [
                    { id: 'all', label: `All (${WORD_BANK.length})` },
                    {
                      id: 'noun',
                      label: `Nouns (${
                        WORD_BANK.filter((w) => w.category === 'noun').length
                      })`,
                    },
                    {
                      id: 'verb',
                      label: `Verbs (${
                        WORD_BANK.filter((w) => w.category === 'verb').length
                      })`,
                    },
                    {
                      id: 'adjective',
                      label: `Adjectives (${
                        WORD_BANK.filter((w) => w.category === 'adjective')
                          .length
                      })`,
                    },
                    {
                      id: 'adverb',
                      label: `Adverbs (${
                        WORD_BANK.filter((w) => w.category === 'adverb').length
                      })`,
                    },
                    {
                      id: 'chunk',
                      label: `Chunks (${
                        WORD_BANK.filter((w) => w.category === 'chunk').length
                      })`,
                    },
                  ] as const
                ).map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                      categoryFilter === cat.id
                        ? isGta
                          ? 'gta-btn-gradient text-white'
                          : 'bg-indigo-600 text-white'
                        : isGta
                        ? 'bg-white/10 text-pink-200 hover:bg-white/15'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Word Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredWordBank.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-colors flex flex-col justify-between ${
                      isGta
                        ? 'bg-black/35 border-pink-500/25 hover:border-cyan-400/50'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-indigo-50/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`font-serif font-bold text-base ${
                            isGta ? 'text-white' : 'text-slate-900'
                          }`}
                        >
                          {item.rawLabel}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full capitalize ${
                            isGta
                              ? 'bg-pink-500/20 text-pink-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <p
                        className={`text-xs sm:text-sm leading-snug ${
                          isGta ? 'text-pink-100/85' : 'text-slate-600'
                        }`}
                      >
                        {item.definition}
                      </p>
                    </div>
                    <div
                      dir="rtl"
                      className={`mt-2 pt-2 border-t text-xs font-semibold text-right ${
                        isGta
                          ? 'border-pink-500/20 text-cyan-300'
                          : 'border-slate-100 text-indigo-700'
                      }`}
                    >
                      {item.hebrew}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
