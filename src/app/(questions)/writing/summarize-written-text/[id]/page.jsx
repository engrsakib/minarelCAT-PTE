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

const WRITING_SECONDS = 599; // 9:59min
const WORD_LIMIT = 1000;

export default function RepeatSentencePage({ params }) {
  const { id } = params;
  const router = useRouter();

  // State
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);

  // Writing timer
  const [writingTime, setWritingTime] = useState(WRITING_SECONDS);
  const [writingStarted, setWritingStarted] = useState(false);
  const timerRef = useRef();

  // Answer state
  const [answer, setAnswer] = useState("");
  const [wordCount, setWordCount] = useState(0);

  // AI Score Modal state
  const [showAiScoreModal, setShowAiScoreModal] = useState(false);
  const [apiResponse, setApiResponse] = useState(null);

  // Pagination dropdown (not used but kept for future)
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Function to map API response to modal format
  const mapApiResponseToModalData = (apiData) => {
    const skillsMapping = {
      content: "Content",
      grammar: "Grammar",
      form: "Form",
      vocabularyRange: "Vocabulary Range",
    };

    const maxScores = {
      content: 3,
      grammar: 2,
      form: 2,
      vocabularyRange: 2,
    };

    const enablingSkills = Object.keys(skillsMapping).map((key) => {
      const score = apiData[key] || 0;
      const max = maxScores[key] || 2;
      const progress = (score / max) * 100;

      return {
        name: skillsMapping[key],
        score: score,
        max: max,
        progress: progress,
        color: "hsl(var(--primary))",
      };
    });

    return {
      overallScore: apiData.score || 0,
      maxScore: 15,
      enablingSkills: enablingSkills,
      userResponse: {
        text: apiData.feedback || "No feedback provided.",
        totalWords: wordCount || 0,
        time: formatTime(WRITING_SECONDS - writingTime),
        language: "English: American",
      },
      suggestions: [
        {
          title: "Detailed Feedback",
          text: apiData.feedback || "No specific suggestions provided.",
        },
      ],
      scoreDisappearDate: "28/09/2025",
    };
  };

  // Fetch question
  useEffect(() => {
    async function getQuestion() {
      setLoading(true);
      try {
        const res = await fetchWithAuth(`${baseUrl}/user/get-question/${id}`);
        const data = await res.json();
        setQuestion(data?.question || null);
      } catch {
        setQuestion(null);
      }
      setLoading(false);
      setWritingTime(WRITING_SECONDS);
      setWritingStarted(false);
      setAnswer("");
      setWordCount(0);
    }
    getQuestion();
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
    if (!answer.trim() || !question) return;

    const userSummary = answer.trim();
    const questionId = id;
    console.log(questionId, userSummary);
    try {
      const response = await fetchWithAuth(
        `${baseUrl}/test/writing/summerize-written-text/result`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userSummary,
            questionId,
          }),
        }
      );

      const responseData = await response.json();
      console.log("API Response:", responseData);

      // Store the API response
      setApiResponse(responseData);

      // Show AI Score Modal
      setShowAiScoreModal(true);
    } catch (e) {
      console.error("Submit error:", e);
      alert("Something went wrong! Try again.");
    }
  };

  // mm:ss format for timer
  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Get modal data (either from API response or fallback to mock)
  const getModalData = () => {
    if (apiResponse) {
      return mapApiResponseToModalData(apiResponse);
    }

    // Fallback mock data if no API response
    return {
      overallScore: 0,
      maxScore: 15,
      enablingSkills: [
        {
          name: "Content",
          score: 0,
          max: 3,
          progress: 0,
          color: "hsl(var(--primary))",
        },
        {
          name: "Grammar",
          score: 0,
          max: 2,
          progress: 0,
          color: "hsl(var(--primary))",
        },
        {
          name: "Form",
          score: 0,
          max: 2,
          progress: 0,
          color: "hsl(var(--primary))",
        },
        {
          name: "Vocabulary Range",
          score: 0,
          max: 2,
          progress: 0,
          color: "hsl(var(--primary))",
        },
      ],
      userResponse: {
        text: "No feedback available.",
        totalWords: wordCount || 0,
        time: formatTime(WRITING_SECONDS - writingTime),
        language: "English: American",
      },
      suggestions: [
        {
          title: "Feedback",
          text: "No feedback available at this time.",
        },
      ],
      scoreDisappearDate: "28/09/2025",
    };
  };

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        Loading...
      </div>
    );
  }

  const modalData = getModalData();

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
        <span>#{question._id}</span>
        <span>|</span>
        <span>{question.heading}</span>
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
        {question.prompt}
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
            setApiResponse(null);
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

      <style jsx>{`
        textarea::placeholder {
          color: #bbb;
        }
        textarea:disabled {
          background: #f5f5f5;
          color: #aaa;
        }
      `}</style>

      {/* Custom AI Score Modal (Full Width) */}
      {showAiScoreModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
          <div className="fixed inset-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#810000] to-[#a50000] p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 shadow-lg">
              {/* Left Section */}
              <div className="flex items-center gap-2 text-white text-base sm:text-lg font-semibold">
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>#{question._id}</span>
              </div>

              {/* Center Title */}
              <div className="text-white text-xl sm:text-2xl font-bold text-center flex flex-col sm:flex-grow sm:items-center">
                AI Score Report
                <span className="block text-sm font-normal opacity-90 mt-1">
                  alfapte.com
                </span>
              </div>

              {/* Right Icons */}
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
                <X
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setShowAiScoreModal(false)}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="h-[calc(100%-84px)] overflow-y-auto">
              <div className="p-12 space-y-12">
                {/* Score Overview */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-12">
                  {/* Overall Score */}
                  <div className="xl:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <h3 className="text-2xl font-bold text-gray-800 mb-10 text-center">
                        Overall Score
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="relative w-40 h-40 mb-6">
                          <svg
                            className="w-40 h-40 transform -rotate-90"
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
                                (modalData.overallScore / modalData.maxScore) *
                                100
                              }, 100`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-4xl font-bold text-[#810000]">
                              {modalData.overallScore}
                            </span>
                            <span className="text-base text-gray-500">
                              out of {modalData.maxScore}
                            </span>
                          </div>
                        </div>
                        <div className="text-center">
                          <p className="text-xl font-semibold text-gray-700 mb-2">
                            {modalData.overallScore >= modalData.maxScore * 0.8
                              ? "Excellent Work!"
                              : modalData.overallScore >=
                                modalData.maxScore * 0.6
                              ? "Good Job!"
                              : modalData.overallScore >=
                                modalData.maxScore * 0.4
                              ? "Keep Practicing!"
                              : "Needs Improvement"}
                          </p>
                          <p className="text-base text-gray-500">
                            {Math.round(
                              (modalData.overallScore / modalData.maxScore) *
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
                    <div className="bg-white rounded-3xl shadow-xl p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-5 px-10 rounded-2xl mb-10">
                        <h3 className="text-2xl font-bold text-center">
                          Enabling Skills Breakdown
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                        {modalData.enablingSkills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded-2xl p-8 border border-slate-200 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-6">
                              <span className="font-bold text-gray-800 text-xl">
                                {skill.name}
                              </span>
                              <span className="text-xl font-bold text-[#810000] bg-red-50 px-4 py-2 rounded-full">
                                {skill.score}/{skill.max}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={skill.progress}
                                className="h-5 bg-slate-200"
                              />
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-sm font-bold text-white drop-shadow-sm">
                                  {Math.round(skill.progress)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-6 px-10 cursor-pointer hover:from-[#950000] hover:to-[#b50000] transition-colors">
                    <h3 className="text-3xl font-bold flex items-center justify-center gap-4">
                      💡 Detailed Feedback & Suggestions
                    </h3>
                  </div>
                  <div className="p-10 bg-gradient-to-br from-slate-50 to-white">
                    {modalData.suggestions.map((suggestion, index) => (
                      <div key={index} className="mb-8 last:mb-0">
                        <div className="bg-white rounded-2xl p-8 border-l-8 border-[#810000] shadow-lg hover:shadow-xl transition-shadow">
                          <h4 className="font-bold text-[#810000] mb-4 flex items-center gap-4 text-2xl">
                            <span className="w-4 h-4 bg-[#810000] rounded-full"></span>
                            {suggestion.title}
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-lg">
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
