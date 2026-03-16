import Chatbot from './components/Chatbot';
import Interviewer from './components/Interviewer';
import Helmet from './components/Helmet';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chatbot />} />
      <Route path="/interview" element={<><Helmet title="Technical Interviewer" favicon="/quiz.png" description="Technical Interviewer" /><Interviewer /></>} />
      {/* 
        Add more routes below to expose other components:
        <Route path="/about" element={<AboutPage />} /> 
      */}
      <Route path="*" element={<Chatbot />} />
    </Routes>
  );
}

export default App;
