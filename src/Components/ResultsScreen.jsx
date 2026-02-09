import React from 'react';
import { useLocation } from 'react-router-dom';
import { quizQuestions, quizConfig } from '../data/questions';

const ResultScreen = () => {
  const location = useLocation();
  const { answers, candidate } = location.state || {};

  if (!answers || !candidate) {
    return (
      <div className="exam-page">
        <div className="card" style={{ textAlign: 'center' }}>
          <h1>No Results Found</h1>
          <p>We couldn't find your exam data. Please contact support.</p>
        </div>
      </div>
    );
  }


  const checkAnswer = (userAns, correctAns)=> {
   
    if (!Array.isArray(userAns)) {
      return userAns === correctAns;
    }

   
    if (Array.isArray(userAns) && Array.isArray(correctAns)) {
      if (userAns.length !== correctAns.length) return false;

   
      const sortedUser = [...userAns].sort();
      const sortedCorrect = [...correctAns].sort();

      return sortedUser.every((val, index) => val === sortedCorrect[index]);
    }

    return false;
  };

  let score = 0;
  const scorableQuestions = quizQuestions.filter(q => q.type !== 'oral');

  scorableQuestions.forEach(q => {

    const userAnswer = answers[q.id] !== undefined ? answers[q.id] : answers[q.id.toString()];
    
    if (userAnswer !== undefined) {
      if (checkAnswer(userAnswer, q.correctAnswer)) {
        score++;
      }
    }
  });

  const percentage = scorableQuestions.length === 0
    ? 0
    : Math.round((score / scorableQuestions.length) * 100);

  const isPassed = percentage >= quizConfig.passingScore;

  return (
    <div className="exam-page">
      <div className="card">
        <h1>Final Result</h1>
        
        <div style={styles.infoSection}>
          <p><strong>Candidate Name:</strong> {candidate.name}</p>
          <p><strong>Candidate ID:</strong> {candidate.candidateId}</p>
          <p><strong>Exam ID:</strong> {candidate.examId}</p>
        </div>

        <hr style={styles.divider} />

        <div style={styles.scoreSection}>
          <p style={styles.scoreText}>
            Your Score: <span style={{ color: '#084fe9' }}>{percentage}%</span>
          </p>
          <p style={{ 
            fontSize: '1.5rem', 
            fontWeight: 'bold', 
            color: isPassed ? '#2e7d32' : '#d32f2f' 
          }}>
            {isPassed ? 'PASSED' : 'FAILED'}
          </p>
        </div>

        <p style={styles.footerText}>
          {isPassed 
            ? "Congratulations! You have successfully cleared the assessment." 
            : "Unfortunately, you did not meet the passing criteria this time."}
        </p>
      </div>
    </div>
  );
};

const styles = {
  infoSection: { textAlign: 'left' , margin: '20px 0', lineHeight: '1.6' },
  scoreSection: { margin: '30px 0', textAlign: 'left' },
  scoreText: { fontSize: '1.8rem', fontWeight: 600, marginBottom: '10px' },
  divider: { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' },
  footerText: { color: '#666', marginBottom: '30px' },
};

export default ResultScreen;
