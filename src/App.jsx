import { useState } from 'react';
import './App.css';
import DomainAndResume from './assets/Components/DomainAndResume';
import SplitScreen from './assets/Components/SplitScreen';
import FeedbackScreen from './assets/Components/FeedbackScreen';
import CandidateSelectPage from './assets/Components/CandidateSelectPage';

function App() {
  const [screen, setScreen] = useState('candidateSelect');
  const [domainData, setDomainData] = useState({
    domain: '',
    resumeText: ''
  });
  const [interviewResults, setInterviewResults] = useState(null);

  const handleDomainResumeNext = (domain, resumeText) => {
    setDomainData({ domain, resumeText });
    setScreen('interview');
  };

  const handleInterviewComplete = (scores) => {
    setInterviewResults({
      scores,
      timestamp: new Date().toISOString(),
      domain: domainData.domain
    });
    setScreen('feedback');
  };

  const handleFinish = () => {
    setDomainData({ domain: '', resumeText: '' });
    setInterviewResults(null);
    setScreen('candidateSelect');
  };

  const handleStartMockInterview = () => {
    setScreen('domainResume');
  };

  const getCurrentScreen = () => {
    switch(screen) {
      case 'candidateSelect':
        return <CandidateSelectPage onStartMockInterview={handleStartMockInterview} />;
        
      case 'domainResume':
        return <DomainAndResume onNext={handleDomainResumeNext} />;
      
      case 'interview':
        return (
          <SplitScreen 
            domain={domainData.domain} 
            resumetext={domainData.resumeText} 
            onComplete={handleInterviewComplete} 
          />
        );
      
      case 'feedback':
        return (
          <FeedbackScreen 
            scores={interviewResults?.scores}
            domain={domainData.domain}
            onFinish={handleFinish}
          />
        );
      
      default:
        return <CandidateSelectPage onStartMockInterview={handleStartMockInterview} />;
    }
  };

  return (
    <div className="app-container">
      {getCurrentScreen()}
    </div>
  );
}

export default App;