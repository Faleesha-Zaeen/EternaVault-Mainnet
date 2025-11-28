import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Landing from './pages/Landing.jsx';
import Upload from './pages/Upload.jsx';
import Timeline from './pages/Timeline.jsx';
import HeirDashboard from './pages/HeirDashboard.jsx';
import ValidatorDashboard from './pages/ValidatorDashboard.jsx';

function App() {
  console.log("WEB3 KEY:", import.meta.env.VITE_WEB3_STORAGE_KEY);
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold text-lg tracking-tight">
            EternaVault
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link to="/" className="hover:text-emerald-300">Home</Link>
            <Link to="/upload" className="hover:text-emerald-300">Upload</Link>
            <Link to="/timeline" className="hover:text-emerald-300">Timeline</Link>
            <Link to="/heir" className="hover:text-emerald-300">Heir</Link>
            <Link to="/validator" className="hover:text-emerald-300">Validator</Link>
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
        </Routes>
      </main>
      <footer className="border-t border-slate-800 text-xs text-slate-400 py-4 text-center">
        Prototype for QIE Hackathon – Not legal advice or production-ready.
      </footer>
    </div>
  );
}

export default App;
