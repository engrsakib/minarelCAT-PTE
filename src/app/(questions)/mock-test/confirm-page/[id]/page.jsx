"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  Volume2,
  Clock,
  Target,
  BookOpen,
  Mic,
  Headphones,
  Play,
  Pause,
  PenTool,
  FileText,
  List,
  RotateCcw,
  Send
} from "lucide-react";
import MicRecorder from "mic-recorder-to-mp3";
import fetchWithAuth from "@/lib/fetchWithAuth";

const RECORD_SECONDS = 35;

// Read Aloud Component
const ReadAloudComponent = ({ question, onAnswer }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const timerRef = useRef();

  useEffect(() => {
    if (!isRecording) return;
    if (recordingTime === 0) {
      stopRecording();
      return;
    }
    timerRef.current = setTimeout(() => setRecordingTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, recordingTime]);

  const startRecording = () => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
        setRecordingTime(RECORD_SECONDS);
      })
      .catch((e) => console.error("Recording failed:", e));
  };

  const stopRecording = () => {
    if (!recorder.current) return;
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        setAudioBlob(blob);
        setMp3URL(URL.createObjectURL(blob));
        setIsRecording(false);
        onAnswer(blob);
      })
      .catch((e) => console.error("Stopping recording failed:", e));
  };

  const restart = () => {
    setAudioBlob(null);
    setMp3URL(null);
    setRecordingTime(RECORD_SECONDS);
    setIsRecording(false);
    onAnswer(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <BookOpen className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Read Aloud
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
      </div>
      
      {/* Timer */}
      <div className="mb-4 flex items-center gap-3">
        <span className="text-blue-600 font-medium text-base">
          {isRecording ? "Recording:" : "Time left:"}
          <span className="font-bold ml-1">{recordingTime} sec</span>
        </span>
        {isRecording && (
          <div className="flex items-center gap-2 text-red-600">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">REC</span>
          </div>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex items-center w-full gap-2 mb-4">
        <span className="text-xs text-gray-600">
          {new Date((RECORD_SECONDS - recordingTime) * 1000)
            .toISOString()
            .substr(14, 5)}
        </span>
        <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden relative">
          <div
            className="h-2 rounded bg-blue-600 transition-all duration-200"
            style={{
              width: `${
                ((RECORD_SECONDS - recordingTime) / RECORD_SECONDS) * 100
              }%`,
            }}
          />
        </div>
        <span className="text-xs text-gray-600">
          {new Date(RECORD_SECONDS * 1000).toISOString().substr(14, 5)}
        </span>
      </div>

      {/* Audio Preview */}
      {mp3URL && (
        <div className="mb-4">
          <audio controls className="w-full max-w-xs">
            <source src={mp3URL} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
      
      {/* Controls */}
      <div className="flex items-center gap-4">
        <button
          onClick={startRecording}
          disabled={isRecording || recordingTime === 0}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            isRecording || recordingTime === 0
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Mic className="mr-2 h-4 w-4" />
          Start Recording
        </button>
        
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            !isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Stop Recording
        </button>

        <button
          onClick={restart}
          disabled={isRecording}
          className="flex items-center px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md font-medium disabled:bg-gray-300 disabled:text-gray-500"
        >
          <RotateCcw className="mr-2 h-4 w-4" />
          Restart
        </button>
      </div>
    </div>
  );
};

// Repeat Sentence Component
const RepeatSentenceComponent = ({ question, onAnswer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startRecording = () => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
      })
      .catch((e) => console.error("Recording failed:", e));
  };

  const stopRecording = () => {
    if (!recorder.current) return;
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        setAudioBlob(blob);
        setMp3URL(URL.createObjectURL(blob));
        setIsRecording(false);
        onAnswer(blob);
      })
      .catch((e) => console.error("Stopping recording failed:", e));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Volume2 className="text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Repeat Sentence
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Audio Player */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={toggleAudio}
            className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </button>
          <span className="text-gray-600">Listen and repeat</span>
        </div>
        
        <audio
          ref={audioRef}
          src={question.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
        />
        
        {question.audioConvertedText && (
          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <p className="text-sm text-gray-600 font-medium">Audio Text:</p>
            <p className="text-sm text-gray-700 mt-1">{question.audioConvertedText}</p>
          </div>
        )}
      </div>
      
      {/* Recording Section */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Mic className="mr-2 h-4 w-4" />
          Start Recording
        </button>
        
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            !isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Stop Recording
        </button>
        
        {isRecording && (
          <div className="flex items-center text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
            Recording your response...
          </div>
        )}
      </div>

      {/* Audio Preview */}
      {mp3URL && (
        <div className="mb-4">
          <audio controls className="w-full max-w-xs">
            <source src={mp3URL} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

// Respond to Situation Component
const RespondToSituationComponent = ({ question, onAnswer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startRecording = () => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
      })
      .catch((e) => console.error("Recording failed:", e));
  };

  const stopRecording = () => {
    if (!recorder.current) return;
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        setAudioBlob(blob);
        setMp3URL(URL.createObjectURL(blob));
        setIsRecording(false);
        onAnswer(blob);
      })
      .catch((e) => console.error("Stopping recording failed:", e));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Volume2 className="text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Respond to Situation
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Audio Player */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={toggleAudio}
            className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </button>
          <span className="text-gray-600">Listen to the situation</span>
        </div>
        
        <audio
          ref={audioRef}
          src={question.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
        />
        
        {question.prompt && (
          <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-400">
            <p className="text-sm text-gray-600">Situation: {question.prompt}</p>
          </div>
        )}
      </div>
      
      {/* Recording Section */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Mic className="mr-2 h-4 w-4" />
          Record Response
        </button>
        
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            !isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Stop Recording
        </button>
        
        {isRecording && (
          <div className="flex items-center text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
            Recording your response...
          </div>
        )}
      </div>

      {/* Audio Preview */}
      {mp3URL && (
        <div className="mb-4">
          <audio controls className="w-full max-w-xs">
            <source src={mp3URL} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

// Answer Short Question Component
const AnswerShortQuestionComponent = ({ question, onAnswer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const audioRef = useRef(null);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const startRecording = () => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
      })
      .catch((e) => console.error("Recording failed:", e));
  };

  const stopRecording = () => {
    if (!recorder.current) return;
    recorder.current
      .stop()
      .getMp3()
      .then(([buffer, blob]) => {
        setAudioBlob(blob);
        setMp3URL(URL.createObjectURL(blob));
        setIsRecording(false);
        onAnswer(blob);
      })
      .catch((e) => console.error("Stopping recording failed:", e));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Target className="text-orange-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Answer Short Question
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Audio Player */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={toggleAudio}
            className="flex items-center px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause Question' : 'Play Question'}
          </button>
          <span className="text-gray-600">Listen and answer briefly</span>
        </div>
        
        <audio
          ref={audioRef}
          src={question.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
        />
      </div>
      
      {/* Recording Section */}
      <div className="flex items-center gap-4 mb-4">
        <button
          onClick={startRecording}
          disabled={isRecording}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          <Mic className="mr-2 h-4 w-4" />
          Record Answer
        </button>
        
        <button
          onClick={stopRecording}
          disabled={!isRecording}
          className={`flex items-center px-4 py-2 rounded-md font-medium ${
            !isRecording
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          Stop Recording
        </button>
        
        {isRecording && (
          <div className="flex items-center text-red-600">
            <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse mr-2"></div>
            Recording your answer...
          </div>
        )}
      </div>

      {/* Audio Preview */}
      {mp3URL && (
        <div className="mb-4">
          <audio controls className="w-full max-w-xs">
            <source src={mp3URL} type="audio/mp3" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}
    </div>
  );
};

// Summarize Spoken Text Component (Listening)
const SummarizeSpokenTextComponent = ({ question, onAnswer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [summary, setSummary] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    onAnswer(summary);
  }, [summary, onAnswer]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Headphones className="text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Summarize Spoken Text
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Audio Player */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={toggleAudio}
            className="flex items-center px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md"
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </button>
          <span className="text-gray-600">Listen and summarize</span>
        </div>
        
        <audio
          ref={audioRef}
          src={question.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
        />
        
        {question.audioConvertedText && (
          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
            <p className="text-sm text-gray-600 font-medium">Audio Content:</p>
            <p className="text-sm text-gray-700 mt-1">{question.audioConvertedText}</p>
          </div>
        )}
      </div>
      
      {/* Summary Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write your summary (5-75 words):
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          rows="4"
          placeholder="Summarize the main points from the audio..."
        />
        <div className="mt-2 text-sm text-gray-500">
          Word count: {summary.trim().split(/\s+/).filter(word => word.length > 0).length}
        </div>
      </div>
    </div>
  );
};

// Summarize Written Text Component (Writing)
const SummarizeWrittenTextComponent = ({ question, onAnswer }) => {
  const [summary, setSummary] = useState('');

  useEffect(() => {
    onAnswer(summary);
  }, [summary, onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <PenTool className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Summarize Written Text
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Text to Summarize */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
      </div>
      
      {/* Summary Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write your summary (5-75 words):
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows="4"
          placeholder="Summarize the main points from the text..."
        />
        <div className="mt-2 text-sm text-gray-500">
          Word count: {summary.trim().split(/\s+/).filter(word => word.length > 0).length}
        </div>
      </div>
    </div>
  );
};

// Write Email Component
const WriteEmailComponent = ({ question, onAnswer }) => {
  const [email, setEmail] = useState('');

  useEffect(() => {
    onAnswer(email);
  }, [email, onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Send className="text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Write Email
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Email Prompt */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
      </div>
      
      {/* Email Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Write your email:
        </label>
        <textarea
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
          rows="8"
          placeholder="Write your email here..."
        />
        <div className="mt-2 text-sm text-gray-500">
          Word count: {email.trim().split(/\s+/).filter(word => word.length > 0).length}
        </div>
      </div>
    </div>
  );
};

// Reading Fill in the Blanks Component
const RWFillInTheBlanksComponent = ({ question, onAnswer }) => {
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    onAnswer(answers);
  }, [answers, onAnswer]);

  const handleAnswerChange = (blankIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [blankIndex]: value
    }));
  };

  const renderPromptWithBlanks = () => {
    let text = question.prompt;
    const blanks = question.blanks || [];
    
    blanks.forEach((blank, index) => {
      const placeholder = `(${String.fromCharCode(97 + blank.index)})`;
      const dropdown = (
        <select
          key={index}
          value={answers[blank.index] || ''}
          onChange={(e) => handleAnswerChange(blank.index, e.target.value)}
          className="mx-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select...</option>
          {blank.options.map((option, optIndex) => (
            <option key={optIndex} value={option}>{option}</option>
          ))}
        </select>
      );
      
      text = text.replace(placeholder, `<BLANK_${index}>`);
    });

    const parts = text.split(/<BLANK_\d+>/);
    const result = [];
    
    parts.forEach((part, index) => {
      result.push(<span key={`text-${index}`}>{part}</span>);
      if (index < blanks.length) {
        result.push(
          <select
            key={`blank-${index}`}
            value={answers[blanks[index].index] || ''}
            onChange={(e) => handleAnswerChange(blanks[index].index, e.target.value)}
            className="mx-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select...</option>
            {blanks[index].options.map((option, optIndex) => (
              <option key={optIndex} value={option}>{option}</option>
            ))}
          </select>
        );
      }
    });

    return result;
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <FileText className="text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Reading & Writing Fill in the Blanks
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="text-gray-700 leading-relaxed">
          {renderPromptWithBlanks()}
        </div>
      </div>
    </div>
  );
};

// Multiple Choice Multiple Answers Component
const MCQMultipleComponent = ({ question, onAnswer }) => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  useEffect(() => {
    onAnswer(selectedAnswers);
  }, [selectedAnswers, onAnswer]);

  const handleAnswerChange = (option) => {
    setSelectedAnswers(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <List className="text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Multiple Choice (Multiple Answers)
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
        {question.text && (
          <p className="text-gray-700 leading-relaxed mt-2 font-medium">{question.text}</p>
        )}
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedAnswers.includes(option)}
              onChange={() => handleAnswerChange(option)}
              className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Multiple Choice Single Answer Component
const MCQSingleComponent = ({ question, onAnswer }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');

  useEffect(() => {
    onAnswer(selectedAnswer);
  }, [selectedAnswer, onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Target className="text-blue-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Multiple Choice (Single Answer)
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
        {question.text && (
          <p className="text-gray-700 leading-relaxed mt-2 font-medium">{question.text}</p>
        )}
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name={`question-${question._id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => setSelectedAnswer(e.target.value)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Reorder Paragraphs Component
const ReorderParagraphsComponent = ({ question, onAnswer }) => {
  const [orderedOptions, setOrderedOptions] = useState(question.options || []);

  useEffect(() => {
    onAnswer(orderedOptions);
  }, [orderedOptions, onAnswer]);

  const moveItem = (fromIndex, toIndex) => {
    const newOptions = [...orderedOptions];
    const [movedItem] = newOptions.splice(fromIndex, 1);
    newOptions.splice(toIndex, 0, movedItem);
    setOrderedOptions(newOptions);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <List className="text-purple-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Reorder Paragraphs
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
      </div>
      
      <div className="space-y-3">
        {orderedOptions.map((option, index) => (
          <div key={index} className="bg-white border border-gray-300 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700 flex-1">{option}</span>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => moveItem(index, Math.max(0, index - 1))}
                  disabled={index === 0}
                  className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 text-sm"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(index, Math.min(orderedOptions.length - 1, index + 1))}
                  disabled={index === orderedOptions.length - 1}
                  className="px-2 py-1 bg-blue-500 text-white rounded disabled:bg-gray-300 text-sm"
                >
                  ↓
                </button>
              </div>
            </div>
            <div className="text-sm text-gray-500 mt-2">Position: {index + 1}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Listening Fill in the Blanks Component
const ListeningFillInTheBlanksComponent = ({ question, onAnswer }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState({});
  const audioRef = useRef(null);

  useEffect(() => {
    onAnswer(answers);
  }, [answers, onAnswer]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnswerChange = (blankIndex, value) => {
    setAnswers(prev => ({
      ...prev,
      [blankIndex]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Headphones className="text-indigo-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Listening Fill in the Blanks
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Audio Player */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={toggleAudio}
            className="flex items-center px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md"
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </button>
          <span className="text-gray-600">Listen and fill in the blanks</span>
        </div>
        
        <audio
          ref={audioRef}
          src={question.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed mb-4">{question.prompt}</p>
        
        <div className="space-y-4">
          {question.blanks?.map((blank, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="text-gray-700">Blank {blank.index + 1}:</span>
              {blank.options && blank.options.length > 0 ? (
                <select
                  value={answers[blank.index] || ''}
                  onChange={(e) => handleAnswerChange(blank.index, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Select...</option>
                  {blank.options.map((option, optIndex) => (
                    <option key={optIndex} value={option}>{option}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={answers[blank.index] || ''}
                  onChange={(e) => handleAnswerChange(blank.index, e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500"
                  placeholder="Type your answer..."
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Listening Multiple Choice Components (Single and Multiple)
const ListeningMCQComponent = ({ question, onAnswer, isMultiple = false }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState(isMultiple ? [] : '');
  const audioRef = useRef(null);

  useEffect(() => {
    onAnswer(selectedAnswers);
  }, [selectedAnswers, onAnswer]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnswerChange = (option) => {
    if (isMultiple) {
      setSelectedAnswers(prev => {
        if (prev.includes(option)) {
          return prev.filter(item => item !== option);
        } else {
          return [...prev, option];
        }
      });
    } else {
      setSelectedAnswers(option);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Headphones className="text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-800">
          Question {question.questionNumber}: Listening Multiple Choice {isMultiple ? '(Multiple Answers)' : '(Single Answer)'}
        </h3>
      </div>
      
      <h4 className="text-md font-medium text-gray-700 mb-3">{question.heading}</h4>
      
      {/* Audio Player */}
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <div className="flex items-center gap-4 mb-3">
          <button
            onClick={toggleAudio}
            className="flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
          >
            {isPlaying ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
            {isPlaying ? 'Pause Audio' : 'Play Audio'}
          </button>
          <span className="text-gray-600">Listen and choose {isMultiple ? 'all correct answers' : 'the correct answer'}</span>
        </div>
        
        <audio
          ref={audioRef}
          src={question.audioUrl}
          onEnded={() => setIsPlaying(false)}
          className="w-full"
          controls
        />
      </div>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <p className="text-gray-700 leading-relaxed">{question.prompt}</p>
      </div>
      
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type={isMultiple ? "checkbox" : "radio"}
              name={isMultiple ? undefined : `question-${question._id}`}
              value={option}
              checked={isMultiple ? selectedAnswers.includes(option) : selectedAnswers === option}
              onChange={() => handleAnswerChange(option)}
              className={`mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 ${isMultiple ? 'rounded' : ''}`}
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Main Question Renderer
const QuestionRenderer = ({ question, questionIndex, onAnswer }) => {
  const { type, subtype } = question;
  
  switch (subtype) {
    case 'read_aloud':
      return <ReadAloudComponent question={question} onAnswer={onAnswer} />;
    
    case 'repeat_sentence':
      return <RepeatSentenceComponent question={question} onAnswer={onAnswer} />;
    
    case 'respond_to_situation':
      return <RespondToSituationComponent question={question} onAnswer={onAnswer} />;
    
    case 'answer_short_question':
      return <AnswerShortQuestionComponent question={question} onAnswer={onAnswer} />;
    
    case 'summarize_spoken_text':
      return <SummarizeSpokenTextComponent question={question} onAnswer={onAnswer} />;
    
    case 'summarize_written_text':
      return <SummarizeWrittenTextComponent question={question} onAnswer={onAnswer} />;
    
    case 'write_email':
      return <WriteEmailComponent question={question} onAnswer={onAnswer} />;
    
    case 'rw_fill_in_the_blanks':
      return <RWFillInTheBlanksComponent question={question} onAnswer={onAnswer} />;
    
    case 'mcq_multiple':
      return <MCQMultipleComponent question={question} onAnswer={onAnswer} />;
    
    case 'mcq_single':
      return <MCQSingleComponent question={question} onAnswer={onAnswer} />;
    
    case 'reorder_paragraphs':
      return <ReorderParagraphsComponent question={question} onAnswer={onAnswer} />;
    
    case 'listening_fill_in_the_blanks':
      return <ListeningFillInTheBlanksComponent question={question} onAnswer={onAnswer} />;
    
    case 'listening_multiple_choice_multiple_answers':
      return <ListeningMCQComponent question={question} onAnswer={onAnswer} isMultiple={true} />;
    
    case 'listening_multiple_choice_single_answers':
      return <ListeningMCQComponent question={question} onAnswer={onAnswer} isMultiple={false} />;
    
    default:
      return (
        <div className="bg-gray-100 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-600">
            Unknown Question Type: {subtype}
          </h3>
          <p className="text-gray-500 mt-2">
            Component for this question type is not implemented yet.
          </p>
        </div>
      );
  }
};

// Result Modal Component
const ResultModal = ({ isOpen, onClose, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200 overflow-hidden">
        <div className="bg-green-600 p-4 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Test Completed!</h3>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="text-center">
            <div className="text-green-600 text-xl font-bold mb-2">
              Test Results
            </div>
            <p className="text-gray-600 mb-4">
              Your test has been submitted successfully!
            </p>
            
            {result && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Dynamic Mock Test Component
export default function DynamicMockTest({ params }) {
  const { id: mockTestId } = params;
//   console.log(mockTestId)
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";


  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState(null);

    console.log(testData)

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true);
      try {
        const response = await fetchWithAuth(`${baseUrl}/full-mock-test/get/${mockTestId}`);
        const data = await response.json();
        setTestData(data);
      } catch (error) {
        console.error("Failed to fetch test data:", error);
      }
      setLoading(false);
    };

    if (mockTestId) {
      fetchTestData();
    }
  }, [mockTestId, baseUrl]);

  // Handle answer changes
  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  // Submit individual answer
  const submitAnswer = async (questionId, answer) => {
    try {
      const formData = new FormData();
      
      if (answer instanceof Blob) {
        // For audio files
        formData.append("voice", answer, "voice.mp3");
        formData.append("questionId", questionId);
      } else {
        // For text answers
        const response = await fetchWithAuth(`${baseUrl}/test/submit-answer`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId,
            answer
          })
        });
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  };

  // Navigate to next question
  const nextQuestion = async () => {
    const currentQuestion = testData.questions[currentQuestionIndex];
    const currentAnswer = answers[currentQuestion._id];
    
    if (currentAnswer) {
      await submitAnswer(currentQuestion._id, currentAnswer);
    }
    
    if (currentQuestionIndex < testData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Submit test
      await submitTest();
    }
  };

  // Navigate to previous question
  const prevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  // Submit entire test
  const submitTest = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`${baseUrl}/full-mock-test/get-mock-test-result/${mockTestId}`);
      const result = await response.json();
      setTestResult(result);
      setShowResultModal(true);
    } catch (error) {
      console.error("Failed to submit test:", error);
    }
    setIsSubmitting(false);
  };

  if (loading || !testData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const currentQuestion = testData.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testData.questions.length - 1;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{testData.name}</h1>
              <div className="flex items-center mt-1 text-gray-600">
                <Clock className="h-4 w-4 mr-1" />
                <span>Duration: {testData.duration.hours}h {testData.duration.minutes}m</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {testData.questions.length}
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <QuestionRenderer 
          question={currentQuestion} 
          questionIndex={currentQuestionIndex}
          onAnswer={(answer) => handleAnswerChange(currentQuestion._id, answer)}
        />
        
        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={prevQuestion}
            disabled={currentQuestionIndex === 0}
            className={`px-6 py-2 rounded-md font-medium ${
              currentQuestionIndex === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gray-600 hover:bg-gray-700 text-white'
            }`}
          >
            Previous
          </button>
          
          <button
            onClick={nextQuestion}
            disabled={isSubmitting}
            className={`px-6 py-2 rounded-md font-medium ${
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Submitting...
              </div>
            ) : (
              isLastQuestion ? 'Submit Test' : 'Next'
            )}
          </button>
        </div>
      </div>

      <ResultModal
        isOpen={showResultModal}
        onClose={() => {
          setShowResultModal(false);
          router.push('/dashboard');
        }}
        result={testResult}
      />
    </div>
  );
}