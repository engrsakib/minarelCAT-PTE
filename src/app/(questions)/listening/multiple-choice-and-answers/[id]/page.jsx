"use client";
import { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";


// 9:59 minutes in seconds
const RECORD_SECONDS = 599;

export default function DynamicPage({ params }) {
  const [serverResponse, setServerResponse] = useState({});

  console.log("=========Server Response============", serverResponse);

  const { id } = params;
  const router = useRouter();
  const baseURL = process.env.NEXT_PUBLIC_URL;

  // State
  const [currentQ, setCurrentQ] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //==================Modal States======================
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Timer
  const [timeLeft, setTimeLeft] = useState(RECORD_SECONDS);
  const timerRef = useRef();
  const [timerStarted, setTimerStarted] = useState(false);

  // Multi-answer selection
  const [selected, setSelected] = useState([]);

  // Pagination dropdown (not needed for single question mode)
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Fetch question (single)
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseURL}/user/get-question/${id}`);
        const data = await res.json();
        if (data?.question) {
          setCurrentQ(data.question);
          setSelected([]);
        } else {
          setCurrentQ(null);
          setSelected([]);
        }
      } catch {
        setCurrentQ(null);
        setSelected([]);
      }
      setLoading(false);
      setTimeLeft(RECORD_SECONDS);
      setTimerStarted(false);
    }
    getQuestion();
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
    setIsSubmitting(true);
    if (!currentQ || selected.length === 0) return;
    const selectedAnswers = selected.map((eachId) => currentQ.options[eachId]);
    const payload = {
      questionId: currentQ._id,
      selectedAnswers, // array of selected option texts
    };

    try {
      const response = await fetchWithAuth(
        `${baseURL}/test/listening/multiple-choice-multiple-answers/result`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      setServerResponse(await response.json());
      setIsSubmitting(true);
      setIsModalOpen(!isModalOpen);
    } catch (e) {}
  };

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

  return (
    <div className="w-full lg:max-w-[80%] mx-auto py-6 px-2 relative">
      {/* ===========================Modal Contents starts here======================== */}

      <Modal
        isModalOpen={isModalOpen}
        setIsModalOpen={() => setIsModalOpen(!isModalOpen)}
      >
        <div className="size-80 bg-white rounded-2xl flex flex-col gap-2 justify-center items-center">
          <h1 className="text-3xl font-semibold text-[#660303]">🎉 Results</h1>
          <p>
            <span className="font-bold">Score:</span>{" "}
            {serverResponse?.result?.score}
          </p>
          <p>
            <span className="font-bold">Total Correct Answer:</span>{" "}
            {serverResponse?.result?.totalCorrectAnswers}
          </p>
          <p>
            <span className="font-bold">Correct Answers Give:</span>{" "}
            {serverResponse?.result?.correctAnswersGiven.toString()}
          </p>
          <p>
            <span className="font-bold">Feedback:</span>{" "}
            {serverResponse?.feedback}
          </p>
        </div>
      </Modal>

      {/* ===========================Modal Contents starts here======================== */}

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
        {currentQ.audioUrl && <AudioPlayer src={currentQ.audioUrl} />}
        {currentQ.prompt && (
          <div className="mt-2 text-[#333] text-base">{currentQ.prompt}</div>
        )}
      </div>
      {/* MCQ Options */}
      <div className="border border-[#810000] rounded bg-white p-3 mb-2 text-[#810000] text-base font-semibold">
        {/* If you want a questionText, e.g. "Select all correct", can use here */}
        {/* {currentQ.questionText} */}
        নিচের অপশনগুলো থেকে একাধিক সঠিক উত্তরের অপশন সিলেক্ট করুন।
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
          {isSubmitting?"Submitting...":"Submit"}
        </button>
      </div>
      {/* If you want to show modal or pagination, add here if needed */}
    </div>
  );
}

//Modal Component
const Modal = ({ isModalOpen, children, setIsModalOpen }) => {
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = "auto"; // Enable scrolling again
    }

    return () => {
      document.body.style.overflow = "auto"; // Cleanup function in case modal unmounts
    };
  }, [isModalOpen]);
  return (
    <div
      onClick={setIsModalOpen}
      className={`${
        isModalOpen
          ? "h-dvh w-full fixed inset-0 z-50 bg-black/50 flex flex-col justify-center items-center"
          : "hidden"
      }`}
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        {children}
      </div>
    </div>
  );
};

// (Optional) Circular Progressbar (not used, but provided)
const CircularProgress = ({ value = 75, size = 200 }) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size}>
      <circle
        stroke="#e5e7eb"
        fill="transparent"
        strokeWidth={strokeWidth}
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        stroke="red"
        fill="transparent"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        className="transition-all duration-300"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-black text-xl font-bold"
      >
        {value}%
      </text>
    </svg>
  );
};
