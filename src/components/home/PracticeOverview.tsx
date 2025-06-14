"use client"

import { useState } from "react"
import { Mic, PenTool, BookOpen, Volume2 } from "lucide-react"
import practiceData from "@/../public/data.json"

interface PracticeData {
  title: string
  count: number
  label: string
  icon: string
  details: string[]
}

interface PracticeDataSet {
  speaking: PracticeData
  writing: PracticeData
  reading: PracticeData
  listening: PracticeData
}

type PracticeType = keyof PracticeDataSet

export default function PracticeOverview() {
  const [activeCategory, setActiveCategory] = useState<PracticeType>("speaking")
  const data = practiceData as PracticeDataSet

  const getActiveIcon = (category: PracticeType) => {
    const iconClass = activeCategory === category ? "w-6 h-6 text-white" : "w-6 h-6 text-gray-600"
    switch (category) {
      case "speaking":
        return <Mic className={iconClass} />
      case "writing":
        return <PenTool className={iconClass} />
      case "reading":
        return <BookOpen className={iconClass} />
      case "listening":
        return <Volume2 className={iconClass} />
      default:
        return null
    }
  }

  const currentData = data[activeCategory]

  return (
    <div className="min-h-screen  relative overflow-hidden">
      {/* Decorative curved lines */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M0,0 Q100,50 200,0 L200,200 L0,200 Z" fill="none" stroke="#dc2626" strokeWidth="2" />
        </svg>
      </div>
      <div className="absolute top-0 right-0 w-64 h-64 opacity-20">
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <path d="M200,0 Q100,50 0,0 L0,200 L200,200 Z" fill="none" stroke="#dc2626" strokeWidth="2" />
        </svg>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="text-red-600">Practice</span> <span className="text-gray-800">Overview</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Comprehensive PTE Training – Everything You Need to Succeed!
          </p>
        </div>

        {/* Practice Category Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {(Object.keys(data) as PracticeType[]).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`
                p-6 rounded-2xl transition-all duration-300 transform hover:scale-105
                ${
                  activeCategory === category
                    ? "bg-red-600 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 shadow-md"
                }
              `}
            >
              <div className="flex flex-col items-center space-y-3">
                {getActiveIcon(category)}
                <span className="font-semibold text-sm md:text-base capitalize">{category} Practice</span>
              </div>
            </button>
          ))}
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
          <div className="grid md:grid-cols-2 gap-8 items-start">
            {/* Left side - Number and label */}
            <div className="text-center md:text-left">
              <div className="text-6xl md:text-8xl font-bold text-red-600 mb-2">{currentData.count}</div>
              <div className="text-gray-600 text-lg md:text-xl font-medium">{currentData.label}</div>
            </div>

            {/* Right side - Details */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-red-600 mb-6">{currentData.title}</h2>
              <ul className="space-y-4">
                {currentData.details.map((detail, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 text-base md:text-lg leading-relaxed">{detail}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
