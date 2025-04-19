import { useEffect, useRef, useState } from "react";
import ChatInterface from "./Screen2/ChatInterface";
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

export default function SplitScreen({ domain, resumetext, onComplete }) {
  const chatInterfaceRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraError] = useState(false);
  const [messageCount, setMessageCount] = useState(0);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [tabSwitchDetected, setTabSwitchDetected] = useState(false);
  const [lookAwayDetected, setLookAwayDetected] = useState(false);
  

  const errorFrameCountRef = useRef(0);
  const goodFrameCountRef = useRef(0);
  const cameraInstance = useRef(null);
  const faceMeshInstance = useRef(null);


  const ERROR_THRESHOLD = 30; // ~3 seconds at 10 fps
  const GOOD_THRESHOLD = 15;  // Faster recovery

  useEffect(() => {
    const startWebcam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (!stream?.active || !stream.getVideoTracks().length) {
          throw new Error("Webcam not available");
        }
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setupEyeTracking();
        }
      } catch (error) {
        console.error("Error accessing webcam:", error);
        setCameraError(true);
      }
    };
    startWebcam();

    return () => {
      // Clean up camera and face mesh
      if (cameraInstance.current) {
        cameraInstance.current.stop();
      }
      if (faceMeshInstance.current) {
        faceMeshInstance.current.close();
      }
      // Stop webcam stream
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Set up the eye tracking using MediaPipe
  const setupEyeTracking = () => {
    faceMeshInstance.current = new FaceMesh({
      locateFile: (file) =>
        `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMeshInstance.current.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMeshInstance.current.onResults(onResults);

    if (videoRef.current) {
      cameraInstance.current = new Camera(videoRef.current, {
        onFrame: async () => {
          if (faceMeshInstance.current) {
            await faceMeshInstance.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });
      cameraInstance.current.start();
    }
  };

  // Helper: Euclidean distance between two points
  const distance = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

  const onResults = (results) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
    

    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);


    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
      const landmarks = results.multiFaceLandmarks[0];


      const leftIris = landmarks[468];
      const rightIris = landmarks[473];
      const leftOuter = landmarks[33];
      const leftInner = landmarks[133];
      const rightInner = landmarks[263];
      const rightOuter = landmarks[362];

      const leftRatio = (leftIris.x - leftOuter.x) / (leftInner.x - leftOuter.x);
      const rightRatio = (rightInner.x - rightIris.x) / (rightInner.x - rightOuter.x);
      const irisCentered = leftRatio > 0.4 && leftRatio < 0.6 && rightRatio > 0.4 && rightRatio < 0.6;

      const leftVertical = distance(landmarks[159], landmarks[145]);
      const leftHorizontal = distance(landmarks[33], landmarks[133]);
      const earLeft = leftVertical / leftHorizontal;
      const rightVertical = distance(landmarks[386], landmarks[374]);
      const rightHorizontal = distance(landmarks[362], landmarks[263]);
      const earRight = rightVertical / rightHorizontal;
      const eyesOpen = earLeft > 0.25 && earRight > 0.25;


      const lookingStraight = irisCentered && eyesOpen;


      if (!lookingStraight) {
        errorFrameCountRef.current++;
        goodFrameCountRef.current = 0; 
      } else {
        goodFrameCountRef.current++;
        errorFrameCountRef.current = 0; 
      }

      if (errorFrameCountRef.current >= ERROR_THRESHOLD) {
        if (!lookAwayDetected) {
          setLookAwayDetected(true);
        }
      } else if (goodFrameCountRef.current >= GOOD_THRESHOLD) {
        if (lookAwayDetected) {
          setLookAwayDetected(false);
        }
      }
    } else {

      errorFrameCountRef.current++;
      goodFrameCountRef.current = 0;
      
      if (errorFrameCountRef.current >= ERROR_THRESHOLD && !lookAwayDetected) {
        setLookAwayDetected(true);
      }
    }
  };


  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchDetected(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  const handleMessageCountUpdate = (count) => {
    setMessageCount(count);
    if (count >= 3 && !interviewComplete) {
      setInterviewComplete(true);
    }
  };

  const handleCompleteInterview = async () => {
    try {
      const scores = await chatInterfaceRef.current.evaluatePerformance();
      
      // Stop webcam
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
      }
      
      if (onComplete) {
        onComplete(scores);
      }
    } catch (error) {
      console.error("Error completing interview:", error);
      if (onComplete) {
        onComplete({ 
          technicalSkills: 50, 
          softSkills: 50, 
          problemSolving: 50 
        });
      }
    }
  };


  const dismissTabSwitchWarning = () => {
    setTabSwitchDetected(false);
  };


  const dismissLookAwayWarning = () => {
    setLookAwayDetected(false);
    errorFrameCountRef.current = 0;
    goodFrameCountRef.current = 0;
  };

  return (
    <div className="flex flex-col h-screen bg-[#171717] overflow-hidden">
      {/* Tab Switch Warning */}
      {tabSwitchDetected && (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-md">
            <div className="flex items-center mb-4 text-red-500">
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold">Tab Switch Detected</h3>
            </div>
            <p className="text-white mb-4">
              You have switched away from the interview tab. For the integrity of the interview process, please stay on this page until the interview is complete.
            </p>
            <button
              onClick={dismissTabSwitchWarning}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
            >
              Return to Interview
            </button>
          </div>
        </div>
      )}

      {/* Look Away Warning */}
      {lookAwayDetected && (
        <div className="absolute inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-6">
          <div className="bg-[#2a2a2a] rounded-lg p-6 max-w-md">
            <div className="flex items-center mb-4 text-red-500">
              <svg className="w-6 h-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <h3 className="text-xl font-bold">Look at the camera properly!</h3>
            </div>
            <p className="text-white mb-4">
              Please face the camera directly for the interview. Looking away for extended periods is not allowed.
            </p>
            <button
              onClick={dismissLookAwayWarning}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-grow overflow-hidden">
        {/* Left Section - Webcam */}
        <div className="w-1/2 bg-black flex items-center justify-center relative">
          {cameraError ? (
            <p className="text-white text-xl">
              Error accessing camera. Please check your webcam settings.
            </p>
          ) : (
            <>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              <canvas
                ref={canvasRef}
                className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1] pointer-events-none"
              />
            </>
          )}
          {/* Interview status indicator */}
          <div className="absolute top-4 left-4 bg-[#1e1e1e] px-3 py-1 rounded-md border border-gray-700">
            <p className="text-white flex items-center">
              <span className={`inline-block w-3 h-3 rounded-full mr-2 ${messageCount > 0 ? "bg-green-500" : "bg-gray-500"}`}></span>
              Interview {messageCount > 0 ? "Active" : "Ready"}
            </p>
          </div>
        </div>

        {/* Right Section - Chat Interface */}
        <div className="w-1/2 overflow-hidden">
          <ChatInterface
            ref={chatInterfaceRef}
            domain={domain}
            resumeText={resumetext}
            onMessageCountUpdate={handleMessageCountUpdate}
          />
        </div>
      </div>

      {/* Complete Interview Button */}
      <div className="p-4 bg-[#1e1e1e] border-t border-gray-700 flex justify-center">
        <button
          onClick={handleCompleteInterview}
          disabled={!interviewComplete}
          className={`px-6 py-3 rounded-lg font-bold text-white ${
            interviewComplete
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 cursor-not-allowed opacity-50"
          } transition duration-300`}
        >
          {interviewComplete ? "Complete Interview" : "Answer More Questions to Complete"}
        </button>
      </div>
    </div>
  );
}