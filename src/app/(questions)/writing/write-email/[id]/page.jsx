"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const FAKE_QUESTIONS = Array.from({ length: 100 }, (_, i) => ({
  _id: String(1001635 + i),
  type: "writing",
  subtype: "write_essay",
  heading: i === 0 ? "Parent Teacher Conference" : `Fake Heading ${i + 1}`,
  prompt:
    i === 0
      ? `Write an email to the manager of a restaurant inquiring about the process for making online reservations.
In your email, include:
- Ask for information on how the online reservation system works.
- Clarify if special requests (e.g., dietary preferences or seating arrangements) can be made online.
- Inquire about confirmation details and how far reservations should be made in advance.`
      : `Fake prompt for question #${i + 1}`,
  audioUrl: "",
}));

const WRITING_SECONDS = 599; // 9:59min
const WORD_LIMIT = 1000;

export default function RepeatSentencePage({ params }) {
  const { id } = params;
  const router = useRouter();

  // State
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);

  // Writing timer
  const [writingTime, setWritingTime] = useState(WRITING_SECONDS);
  const [writingStarted, setWritingStarted] = useState(false);
  const timerRef = useRef();

  // Answer state
  const [answer, setAnswer] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch questions
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/test/writing/write_essay`);
        const data = await res.json();
        const arr =
          data?.questions && data.questions.length
            ? data.questions
            : FAKE_QUESTIONS;
        setQuestions(arr);
        const idx = arr.findIndex((q) => q._id === id);
        setCurrentIdx(idx !== -1 ? idx : 0);
        setCurrentQ(arr[idx !== -1 ? idx : 0]);
      } catch {
        setQuestions(FAKE_QUESTIONS);
        setCurrentIdx(0);
        setCurrentQ(FAKE_QUESTIONS[0]);
      }
      setLoading(false);
      setWritingTime(WRITING_SECONDS);
      setWritingStarted(false);
      setAnswer("");
      setWordCount(0);
    }
    getQuestions();
    // eslint-disable-next-line
  }, [id]);

  // Writing timer logic
  useEffect(() => {
    if (!writingStarted) return;
    if (writingTime === 0) {
      setWritingStarted(false);
      return;
    }
    timerRef.current = setTimeout(() => setWritingTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [writingStarted, writingTime]);

  // Word count
  useEffect(() => {
    const wc = answer.trim() ? answer.trim().split(/\s+/).length : 0;
    setWordCount(wc);
  }, [answer]);

  // Prevent paste in textarea
  const handlePaste = (e) => {
    e.preventDefault();
  };

  // Handle input in textarea
  const handleInput = (e) => {
    if (!writingStarted) setWritingStarted(true);
    let val = e.target.value;
    // Limit word count to WORD_LIMIT
    let words = val.trim() ? val.trim().split(/\s+/) : [];
    if (words.length > WORD_LIMIT) {
      words = words.slice(0, WORD_LIMIT);
      val = words.join(" ") + " ";
    }
    setAnswer(val);
  };

  // Submit handler
  const handleSubmit = async () => {
    if (!answer.trim() || !currentQ) return;
    const formData = new FormData();
    formData.append("text", answer.trim());
    formData.append("questionId", currentQ._id);
    try {
      await fetchWithAuth("/test/writing/write_essay/submit", {
        method: "POST",
        body: formData,
      });
      alert(
        "Your answer has been submitted! (Demo: backend response not shown)"
      );
    } catch (e) {
      alert("Something went wrong! Try again.");
    }
  };

  // Pagination controls
  const goToIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    router.push(`/question/write-essay/${questions[idx]._id}`);
    setDropdownOpen(false);
  };

  // Render pagination (bottom right, sticky dropdown)
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
          <div className="absolute right-0 bottom-11 w-36 max-h-72 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50">
            {questions.slice(0, 100).map((q, i) => (
              <button
                key={q._id}
                onClick={() => goToIndex(i)}
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
          onClick={() => goToIndex(currentIdx - 1)}
          disabled={currentIdx === 0}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          aria-label="Next"
          onClick={() => goToIndex(currentIdx + 1)}
          disabled={currentIdx === questions.length - 1}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  // mm:ss format for timer
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (loading || !currentQ) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Respond to a Situation (Writing)
      </div>
      <p className="text-gray-700 mb-6">
        Read a description of a situation. You will have{" "}
        <span className="font-bold">9:59 minutes</span> to write your answer.{" "}
        <br />
        Please answer as completely as you can. (Max {WORD_LIMIT} words)
      </p>
      {/* Question Heading */}
      <div className="bg-[#810000] text-white px-5 py-2 rounded mb-2 text-lg font-semibold tracking-wide flex items-center gap-2">
        <span>#{currentQ._id}</span>
        <span>|</span>
        <span>{currentQ.heading}</span>
      </div>
      {/* Timer */}
      <div className="mb-2 text-[#810000] font-medium text-base flex items-center gap-2">
        <svg
          width="21"
          height="21"
          fill="#810000"
          className="inline"
          viewBox="0 0 24 24"
        >
          <path d="M12 7v5l4 2M12 1a11 11 0 1 1 0 22 11 11 0 0 1 0-22Z" />
        </svg>
        <span className="font-bold text-lg">{formatTime(writingTime)}</span>
      </div>
      {/* Prompt */}
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line">
        {currentQ.prompt}
      </div>
      {/* Writing Box */}
      <div className="border border-[#810000] rounded p-0 mb-3 bg-[#faf9f9] flex flex-col items-stretch relative">
        <textarea
          className="w-full min-h-[210px] max-h-[420px] p-4 rounded text-base border-0 outline-none resize-none bg-[#faf9f9] text-gray-800 font-mono"
          placeholder="Type your answer here (Paste is disabled)..."
          value={answer}
          onChange={handleInput}
          onPaste={handlePaste}
          maxLength={WORD_LIMIT * 7} // extra limit
          disabled={writingTime === 0}
        />
        <div className="flex items-center justify-between px-4 pb-2 pt-1">
          <span className={`text-xs text-gray-500`}>
            {writingTime === 0 ? "Time's up!" : ""}
          </span>
          <span
            className={`text-xs font-semibold transition-all duration-200 ${
              wordCount > WORD_LIMIT
                ? "text-red-600"
                : wordCount > WORD_LIMIT - 40
                ? "text-orange-600"
                : "text-gray-700"
            }`}
          >
            Words: {wordCount} / {WORD_LIMIT}
          </span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex gap-3 mb-2">
        <button
          className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm"
          onClick={() => {
            setAnswer("");
            setWordCount(0);
            setWritingTime(WRITING_SECONDS);
            setWritingStarted(false);
          }}
          disabled={writingTime === 0 && !answer}
        >
          Restart
        </button>
        <button
          className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400"
          onClick={handleSubmit}
          disabled={
            !answer.trim() || wordCount > WORD_LIMIT || writingTime === 0
          }
        >
          <span>Submit</span>
        </button>
      </div>
      {renderPagination()}
      <style jsx>{`
        textarea::placeholder {
          color: #bbb;
        }
        textarea:disabled {
          background: #f5f5f5;
          color: #aaa;
        }
      `}</style>
    </div>
  );
}
