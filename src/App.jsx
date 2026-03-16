import Chatbot from './components/Chatbot';
import Interviewer from './components/Interviewer';
import { Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Chatbot />} />
      <Route path="/interview" element={<Interviewer />} />
      {/* 
        Add more routes below to expose other components:
        <Route path="/about" element={<AboutPage />} /> 
      */}
      <Route path="*" element={<Chatbot />} />
    </Routes>
  );
}

export default App;
