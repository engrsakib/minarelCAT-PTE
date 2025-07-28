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
  const [startTime, setStartTime] = useState(null);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Multi-answer selection
  const [selected, setSelected] = useState([]);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // AI Score Modal state
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Mock score data with time tracking
  const [mockScoreData, setMockScoreData] = useState({
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
      selectedOptions: [],
      totalOptions: 0,
      time: "00:00",
      timeInSeconds: 0,
      language: "English: American",
      correctSelections: 0,
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
  });

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
        setStartTime(null); // Reset start time on new question
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

    // Set start time when timer first starts
    if (startTime === null) {
      setStartTime(Date.now());
    }

    timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [timerStarted, timeLeft, startTime]);

  // Handle option change (multiple)
  const handleOptionChange = (idx) => {
    setSelected((prev) => {
      if (prev.includes(idx)) {
        return prev.filter((i) => i !== idx);
      } else {
        return [...prev, idx];
      }
    });
  };

  // Format MM:SS
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  // Submit handler with time tracking
  const handleSubmit = async () => {
    if (!currentQ || selected.length === 0) return;

    const timeTaken = startTime
      ? Math.floor((Date.now() - startTime) / 1000)
      : 0;

    const payload = {
      questionId: currentQ._id,
      answers: selected,
      timeTaken: timeTaken,
    };

    try {
      await fetchWithAuth("/test/mcq_multiple/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      // Update mock score data with actual time taken
      setMockScoreData((prev) => ({
        ...prev,
        userResponse: {
          ...prev.userResponse,
          selectedOptions: selected,
          totalOptions: currentQ.options?.length || 0,
          time: formatTime(timeTaken),
          timeInSeconds: timeTaken,
          correctSelections: Math.floor(Math.random() * selected.length) + 1,
        },
      }));

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
            setStartTime(null);
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

      {/* Enhanced AI Score Modal with Time Tracking */}
      {showAiScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#810000]">
                AI Score Report
              </h2>
              <button
                onClick={() => setShowAiScoreModal(false)}
                className="text-gray-500 hover:text-[#810000]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Time Taken Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">Time Taken:</span>
                <span className="font-bold text-[#810000] text-xl">
                  {mockScoreData.userResponse.time}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>
                  Started at: {new Date(startTime).toLocaleTimeString()}
                </span>
                <span>{mockScoreData.userResponse.timeInSeconds} seconds</span>
              </div>
              <Progress
                value={
                  (mockScoreData.userResponse.timeInSeconds / RECORD_SECONDS) *
                  100
                }
                className="h-2 bg-gray-200"
                indicatorClassName="bg-[#810000]"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0:00</span>
                <span>{formatTime(RECORD_SECONDS)}</span>
              </div>
            </div>

            {/* Score Summary */}
            <div className="text-center mb-6">
              <p className="text-4xl font-bold text-[#810000] mb-2">
                {mockScoreData.overallScore}/{mockScoreData.maxScore}
              </p>
              <p className="text-gray-600 mb-4">
                You answered {mockScoreData.userResponse.correctSelections} out
                of {mockScoreData.userResponse.selectedOptions.length}{" "}
                selections correctly
              </p>
              <div className="bg-[#f5eaea] p-3 rounded-lg">
                <p className="text-[#810000] font-medium">
                  Answered in {mockScoreData.userResponse.time}
                </p>
                {mockScoreData.userResponse.timeInSeconds < 60 ? (
                  <p className="text-sm text-gray-600">Very quick response!</p>
                ) : (
                  <p className="text-sm text-gray-600">Good timing!</p>
                )}
              </div>
            </div>

            {/* Skills Breakdown */}
            <div className="mb-6">
              <h3 className="font-semibold text-[#810000] mb-2">
                Skills Breakdown:
              </h3>
              <div className="space-y-3">
                {mockScoreData.enablingSkills.map((skill, index) => (
                  <div key={index} className="flex items-center">
                    <span className="w-32 text-sm font-medium text-gray-600">
                      {skill.name}
                    </span>
                    <Progress
                      value={skill.progress}
                      className="h-2 flex-1 bg-gray-200 mx-2"
                      indicatorClassName={
                        skill.progress === 100 ? "bg-green-500" : "bg-[#810000]"
                      }
                    />
                    <span className="w-10 text-sm font-medium">
                      {skill.score}/{skill.max}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <button
              className="w-full mt-4 px-4 py-3 bg-[#810000] text-white rounded-lg hover:bg-[#a50000] transition font-semibold"
              onClick={() => setShowAiScoreModal(false)}
            >
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
