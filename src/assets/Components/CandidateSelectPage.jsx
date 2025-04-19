

import React, { useState } from 'react';
import BookInterviewOptions from './BookInterviewOptions';
import MeetingPage from './MeetingPage';

function CandidateSelectPage({ onStartMockInterview }) {
  const [selectedOption, setSelectedOption] = useState(null);
  const [interviewType, setInterviewType] = useState(null);

  const handleAIMockInterview = () => {
    onStartMockInterview();
  };

  const handleBookInterview = () => {
    setSelectedOption('book');
  };

  const handleInterviewTypeSelect = (type) => {
    setInterviewType(type);
  };

  const resetSelection = () => {
    setSelectedOption(null);
    setInterviewType(null);
  };

  // For redirecting to landing page after meeting ends
  const handleMeetingEnd = () => {
    // This will reset the component state and effectively show the "landing page" view
    resetSelection();
    
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#171717] text-white p-4">
      <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Candidate Interview Selection
        </h1>
        
        {!selectedOption && (
          <div className="space-y-4">
            <button 
              onClick={handleAIMockInterview}
              className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Take AI Mock Interview
            </button>
            <button 
              onClick={handleBookInterview}
              className="w-full py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              Book Interview with an Expert
            </button>
          </div>
        )}
        
        {selectedOption === 'book' && !interviewType && (
          <BookInterviewOptions 
            onSelect={handleInterviewTypeSelect} 
            onBack={resetSelection} 
          />
        )}
        
        {selectedOption === 'book' && interviewType && (
          <MeetingPage 
            interviewType={interviewType} 
            onMeetingEnd={handleMeetingEnd} 
          />
        )}
      </div>
    </div>
  );
}

export default CandidateSelectPage;