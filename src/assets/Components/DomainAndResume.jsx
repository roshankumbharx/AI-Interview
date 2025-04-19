import { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@4.10.38/build/pdf.worker.mjs';

export default function DomainAndResume({ onNext }) {
  const [domain, setDomain] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeText, setResumeText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [domainScores, setDomainScores] = useState({});

  const domains = [
    'Artificial Intelligence',
    'Chartered Accountant',
    'Sales Executive',
    'Data analytics',
    'Web Development',
    'Data Science',
    'Cybersecurity',
  ];
  
  // Enhanced domain-specific keywords with weights
  const domainKeywords = {
    'Artificial Intelligence': [
      {word: 'ai', weight: 3}, 
      {word: 'artificial intelligence', weight: 5}, 
      {word: 'machine learning', weight: 4}, 
      {word: 'ml', weight: 3}, 
      {word: 'deep learning', weight: 4}, 
      {word: 'neural network', weight: 4}, 
      {word: 'nlp', weight: 3}, 
      {word: 'natural language processing', weight: 4},
      {word: 'tensorflow', weight: 4},
      {word: 'pytorch', weight: 4},
      {word:'data science',weight:4},
      {word:'data analysis',weight:4}
    ],
    'Chartered Accountant': [
      {word: 'ca', weight: 3}, 
      {word: 'chartered accountant', weight: 5},
      {word: 'accountant', weight: 4}, 
      {word: 'accounting', weight: 4}, 
      {word: 'audit', weight: 4}, 
      {word: 'finance', weight: 3}, 
      {word: 'taxation', weight: 4}, 
      {word: 'financial', weight: 3}, 
      {word: 'balance sheet', weight: 4},
      {word: 'ledger', weight: 3},
      {word: 'tax', weight: 3},
      {word: 'icai', weight: 5},
    ],
    'Sales Executive': [
      {word: 'sales', weight: 5}, 
      {word: 'marketing', weight: 3}, 
      {word: 'business development', weight: 4}, 
      {word: 'account manager', weight: 4}, 
      {word: 'client', weight: 2}, 
      {word: 'customer', weight: 2}, 
      {word: 'revenue', weight: 3},
      {word: 'target', weight: 3},
      {word: 'quota', weight: 4},
      {word: 'conversion', weight: 3},
    ],
    'Data analytics': [
      {word: 'analytics', weight: 5}, 
      {word: 'data analysis', weight: 5}, 
      {word: 'visualization', weight: 4}, 
      {word: 'tableau', weight: 4}, 
      {word: 'power bi', weight: 4}, 
      {word: 'sql', weight: 3}, 
      {word: 'excel', weight: 2}, 
      {word: 'reporting', weight: 3},
      {word: 'dashboard', weight: 3},
      {word: 'metrics', weight: 3},
    ],
    'Web Development': [
      {word: 'web', weight: 2}, 
      {word: 'frontend', weight: 4}, 
      {word: 'backend', weight: 4}, 
      {word: 'fullstack', weight: 5}, 
      {word: 'html', weight: 3}, 
      {word: 'css', weight: 3}, 
      {word: 'javascript', weight: 4}, 
      {word: 'react', weight: 4}, 
      {word: 'angular', weight: 4}, 
      {word: 'node', weight: 4},
      {word: 'responsive', weight: 3},
      {word: 'api', weight: 3},
    ],
    'Data Science': [
      {word: 'data science', weight: 5}, 
      {word: 'statistics', weight: 3}, 
      {word: 'python', weight: 3}, 
      {word: 'r', weight: 3}, 
      {word: 'machine learning', weight: 4}, 
      {word: 'predictive', weight: 3}, 
      {word: 'modeling', weight: 3}, 
      {word: 'pandas', weight: 4},
      {word: 'scikit-learn', weight: 4},
      {word: 'data mining', weight: 4},
    ],
    'Cybersecurity': [
      {word: 'security', weight: 3}, 
      {word: 'cyber', weight: 4}, 
      {word: 'penetration testing', weight: 5}, 
      {word: 'ethical hacking', weight: 5}, 
      {word: 'network security', weight: 4}, 
      {word: 'firewall', weight: 3}, 
      {word: 'encryption', weight: 3},
      {word: 'vulnerability', weight: 4},
      {word: 'threat', weight: 3},
      {word: 'authentication', weight: 3},
      {word: 'infosec', weight: 4},
    ],
  };

  // Function to calculate domain match scores
  const calculateDomainScores = (resumeText) => {
    if (!resumeText) return {};
    
    const scores = {};
    const lowerCaseResumeText = resumeText.toLowerCase();
    
    // Calculate score for each domain
    for (const [domainName, keywords] of Object.entries(domainKeywords)) {
      let domainScore = 0;
      let keywordMatches = 0;
      
      for (const {word, weight} of keywords) {
        // Count occurrences of the keyword
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = (lowerCaseResumeText.match(regex) || []).length;
        
        if (matches > 0) {
          domainScore += weight * Math.min(matches, 3); // Cap repeated keywords
          keywordMatches++;
        }
      }
      
      // Calculate percentage of keywords matched
      const keywordCoverage = keywordMatches / keywords.length;
      
      // Final score is a combination of total weighted matches and keyword coverage
      scores[domainName] = {
        score: domainScore,
        coverage: keywordCoverage,
        normalizedScore: domainScore * (0.7 + 0.3 * keywordCoverage) // Weighted formula
      };
    }
    
    return scores;
  };

  // Improved function to validate domain against resume
  const validateDomainMatch = (selectedDomain, resumeText, scores) => {
    if (!selectedDomain || !resumeText || !scores || Object.keys(scores).length === 0) {
      return false;
    }
    
    // Get the score for the selected domain
    const selectedScore = scores[selectedDomain]?.normalizedScore || 0;
    
    // Find the highest scoring domain
    let highestScore = 0;
    let bestMatchDomain = null;
    
    for (const [domainName, scoreData] of Object.entries(scores)) {
      if (scoreData.normalizedScore > highestScore) {
        highestScore = scoreData.normalizedScore;
        bestMatchDomain = domainName;
      }
    }
    
    // Debug information (can be removed in production)
    console.log('Domain scores:', scores);
    console.log('Selected domain:', selectedDomain, 'Score:', selectedScore);
    console.log('Best match domain:', bestMatchDomain, 'Score:', highestScore);
    
    // Thresholds for validation
    const MINIMUM_SCORE = 5; // Minimum score needed for any domain to be valid
    const RELATIVE_THRESHOLD = 0.6; // Selected domain should be at least 60% of the highest score
    
    // Check if selected domain has reasonable score and is close to the best match
    return (
      selectedScore >= MINIMUM_SCORE && 
      (selectedDomain === bestMatchDomain || selectedScore >= highestScore * RELATIVE_THRESHOLD)
    );
  };

  const extractTextFromPDF = async (file) => {
    setIsProcessing(true);
    setError('');
    
    try {
      const reader = new FileReader();
      
      // Add promise wrapper for FileReader
      const fileReadPromise = new Promise((resolve, reject) => {
        reader.onload = resolve;
        reader.onerror = reject;
      });
  
      reader.readAsArrayBuffer(file);
      await fileReadPromise;
  
      const pdf = await pdfjsLib.getDocument(reader.result).promise;
      let extractedText = '';
  
      // Corrected page processing logic
      const pagePromises = Array.from({ length: pdf.numPages }, (_, i) => 
        pdf.getPage(i + 1).then(page => 
          page.getTextContent().then(content => 
            content.items.map(item => item.str).join(' ')
          )
        ));
  
      const pagesText = await Promise.all(pagePromises);
      extractedText = pagesText.join('\n').replace(/\s+/g, ' ').trim();
  
      if (!extractedText) {
        throw new Error('PDF appears to be image-based or contains no extractable text');
      }
  
      // Calculate domain scores when text is extracted
      const scores = calculateDomainScores(extractedText);
      setDomainScores(scores);
      setResumeText(extractedText);
      setIsProcessing(false);
    } catch (err) {
      console.error('PDF processing error:', err);
      setError(err.message || 'Failed to process PDF. Please ensure it contains text.');
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file');
      return;
    }

    setResumeFile(file);
    setError('');
    await extractTextFromPDF(file);
  };

  const handleDomainChange = (value) => {
    setDomain(value);
    // Clear error when domain changes
    if (error) {
      setError('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (!resumeText) {
      setError('Please upload a valid text-based resume PDF');
      return;
    }
    
    // Use the improved domain validation with scores
    if (!validateDomainMatch(domain, resumeText, domainScores)) {
      // Get recommended domains based on scores
      const sortedDomains = Object.entries(domainScores)
        .sort((a, b) => b[1].normalizedScore - a[1].normalizedScore)
        .slice(0, 2)
        .map(([name]) => name);
      
      let errorMessage = 'The selected domain does not match your resume content.';
      
      if (sortedDomains.length > 0) {
        errorMessage += ` Your resume appears to be more suitable for: ${sortedDomains.join(' or ')}.`;
      }
      
      setError(errorMessage);
      return;
    }

    // If all checks pass, proceed with the interview
    onNext(domain, resumeText);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#171717] text-white p-4">
      <div className="w-full max-w-2xl bg-[#1e1e1e] rounded-xl p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-8 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Start Your Interview Prep
        </h1>
        {error && (
          <div className="mb-6 p-4 bg-red-900/30 border border-red-400 rounded-lg text-red-200">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-4">
            <label className="block space-y-2">
              <span className="text-lg font-semibold">Select Target Domain</span>
              <div className="relative">
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => handleDomainChange(e.target.value)}
                  list="domain-list"
                  placeholder="Search domain..."
                  className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist id="domain-list">
                  {domains.map((d) => (
                    <option key={d} value={d} />
                  ))}
                </datalist>
              </div>
            </label>

            <label className="block space-y-2">
              <span className="text-lg font-semibold">Upload Resume</span>
              <div className="relative group">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="w-full p-3 rounded-lg bg-[#2a2a2a] border border-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
                />
                <div className="mt-2 text-sm text-gray-400">
                  {resumeFile && (
                    <span className={`${isProcessing ? 'text-blue-400' : 'text-green-400'}`}>
                      {isProcessing ? 'Analyzing PDF...' : `Loaded: ${resumeFile.name}`}
                    </span>
                  )}
                </div>
              </div>
            </label>
            
            {/* Optional: Display domain match information after resume is loaded */}
            {/* {resumeText && Object.keys(domainScores).length > 0 && !isProcessing && (
              <div className="mt-4 p-3 bg-[#2a2a2a] rounded-lg border border-gray-700">
                <h3 className="font-semibold mb-2">Resume Analysis:</h3>
                <div className="text-sm">
                  <p className="mb-1">Top domain matches:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {Object.entries(domainScores)
                      .sort((a, b) => b[1].normalizedScore - a[1].normalizedScore)
                      .slice(0, 3)
                      .map(([domainName, scoreData], index) => (
                        <li key={index} className={domainName === domain ? "text-blue-400" : ""}>
                          {domainName} 
                          <span className="text-gray-400 ml-1">
                            ({Math.round(scoreData.normalizedScore)} pts)
                          </span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
              </div>
            )} */}
          </div>

          <button
            type="submit"
            disabled={isProcessing || !domain || !resumeText}
            className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              'Start Interview →'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}