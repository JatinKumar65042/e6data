import React, { useState, useMemo } from "react";

/* ---------- Icons (unchanged) ---------- */
const UploadCloudIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
  </svg>
);
const FileIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
  </svg>
);
const ChevronDownIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6"/>
  </svg>
);
const RocketIcon = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05A7.49 7.49 0 0 0 5.21 7.21a7.49 7.49 0 0 0-2.22 2.22c-.75.75-2.21.76-3.05.05z"/><path d="m12 15-3-3a7.49 7.49 0 0 1 2.22-2.22A7.49 7.49 0 0 1 14.26 7.5l-3 3"/>
    <path d="M15 12 9 6"/><path d="m22 2-3 1-1 3-3.5-2-1.5 4-2-1.5-2 4-1.5-2-2 4 4-2 4-2 3-1 1-3Z"/>
  </svg>
);

/* ---------- Helper utilities ---------- */
const normalizeLabel = (desc) => {
  // remove "Approximate", "(10% Sample)", "(20% Sample)", "Approx SUM" noise etc.
  let s = desc.replace(/\bApproximate\b/gi, "")
              .replace(/\bApprox\b/gi, "")
              .replace(/\(\d+%.*?\)/gi, "")
              .replace(/SAMPLE\s*\d+%/gi, "")
              .replace(/\b\(Exact\)\b/gi, "")
              .replace(/\bApproximate\b/gi, "")
              .replace(/[-_]/g, " ")
              .trim();
  // squash spaces
  s = s.replace(/\s+/g, " ");
  return s;
};

const parseNumber = (str) => {
  if (str === null || str === undefined) return NaN;
  // try to parse float, tolerate commas
  const num = parseFloat(String(str).replace(/,/g, ""));
  return Number.isFinite(num) ? num : NaN;
};

