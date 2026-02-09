import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import { quizConfig } from '../data/questions';
import mixpanel from 'mixpanel-browser';
import * as Sentry from "@sentry/react";
 mixpanel.init('6071bda40c5828feef3ff2b83fa4a97b', {
    autocapture: true,
    record_sessions_percent: 100,
  debug:true,
  
  track_pageview: true,
  persistence: "localStorage",

  record_heatmap_data: true,
  
  })

const WelcomeScreen = ({ onStartExam }) => {
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(null); // Track specific mode loading
  const navigate = useNavigate();
  const [candidateID, setCandidateId] = useState('');
  const [ExamID, setExamId] = useState('');

  const waitForProview = () =>
    new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject('Proview not loaded in 5s'), 5000);
      const interval = setInterval(() => {
        if (window.Proview) {
          clearTimeout(timeout);
          clearInterval(interval);
          resolve(window.Proview);
        }
      }, 300);
    });

  const handleStartExam = async (mode) => { // Captured 'mode' here
    if (!candidateName.trim()) return alert('Enter name');

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!candidateEmail.trim()) {
      alert('Enter email');
      return;
    }
    if (!emailRegex.test(candidateEmail)) {
      alert('Enter a valid email address');
      return;
    }
    if (!candidateID.trim()) {
      alert('Enter Candidate ID/Roll Number');
      return;
    }
    if (!ExamID.trim()) {
      alert('Enter Exam ID/Code');
      return;
    }

    if (!agreedToTerms) return alert('Accept terms');
    setIsLoading(mode); // Set loading to the current mode (e.g., 'IFRAME')

    try {
      const attendeeId = `att_${Date.now()}`;
      const candidate = {
        name: candidateName,
        email: candidateEmail,
        candidateId: candidateID || attendeeId,
        examId: ExamID,
        preferredMode: mode 
      };
      mixpanel.identify(candidate.candidateId);

     
      mixpanel.people.set({
        '$name': candidate.name,
        '$email': candidate.email,
        'Exam ID': candidate.examId,
        'Preferred Mode': mode,
        'Last Login': new Date().toISOString()
      });

     
      mixpanel.track('Exam Started', {
        'Exam ID': candidate.examId,
        'Mode': mode
      });

      const ProviewSDK = await waitForProview();
      if (!ProviewSDK) 
        throw new Error('Proview unavailable');
      Sentry.captureMessage('Proview SDK is initialised');
      Sentry.setUser({ id: candidate.candidateId, email: candidate.email, username: candidate.name });
      Sentry.addBreadcrumb
({
  category: 'proctoring',
  message: 'Proview SDK initialized for candidate',

});

Sentry.addIntegration({
  name: 'ProviewIntegration',
  setupOnce: (addGlobalEventProcessor, getCurrentHub) => {
    addGlobalEventProcessor((event) => {
      const hub = getCurrentHub();
      const self = hub.getIntegration('ProviewIntegration');
      if (self) {
        event.extra = { ...event.extra, proctoring: 'Proview SDK initialized' };
      }
      return event;
    });
  },
});

      const dsns = import.meta.env.dsn;
      
      const success = await ProviewSDK.init({
        dsn: dsns,
        attendee_identifier: candidate.candidateId,
        workflow_identifier: "wft001",
      });

      if (!success) throw new Error('Proview init failed');

      ProviewSDK.setAttendee({
        email: candidateEmail,
        identifier: candidateID,
      });

      ProviewSDK.session.start((output, err) => {
        if (err) {
          alert('Proctoring failed');
          setIsLoading(null);
          return;
        }
        onStartExam(candidate);
        navigate('/proctor');
      });
    } catch (err) {
      console.error('[App] Proview failed:', err);
      alert('Unable to start proctoring');
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAF2FF] py-[24px] px-[16px] font-sans">
      <div className="max-w-[900px] mx-auto flex flex-col gap-[20px]">
        <h1 className="text-[32px] font-bold mx-auto text-[#1E2F47]">{quizConfig.title}</h1>
        <p className="text-[#1E2F47] text-left mb-[8px]">{quizConfig.description}</p>
        
        <div className="bg-[#fff] p-[24px] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full">
          <h2 className="text-xl font-bold mb-3 text-[#1E2F47]">Exam Details</h2>
          <ul className="list-disc ml-5 space-y-1 text-[#1E2F47]">
            <li>{quizConfig.totalQuestions} Questions</li>
            <li>30 Minutes</li>
            <li>Proctored Exam</li>
            <li>{quizConfig.passingScore}% to Pass</li>
          </ul>
        </div>

        <div className="bg-[#fff] p-[24px] rounded-[8px] shadow-[0_4px_12px_rgba(0,0,0,0.05)] w-full">
          <h2 className="text-xl font-bold mb-4 text-[#1E2F47]">Before You Begin</h2>
          
          <div className="flex flex-col mb-[16px]">
            <label className="text-[14px] mb-[6px] font-semibold">Full Name *</label>
            <input 
              className="p-[10px] text-[14px] rounded-[4px] border border-[#ccc]" 
              value={candidateName} 
              onChange={(e) => setCandidateName(e.target.value)} 
            />
          </div>

          <div className="flex flex-col mb-[16px]">
            <label className="text-[14px] mb-[6px] font-semibold">Candidate ID/Roll Number *</label>
            <input 
              className="p-[10px] text-[14px] rounded-[4px] border border-[#ccc]" 
              value={candidateID} 
              onChange={(e) => setCandidateId(e.target.value)} 
            />
          </div>

          <div className="flex flex-col mb-[16px]">
            <label className="text-[14px] mb-[6px] font-semibold">Exam ID/Code *</label>
            <input 
              className="p-[10px] text-[14px] rounded-[4px] border border-[#ccc]" 
              value={ExamID} 
              onChange={(e) => setExamId(e.target.value)} 
            />
          </div>

          <div className="flex flex-col mb-[16px]">
            <label className="text-[14px] mb-[6px] font-semibold">Email *</label>
            <input 
              type="email"
              className="p-[10px] text-[14px] rounded-[4px] border border-[#ccc]" 
              value={candidateEmail} 
              onChange={(e) => setCandidateEmail(e.target.value)} 
            />
          </div>

          <div className="flex gap-[10px] items-start mb-[20px] text-[14px]">
            <input 
              type="checkbox" 
              checked={agreedToTerms} 
              onChange={(e) => setAgreedToTerms(e.target.checked)} 
            />
            <span className="text-[#1E2F47]">I agree to proctoring terms and conditions</span>
          </div>

          <div className="flex gap-[10px] mt-4">
            <button 
              className={`flex-1 py-[12px] px-[20px] text-[16px] font-bold text-[#fff] rounded-[6px] transition-all bg-[#084fe9] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#063db5]'}`}
              onClick={() => handleStartExam('IFRAME')} 
              disabled={!!isLoading}
            >
              {isLoading === 'IFRAME' ? 'Starting...' : 'Start Exam (Iframe Mode)'}
            </button>

            <button 
              className={`flex-1 py-[12px] px-[20px] text-[16px] font-bold text-[#fff] rounded-[6px] transition-all bg-[#053ab8] ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#042d8d]'}`}
              onClick={() => handleStartExam('EMBEDDED')} 
              disabled={!!isLoading}
            >
              {isLoading === 'EMBEDDED' ? 'Starting...' : 'Start Exam (Embedded Mode)'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeScreen;
  
