import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import WelcomeScreen from './Components/WelcomeScreen';
import ExamScreen from './Components/ExamScreen';
import Proctor from './Components/proctor';
import ResultScreen from './Components/ResultsScreen';

const App = () => {
  // Initialize state from localStorage to persist candidate data on refresh
  const [candidate, setCandidate] = useState(() => {
    const saved = localStorage.getItem('candidate');
    return saved ? JSON.parse(saved) : null;
  });

  // Handler to save candidate info and update state
  const handleStartExam = (data) => {
    localStorage.setItem('candidate', JSON.stringify(data));
    setCandidate(data);
  };

  return (
    <Router>
      <Routes>
        {/* Registration / Welcome Screen */}
        <Route
          path="/"
          element={<WelcomeScreen onStartExam={handleStartExam} />}
        />

        {/* Secure Exam Interface */}
        <Route
          path="/exam/:questionId"
          element={
            candidate ? (
              <ExamScreen candidate={candidate} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Proctoring Initialization Screen */}
        <Route 
          path="/proctor"
          element={
            candidate ? (
              <Proctor candidate={candidate} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

      
        <Route
          path="/results"
          element={
            candidate ? (
              <ResultScreen  />
            ) : (
              <Navigate to="/" />
            )
          }
        />

     
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;