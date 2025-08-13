"use client";
import { useEffect, useState, useRef, use, useMemo, useCallback } from "react";
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
const ReadAloudComponent = ({ question, onAnswer, clearTrigger }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(RECORD_SECONDS);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const timerRef = useRef();

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setAudioBlob(null);
      setMp3URL(null);
      setRecordingTime(RECORD_SECONDS);
      setIsRecording(false);
      onAnswer(null);
    }
  }, [clearTrigger, onAnswer]);

  useEffect(() => {
    if (!isRecording) return;
    if (recordingTime === 0) {
      stopRecording();
      return;
    }
    timerRef.current = setTimeout(() => setRecordingTime((t) => t - 1), 1000);
    return () => clearTimeout(timerRef.current);
  }, [isRecording, recordingTime]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const startRecording = useCallback(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
        setRecordingTime(RECORD_SECONDS);
      })
      .catch((e) => console.error("Recording failed:", e));
  }, []);

  const stopRecording = useCallback(() => {
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
  }, [onAnswer]);

  const restart = useCallback(() => {
    setAudioBlob(null);
    setMp3URL(null);
    setRecordingTime(RECORD_SECONDS);
    setIsRecording(false);
    onAnswer(null);
  }, [onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <BookOpen className="text-red-600 mr-2" />
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
        <span className="text-red-600 font-medium text-base">
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
            className="h-2 rounded bg-red-600 transition-all duration-200"
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
              : 'bg-red-500 hover:bg-red-600 text-white'
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
const RepeatSentenceComponent = ({ question, onAnswer, clearTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const audioRef = useRef(null);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setIsPlaying(false);
      setIsRecording(false);
      setAudioBlob(null);
      setMp3URL(null);
      onAnswer(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [clearTrigger, onAnswer]);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const startRecording = useCallback(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
      })
      .catch((e) => console.error("Recording failed:", e));
  }, []);

  const stopRecording = useCallback(() => {
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
  }, [onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Volume2 className="text-red-600 mr-2" />
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
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
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
          <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-400">
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
              : 'bg-red-500 hover:bg-red-600 text-white'
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
const RespondToSituationComponent = ({ question, onAnswer, clearTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const audioRef = useRef(null);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setIsPlaying(false);
      setIsRecording(false);
      setAudioBlob(null);
      setMp3URL(null);
      onAnswer(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [clearTrigger, onAnswer]);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const startRecording = useCallback(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
      })
      .catch((e) => console.error("Recording failed:", e));
  }, []);

  const stopRecording = useCallback(() => {
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
  }, [onAnswer]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Volume2 className="text-red-600 mr-2" />
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
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
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
              : 'bg-red-500 hover:bg-red-600 text-white'
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
const AnswerShortQuestionComponent = ({ question, onAnswer, clearTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [mp3URL, setMp3URL] = useState(null);
  const recorder = useRef(null);
  const audioRef = useRef(null);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setIsPlaying(false);
      setIsRecording(false);
      setAudioBlob(null);
      setMp3URL(null);
      onAnswer(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [clearTrigger, onAnswer]);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const startRecording = useCallback(() => {
    recorder.current = new MicRecorder({ bitRate: 128 });
    recorder.current
      .start()
      .then(() => {
        setIsRecording(true);
      })
      .catch((e) => console.error("Recording failed:", e));
  }, []);

  const stopRecording = useCallback(() => {
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
  }, [onAnswer]);

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
const SummarizeSpokenTextComponent = ({ question, onAnswer, clearTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [summary, setSummary] = useState('');
  const audioRef = useRef(null);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setIsPlaying(false);
      setSummary('');
      onAnswer('');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [clearTrigger, onAnswer]);

  // Debounced onAnswer call to prevent excessive updates
  const debouncedOnAnswer = useMemo(() => {
    let timeoutId;
    return (value) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => onAnswer(value), 300);
    };
  }, [onAnswer]);

  useEffect(() => {
    debouncedOnAnswer(summary);
  }, [summary, debouncedOnAnswer]);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleSummaryChange = useCallback((e) => {
    setSummary(e.target.value);
  }, []);

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
          <div className="mt-3 p-3 bg-red-50 rounded border-l-4 border-red-400">
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
          onChange={handleSummaryChange}
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
const SummarizeWrittenTextComponent = ({ question, onAnswer, clearTrigger }) => {
  const [summary, setSummary] = useState('');

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setSummary('');
      onAnswer('');
    }
  }, [clearTrigger, onAnswer]);

  // Debounced onAnswer call
  const debouncedOnAnswer = useMemo(() => {
    let timeoutId;
    return (value) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => onAnswer(value), 300);
    };
  }, [onAnswer]);

  useEffect(() => {
    debouncedOnAnswer(summary);
  }, [summary, debouncedOnAnswer]);

  const handleSummaryChange = useCallback((e) => {
    setSummary(e.target.value);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <PenTool className="text-red-600 mr-2" />
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
          onChange={handleSummaryChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
const WriteEmailComponent = ({ question, onAnswer, clearTrigger }) => {
  const [email, setEmail] = useState('');

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setEmail('');
      onAnswer('');
    }
  }, [clearTrigger, onAnswer]);

  // Debounced onAnswer call
  const debouncedOnAnswer = useMemo(() => {
    let timeoutId;
    return (value) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => onAnswer(value), 300);
    };
  }, [onAnswer]);

  useEffect(() => {
    debouncedOnAnswer(email);
  }, [email, debouncedOnAnswer]);

  const handleEmailChange = useCallback((e) => {
    setEmail(e.target.value);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Send className="text-red-600 mr-2" />
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
          onChange={handleEmailChange}
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
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

// Reading Fill in the Blanks Component - Fixed version
const RWFillInTheBlanksComponent = ({ question, onAnswer }) => {
  const [answers, setAnswers] = useState([]);

  // Clear answers when question changes
  useEffect(() => {
    setAnswers([]);
  }, [question._id]);

  // Memoize the onAnswer callback to prevent unnecessary re-renders
  const stableOnAnswer = useCallback(onAnswer, []);

  // Only call onAnswer when answers actually change
  useEffect(() => {
    stableOnAnswer(answers);
  }, [answers, stableOnAnswer]);

  

const handleAnswerChange = useCallback((blankIndex, value) => {
  setAnswers(prev => {
    
    const newAnswers = [...prev];
     if (newAnswers[blankIndex] === value) return newAnswers;
     newAnswers[blankIndex] = value;

    return newAnswers;
  });
}, []);





  const renderPromptWithBlanks = useMemo(() => {
    let text = question.prompt || '';
    const blanks = question.blanks || [];
    
    if (blanks.length === 0) {
      return <span>{text}</span>;
    }
    
    blanks.forEach((blank, index) => {
      const placeholder = `(${String.fromCharCode(97 + blank.index)})`;
      text = text.replace(placeholder, `<BLANK_${index}>`);
    });

    const parts = text.split(/<BLANK_\d+>/);
    const result = [];
    console.log("blanks.length",blanks.length);
    
  parts.forEach((part, index) => {
  // Push the part (text) into the result array
  result.push(<span key={`text-${index}`}>{part}</span>);

  // Only render select inputs for the corresponding blanks
  if (index < blanks.length) {
    result.push(
      <select
        key={`blank-${index}`}
        value={answers[blanks[index].index] || ''}
        onChange={(e) => handleAnswerChange(blanks[index].index, e.target.value)}
        className="mx-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
      >
        <option value="">Select...</option>
        {blanks[index].options.map((option, optIndex) => (
          <option key={optIndex} value={option}>{option}</option>
        ))}
      </select>
    );
  }
});

// Ensure that if there are more blanks than parts, we still render the remaining blanks.
if (blanks.length > parts.length) {
  blanks.slice(parts.length).forEach((blank, index) => {
    result.push(
      <select
        key={`blank-${index + parts.length}`}
        value={answers[blank.index] || ''}
        onChange={(e) => handleAnswerChange(blank.index, e.target.value)}
        className="mx-1 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500"
      >
        <option value="">Select...</option>
        {blank.options.map((option, optIndex) => (
          <option key={optIndex} value={option}>{option}</option>
        ))}
      </select>
    );
  });
}


    

    return result;
  }, [question.prompt, question.blanks, answers, handleAnswerChange]);

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
          {renderPromptWithBlanks}
        </div>
      </div>
    </div>
  );
};
// Multiple Choice Multiple Answers Component
const MCQMultipleComponent = ({ question, onAnswer, clearTrigger }) => {
  const [selectedAnswers, setSelectedAnswers] = useState([]);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setSelectedAnswers([]);
      onAnswer([]);
    }
  }, [clearTrigger, onAnswer]);

  // Stable onAnswer callback
  const stableOnAnswer = useCallback(onAnswer, []);

  useEffect(() => {
    stableOnAnswer(selectedAnswers);
  }, [selectedAnswers, stableOnAnswer]);

  const handleAnswerChange = useCallback((option) => {
    setSelectedAnswers(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <List className="text-red-600 mr-2" />
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
        {question.options?.map((option, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedAnswers.includes(option)}
              onChange={() => handleAnswerChange(option)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Multiple Choice Single Answer Component
const MCQSingleComponent = ({ question, onAnswer, clearTrigger }) => {
  const [selectedAnswer, setSelectedAnswer] = useState('');

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setSelectedAnswer('');
      onAnswer('');
    }
  }, [clearTrigger, onAnswer]);

  // Stable onAnswer callback
  const stableOnAnswer = useCallback(onAnswer, []);

  useEffect(() => {
    stableOnAnswer(selectedAnswer);
  }, [selectedAnswer, stableOnAnswer]);

  const handleAnswerChange = useCallback((value) => {
    setSelectedAnswer(value);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Target className="text-red-600 mr-2" />
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
        {question.options?.map((option, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type="radio"
              name={`question-${question._id}`}
              value={option}
              checked={selectedAnswer === option}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300"
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Reorder Paragraphs Component
const ReorderParagraphsComponent = ({ question, onAnswer, clearTrigger }) => {
  const [orderedOptions, setOrderedOptions] = useState(question.options || []);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setOrderedOptions(question.options || []);
      onAnswer(question.options || []);
    }
  }, [clearTrigger, question.options, onAnswer]);

  // Stable onAnswer callback
  const stableOnAnswer = useCallback(onAnswer, []);

  useEffect(() => {
    stableOnAnswer(orderedOptions);
  }, [orderedOptions, stableOnAnswer]);

  const moveItem = useCallback((fromIndex, toIndex) => {
    setOrderedOptions(prev => {
      const newOptions = [...prev];
      const [movedItem] = newOptions.splice(fromIndex, 1);
      newOptions.splice(toIndex, 0, movedItem);
      return newOptions;
    });
  }, []);

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
                  className="px-2 py-1 bg-red-500 text-white rounded disabled:bg-gray-300 text-sm"
                >
                  ↑
                </button>
                <button
                  onClick={() => moveItem(index, Math.min(orderedOptions.length - 1, index + 1))}
                  disabled={index === orderedOptions.length - 1}
                  className="px-2 py-1 bg-red-500 text-white rounded disabled:bg-gray-300 text-sm"
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
const ListeningFillInTheBlanksComponent = ({ question, onAnswer, clearTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [answers, setAnswers] = useState({});
  const audioRef = useRef(null);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setIsPlaying(false);
      setAnswers({});
      onAnswer({});
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [clearTrigger, onAnswer]);

  // Stable onAnswer callback
  const stableOnAnswer = useCallback(onAnswer, []);

  useEffect(() => {
    stableOnAnswer(answers);
  }, [answers, stableOnAnswer]);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleAnswerChange = useCallback((blankIndex, value) => {
    setAnswers(prev => {
      if (prev[blankIndex] === value) return prev;
      return {
        ...prev,
        [blankIndex]: value
      };
    });
  }, []);

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
const ListeningMCQComponent = ({ question, onAnswer, isMultiple = false, clearTrigger }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState(isMultiple ? [] : '');
  const audioRef = useRef(null);

  // Clear component state when clearTrigger changes
  useEffect(() => {
    if (clearTrigger) {
      setIsPlaying(false);
      setSelectedAnswers(isMultiple ? [] : '');
      onAnswer(isMultiple ? [] : '');
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    }
  }, [clearTrigger, isMultiple, onAnswer]);

  // Stable onAnswer callback
  const stableOnAnswer = useCallback(onAnswer, []);

  useEffect(() => {
    stableOnAnswer(selectedAnswers);
  }, [selectedAnswers, stableOnAnswer]);

  const toggleAudio = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleAnswerChange = useCallback((option) => {
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
  }, [isMultiple]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center mb-4">
        <Headphones className="text-red-600 mr-2" />
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
            className="flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md"
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
        {question.options?.map((option, index) => (
          <label key={index} className="flex items-start gap-3 cursor-pointer">
            <input
              type={isMultiple ? "checkbox" : "radio"}
              name={isMultiple ? undefined : `question-${question._id}`}
              value={option}
              checked={isMultiple ? selectedAnswers.includes(option) : selectedAnswers === option}
              onChange={() => handleAnswerChange(option)}
              className={`mt-1 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 ${isMultiple ? 'rounded' : ''}`}
            />
            <span className="text-gray-700">{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Main Question Renderer - Memoized to prevent unnecessary re-renders
const QuestionRenderer = ({ question, onAnswer, clearTrigger }) => {
  const { subtype } = question;
  
  const componentToRender = useMemo(() => {
    switch (subtype) {
      case 'read_aloud':
        return <ReadAloudComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'repeat_sentence':
        return <RepeatSentenceComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'respond_to_situation':
        return <RespondToSituationComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'answer_short_question':
        return <AnswerShortQuestionComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'summarize_spoken_text':
        return <SummarizeSpokenTextComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'summarize_written_text':
        return <SummarizeWrittenTextComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'write_email':
        return <WriteEmailComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'reading_fill_in_the_blanks':
        return <RWFillInTheBlanksComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'mcq_multiple':
        return <MCQMultipleComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'mcq_single':
        return <MCQSingleComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'reorder_paragraphs':
        return <ReorderParagraphsComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'listening_fill_in_the_blanks':
        return <ListeningFillInTheBlanksComponent question={question} onAnswer={onAnswer} clearTrigger={clearTrigger} />;
      
      case 'listening_multiple_choice_multiple_answers':
        return <ListeningMCQComponent question={question} onAnswer={onAnswer} isMultiple={true} clearTrigger={clearTrigger} />;
      
      case 'listening_multiple_choice_single_answers':
        return <ListeningMCQComponent question={question} onAnswer={onAnswer} isMultiple={false} clearTrigger={clearTrigger} />;
      
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
  }, [subtype, question, onAnswer, clearTrigger]);

  return componentToRender;
};

// Result Modal Component
const ResultModal = ({ isOpen, onClose, result }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4  bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto border border-gray-200 overflow-hidden">
        <div className="bg-red-700 p-4 text-white">
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
            <div className="text-red-700 text-xl font-bold mb-2">
              Test Results
            </div>
            <p className="text-gray-600 mb-4">
              Your test has been submitted successfully!
            </p>
            
            {result && (
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap grid  gap-5">
                  <p>Listening : {Number(result.data.listening).toFixed(2)}</p>
                  <p>Reading : {Number(result.data.reading).toFixed(2)}</p>
                  <p>Speaking : { Number(result.data.speaking).toFixed(2)}</p>
                  <p>Writing : { Number(result.data.writing).toFixed(2)}</p>
                  <p>Total Score : { Number(result.data.totalScore).toFixed(2)}</p>
                  
                </pre>
              </div>
            )}{
              
              
            }
          </div>

          <button
            onClick={onClose}
            className="w-full py-2.5 bg-red-700 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// Route Change Confirmation Component
const RouteChangeConfirmation = ({ isActive, onConfirm, onCancel }) => {
  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto border border-gray-200 overflow-hidden">
        <div className="bg-yellow-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <XCircle className="h-6 w-6" />
            <h3 className="text-lg font-bold">Leave Test?</h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Are you sure you want to leave this test? Your progress will be lost.
          </p>
          
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition font-medium"
            >
              Stay in Test
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
            >
              Leave Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// Main Dynamic Mock Test Component
export default function DynamicMockTest({ params }) {
  // Use React.use() to unwrap the Promise params
  const resolvedParams = use(params);
  const mockTestId = resolvedParams.id;
  
  const router = useRouter();
  const baseUrl = process.env.NEXT_PUBLIC_URL || "";
  
  const [testData, setTestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResultModal, setShowResultModal] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showRouteConfirm, setShowRouteConfirm] = useState(false);
  const [pendingRoute, setPendingRoute] = useState(null);

  // Prevent route changes during test
  useEffect(() => {
    const handleRouteChange = (url) => {
      if (url !== window.location.pathname && !showResultModal) {
        // Store the intended route and show confirmation
        setPendingRoute(url);
        setShowRouteConfirm(true);
        // Prevent the route change
        window.history.pushState(null, '', window.location.pathname);
        return false;
      }
    };

    const handleBeforeUnload = (e) => {
      if (!showResultModal) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // Override router.push to show confirmation
    const originalPush = router.push;
    router.push = (url, options) => {
      if (!showResultModal && url !== window.location.pathname) {
        setPendingRoute(url);
        setShowRouteConfirm(true);
        return Promise.resolve(true);
      }
      return originalPush(url, options);
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.push = originalPush;
    };
  }, [router, showResultModal]);

  // Handle route confirmation
  const handleRouteConfirm = useCallback(() => {
    setShowRouteConfirm(false);
    if (pendingRoute) {
      window.location.href = pendingRoute;
    }
  }, [pendingRoute]);

  const handleRouteCancel = useCallback(() => {
    setShowRouteConfirm(false);
    setPendingRoute(null);
  }, []);

  // Fetch test data
  useEffect(() => {
    const fetchTestData = async () => {
      if (!mockTestId) return;
      
      setLoading(true);
      try {
        const response = await fetchWithAuth(`${baseUrl}/full-mock-test/get/${mockTestId}`);
        const data = await response.json();
        setTestData(data);
      } catch (error) {
        console.error("Failed to fetch test data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestData();
  }, [mockTestId, baseUrl]);

  // Memoized answer handler to prevent infinite re-renders
  const handleAnswerChange = useCallback((questionId, answer) => {
    setAnswers(prev => {
      // Only update if the answer actually changed
      if (prev[questionId] === answer) return prev;
      return {
        ...prev,
        [questionId]: answer
      };
    });
  }, []);

  // Submit individual answer
  const submitAnswer = useCallback(async (questionId, answer) => {
    if (!answer) return;

    try {
      if (answer instanceof Blob) {
        // For audio files
        const formData = new FormData();
        formData.append("voice", answer, "voice.mp3");
        formData.append("questionId", questionId);
        formData.append("mockTestId", mockTestId);
        
        await fetchWithAuth(`${baseUrl}/full-mock-test/result-single-question`, {
          method: "POST",
          body: formData
        });
      } else {
        // For text answers
        await fetchWithAuth(`${baseUrl}/full-mock-test/result-single-question`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            questionId,
            answer,
            mockTestId
          })
        });
      }
    } catch (error) {
      console.error("Failed to submit answer:", error);
    }
  }, [baseUrl]);

  // Navigate to next question
  const nextQuestion = useCallback(async () => {
  if (!testData?.questions || isSubmitting) return;

  const currentQuestion = testData.questions[currentQuestionIndex];
  const currentAnswer = answers[currentQuestion._id];

  // Submit current answer if exists
  if (currentAnswer) {
    setIsSubmitting(true); // Set isSubmitting to true
    await submitAnswer(currentQuestion._id, currentAnswer);
    setIsSubmitting(false); // Reset isSubmitting after submitting
  }

  if (currentQuestionIndex < testData.questions.length - 1) {
    setCurrentQuestionIndex(currentQuestionIndex + 1);
  } else {
    // Submit entire test
    await submitTest();
  }
}, [testData, currentQuestionIndex, answers, isSubmitting, submitAnswer]);


  // Navigate to previous question
  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);

  // Submit entire test
  const submitTest = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const response = await fetchWithAuth(`${baseUrl}/full-mock-test/get-mock-test-result/${mockTestId}`);
      const result = await response.json();
      setTestResult(result);
      setShowResultModal(true);
    } catch (error) {
      console.error("Failed to submit test:", error);
    } finally {
      setIsSubmitting(false);
    }
  }, [baseUrl, mockTestId]);

  const handleResultModalClose = useCallback(() => {
    setShowResultModal(false);
    router.push('/dashboard');
  }, [router]);

  // Memoized current question to prevent unnecessary re-renders
  const currentQuestion = useMemo(() => {
    return testData?.questions?.[currentQuestionIndex];
  }, [testData, currentQuestionIndex]);

  const isLastQuestion = useMemo(() => {
    return currentQuestionIndex === (testData?.questions?.length || 0) - 1;
  }, [currentQuestionIndex, testData]);

  if (loading || !testData || !testData.questions || testData.questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

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
                <span>Duration: {testData.duration?.hours || 0}h {testData.duration?.minutes || 0}m</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {testData.questions.length}
              </div>
              <div className="w-48 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / testData.questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Question Area */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {currentQuestion && (
          <QuestionRenderer 
            question={currentQuestion} 
            onAnswer={(answer) => handleAnswerChange(currentQuestion._id, answer)}
          />
        )}
        
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
      : 'bg-red-600 hover:bg-red-700 text-white'
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

      {/* Modals */}
      <ResultModal
        isOpen={showResultModal}
        onClose={handleResultModalClose}
        result={testResult}
      />

      <RouteChangeConfirmation
        isActive={showRouteConfirm}
        onConfirm={handleRouteConfirm}
        onCancel={handleRouteCancel}
      />
    </div>
  );
}