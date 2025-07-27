"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Monitor,
  Share2,
  X,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

export default function DynamicPage({ params }) {
  const { id } = params;
  const router = useRouter();

  // State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Multi-answer selection
  const [selected, setSelected] = useState([]);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // AI Score Modal state
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Mock score data for the modal
  const mockScoreData = {
    overallScore: 13,
    maxScore: 15,
    enablingSkills: [
      {
        name: "Reading",
        score: 3,
        max: 3,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Critical Thinking",
        score: 2,
        max: 3,
        progress: 67,
        color: "hsl(var(--primary))",
      },
      {
        name: "Comprehension",
        score: 3,
        max: 3,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Analysis",
        score: 2,
        max: 3,
        progress: 67,
        color: "hsl(var(--primary))",
      },
      {
        name: "Multiple Selection",
        score: 3,
        max: 3,
        progress: 100,
        color: "hsl(var(--primary))",
      },
    ],
    userResponse: {
      selectedOptions: selected,
      totalOptions: currentQ?.options?.length || 0,
      time: formatTime(RECORD_SECONDS - timeLeft),
      language: "English: American",
      correctSelections: Math.floor(Math.random() * selected.length) + 1,
    },
    suggestions: [
      {
        title: "Multiple Answer Strategy",
        text: "When answering multiple choice questions with multiple correct answers, read each option independently. Don't assume that selecting one option eliminates others - each option should be evaluated on its own merit.",
      },
      {
        title: "Reading Comprehension",
        text: "Take time to fully understand the passage before looking at the options. Identify key themes, main ideas, and supporting details that will help you make informed selections.",
      },
    ],
    scoreDisappearDate: "28/09/2025",
  };

  // Fetch all questions and find current index
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();

        let arr = [];
        let idx = 0;
        let questionObj = null;

        // API can send as {questions:[]} or {question:{}}
        if (
          data.questions &&
          Array.isArray(data.questions) &&
          data.questions.length
        ) {
          arr = data.questions;
          idx = arr.findIndex((q) => q._id === id);
          questionObj = arr[idx !== -1 ? idx : 0];
        } else if (data.question) {
          arr = [data.question];
          idx = 0;
          questionObj = data.question;
        }

        setQuestions(arr);
        setCurrentIdx(idx);
        setCurrentQ(questionObj);
        setSelected([]);
      } catch {
        setQuestions([]);
        setCurrentIdx(0);
        setCurrentQ(null);
        setSelected([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestions();
    // eslint-disable-next-line
  }, [id]);

  // Timer logic (start on page load)
  useEffect(() => {
    if (loading) return;
    if (!timerStarted) setTimerStarted(true);
  }, [loading]);

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft === 0) return;
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft]);

  // Handle option change (multiple)
  const handleOptionChange = (idx) => {
    setSelected((prev) => {
      if (prev.includes(idx)) {
        // deselect if already selected
        return prev.filter((i) => i !== idx);
      } else {
        // select new
        return [...prev, idx];
      }
    });
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ || selected.length === 0) return;
    const payload = {
      questionId: currentQ._id,
      answers: selected, // array of selected option indexes
    };
    try {
      await fetchWithAuth("/test/mcq_multiple/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      // Show AI Score Modal instead of alert
      setShowAiScoreModal(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
    }
  };

  // Pagination controls (dropdown + prev/next, styled right-bottom)
  const renderPagination = () => (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end w-max">
      <div className="relative">
        <button
          className="rounded border bg-white px-4 py-2 shadow text-[#810000] font-bold flex items-center gap-2"
          onClick={() => setDropdownOpen((o) => !o)}
        >
          {String(currentIdx + 1).padStart(3, "0")}
          {dropdownOpen ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 bottom-11 w-36 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50 dropdown-scroll">
            {questions.map((q, i) => (
              <button
                key={q._id}
                onClick={() => {
                  router.push(`/question/mcq-multiple/${q._id}`);
                  setDropdownOpen(false);
                }}
                className={`flex w-full px-4 py-2 text-left text-sm font-semibold transition
                  ${
                    i === currentIdx
                      ? "bg-[#810000] text-white"
                      : "hover:bg-[#f5eaea] text-[#810000]"
                  }
                `}
              >
                {String(i + 1).padStart(3, "0")}{" "}
                {q.heading && (
                  <span className="ml-1 truncate w-24">{q.heading}</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="flex mt-2 gap-2">
        <button
          aria-label="Prev"
          onClick={() => {
            if (currentIdx > 0) {
              router.push(
                `/question/mcq-multiple/${questions[currentIdx - 1]._id}`
              );
            }
          }}
          disabled={currentIdx === 0}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          aria-label="Next"
          onClick={() => {
            if (currentIdx < questions.length - 1) {
              router.push(
                `/question/mcq-multiple/${questions[currentIdx + 1]._id}`
              );
            }
          }}
          disabled={currentIdx === questions.length - 1}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <style jsx>{`
        .dropdown-scroll::-webkit-scrollbar {
          width: 4px;
          background: #eee;
        }
        .dropdown-scroll::-webkit-scrollbar-thumb {
          background: #dedede;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );

  // Format MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice &amp; Multiple answer
      </div>
      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting all
        correct responses. You may select more than one response.
      </p>
      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {currentQ.heading}
        </span>
      </div>
      {/* Timer */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time:{" "}
          <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>
      {/* Prompt */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {currentQ.prompt}
      </div>
      {/* MCQ Question */}
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        {/* Use 'text' field from API for MCQ question */}
        {currentQ.text}
      </div>
      {/* Options */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-4 mb-2">
        {currentQ.options.map((opt, i) => {
          const abc = String.fromCharCode(65 + i);
          return (
            <label
              key={i}
              className={`flex items-center gap-3 mb-2 cursor-pointer select-none group ${
                selected.includes(i)
                  ? "bg-[#f5eaea] border-2 border-[#810000] rounded"
                  : ""
              }`}
              style={{
                transition: "background 0.1s, border 0.1s",
                padding: "0.25rem 0.5rem",
              }}
            >
              <input
                type="checkbox"
                name="mcq"
                checked={selected.includes(i)}
                onChange={() => handleOptionChange(i)}
                className="accent-[#810000] w-4 h-4"
                style={{ accentColor: "#810000" }}
              />
              <span
                className={`text-base font-bold flex items-center justify-center w-7 h-7 rounded-full border border-[#810000] ${
                  selected.includes(i)
                    ? "bg-[#810000] text-white"
                    : "bg-white text-[#810000]"
                }`}
                style={{
                  minWidth: 28,
                  minHeight: 28,
                }}
              >
                {abc}
              </span>
              <span className="text-gray-800 font-normal text-base">{opt}</span>
            </label>
          );
        })}
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base"
          onClick={() => {
            setSelected([]);
            setTimeLeft(RECORD_SECONDS);
            setTimerStarted(false);
          }}
          disabled={timeLeft === 0}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition"
          onClick={handleSubmit}
          disabled={selected.length === 0 || timeLeft === 0}
        >
          Submit
        </button>
      </div>
      {renderPagination()}

      {/* Custom AI Score Modal (Responsive) */}
      {showAiScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-2 sm:inset-4 lg:inset-6 xl:inset-8 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg sm:rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#810000] to-[#a50000] p-3 sm:p-4 lg:p-6 flex flex-col sm:flex-row items-center justify-between shadow-lg gap-3 sm:gap-0">
              <div className="flex items-center gap-2 sm:gap-3 text-white text-base sm:text-lg font-semibold order-2 sm:order-1">
                <Monitor className="w-4 h-4 sm:w-6 sm:h-6" />
                <span className="text-sm sm:text-base">#{currentQ._id}</span>
              </div>
              <div className="text-white text-lg sm:text-xl lg:text-2xl font-bold flex-grow text-center order-1 sm:order-2">
                AI Score Report
                <span className="block text-xs sm:text-sm font-normal opacity-90 mt-1">
                  alfapte.com
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3 order-3">
                <Share2 className="w-4 h-4 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
                <X
                  className="w-4 h-4 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setShowAiScoreModal(false)}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100%-60px)] sm:h-[calc(100%-72px)] lg:h-[calc(100%-84px)] overflow-y-auto">
              <div className="p-4 sm:p-6 lg:p-8 xl:p-12 space-y-6 sm:space-y-8 lg:space-y-12">
                {/* Score Overview */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12">
                  {/* Overall Score */}
                  <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-800 mb-6 sm:mb-8 lg:mb-10 text-center">
                        Overall Score
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 mb-4 sm:mb-6">
                          <svg
                            className="w-full h-full transform -rotate-90"
                            viewBox="0 0 36 36"
                          >
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e2e8f0"
                              strokeWidth="2"
                            />
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#810000"
                              strokeWidth="2"
                              strokeDasharray={`${
                                (mockScoreData.overallScore /
                                  mockScoreData.maxScore) *
                                100
                              }, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#810000]">
                              {mockScoreData.overallScore}
                            </span>
                            <span className="text-sm sm:text-base text-gray-500">
                              out of {mockScoreData.maxScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 mb-2">
                            Great Performance!
                          </p>
                          <p className="text-sm sm:text-base text-gray-500">
                            {Math.round(
                              (mockScoreData.overallScore /
                                mockScoreData.maxScore) *
                                100
                            )}
                            % Achievement
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills Breakdown */}
                  <div className="lg:col-span-4">
                    <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl p-6 sm:p-8 lg:p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-3 sm:py-4 lg:py-5 px-6 sm:px-8 lg:px-10 rounded-xl sm:rounded-2xl mb-6 sm:mb-8 lg:mb-10">
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-center">
                          Enabling Skills Breakdown
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                        {mockScoreData.enablingSkills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border border-slate-200 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                              <span className="font-bold text-gray-800 text-sm sm:text-base lg:text-xl">
                                {skill.name}
                              </span>
                              <span className="text-sm sm:text-base lg:text-xl font-bold text-[#810000] bg-red-50 px-2 sm:px-3 lg:px-4 py-1 sm:py-2 rounded-full">
                                {skill.score}/{skill.max}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={skill.progress}
                                className="h-3 sm:h-4 lg:h-5 bg-slate-200"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs sm:text-sm font-bold text-white drop-shadow-sm">
                                  {skill.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Response Section */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-4 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-10">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold">
                      Your Response Analysis
                    </h3>
                  </div>

                  <div className="p-4 sm:p-6 lg:p-10 space-y-6 sm:space-y-8">
                    <div className="bg-slate-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-l-4 sm:border-l-8 border-[#810000]">
                      <h4 className="text-lg sm:text-xl font-bold text-[#810000] mb-4">
                        Selected Options:
                      </h4>
                      <div className="grid grid-cols-1 gap-3 sm:gap-4">
                        {currentQ.options.map((option, idx) => (
                          <div
                            key={idx}
                            className={`p-3 sm:p-4 rounded-lg border ${
                              selected.includes(idx)
                                ? "bg-green-50 border-green-200"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <div className="flex items-start sm:items-center gap-2 sm:gap-3">
                              <span
                                className={`font-bold text-sm sm:text-lg w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  selected.includes(idx)
                                    ? "bg-[#810000] text-white"
                                    : "bg-gray-200 text-gray-600"
                                }`}
                              >
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="text-gray-800 flex-1 text-sm sm:text-base leading-relaxed">
                                {option}
                              </span>
                              {selected.includes(idx) && (
                                <span className="text-green-600 font-bold text-lg flex-shrink-0">
                                  ✓
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mt-6 sm:mt-10">
                      <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center border border-blue-200 hover:shadow-xl transition-shadow">
                        <p className="text-xs sm:text-sm lg:text-base text-blue-600 font-bold uppercase tracking-wider mb-2 sm:mb-3">
                          Selected
                        </p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-800">
                          {selected.length}/{currentQ.options.length}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center border border-green-200 hover:shadow-xl transition-shadow">
                        <p className="text-xs sm:text-sm lg:text-base text-green-600 font-bold uppercase tracking-wider mb-2 sm:mb-3">
                          Time Taken
                        </p>
                        <p className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-800">
                          {formatTime(RECORD_SECONDS - timeLeft)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 text-center border border-purple-200 hover:shadow-xl transition-shadow">
                        <p className="text-xs sm:text-sm lg:text-base text-purple-600 font-bold uppercase tracking-wider mb-2 sm:mb-3">
                          Language
                        </p>
                        <p className="text-base sm:text-lg lg:text-xl font-bold text-purple-800">
                          {mockScoreData.userResponse.language}
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-sm sm:text-base text-gray-600 mt-6 sm:mt-8 bg-yellow-50 py-3 sm:py-4 px-4 sm:px-6 lg:px-8 rounded-xl sm:rounded-2xl border border-yellow-200">
                      ⏰ This score will expire on{" "}
                      <span className="font-bold">
                        {mockScoreData.scoreDisappearDate}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-4 sm:py-5 lg:py-6 px-4 sm:px-6 lg:px-10 cursor-pointer hover:from-[#950000] hover:to-[#b50000] transition-colors">
                    <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold flex items-center justify-center gap-2 sm:gap-4">
                      💡 Detailed Feedback & Suggestions
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6 lg:p-10 bg-gradient-to-br from-slate-50 to-white">
                    {mockScoreData.suggestions.map((suggestion, index) => (
                      <div key={index} className="mb-6 sm:mb-8 last:mb-0">
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 border-l-4 sm:border-l-8 border-[#810000] shadow-lg hover:shadow-xl transition-shadow">
                          <h4 className="font-bold text-[#810000] mb-3 sm:mb-4 flex items-center gap-2 sm:gap-4 text-lg sm:text-xl lg:text-2xl">
                            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-[#810000] rounded-full flex-shrink-0"></span>
                            {suggestion.title}
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base lg:text-lg">
                            {suggestion.text}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
