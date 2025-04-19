import React from 'react';

function BookInterviewOptions({ onSelect, onBack }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">Select Interview Type</h2>
      
      <button 
        onClick={() => onSelect('peer')}
        className="w-full py-3 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
      >
        Peer to Peer
      </button>
      
      <button 
        onClick={() => onSelect('expert')}
        className="w-full py-3 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
      >
        Expert
      </button>
      
      <button 
        onClick={onBack}
        className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors mt-4"
      >
        Back
      </button>
    </div>
  );
}

export default BookInterviewOptions;