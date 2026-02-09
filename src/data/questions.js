export const quizQuestions = [
  {
    id: 1,
    type: 'single',
    question: 'What is the capital of France?',
    options: [
      { id: 'a', text: 'London' },
      { id: 'b', text: 'Berlin' },
      { id: 'c', text: 'Paris' },
      { id: 'd', text: 'Madrid' }
    ],
    correctAnswer: 'c'
  },
  {
    id: 2,
    type: 'oral',
    question: 'Please state what is database , and its types.',
    options: [],
    correctAnswer: null
  },
  {
    id: 3,
    type: 'multiple',
    question: 'Which of the following are programming languages? (Select all that apply)',
    options: [
      { id: 'a', text: 'Python' },
      { id: 'b', text: 'HTML' },
      { id: 'c', text: 'JavaScript' },
      { id: 'd', text: 'CSS' }
    ],
    correctAnswer: ['a', 'c']
  },
  {
    id: 4,
    type: 'single',
    question: 'What does CPU stand for?',
    options: [
      { id: 'a', text: 'Central Processing Unit' },
      { id: 'b', text: 'Computer Personal Unit' },
      { id: 'c', text: 'Central Process Utility' },
      { id: 'd', text: 'Central Processor Universal' }
    ],
    correctAnswer: 'a'
  },
  {
    id: 5,
    type: 'single',
    question: 'Which planet is known as the Red Planet?',
    options: [
      { id: 'a', text: 'Venus' },
      { id: 'b', text: 'Mars' },
      { id: 'c', text: 'Jupiter' },
      { id: 'd', text: 'Saturn' }
    ],
    correctAnswer: 'b'
  }
];

export const quizConfig = {
  title: 'Knowledge Assessment',
  description: 'Test your knowledge across various topics',
  duration: 30, 
  passingScore: 60, 
  totalQuestions: quizQuestions.length 
};