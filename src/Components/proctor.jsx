import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Proctor = ({ candidate }) => {
  const navigate = useNavigate();
  const [view, setView] = useState<'INSTRUCTIONS' | 'IFRAME' | 'FINISHED'>('INSTRUCTIONS');

  useEffect(() => {
    const handler = (event) => {
      if (event.data?.type === 'EXAM_FINISHED') {
        setView('FINISHED');
        if ((window).Proview?.session) {
          (window).Proview.session.stop();
        }
        navigate('/results', { state: event.data.payload, replace: true });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [navigate]);

 
  const handleStartExam = () => {
    if (candidate?.preferredMode === 'IFRAME') {
      setView('IFRAME');
    } else {
      navigate('/exam/1');
    }
  };

  return (
    <div style={styles.screenWrapper}>
      {view === 'INSTRUCTIONS' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Exam Instructions</h2>
          <div style={styles.divider} />
          <p style={styles.description}>
            The proctoring session has been initialized. Please read the following rules carefully:
          </p>
          <ul style={styles.list}>
            <li>Ensure your webcam is centered and your face is clearly visible.</li>
            <li>Maintain a stable internet connection throughout the exam.</li>
            <li>Do not refresh the page or navigate away from the exam tab.</li>
          </ul>

          <div style={styles.actionArea}>
            <button style={styles.button} onClick={handleStartExam}>
              I Understand, Start Exam
            </button>
          </div>
        </div>
      )}

      {view === 'IFRAME' && (
        <iframe 
          src="#/exam/1" 
          style={styles.iframe} 
          title="Exam" 
          allow="camera;microphone;fullscreen"
        />
      )}

      {view === 'FINISHED' && (
        <div style={styles.card}>
          <h2 style={{ ...styles.cardTitle, textAlign: 'center' }}>Submitting Exam...</h2>
          <p style={{ textAlign: 'center', color: '#666' }}>Please do not close this window.</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  screenWrapper: {
    width: '90%',
    height: '90vh',
    backgroundColor: '#EAF2FF',
    display: 'flex',         
    justifyContent: 'center',
    alignItems: 'center',     
    padding: '20px',
    boxSizing: 'border-box',
  },
  card: {
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '12px',
    boxShadow: '0 8px 30px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '600px',
    textAlign: 'left',
  },
  cardTitle: {
    fontSize: '24px',
    color: '#1E2F47',
    margin: '0 0 10px 0',
    fontWeight: 'bold',
  },
  divider: {
    height: '2px',
    backgroundColor: '#EAF2FF',
    width: '100%',
    marginBottom: '20px',
  },
  description: {
    color: '#555',
    marginBottom: '15px',
    fontSize: '16px',
  },
  list: {
    lineHeight: '2',
    color: '#444',
    paddingLeft: '20px',
    marginBottom: '30px',
  },
  actionArea: {
    borderTop: '1px solid #eee',
    paddingTop: '30px',
    display: 'flex',
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#084fe9',
    color: '#ffffff',
    padding: '14px 40px',
    fontSize: '16px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  },
  iframe: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100vh',
    border: 'none',
  }
};

export default Proctor;



 