"use client";
import React, { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react";
import AudioPlayer from "../../../../../components/audio/AudioPlayer";

// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

// Fake questions fallback (1-100 for pagination)
const FAKE_QUESTIONS = Array.from({ length: 100 }, (_, i) => ({
  _id: String(1001635 + i),
  type: "reading_writing_blanks",
  heading: i === 0 ? "Driving Licenses in BC" : `Fake Heading ${i + 1}`,
  audio: `https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3`,
  prompt:
    i === 0
      ? `But as I was saying, Professor Wilmot ...
Look, can please call me Lisa.

Yeah, Lisa, well I'm still trying to get my head around the choice of (a) ____________ for the optional part of the third-year program. I was thinking of taking personal taxation law and company law, together with the extra five-credit-point course on goods and services and VAT type taxes, but it is the (b) ____________ that I'm going to discipline myself to study in the course.

Lisa: Well, hmmm.

Did you know there are going to be (c) ____________ for summer clerkship training, so I really don't want to come across as too focused on certain areas, but a lot of firms don't even do this. You know, a position in a (d) ____________.

Lisa: Well, don't forget, you're only about 25% of the courses at this stage is elective-based and you'll still have that core of subjects - you, legal institutions, (e) ____________ property law, general commercial and factors law, all of which would be of interest to a lot of firms. So if I were you, which I'm not, I'd stay put with what you're thinking on and enjoy the chance to complete some work in areas that will be, to pursue. Don't you think? There's an awful lot of law in this profession where you'll be undertaking long, stressful hours on projects that don't really interest you as much.`
      : `Fake prompt for question #${i + 1}`,
  options: [
    [
      "Taxation Law",
      "Company Law",
      "Intellectual Property",
      "Constitutional Law",
    ],
    ["Discipline", "Subject", "Area", "Course"],
    ["Vacancies", "Positions", "Options", "Offers"],
    ["Firm", "Chamber", "Practice", "Institution"],
    ["Intellectual", "Corporate", "Family", "International"],
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

  // Dropdown answers
  const [answers, setAnswers] = useState([]);

  // Pagination dropdown
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch all questions and find current index
  useEffect(() => {
    async function getQuestions() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`/test/reading-writing-blanks`);
        const data = await res.json();
        const arr =
          data?.questions && data.questions.length
            ? data.questions
            : FAKE_QUESTIONS;
        setQuestions(arr);
        const idx = arr.findIndex((q) => q._id === id);
        setCurrentIdx(idx !== -1 ? idx : 0);
        setCurrentQ(arr[idx !== -1 ? idx : 0]);
        setAnswers(
          Array(arr[idx !== -1 ? idx : 0]?.options?.length || 0).fill("")
        );
      } catch {
        setQuestions(FAKE_QUESTIONS);
        setCurrentIdx(0);
        setCurrentQ(FAKE_QUESTIONS[0]);
        setAnswers(Array(FAKE_QUESTIONS[0]?.options?.length || 0).fill(""));
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

  // Pagination controls (sticky bottom right)
  const goToIndex = (idx) => {
    if (idx < 0 || idx >= questions.length) return;
    router.push(`/question/reading-writing-blanks/${questions[idx]._id}`);
    setDropdownOpen(false);
  };

  // Render pagination (bottom right, sticky dropdown)
  const renderPagination = () => (
    <div className="pagination-sticky">
      <div className="flex items-center gap-2">
        <button
          aria-label="Prev"
          onClick={() => goToIndex(currentIdx - 1)}
          disabled={currentIdx === 0}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative">
          <button
            className="rounded border border-[#810000] bg-white px-4 py-2 shadow text-[#810000] font-bold flex items-center gap-2"
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
            <div className="absolute left-0 bottom-12 w-44 max-h-64 overflow-y-auto bg-white border border-gray-200 rounded shadow-lg z-50 dropdown-scroll">
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
        <button
          aria-label="Next"
          onClick={() => goToIndex(currentIdx + 1)}
          disabled={currentIdx === questions.length - 1}
          className={`rounded-full border bg-white px-2 py-1 shadow text-[#810000] font-bold text-lg disabled:opacity-40`}
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
      <style jsx>{`
        .pagination-sticky {
          position: fixed;
          right: 2.5rem;
          bottom: 2.5rem;
          z-index: 50;
          background: transparent;
        }
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
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  // Prompt split for blanks (find indices for (a)...(e))
  const prompt = currentQ.prompt;
  const options = currentQ.options || [];
  let blanks = [];
  let splitParts = [];
  let cursor = 0;
  let regex = /\([a-e]\)/g;
  let match;
  while ((match = regex.exec(prompt))) {
    splitParts.push(prompt.slice(cursor, match.index));
    blanks.push(match[0]);
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
      {/* Audio Player */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        <AudioPlayer src={currentQ.audio} />
      </div>
      {/* Prompt with answer dropdowns */}
      <div className="border border-[#810000] rounded bg-[#faf9f9] p-5 mb-4 text-gray-900 text-base whitespace-pre-line">
        {splitParts.map((part, i) => (
          <React.Fragment key={i}>
            {part}
            {i < blanks.length && (
              <span className="inline-block align-middle mx-1">
                <span className="font-bold text-[#810000] mr-1">
                  {blanks[i]}
                </span>
                {/* nothing here, options below */}
              </span>
            )}
          </React.Fragment>
        ))}
      </div>
      {/* Answer options below */}
      <div className="w-full flex flex-col md:flex-row gap-2 mb-4">
        {options.map((opts, i) => (
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
              {opts.map((opt, j) => (
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
            setAnswers(Array(currentQ.options?.length || 0).fill(""));
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
    </div>
  );
}