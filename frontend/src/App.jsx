import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Upload from './pages/Upload.jsx';
import Timeline from './pages/Timeline.jsx';
import HeirDashboard from './pages/HeirDashboard.jsx';
import ValidatorDashboard from './pages/ValidatorDashboard.jsx';
import TokenizationInfo from './pages/TokenizationInfo.jsx';

function App() {
  console.log("WEB3 KEY:", import.meta.env.VITE_WEB3_STORAGE_KEY);
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0e11] text-slate-100 font-['Inter']">
      <header className="border-b border-white/5 bg-[#0d0e11]/90 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-['Playfair_Display'] text-xl text-[#C4A87C] tracking-[0.08em]">
            EternaVault
          </Link>
          <nav className="flex gap-4 text-sm text-[#8A8F99]">
            <Link to="/" className="transition hover:text-[#6aa4ff]">Home</Link>
            <Link to="/upload" className="transition hover:text-[#6aa4ff]">Upload</Link>
            <Link to="/timeline" className="transition hover:text-[#6aa4ff]">Timeline</Link>
            <Link to="/heir" className="transition hover:text-[#6aa4ff]">Heir</Link>
            <Link to="/validator" className="transition hover:text-[#6aa4ff]">Validator</Link>
            <Link to="/tokenization" className="transition hover:text-[#6aa4ff]">Tokenization (DLT)</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/heir" element={<HeirDashboard />} />
            <Route path="/validator" element={<ValidatorDashboard />} />
            <Route path="/tokenization" element={<TokenizationInfo />} />
        </Routes>
      </main>
      <footer className="border-t border-white/5 text-xs text-[#8A8F99] py-4 text-center">
        Prototype for QIE Hackathon – Not legal advice or production-ready.
      </footer>
    </div>
  );
}

export default App;
