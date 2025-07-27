"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Monitor, Share2, X } from "lucide-react";
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

  // Dropdown answers
  const [answers, setAnswers] = useState([]);

  // AI Score Modal state
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);

  // Mock score data for the modal (updated to be dynamic based on 'answers' state)
  const mockScoreData = {
    overallScore: 12, // This could be dynamically calculated based on correct answers
    maxScore: 15, // This should be total number of blanks
    enablingSkills: [
      {
        name: "Reading",
        score: 3,
        max: 3,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Grammar",
        score: 2,
        max: 3,
        progress: 67,
        color: "hsl(var(--primary))",
      },
      {
        name: "Vocabulary",
        score: 3,
        max: 3,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Comprehension",
        score: 2,
        max: 3,
        progress: 67,
        color: "hsl(var(--primary))",
      },
      {
        name: "Context",
        score: 2,
        max: 3,
        progress: 67,
        color: "hsl(var(--primary))",
      },
    ],
    userResponse: {
      totalAnswers: answers.filter((a) => a).length,
      time: formatTime(RECORD_SECONDS - timeLeft),
      language: "English: American",
      correctAnswers: Math.floor(Math.random() * answers.length) + 1, // Placeholder for actual correct answers
    },
    suggestions: [
      {
        title: "Grammar Understanding",
        text: "Focus on understanding the grammatical context of each blank. Consider the sentence structure and the type of word needed (noun, verb, adjective, etc.) before selecting your answer.",
      },
      {
        title: "Context Clues",
        text: "Read the entire passage carefully to understand the overall meaning. Often, clues for one blank can be found in other parts of the text.",
      },
    ],
    scoreDisappearDate: "28/09/2025",
  };

  // Fetch all questions and find current index
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        // Fetch the question list for pagination
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        let arr = [];
        let idx = 0;
        let questionObj = null;
        if (res.ok) {
          const data = await res.json();
          // If API gives multiple questions (pagination), else fallback to single
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
        }
        setQuestions(arr);
        setCurrentIdx(idx);
        setCurrentQ(questionObj);
        // Answers array is based on blanks length
        setAnswers(Array(questionObj?.blanks?.length || 0).fill(""));
      } catch {
        setQuestions([]);
        setCurrentIdx(0);
        setCurrentQ(null);
        setAnswers([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Added id to dependency array to re-fetch on ID change

  // Timer logic (start on page load or when loading is complete)
  useEffect(() => {
    if (loading) return; // Wait until content is loaded
    if (!timerStarted) {
      setTimerStarted(true);
    }
  }, [loading, timerStarted]); // Added timerStarted to dependency array

  useEffect(() => {
    if (!timerStarted) return;
    if (timeLeft === 0) {
      clearTimeout(timerRef.current);
      // Optionally, submit answers automatically when time runs out
      // handleSubmit();
      return;
    }
    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft]);

  // Answer change handler
  const handleAnswerChange = (idx) => (e) => {
    const arr = [...answers];
    arr[idx] = e.target.value;
    setAnswers(arr);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!currentQ) return;
    const payload = {
      questionId: currentQ._id,
      answers,
    };
    try {
      // Simulate API call
      // await fetchWithAuth("/test/reading-writing-blanks/submit", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });
      console.log("Submitting answers:", payload); // For demonstration
      // Show AI Score Modal instead of alert
      setShowAiScoreModal(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
    }
  };

  // Pagination controls
  const goToIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    router.push(`/question/reading-writing-blanks/${questions[idx]._id}`);
  };

  // Render pagination (bottom right, sticky dropdown)
  const renderPagination = () => (
    <div className="flex items-center justify-end gap-2 mt-6">
      <button
        aria-label="Previous question"
        onClick={() => goToIndex(currentIdx - 1)}
        disabled={currentIdx === 0}
        className={`rounded-full border bg-white p-2 shadow text-[#810000] font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-[#810000] hover:text-white`}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
      </button>
      <div className="flex items-center gap-2">
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white text-sm md:text-base">
          {String(currentIdx + 1).padStart(3, "0")}
        </span>
        <span className="text-gray-500 font-medium">/</span>
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white text-sm md:text-base">
          {String(questions.length).padStart(3, "0")}
        </span>
      </div>
      <button
        aria-label="Next question"
        onClick={() => goToIndex(currentIdx + 1)}
        disabled={currentIdx === questions.length - 1}
        className={`rounded-full border bg-white p-2 shadow text-[#810000] font-bold text-lg disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 hover:bg-[#810000] hover:text-white`}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
      </button>
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
      <div className="flex justify-center items-center min-h-[40vh] text-lg font-medium text-gray-600">
        Loading...
      </div>
    );
  }

  // Prompt split for blanks (replace ___ or (a)/(b) style)
  const prompt = currentQ.prompt || "";
  const blanks = currentQ.blanks || [];
  let splitParts = [];
  let regex = /___/g;
  let match;
  let cursor = 0;
  // let blankCount = 0; // blankCount is not used, can be removed

  // Support both ___ and (a)/(b) style (optional, fallback to ___)
  if (prompt.match(/\([a-e]\)/g)) {
    regex = /\([a-e]\)/g;
  }

  while ((match = regex.exec(prompt))) {
    splitParts.push(prompt.slice(cursor, match.index));
    // blankCount++; // Not used
    cursor = match.index + match[0].length;
  }
  splitParts.push(prompt.slice(cursor));

  return (
    <div className="w-full lg:max-w-[90%] xl:max-w-[80%] mx-auto py-4 px-4 sm:py-6 sm:px-6 relative">
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#810000] border-b-2 border-[#810000] pb-2 mb-4 sm:mb-6">
        Reading & Writing Blanks
      </h1>
      <p className="text-gray-700 text-sm sm:text-base mb-4 sm:mb-6">
        Below is a text with blanks. Click on each blank, a list of choices will
        appear. Select the appropriate answer choice for each blank.
      </p>
      {/* Question Heading */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 mb-4">
        <span className="rounded px-3 py-1 sm:px-4 sm:py-2 font-bold text-white bg-[#810000] text-sm sm:text-base tracking-wide min-w-[70px] text-center">
          #{currentQ._id}
        </span>
        {currentQ.heading && (
          <h2 className="text-lg sm:text-xl font-semibold text-[#810000] mt-2 sm:mt-0">
            {currentQ.heading}
          </h2>
        )}
      </div>
      {/* Timer */}
      <div className="mb-4 flex items-center gap-3 text-sm sm:text-base">
        <span className="text-[#810000] font-medium">
          Remaining Time:{" "}
          <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>
      {/* Prompt with answer dropdowns */}
      <div className="border border-[#810000] rounded-lg bg-[#faf9f9] p-4 sm:p-5 mb-4 text-gray-900 text-sm sm:text-base leading-relaxed whitespace-pre-line">
        {splitParts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < blanks.length && (
              <span className="inline-block align-middle mx-0.5 sm:mx-1">
                <span className="font-bold text-[#810000] mr-1">
                  {/* For (a)/(b) style, show (a), else show (i) */}
                  {(prompt.match(/\([a-e]\)/g) &&
                    prompt.match(/\([a-e]\)/g)[i]) ||
                    `(${String.fromCharCode(97 + i)})`}
                </span>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Answer options below */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 mb-4">
        {blanks.map((blank, i) => (
          <div key={i} className="flex-1">
            <select
              value={answers[i] || ""}
              onChange={handleAnswerChange(i)}
              className="w-full border border-[#810000] bg-white rounded-md px-3 py-2 text-[#810000] font-semibold focus:outline-none focus:ring-2 focus:ring-[#810000] appearance-none text-sm sm:text-base cursor-pointer"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml;charset=UTF-8,%3Csvg width='24' height='24' fill='none' stroke='%23810000' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
                backgroundPosition: "right 0.75rem center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "1em",
              }}
            >
              <option value="">{`(${String.fromCharCode(
                97 + i
              )}) Select answer`}</option>
              {blank.options.map((opt, j) => (
                <option key={j} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
      {/* Controls */}
      <div className="flex flex-wrap gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-5 py-2 rounded-md border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-sm sm:text-base transition-colors duration-200"
          onClick={() => {
            setAnswers(Array(currentQ.blanks?.length || 0).fill(""));
            setTimeLeft(RECORD_SECONDS);
            setTimerStarted(false);
          }}
          disabled={timeLeft === 0}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-5 py-2 rounded-md border-2 border-[#810000] bg-white text-[#810000] font-semibold text-sm sm:text-base hover:bg-[#810000] hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={answers.some((a) => !a) || timeLeft === 0}
        >
          Submit
        </button>
      </div>
      {renderPagination()}

      {/* Custom AI Score Modal (Full Width) */}
      {showAiScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="relative w-full max-w-full h-[98vh] sm:h-[90vh] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#810000] to-[#a50000] p-3 sm:p-4 md:p-5 flex flex-row items-center justify-between shadow-lg flex-shrink-0">
              <div className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold">
                <Monitor className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>#{currentQ._id}</span>
              </div>
              <div className="text-white text-lg sm:text-xl md:text-2xl font-bold flex-grow text-center">
                AI Score Report
                <span className="block text-xs sm:text-sm font-normal opacity-90 mt-0.5">
                  alfapte.com
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white cursor-pointer hover:scale-110 transition-transform" />
                <X
                  className="w-4 h-4 sm:w-5 sm:h-5 text-white cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setShowAiScoreModal(false)}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto">
              <div className="p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
                {/* Score Overview */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 sm:gap-8">
                  {/* Overall Score */}
                  <div className="xl:col-span-1">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-slate-200 hover:shadow-xl transition-shadow">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-5 text-center">
                        Overall Score
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="relative w-28 h-28 sm:w-36 sm:h-36 mb-4 sm:mb-6">
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
                            <span className="text-3xl sm:text-4xl font-bold text-[#810000]">
                              {mockScoreData.overallScore}
                            </span>
                            <span className="text-sm sm:text-base text-gray-500">
                              out of {mockScoreData.maxScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-lg sm:text-xl font-semibold text-gray-700 mb-1 sm:mb-2">
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
                  <div className="xl:col-span-4">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-5 sm:p-8 border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-3 px-5 sm:py-4 sm:px-8 rounded-lg sm:rounded-xl mb-5">
                        <h3 className="text-xl sm:text-2xl font-bold text-center">
                          Enabling Skills Breakdown
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                        {mockScoreData.enablingSkills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-slate-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                              <span className="font-bold text-gray-800 text-base sm:text-lg">
                                {skill.name}
                              </span>
                              <span className="text-base sm:text-lg font-bold text-[#810000] bg-red-50 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full">
                                {skill.score}/{skill.max}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={skill.progress}
                                className="h-3.5 sm:h-4 bg-slate-200"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-white drop-shadow-sm">
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
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-4 px-5 sm:py-5 sm:px-8">
                    <h3 className="text-xl sm:text-2xl font-bold">
                      Your Response Analysis
                    </h3>
                  </div>

                  <div className="p-4 sm:p-6 md:p-8 space-y-5 sm:space-y-6">
                    <div className="bg-slate-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-[#810000]">
                      <h4 className="text-lg sm:text-xl font-bold text-[#810000] mb-3">
                        Selected Answers:
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {answers.map((answer, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3 rounded-md border text-sm sm:text-base"
                          >
                            <span className="font-semibold text-gray-700">
                              {String.fromCharCode(97 + idx)})
                            </span>
                            <span className="ml-1.5 text-gray-800">
                              {answer || "Not selected"}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mt-5">
                      <div className="bg-blue-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center border border-blue-200 hover:shadow-md transition-shadow">
                        <p className="text-sm text-blue-600 font-bold uppercase tracking-wider mb-2">
                          Answered
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-blue-800">
                          {answers.filter((a) => a).length}/{answers.length}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center border border-green-200 hover:shadow-md transition-shadow">
                        <p className="text-sm text-green-600 font-bold uppercase tracking-wider mb-2">
                          Time Taken
                        </p>
                        <p className="text-xl sm:text-2xl font-bold text-green-800">
                          {formatTime(RECORD_SECONDS - timeLeft)}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-lg sm:rounded-xl p-4 sm:p-6 text-center border border-purple-200 hover:shadow-md transition-shadow">
                        <p className="text-sm text-purple-600 font-bold uppercase tracking-wider mb-2">
                          Language
                        </p>
                        <p className="text-base sm:text-lg font-bold text-purple-800">
                          {mockScoreData.userResponse.language}
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-5 bg-yellow-50 py-3 px-4 rounded-lg border border-yellow-200">
                      ⏰ This score will expire on{" "}
                      <span className="font-bold">
                        {mockScoreData.scoreDisappearDate}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-4 px-5 sm:py-5 sm:px-8 cursor-pointer hover:from-[#950000] hover:to-[#b50000] transition-colors">
                    <h3 className="text-xl sm:text-2xl font-bold flex items-center justify-center gap-2 sm:gap-3">
                      💡 Detailed Feedback & Suggestions
                    </h3>
                  </div>
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-slate-50 to-white">
                    {mockScoreData.suggestions.map((suggestion, index) => (
                      <div key={index} className="mb-5 last:mb-0">
                        <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 border-l-4 border-[#810000] shadow-md hover:shadow-lg transition-shadow">
                          <h4 className="font-bold text-[#810000] mb-3 flex items-center gap-2 sm:gap-3 text-lg sm:text-xl">
                            <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 bg-[#810000] rounded-full"></span>
                            {suggestion.title}
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
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

      <style jsx>{`
        select:disabled {
          background: #eee;
          color: #bbb;
        }
      `}</style>
    </div>
  );
}