/* ---------- Main component ---------- */
export default function App() {
  // form / upload state
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [messageType, setMessageType] = useState("info");
  const [processing, setProcessing] = useState(false);

  const [method, setMethod] = useState("sum");       // default key
  const [precision, setPrecision] = useState("exact"); // "exact" or "approx"


  // server output
  const [output, setOutput] = useState(null);

  /* ---------- Upload handlers (unchanged except set state flags) ---------- */
  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    const allowedTypes = ["text/csv", "application/json", "text/plain"];
    if (allowedTypes.includes(selectedFile.type) || selectedFile.name.match(/\.(csv|json|txt)$/i)) {
      setFile(selectedFile);
      setStatusMessage("");
      setMessageType("info");
    } else {
      setFile(null);
      setMessageType("error");
      setStatusMessage("Invalid file type. Upload CSV / JSON / TXT.");
    }
  };
  const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
  const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
  const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
  const handleDrop = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); if (e.dataTransfer.files[0]) handleFileChange(e.dataTransfer.files[0]); };

  /* ---------- Submit: POST file to server and show output panel ---------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessageType("error");
      setStatusMessage("Please upload a file before processing.");
      return;
    }
    setProcessing(true);
    setMessageType("info");
    setStatusMessage(`Uploading ${file.name}...`);
    setOutput(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("method", method);
      fd.append("precision", precision);

      const resp = await fetch("http://localhost:4000/api/process", { method: "POST", body: fd });
      const json = await resp.json();
      if (!resp.ok || !json.success) {
        setMessageType("error");
        setStatusMessage(json.error || "Processing failed on server.");
        setProcessing(false);
        return;
      }
      setOutput(json.data);
      console.log(output) ; 
      setMessageType("info");
      setStatusMessage("Processing finished.");
      // select first group automatically
      setProcessing(false);
    } catch (err) {
      setMessageType("error");
      setStatusMessage("Network/server error: " + err.message);
      setProcessing(false);
    }
  };

  /* ---------- Group Options ---------- */
  const groupedOptions = useMemo(() => {
    if (!output || !output.queries) return [];
    const map = new Map();
    output.queries.forEach((q, idx) => {
      const base = normalizeLabel(q.description);
      const entry = map.get(base) || { label: base, exactIdx: null, approxIdx: null };
      const isApprox = !!(q.result && q.result.approximate) || /Approx/i.test(q.description);
      if (isApprox) entry.approxIdx = idx;
      else entry.exactIdx = idx;
      map.set(base, entry);
    });
    return Array.from(map.values());
  }, [output]);

  const groupQueries = (queries) => {
    const groups = {};
    queries.forEach((q, idx) => {
      // Example: "Total Sum of 'value' (Exact)" -> key = "Total Sum of 'value'"
      const baseName = q.description.replace(/\s*\(Exact\)|\s*\(Approx.*?\)/gi, '').trim();
      if (!groups[baseName]) {
        groups[baseName] = { label: baseName, exactIdx: null, approxIdx: null };
      }
      if (/exact/i.test(q.description)) groups[baseName].exactIdx = idx;
      else groups[baseName].approxIdx = idx;
    });
    return Object.values(groups);
  };
  

  const buildComparisonForGroup = (group) => {
    if (!output) return { headers: [], rows: [] };
  
    const exact = group.exactIdx !== null ? output.queries[group.exactIdx] : null;
    const approx = group.approxIdx !== null ? output.queries[group.approxIdx] : null;
  
    const getCols = (q) => q?.result?.columns || [];
    const getRows = (q) => q?.result?.rows || [];
  
    const exactCols = getCols(exact);
    const approxCols = getCols(approx);
    const exactRows = getRows(exact);
    const approxRows = getRows(approx);
  
    const exactTime = exact?.executionTimeMs ?? null;
    const approxTime = approx?.executionTimeMs ?? null;
  
    const isGroupBy = (exactRows.length > 1 || approxRows.length > 1);
  
    if (isGroupBy) {
      // ✅ GROUP BY logic (already working fine)
      const groupKeyIndex = 0;
      const exactKeyToRow = new Map();
      exactRows.forEach((r) => exactKeyToRow.set(r[groupKeyIndex] ?? "NULL", r));
      const approxKeyToRow = new Map();
      approxRows.forEach((r) => approxKeyToRow.set(r[groupKeyIndex] ?? "NULL", r));
  
      const metricNames = Array.from(new Set([...exactCols.slice(1), ...approxCols.slice(1)]));
      const allKeys = Array.from(new Set([...exactKeyToRow.keys(), ...approxKeyToRow.keys()]));
  
      const rows = [];
      for (const g of allKeys) {
        for (const metric of metricNames) {
          let exactVal = exactKeyToRow.get(g)?.[exactCols.indexOf(metric)] ?? null;
          let approxVal = approxKeyToRow.get(g)?.[approxCols.indexOf(metric)] ?? null;
          const en = parseNumber(exactVal), an = parseNumber(approxVal);
          rows.push({
            group: g,
            metric,
            exact: exactVal ?? "—",
            approx: approxVal ?? "—",
            diff: (Number.isFinite(en) && Number.isFinite(an)) ? (an - en) : null,
            exactTime,
            approxTime,
          });
        }
      }
      return {
        headers: ["Group", "Metric", "Exact", "Approx", "Difference", "Exact Time (ms)", "Approx Time (ms)"],
        rows,
      };
    }
  
    // ✅ FIXED: Non-GroupBy case (Count, Sum, Avg, Min/Max)
    const cols = Array.from(new Set([...exactCols, ...approxCols])); // union of all metrics
    const exactRow = exactRows[0] ?? [];
    const approxRow = approxRows[0] ?? [];
  
    const rows = cols.map((metric, i) => {
      const exactVal = exactRow[exactCols.indexOf(metric)] ?? null;
      const approxVal = approxRow[approxCols.indexOf(metric)] ?? null;
      const en = parseNumber(exactVal), an = parseNumber(approxVal);
  
      return {
        metric,
        exact: exactVal ?? "—",
        approx: approxVal ?? "—",
        diff: (Number.isFinite(en) && Number.isFinite(an)) ? (an - en) : null,
        exactTime,
        approxTime,
      };
    });
  
    return {
      headers: ["Metric", "Exact", "Approx", "Difference", "Exact Time (ms)", "Approx Time (ms)"],
      rows,
    };
  };
  

  const showOutput = !!output;
  const leftWidth = showOutput ? "md:w-1/3 w-full" : "w-full max-w-md";
  const rightWidth = showOutput ? "md:w-2/3 w-full mt-6 md:mt-0" : "hidden";

  /* ---------- Render ---------- */
  return (
    <>
      <style>{`
        @keyframes gradient-animation {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-animation 6s ease infinite;
        }
      `}</style>

      <div className="min-h-screen relative overflow-hidden w-full flex items-start justify-center p-6 bg-gradient-to-r from-pink-500 via-blue-500 to-pink-500 animate-gradient font-sans">
        <div className={`flex flex-col md:flex-row gap-6 w-full max-w-6xl transition-all duration-400 justify-center`}>
          {/* LEFT: form/card (slides left when output exists) */}
          <div className={`${leftWidth} p-6 space-y-6 bg-blue-900 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl text-white transition-transform duration-500 ${showOutput ? "transform md:-translate-x-4" : ""}`}>
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-200">
                DataFlow Engine
              </h1>
              <p className="text-white/70 mt-2 text-base">Upload, configure, and process your data seamlessly.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* upload */}
              <div>
                <label className="text-base font-semibold mb-3 block">1. Upload Data</label>
                <div
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className={`relative flex flex-col items-center justify-center w-full h-36 p-4 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer ${isDragging ? 'border-pink-400 bg-white/20' : 'border-white/40 bg-white/10 hover:bg-white/20'}`}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input id="file-upload" type="file" className="hidden" accept=".csv,.json,.txt,text/csv,application/json,text/plain" onChange={(e) => handleFileChange(e.target.files[0])} />
                  {file ? (
                    <div className="text-center">
                      <FileIcon className="w-12 h-12 mx-auto text-green-400" />
                      <p className="mt-2 font-semibold text-base">{file.name}</p>
                      <p className="text-sm text-white/60">{(file.size / 1024).toFixed(2)} KB</p>
                      <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); setStatusMessage(""); }} className="mt-3 px-3 py-1 text-xs bg-red-500/50 hover:bg-red-500/80 rounded-full transition-colors">Remove</button>
                    </div>
                  ) : (
                    <div className="text-center text-white/70">
                      <UploadCloudIcon className="w-12 h-12 mx-auto mb-2" />
                      <p className="font-semibold text-base">Drag & drop your file here</p>
                      <p className="text-sm">or <span className="font-bold text-pink-400">click to browse</span></p>
                      <p className="text-xs mt-3 text-white/50">Supports: CSV, JSON, TXT</p>
                    </div>
                  )}
                </div>
              </div>

              {/* selectors: we keep them but they don't drive the compare UI in this change */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Method selector */}
