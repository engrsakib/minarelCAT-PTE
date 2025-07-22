"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
          if (data.questions && Array.isArray(data.questions) && data.questions.length) {
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
        setAnswers(
          Array(questionObj?.blanks?.length || 0).fill("")
        );
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
      await fetchWithAuth("/test/reading-writing-blanks/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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
    router.push(`/question/reading-writing-blanks/${questions[idx]._id}`);
  };

  // Render pagination (bottom right, sticky dropdown)
  const renderPagination = () => (
    <div className="flex items-center justify-end gap-2 mt-6">
      <button
        aria-label="Prev"
        onClick={() => goToIndex(currentIdx - 1)}
        disabled={currentIdx === 0}
        className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <div className="flex items-center gap-2">
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white">
          {String(currentIdx + 1).padStart(3, "0")}
        </span>
        <span className="text-gray-500 font-medium">/</span>
        <span className="rounded border border-[#810000] px-3 py-1 font-bold text-[#810000] bg-white">
          {String(questions.length).padStart(3, "0")}
        </span>
      </div>
      <button
        aria-label="Next"
        onClick={() => goToIndex(currentIdx + 1)}
        disabled={currentIdx === questions.length - 1}
        className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
      >
        <ChevronRight className="w-6 h-6" />
      </button>
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
      <div className="flex justify-center items-center min-h-[40vh]">
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
  let blankCount = 0;

  // Support both ___ and (a)/(b) style (optional, fallback to ___)
  if (prompt.match(/\([a-e]\)/g)) {
    regex = /\([a-e]\)/g;
  }

  while ((match = regex.exec(prompt))) {
    splitParts.push(prompt.slice(cursor, match.index));
    blankCount++;
    cursor = match.index + match[0].length;
  }
  splitParts.push(prompt.slice(cursor));

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      <div className="text-2xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Reading & Writing Blanks
      </div>
      <p className="text-gray-700 mb-6">
        Below is a text with blanks. Click on each blank, a list of choices will
        appear. Select the appropriate answer choice for each blank.
      </p>
      {/* Question Heading */}
      <div className="flex items-center gap-2 mb-4">
        <span className="rounded px-4 py-2 font-bold text-white bg-[#810000] text-base tracking-wide">
          #{currentQ._id}
        </span>
        <span className="text-lg font-semibold text-[#810000]">
          {currentQ.heading ? currentQ.heading : ""}
        </span>
      </div>
      {/* Timer */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-[#810000] font-medium text-base">
          Remaining Time:{" "}
          <span className="font-bold">00: {formatTime(timeLeft)} sec</span>
        </span>
      </div>
      {/* Prompt with answer dropdowns */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {splitParts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < blanks.length && (
              <span className="inline-block align-middle mx-1">
                <span className="font-bold text-[#810000] mr-1">
                  {/* For (a)/(b) style, show (a), else show (i) */}
                  {(prompt.match(/\([a-e]\)/g) && prompt.match(/\([a-e]\)/g)[i]) ||
                    `(${String.fromCharCode(97 + i)})`}
                </span>
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Answer options below */}
      <div className="w-full flex flex-col md:flex-row gap-2 mb-4">
        {blanks.map((blank, i) => (
          <div key={i} className="flex-1">
            <select
              value={answers[i] || ""}
              onChange={handleAnswerChange(i)}
              className="w-full border border-[#810000] bg-white rounded px-2 py-2 text-[#810000] font-semibold focus:outline-none focus:ring-2 focus:ring-[#810000] appearance-none mb-1"
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
              )})Select answer`}</option>
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
      <div className="flex gap-3 mb-2 mt-3">
        <button
          className="flex items-center gap-1 px-6 py-2 rounded border border-gray-400 text-gray-700 hover:bg-gray-100 font-medium text-base"
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
          className="flex items-center gap-1 px-6 py-2 rounded border-2 border-[#810000] bg-white text-[#810000] font-semibold text-base hover:bg-[#810000] hover:text-white transition"
          onClick={handleSubmit}
          disabled={answers.some((a) => !a) || timeLeft === 0}
        >
          Submit
        </button>
      </div>
      {renderPagination()}
      <style jsx>{`
        select:disabled {
          background: #eee;
          color: #bbb;
        }
      `}</style>
    </div>
  );
}