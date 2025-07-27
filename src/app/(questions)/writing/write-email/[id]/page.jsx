"use client";

import { useEffect, useState, useRef } from "react";
import fetchWithAuth from "@/lib/fetchWithAuth";
import { useRouter } from "next/navigation";
import { Monitor, Share2, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const WRITING_SECONDS = 599; // 9:59min
const WORD_LIMIT = 1000;

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

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

  const baseUrl = process.env.NEXT_PUBLIC_URL || "";

  // Mock score data with progress values
  const mockScoreData = {
    overallScore: 14,
    maxScore: 15,
    enablingSkills: [
      {
        name: "Content",
        score: 3,
        max: 3,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Grammar",
        score: 2,
        max: 2,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Spelling",
        score: 2,
        max: 2,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Form",
        score: 2,
        max: 2,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Organization",
        score: 2,
        max: 2,
        progress: 100,
        color: "hsl(var(--primary))",
      },
      {
        name: "Email Convention",
        score: 1,
        max: 2,
        progress: 50,
        color: "hsl(var(--primary))",
      },
      {
        name: "Vocabulary Range",
        score: 2,
        max: 2,
        progress: 100,
        color: "hsl(var(--primary))",
      },
    ],
    userResponse: {
      text: 'The email is well written, with clear content, excellent grammar, spelling, and vocabulary. The form and organization are also well done. However, it lacks the conventional salutation at the beginning of the email. It would be better to address the manager by name, e.g., "Dear Mr./Ms. [Last Name]".',
      totalWords: 1,
      time: "00:04",
      language: "English: American",
    },
    suggestions: [
      {
        title: "Email Convention",
        text: 'The email is well written, with clear content, excellent grammar, spelling, and vocabulary. The form and organization are also well done. However, it lacks the conventional salutation at the beginning of the email. It would be better to address the manager by name, e.g., "Dear Mr./Ms. [Last Name]".',
      },
    ],
    scoreDisappearDate: "28/09/2025",
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
  }, [id, baseUrl]); // Added baseUrl to dependency array

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
      // Assuming this fetch call is successful based on the prompt's context
      // In a real application, you'd handle the response and potential errors
      await fetchWithAuth(
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
      setShowAiScoreModal(true);
    } catch (e) {
      alert("Something went wrong! Try again.");
      console.error("Submission error:", e); // Log the error for debugging
    }
  };

  if (loading || !question) {
    return (
      <div className="flex justify-center items-center min-h-[40vh] text-lg font-semibold">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full lg:w-full lg:max-w-[80%] mx-auto py-6 px-4 md:px-6 relative">
      <h1 className="text-2xl md:text-3xl font-semibold text-[#810000] border-b border-[#810000] pb-2 mb-6">
        Respond to a Situation (Writing)
      </h1>
      <p className="text-gray-700 mb-6 text-sm md:text-base">
        Read a description of a situation. You will have{" "}
        <span className="font-bold">9:59 minutes</span> to write your answer.{" "}
        <br className="sm:hidden" />
        Please answer as completely as you can. (Max {WORD_LIMIT} words)
      </p>

      {/* Question Heading */}
      <div className="bg-[#810000] text-white px-4 py-2 rounded mb-2 text-base md:text-lg font-semibold tracking-wide flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
        <span>#{question._id}</span>
        <span className="hidden sm:inline">|</span>
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
      <div className="border border-[#810000] rounded p-4 mb-4 bg-white text-gray-900 whitespace-pre-line text-sm md:text-base">
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
          maxLength={WORD_LIMIT * 7} // A rough estimate, actual max length depends on average word length
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
          className="flex items-center gap-1 px-4 py-1 rounded border border-gray-300 text-gray-600 hover:bg-gray-100 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
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
          className="flex items-center gap-1 px-4 py-1 rounded bg-[#810000] text-white font-medium text-sm hover:bg-[#5d0000] disabled:bg-gray-300 disabled:text-gray-400 disabled:cursor-not-allowed"
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
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 md:p-8">
          <div className="relative w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl shadow-2xl overflow-hidden flex flex-col  max-h-[95vh]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#810000] to-[#a50000] p-4 sm:p-6 flex flex-row items-center justify-between shadow-lg flex-shrink-0">
              <div className="flex items-center gap-2 sm:gap-3 text-white text-base sm:text-lg font-semibold">
                <Monitor className="w-5 h-5 sm:w-6 sm:h-6" />
                <span>#7000475</span>
              </div>
              <div className="text-white text-lg sm:text-2xl font-bold flex-grow text-center">
                AI Score Report
                <span className="block text-xs sm:text-sm font-normal opacity-90 mt-1">
                  alfapte.com
                </span>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <Share2 className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform" />
                <X
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setShowAiScoreModal(false)}
                />
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-grow overflow-y-auto">
              <div className="p-6 sm:p-8 md:p-12 space-y-8 sm:space-y-12">
                {/* Score Overview */}
                <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 sm:gap-12">
                  {/* Overall Score */}
                  <div className="xl:col-span-1">
                    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-8 sm:mb-10 text-center">
                        Overall Score
                      </h3>
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mb-4 sm:mb-6">
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
                            Excellent Work!
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
                    <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 md:p-10 border border-slate-200 hover:shadow-2xl transition-shadow">
                      <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-4 px-6 sm:py-5 sm:px-10 rounded-2xl mb-8 sm:mb-10">
                        <h3 className="text-xl sm:text-2xl font-bold text-center">
                          Enabling Skills Breakdown
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 sm:gap-8">
                        {mockScoreData.enablingSkills.map((skill, index) => (
                          <div
                            key={index}
                            className="bg-slate-50 rounded-2xl p-6 sm:p-8 border border-slate-200 hover:shadow-lg transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-4 sm:mb-6">
                              <span className="font-bold text-gray-800 text-lg sm:text-xl">
                                {skill.name}
                              </span>
                              <span className="text-lg sm:text-xl font-bold text-[#810000] bg-red-50 px-3 py-1 sm:px-4 sm:py-2 rounded-full">
                                {skill.score}/{skill.max}
                              </span>
                            </div>
                            <div className="relative">
                              <Progress
                                value={skill.progress}
                                className="h-4 sm:h-5 bg-slate-200"
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
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-5 px-6 sm:py-6 sm:px-10">
                    <h3 className="text-2xl sm:text-3xl font-bold">
                      Your Response Analysis
                    </h3>
                  </div>

                  <div className="p-6 sm:p-8 md:p-10 space-y-6 sm:space-y-8">
                    <div className="bg-slate-50 rounded-2xl p-6 sm:p-8 border-l-4 sm:border-l-8 border-[#810000]">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-line text-base sm:text-lg md:text-xl">
                        {mockScoreData.userResponse.text}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-8 sm:mt-10">
                      <div className="bg-blue-50 rounded-2xl p-6 sm:p-8 text-center border border-blue-200 hover:shadow-xl transition-shadow">
                        <p className="text-sm sm:text-base text-blue-600 font-bold uppercase tracking-wider mb-2 sm:mb-3">
                          Total Words
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-blue-800">
                          {mockScoreData.userResponse.totalWords}
                        </p>
                      </div>
                      <div className="bg-green-50 rounded-2xl p-6 sm:p-8 text-center border border-green-200 hover:shadow-xl transition-shadow">
                        <p className="text-sm sm:text-base text-green-600 font-bold uppercase tracking-wider mb-2 sm:mb-3">
                          Time Taken
                        </p>
                        <p className="text-2xl sm:text-3xl font-bold text-green-800">
                          {mockScoreData.userResponse.time}
                        </p>
                      </div>
                      <div className="bg-purple-50 rounded-2xl p-6 sm:p-8 text-center border border-purple-200 hover:shadow-xl transition-shadow">
                        <p className="text-sm sm:text-base text-purple-600 font-bold uppercase tracking-wider mb-2 sm:mb-3">
                          Language
                        </p>
                        <p className="text-lg sm:text-xl font-bold text-purple-800">
                          {mockScoreData.userResponse.language}
                        </p>
                      </div>
                    </div>

                    <p className="text-center text-sm sm:text-base text-gray-600 mt-6 sm:mt-8 bg-yellow-50 py-3 px-6 sm:py-4 sm:px-8 rounded-2xl border border-yellow-200">
                      ⏰ This score will expire on{" "}
                      <span className="font-bold">
                        {mockScoreData.scoreDisappearDate}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Suggestions Section */}
                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-200">
                  <div className="bg-gradient-to-r from-[#810000] to-[#a50000] text-white py-5 px-6 sm:py-6 sm:px-10 cursor-pointer hover:from-[#950000] hover:to-[#b50000] transition-colors">
                    <h3 className="text-2xl sm:text-3xl font-bold flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-center">
                      💡 Detailed Feedback & Suggestions
                    </h3>
                  </div>
                  <div className="p-6 sm:p-8 md:p-10 bg-gradient-to-br from-slate-50 to-white">
                    {mockScoreData.suggestions.map((suggestion, index) => (
                      <div key={index} className="mb-6 last:mb-0">
                        <div className="bg-white rounded-2xl p-6 sm:p-8 border-l-4 sm:border-l-8 border-[#810000] shadow-lg hover:shadow-xl transition-shadow">
                          <h4 className="font-bold text-[#810000] mb-3 sm:mb-4 flex items-center gap-2 sm:gap-4 text-xl sm:text-2xl">
                            <span className="w-3 h-3 sm:w-4 sm:h-4 bg-[#810000] rounded-full flex-shrink-0"></span>
                            {suggestion.title}
                          </h4>
                          <p className="text-gray-700 leading-relaxed text-base sm:text-lg">
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