<div>
  <label className="text-base font-semibold mb-2 block">Method</label>
  <div className="relative">
    <select
      value={method}
      onChange={(e) => setMethod(e.target.value)}
      className="w-full px-3 py-2 bg-white/8 border-2 border-white/30 rounded-lg text-sm"
    >
      <option className="bg-zinc-800" value="count">Count</option>
      <option className="bg-zinc-800" value="sum">Sum</option>
      <option className="bg-zinc-800" value="avg">Average</option>
      <option className="bg-zinc-800" value="minmax">Min/Max</option>
      <option className="bg-zinc-800" value="group">Group (COUNT,SUM,AVG)</option>
      <option className="bg-zinc-800" value="complex">Complex (aliases)</option>
    </select>
    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
  </div>
</div>

{/* Precision selector */}
<div>
  <label className="text-base font-semibold mb-2 block">Precision</label>
  <div className="relative">
    <select
      value={precision}
      onChange={(e) => setPrecision(e.target.value)}
      className="w-full px-3 py-2 bg-white/8 border-2 border-white/30 rounded-lg text-sm"
    >
      <option className="bg-zinc-800" value="exact">Exact</option>
      <option className="bg-zinc-800" value="approx">Approx (sample)</option>
    </select>
    <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
  </div>
</div>

              </div>

              {statusMessage && <div className={`p-3 rounded-lg text-center text-sm ${messageType === "error" ? "bg-red-500/30 text-red-200" : "bg-blue-500/30 text-blue-200"}`}>{statusMessage}</div>}

              <button type="submit" disabled={processing} className="w-full flex items-center justify-center gap-2 py-3 text-lg font-semibold rounded-lg bg-gradient-to-r from-purple-600 via-pink-500 to-red-500 shadow-md transition-all">
                <RocketIcon className="w-5 h-5" /> {processing ? "Processing..." : "Process Data"}
              </button>
            </form>
          </div>

          <div className={`${rightWidth} p-6 bg-white/90 rounded-2xl shadow-xl`}>
            {output ? (
              <>
                <h2 className="text-xl font-bold mb-2 text-black">Results</h2>
                <p className="text-sm text-black/60 mb-4">Rows Loaded: {output.rowsLoaded}</p>

                {groupedOptions.map((group, i) => {
                  const comparison = buildComparisonForGroup(group);
                  return (
                    <div key={i} className="mb-6">
                      <h3 className="font-semibold text-lg mb-2">{group.label}</h3>
                      <table className="min-w-full text-sm border-collapse bg-white border rounded">
                        <thead>
                          <tr>
                            {comparison.headers.map((h, idx) => (
                              <th key={idx} className="text-left px-3 py-2 border-b">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {comparison.rows.length === 0 && (
                            <tr><td colSpan={comparison.headers.length} className="p-4 text-center text-black/60">No data</td></tr>
                          )}
                          {comparison.rows.map((r, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              {comparison.headers[0] === "Group" && <td className="px-3 py-2 border-b">{r.group}</td>}
                              <td className="px-3 py-2 border-b">{r.metric}</td>
                              <td className="px-3 py-2 border-b">{r.exact}</td>
                              <td className="px-3 py-2 border-b">{r.approx}</td>
                              <td className="px-3 py-2 border-b">{r.diff === null ? "—" : r.diff.toFixed(6)}</td>
                              <td className="px-3 py-2 border-b">{r.exactTime !== null ? r.exactTime.toFixed(2) : "—"}</td>
                              <td className="px-3 py-2 border-b">{r.approxTime !== null ? r.approxTime.toFixed(2) : "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  );
                })}
              </>
            ) : (
              <div className="text-center text-black/60">
                No output yet — run Process Data to see results here.
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
