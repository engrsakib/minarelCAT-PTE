"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

// Fake questions fallback (1-100 for pagination)
const FAKE_QUESTIONS = Array.from({ length: 100 }, (_, i) => ({
  _id: String(1234560 + i),
  type: "mcq_multiple",
  heading: i === 0 ? "Skin Cancer" : `Fake Heading ${i + 1}`,
  prompt:
    i === 0
      ? `Write an email to the manager of a restaurant inquiring about the process for making online reservations.

In your email, include:

-Ask for information on how the online reservation system works.
-Clarify if special requests (e.g., dietary preferences or seating arrangements) can be made online.
-Inquire about confirmation details and how far reservations should be made in advance.`
      : `Fake prompt for question #${i + 1}`,
  questionText:
    i === 0
      ? "Which of the following statements about the vaccine are incorrect?"
      : `Fake MCQ question #${i + 1}`,
  options: [
    "Most cases of skin cancer are linked to exposure to ultraviolet radiation.",
    "A vaccine stimulating the production of a protein critical to the skin’s antioxidant network is helping people bolster their defenses against skin cancer.",
    "Skin cancer is the most common cancer in the United States, and Melanoma is the most lethal form of skin cancer",
    "There are multiple vaccines to prevent cancer.",
  ],
}));

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

  // Fetch all questions and find current index
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/test/mcq_multiple`);
        const data = await res.json();
        const arr =
          data?.questions && data.questions.length
            ? data.questions
            : FAKE_QUESTIONS;
        setQuestions(arr);
        const idx = arr.findIndex((q) => q._id === id);
        setCurrentIdx(idx !== -1 ? idx : 0);
        setCurrentQ(arr[idx !== -1 ? idx : 0]);
        setSelected([]);
      } catch {
        setQuestions(FAKE_QUESTIONS);
        setCurrentIdx(0);
        setCurrentQ(FAKE_QUESTIONS[0]);
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
  const handleOptionChange = idx => {
    setSelected(prev => {
      if (prev.includes(idx)) {
        // deselect if already selected
        return prev.filter(i => i !== idx);
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
      alert("Your answer has been submitted! (Demo: backend response not shown)");
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
          {dropdownOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
        {dropdownOpen && (
          <div className="absolute right-0 bottom-11 w-36 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50 dropdown-scroll">
            {questions.slice(0, 100).map((q, i) => (
              <button
                key={q._id}
                onClick={() => {
                  router.push(`/question/mcq-multiple/${q._id}`);
                  setDropdownOpen(false);
                }}
                className={`flex w-full px-4 py-2 text-left text-sm font-semibold transition
                  ${i === currentIdx ? "bg-[#810000] text-white" : "hover:bg-[#f5eaea] text-[#810000]"}
                `}
              >
                {String(i + 1).padStart(3, "0")} {q.heading && (
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
              router.push(`/question/mcq-multiple/${questions[currentIdx - 1]._id}`);
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
              router.push(`/question/mcq-multiple/${questions[currentIdx + 1]._id}`);
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
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">Loading...</div>
    );
  }

  return (
    <div className="max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Multiple Choice &amp; Multiple answer
      </div>
      <p className="text-gray-700 mb-6">
        Read the text and answer the multiple-choice question by selecting all correct responses. You may select more than one response.
      </p>
      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">{currentQ.heading}</span>
      </div>
      {/* Timer */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time: <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>
      {/* Prompt */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {currentQ.prompt}
      </div>
      {/* MCQ Question */}
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        {currentQ.questionText}
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
    </div>
  );
}