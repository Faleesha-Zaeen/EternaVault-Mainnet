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
    <section>
      <h2 className="text-2xl font-semibold mb-4">Vault Timeline (demo)</h2>
      {Object.keys(groups).length === 0 && (
        <p className="text-sm text-slate-400">No files uploaded yet for this DID.</p>
      )}
      <div className="space-y-4 mt-4">
        {Object.entries(groups).map(([date, group]) => (
          <div
            key={date}
            className="border border-slate-800 rounded-lg p-4 bg-slate-900/60"
          >
            <p className="text-sm text-emerald-300 mb-1">{buildSummary(date, group)}</p>
            <ul className="text-xs text-slate-300 list-disc list-inside">
              {group.map((f) => (
                <li key={f.id} className="flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium">{f.meta?.originalName || 'Encrypted file'}</div>
                    <div className="text-xs text-slate-400">ID: {f.id}</div>
                    {f.cid && <div className="text-xs text-slate-400">CID: {f.cid}</div>}
                    {f.anchored && f.anchorTxHash && (
                      <div>
                        <div className="text-xs text-emerald-300">Anchored on QIE ✅</div>
                        <a
                          href={`https://testnet.qie.digital/tx/${f.anchorTxHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-400 underline text-sm"
                        >
                          View on Explorer
                        </a>
                      </div>
                    )}
                  </div>
                  <div>
                    {!f.anchored && f.cid && (
                      <button
                        className="px-3 py-1 bg-emerald-600 text-xs rounded-md"
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
