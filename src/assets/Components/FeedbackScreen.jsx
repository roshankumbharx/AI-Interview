import React from 'react';

function FeedbackScreen({ scores, domain, onFinish }) {
  const defaultScores = {
    technicalSkills: 10,
    softSkills: 10,
    problemSolving: 10,
  };

  const finalScores = scores || defaultScores;

  const totalScore = Math.round(
    (finalScores.technicalSkills * 0.4 + 
     finalScores.softSkills * 0.3 +
     finalScores.problemSolving * 0.3)
  );

  const getScoreColor = (score) => {
    if (score >= 85) return "text-green-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 55) return "text-orange-400";
    return "text-red-500";
  };

  const getFeedbackTier = (score) => {
    const tiers = [
      { min: 85, label: "Exceptional", class: "excellent" },
      { min: 70, label: "Strong", class: "good" },
      { min: 55, label: "Developing", class: "satisfactory" },
      { min: 40, label: "Needs Work", class: "needsImprovement" },
      { min: 0, label: "Requires Attention", class: "insufficient" }
    ];
    return tiers.find(t => score >= t.min);
  };

  const getDetailedFeedback = (skillType, score) => {
    const tier = getFeedbackTier(score);
    const feedbackTemplates = {
      technicalSkills: {
        excellent: `Your ${domain} expertise is exceptional. You demonstrated deep technical understanding and practical application skills.`,
        good: `You show strong ${domain} knowledge. Continue deepening your expertise in specialized areas.`,
        satisfactory: `You have basic ${domain} competency. Focus on core concepts and practical implementations.`,
        needsImprovement: `Your ${domain} knowledge needs strengthening. Start with fundamental concepts and progress to real-world applications.`,
        insufficient: `Essential ${domain} knowledge gaps exist. Begin with foundational learning and hands-on practice.`
      },
      softSkills: {
        excellent: "Communication was polished and professional. You articulated complex ideas clearly and concisely.",
        good: "You communicated effectively. Work on varying your delivery for different audiences.",
        satisfactory: "Basic communication achieved. Practice structuring responses and active listening.",
        needsImprovement: "Communication needs improvement. Focus on clarity and professional tone.",
        insufficient: "Significant communication challenges observed. Prioritize professional communication training."
      },
      problemSolving: {
        excellent: "Demonstrated exceptional problem-solving with innovative, efficient solutions.",
        good: "Showed strong analytical skills. Continue refining solution optimization.",
        satisfactory: "Basic problem-solving demonstrated. Practice structured approaches.",
        needsImprovement: "Problem-solving needs development. Focus on analytical frameworks.",
        insufficient: "Fundamental problem-solving gaps. Start with basic algorithmic thinking."
      }
    };

    return feedbackTemplates[skillType][tier.class];
  };

  // Progress bar component
  const ProgressBar = ({ percentage, label, color }) => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-lg font-semibold text-gray-200">{label}</span>
        <span className={`text-xl font-bold ${getScoreColor(percentage)}`}>
          {percentage}%
        </span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-3">
        <div
          className={`h-3 rounded-full ${color} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-2 text-right text-gray-400">
        {getFeedbackTier(percentage).label}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#171717] text-white flex flex-col">
      <header className="bg-[#1e1e1e] p-6 border-b border-gray-700">
        <h1 className="text-3xl font-bold text-center">Interview Feedback</h1>
        <p className="text-gray-400 text-center mt-2">
          {domain} Position Analysis
        </p>
      </header>

      <div className="flex-grow p-8 max-w-4xl mx-auto w-full">
        <div className="bg-[#1e1e1e] rounded-xl p-6 mb-8 text-center border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-semibold mb-2">Overall Evaluation</h2>
          <div className={`text-6xl font-bold mb-3 ${getScoreColor(totalScore)}`}>
            {totalScore}%
          </div>
          <p className="text-xl text-gray-300">
            {getFeedbackTier(totalScore).label} Performance
          </p>
        </div>

        <div className="bg-[#1e1e1e] rounded-xl p-6 border border-gray-700 shadow-lg">
          <h2 className="text-2xl font-semibold mb-6">Skill Breakdown</h2>

          <ProgressBar
            percentage={finalScores.technicalSkills}
            label="Technical Mastery"
            color="bg-blue-500"
          />

          <ProgressBar
            percentage={finalScores.softSkills}
            label="Communication"
            color="bg-purple-500"
          />

          <ProgressBar
            percentage={finalScores.problemSolving}
            label="Problem Solving"
            color="bg-green-500"
          />

          <div className="mt-8 p-4 bg-[#252525] rounded-lg border border-gray-700">
            <h3 className="text-xl font-semibold mb-4">Personalized Feedback</h3>
            <p className="text-gray-300 mb-3">
              {getDetailedFeedback('technicalSkills', finalScores.technicalSkills)}
            </p>
            <p className="text-gray-300 mb-3">
              {getDetailedFeedback('softSkills', finalScores.softSkills)}
            </p>
            <p className="text-gray-300">
              {getDetailedFeedback('problemSolving', finalScores.problemSolving)}
            </p>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <button
            onClick={onFinish}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            Complete Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackScreen;

