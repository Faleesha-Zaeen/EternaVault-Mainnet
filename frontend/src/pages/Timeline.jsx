import React, { useEffect, useState } from 'react';

function groupByDate(files) {
  const groups = {};
  files.forEach((f) => {
    const date = (f.meta?.timestamp || f.timestamp || '').slice(0, 10) || 'Unknown';
    if (!groups[date]) groups[date] = [];
    groups[date].push(f);
  });
  return groups;
}

function buildSummary(date, files) {
  const count = files.length;
  const examples = files.slice(0, 2).map((f) => f.meta?.originalName || 'a file');
  const exampleText = examples.join(' and ');
  return `${date}: You preserved ${count} memory${count !== 1 ? 'ies' : ''}, including ${exampleText}.`;
  // TODO: Replace with real LLM summarisation (e.g., call GPT/QIE AI service)
}

function Timeline() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [anchoring, setAnchoring] = useState({});

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch('/api/files?did=demo-owner');
        const data = await res.json();
        setFiles(data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  const anchorFile = async (fileId) => {
    try {
      setAnchoring((s) => ({ ...s, [fileId]: true }));
      const res = await fetch('/api/anchor-cid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId }),
      });
      const data = await res.json();
      if (data.ok) {
        setFiles((f) => f.map((item) => (item.id === fileId ? { ...item, anchored: true, anchorTxHash: data.txHash } : item)));
      } else {
        alert(`Anchor failed: ${data.message || data.error}`);
      }
    } catch (err) {
      console.error(err);
      alert('Anchor failed — see console for details');
    } finally {
      setAnchoring((s) => ({ ...s, [fileId]: false }));
    }
  };

  if (loading) return <p>Loading vault timeline...</p>;

  const groups = groupByDate(files);

  return (
    <section className="min-h-screen w-full max-w-5xl mx-auto bg-[#0d0e11] text-slate-100 font-['Inter'] px-4 py-10 sm:px-10 space-y-6">
      <h2 className="text-3xl font-['Playfair_Display'] text-[#C4A87C] tracking-[0.08em]">Vault Timeline (demo)</h2>
      {Object.keys(groups).length === 0 && (
        <p className="text-sm text-[#8A8F99]">No files uploaded yet for this DID.</p>
      )}
      <div className="space-y-4 mt-2">
        {Object.entries(groups).map(([date, group]) => (
          <div
            key={date}
            className="border border-white/5 rounded-2xl p-5 bg-[#111317] shadow-[0_4px_20px_rgba(0,0,0,0.35)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_18px_#C4A87C33]"
          >
            <div className="flex items-baseline justify-between gap-3 mb-3">
              <p className="text-sm font-semibold text-[#C4A87C] tracking-wide">{date}</p>
              <span className="text-xs text-[#8A8F99] uppercase tracking-[0.3em]">Memories</span>
            </div>
            <p className="text-sm text-[#8A8F99] mb-4 leading-relaxed">{buildSummary(date, group)}</p>
            <ul className="text-sm text-[#8A8F99] space-y-4">
              {group.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-6 border border-white/5 rounded-xl p-4 bg-[#0f1115] shadow-[0_2px_12px_rgba(0,0,0,0.35)]"
                >
                  <div className="space-y-1">
                    <div className="font-['Playfair_Display'] text-base text-white">{f.meta?.originalName || 'Encrypted file'}</div>
                    <div className="text-xs text-[#6c707a]">ID: {f.id}</div>
                    {f.cid && <div className="text-xs text-[#6c707a]">CID: {f.cid}</div>}
                    {f.anchored && f.anchorTxHash && (
                      <div className="space-y-1">
                        <div className="text-xs text-emerald-300">Anchored on QIE ✅</div>
                        <a
                          href={`https://mainnet.qie.digital/tx/${f.anchorTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-300 underline text-xs"
                        >
                          View on Explorer
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    {!f.anchored && f.cid && (
                      <button
                        className="px-4 py-2 rounded-md bg-[#6aa4ff] text-[#0d0e11] text-xs font-semibold shadow-lg shadow-[#6aa4ff26] hover:bg-[#82b4ff] transition-all duration-300 hover:-translate-y-1"
                        disabled={!!anchoring[f.id]}
                        onClick={() => anchorFile(f.id)}
                      >
                        {anchoring[f.id] ? 'Anchoring…' : 'Anchor on QIE'}
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Timeline;
