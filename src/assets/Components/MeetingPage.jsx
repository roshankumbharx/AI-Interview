import React, { useState } from 'react';

function MeetingPage({ interviewType, onMeetingEnd }) {
  const [meetingLink, setMeetingLink] = useState('');
  const [inMeeting, setInMeeting] = useState(false);
  
  const handleJoinMeeting = (e) => {
    e.preventDefault();
    if (meetingLink) {
      setInMeeting(true);
      window.open(meetingLink, '_blank');
    }
  };
  
  const handleEndMeeting = () => {
    onMeetingEnd();
  };
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-center mb-2">
        {interviewType === 'peer' ? 'Peer to Peer' : 'Expert'} Interview
      </h2>
      
      {!inMeeting ? (
        <form onSubmit={handleJoinMeeting} className="space-y-4">
          <div>
            <label htmlFor="meetingLink" className="block text-sm font-medium mb-1">
              Enter Digital Samba Meeting Link
            </label>
            <input
              type="url"
              id="meetingLink"
              value={meetingLink}
              onChange={(e) => setMeetingLink(e.target.value)}
              className="w-full p-2 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://..."
              required
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            disabled={!meetingLink}
          >
            Join Meeting
          </button>
          
          <button 
            type="button"
            onClick={onMeetingEnd}
            className="w-full py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
          >
            Back
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="border-2 border-gray-700 rounded-md p-4 min-h-48 flex items-center justify-center">
            <p className="text-center text-gray-400">
              Meeting in progress... <br />
              (Your meeting has been opened in a new tab)
            </p>
          </div>
          
          <button 
            onClick={handleEndMeeting}
            className="w-full py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            End Meeting & Return to Home
          </button>
        </div>
      )}
    </div>
  );
}

export default MeetingPage;