import React, { useState, useEffect, useRef } from 'react';
import { quizQuestions, quizConfig } from '../data/questions';
import ResultScreen from './ResultsScreen';
import { useNavigate } from 'react-router-dom';

const ExamScreen = ({ candidate }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(quizConfig.duration * 60);
  const [submitted, setSubmitted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const navigate = useNavigate();
  const currentQuestion = quizQuestions[currentIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          confirmSubmit()
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleChange = (optionId) => {
    if (currentQuestion.type === 'single') {
      setAnswers({ ...answers, [currentQuestion.id]: optionId });
    } else {
      const prev = answers[currentQuestion.id] || [];
      const updated = prev.includes(optionId)
        ? prev.filter((o) => o !== optionId)
        : [...prev, optionId];
      setAnswers({ ...answers, [currentQuestion.id]: updated });
    }
  };

  const toggleMarkForReview = (questionId) => {
    setMarkedForReview((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.play();
    }
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = url;
        videoRef.current.muted = false;
        videoRef.current.controls = true;
      }
      stream.getTracks().forEach((track) => track.stop());
      setAnswers((prev) => ({ ...prev, [currentQuestion.id]: blob }));
      setIsRecording(false);
    };
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
  };

  const handleNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < quizQuestions.length) {
      setCurrentIndex(nextIndex);
      navigate(`/exam/${nextIndex + 1}`);
    }
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setCurrentIndex(prevIndex);
      navigate(`/exam/${prevIndex + 1}`);
    }
  };
  const stopProviewSession=()=>{
    window.Proview.session.stop();
  }

  const handleSubmit = () => setShowSummary(true);

  const confirmSubmit = () => {
   
     if (submitted) return;

  setSubmitted(true);
   window.parent.postMessage({ type: 'EXAM_FINISHED',
      payload: {
        answers,
        candidate,
      },
   }, '*')
  
    
  
  
   localStorage.removeItem(`exam_state+${candidate.candidateId}`);
   localStorage.removeItem('candidate');
 
  localStorage.removeItem('answers');

  if (window.self === window.top) {
      navigate('/results', { state: { answers, candidate }, replace: true });
      stopProviewSession();
      
    }
 
 
  // navigate('/results',{replace:true});
  


  };

  // if (submitted) return <ResultScreen answers={answers} candidate={candidate} />;

  // Summary Page View
  if (showSummary) {
    return (
      <div className="min-h-screen bg-[#EAF2FF] py-[24px] px-[16px] font-sans flex flex-col items-center">
        <div className="w-full max-w-[500px] bg-white p-[30px] rounded-[10px] shadow-[0_0_15px_rgba(0,0,0,0.1)] text-center">
          <h1 className="text-[24px] font-bold mb-6">Exam Summary</h1>
          <div className="text-[18px] mb-8 space-y-2">
            <p>Answered: {quizQuestions.filter((q) => answers[q.id]).length}</p>
            <p>Marked for Review: {quizQuestions.filter((q) => markedForReview[q.id]).length}</p>
            <p>Remaining: {quizQuestions.length - quizQuestions.filter((q) => answers[q.id]).length}</p>
          </div>
          <div className="flex justify-between">
            <button onClick={() => setShowSummary(false)} className="px-4 py-2 bg-gray-200 rounded-md">Go Back</button>
            <button onClick={confirmSubmit} className="bg-[#084fe9] p-[8px] text-[#fff] rounded-[3px] font-bold">Confirm & Submit</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    
    <div className="min-h-screen bg-[#EAF2FF] py-[24px] px-[16px] font-sans">
      
      {/* .welcome-container (Flex column container) */}
      <div className="max-w-[900px] mx-auto flex flex-col gap-[20px]">
        
    
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-[28px] font-bold">{quizConfig.title}</h1>
 
          <div className="bg-[#bbccf8] text-white px-[16px] py-[10px] rounded-[8px] font-bold text-[16px]">
            {formatTime(timeLeft)}
          </div>
        </div>

  
        <div className="flex justify-center items-center flex-wrap gap-[10px] my-[20px]">
          {quizQuestions.map((q, index) => {
            const answered = !!answers[q.id];
            const review = markedForReview[q.id];
            return (
              <button
                key={q.id}
                onClick={() => {
                  setCurrentIndex(index);
                  navigate(`/exam/${index + 1}`);
                }}
                /* .nav-btn styles */
                className={`w-[40px] h-[40px] rounded-full  transition-all
                  ${review ? 'bg-[#f3970d] text-white' : answered ? 'bg-[#4caf50] text-white' : 'bg-[#f44336] text-white'}
                  ${currentIndex === index ? 'ring-2 ring-black-400' : ''}`}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

   
        <div className="flex justify-center">
          
          <div className="bg-[#fff] p-[24px] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full max-w-[900px]">
            <div className="mb-4">
              <p><strong>Candidate:</strong> {candidate?.name}</p>
              <p className="text-gray-500 text-sm">Question {currentIndex + 1} of {quizQuestions.length}</p>
            </div>

            <h2 className="text-[20px] font-bold mb-6">{currentQuestion.question}</h2>

            {currentQuestion.type === 'oral' ? (
            
              <div className="flex flex-col items-center gap-[10px] my-6">
                <video ref={videoRef} className="w-full max-w-[640px] h-[360px] bg-black rounded-[6px] object-cover" />
                {!isRecording ? (
                  <button onClick={startRecording} className="bg-[#16a34a] text-white px-[16px] py-[10px] rounded-[6px] font-bold">Start Recording</button>
                ) : (
                  <button onClick={stopRecording} className="bg-[#dc2626] text-white px-[16px] py-[10px] rounded-[6px] font-bold">Stop Recording</button>
                )}
              </div>
            ) : (
           
              <div className="flex flex-col gap-[10px] mt-[16px] mb-8">
                {currentQuestion.options.map((option) => (
          
                  <label key={option.id} className="flex gap-[8px] items-center text-[#1E2F47] cursor-pointer p-2 hover:bg-gray-50 rounded">
                    <input
                      type={currentQuestion.type === 'single' ? 'radio' : 'checkbox'}
                      className="accent-[#084fe9]"
                      checked={currentQuestion.type === 'single' ? answers[currentQuestion.id] === option.id : answers[currentQuestion.id]?.includes(option.id)}
                      onChange={() => handleChange(option.id)}
                    />
                    {option.text}
                  </label>
                ))}
              </div>
            )}

           
            <div className="mt-[10px]">
              <button 
                onClick={() => toggleMarkForReview(currentQuestion.id)}
                className="bg-[#cdcd32] text-white min-w-[120px] p-[8px] rounded-[3px] text-sm"
              >
                {markedForReview[currentQuestion.id] ? 'Unmark Review' : 'Mark for Review'}
              </button>
            </div>

           
            <div className="flex justify-between gap-[20px] mt-[30px]">
              <button 
                disabled={currentIndex === 0} 
                onClick={handlePrevious}
                className="min-w-[120px] p-[10px_16px] rounded-[6px] bg-[blue] text-[#fff] disabled:bg-[#112d5d] disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {currentIndex < quizQuestions.length - 1 ? (
                <button 
                  onClick={handleNext}
                  className="min-w-[120px] p-[10px_16px] rounded-[6px] bg-[#084fe9] text-[#fff]"
                >
                  Next
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="min-w-[120px] p-[10px_16px] rounded-[6px] bg-[#084fe9] text-[#fff] font-bold"
                >
                  Submit Exam
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamScreen;