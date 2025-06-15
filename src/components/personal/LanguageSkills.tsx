import Link from "next/link"
import { Circle } from "lucide-react"

export default function LanguageSkills() {
  const skillsData = [
    {
      title: "Speaking",
      color: "bg-orange-400",
      borderColor: "border-orange-400",
      textColor: "text-orange-600",
      tasks: ["Read Aloud", "Repeat Sentence", "Respond to a Situation", "Answer Short Question"],
    },
    {
      title: "Writing",
      color: "bg-cyan-400",
      borderColor: "border-cyan-400",
      textColor: "text-cyan-600",
      tasks: ["Summarize Written Text", "Write Email"],
    },
    {
      title: "Reading",
      color: "bg-green-400",
      borderColor: "border-green-400",
      textColor: "text-green-600",
      tasks: [
        "Fill in the Blanks",
        "Multiple Choice and answers",
        "Re-order Paragraphs",
        "Multiple Choice, Single Answer",
      ],
    },
    {
      title: "Listening",
      color: "bg-purple-500",
      borderColor: "border-purple-500",
      textColor: "text-purple-600",
      tasks: [
        "Summarize Spoken Text",
        "Multiple Choice and answers",
        "Fill in the blanks",
        "Multiple Choice, Single Answer",
      ],
    },
  ]

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {skillsData.map((skill, index) => (
          <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className={`${skill.color} px-4 py-3 border-b-2 ${skill.borderColor}`}>
              <h3 className="text-white font-medium text-base text-center">{skill.title}</h3>
            </div>

            {/* Tasks List */}
            <div className="p-4 space-y-3">
              {skill.tasks.map((task, taskIndex) => (
                <Link
                  key={taskIndex}
                  href={`/${skill.title.toLowerCase()}/${task.toLowerCase().replace(/\s+/g, "-").replace(/,/g, "")}`}
                  className="flex items-start gap-3 text-gray-700 hover:text-gray-900 transition-colors group"
                >
                  <Circle
                    className={`w-4 h-4 mt-0.5 flex-shrink-0 ${skill.textColor} group-hover:scale-110 transition-transform`}
                    fill="currentColor"
                  />
                  <span className="text-sm leading-relaxed group-hover:underline">{task}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
