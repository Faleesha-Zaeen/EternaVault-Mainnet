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
                <li key={f.id}>
                  {f.meta?.originalName || 'Encrypted file'} ({f.id})
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
