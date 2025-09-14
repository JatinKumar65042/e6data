// import React, { useState, useCallback } from 'react';

// // --- Helper Components & Icons ---
// // Using inline SVGs for icons to keep it all in one file.
// const UploadCloudIcon = ({ className }) => (
//   <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//     <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/>
//   </svg>
// );

// const FileIcon = ({ className }) => (
//     <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" />
//     </svg>
// );


// const ChevronDownIcon = ({ className }) => (
//     <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="m6 9 6 6 6-6"/>
//     </svg>
// );

// const RocketIcon = ({ className }) => (
//     <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//         <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.05A7.49 7.49 0 0 0 5.21 7.21a7.49 7.49 0 0 0-2.22 2.22c-.75.75-2.21.76-3.05.05z"/><path d="m12 15-3-3a7.49 7.49 0 0 1 2.22-2.22A7.49 7.49 0 0 1 14.26 7.5l-3 3"/>
//         <path d="M15 12 9 6"/><path d="m22 2-3 1-1 3-3.5-2-1.5 4-2-1.5-2 4-1.5-2-2 4 4-2 4-2 3-1 1-3Z"/>
//     </svg>
// );


// export default function App() {
//   const [file, setFile] = useState(null);
//   const [method, setMethod] = useState("sum");
//   const [precision, setPrecision] = useState("exact");
//   const [isDragging, setIsDragging] = useState(false);
//   const [statusMessage, setStatusMessage] = useState('');
//   const [messageType, setMessageType] = useState('info'); // 'info', 'error'
//   const [output, setOutput] = useState(null);

//   // This handler processes the file selection from both drag-drop and click-to-upload
//   const handleFileChange = (selectedFile) => {
//     if (selectedFile) {
//         // Basic validation for file type
//         const allowedTypes = ["text/csv", "application/json", "text/plain"];
//         if (allowedTypes.includes(selectedFile.type) || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.json') || selectedFile.name.endsWith('.txt')) {
//              setFile(selectedFile);
//              setStatusMessage(''); // Clear previous messages
//         } else {
//             setMessageType('error');
//             setStatusMessage(`Error: Invalid file type. Please upload CSV, JSON, or TXT.`);
//             setFile(null);
//         }
//     }
//   };

//   const handleDragEnter = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsDragging(false);
//     if (e.dataTransfer.files && e.dataTransfer.files[0]) {
//       handleFileChange(e.dataTransfer.files[0]);
//     }
//   };
  
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!file) {
//         setMessageType('error');
//         setStatusMessage("Please upload a file before processing.");
//         return;
//     }
//     setMessageType('info');
//     setStatusMessage(`Uploading ${file.name}...`);
//     setOutput(null);
  
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
  
//       const resp = await fetch('http://localhost:4000/api/process', {
//         method: 'POST',
//         body: formData
//       });
  
//       const json = await resp.json();
//       if (!resp.ok || !json.success) {
//         setMessageType('error');
//         setStatusMessage(`Error: ${json.error || 'processing failed'}`);
//         return;
//       }
  
//       setOutput(json.data);
//       console.log(json.data) ;
//       setMessageType('info');
//       setStatusMessage('Processing finished successfully.');
//     } catch (err) {
//       setMessageType('error');
//       setStatusMessage('Network or server error: ' + err.message);
//     }
//   };
  
//   return (
//     <>
//       {/* This style block is included here to define the background animation.
//         In a real-world scenario, this would be in your main CSS file.
//       */}
//       <style>{`
//         @keyframes gradient-animation {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//         .animate-gradient {
//           background-size: 200% 200%;
//           animation: gradient-animation 6s ease infinite;
//         }
//       `}</style>
      
//       {/* Main container with animated gradient */}
//       <div className="min-h-screen relative overflow-hidden w-full flex items-center justify-center p-4 bg-gradient-to-r from-pink-500 via-blue-500 to-pink-500 animate-gradient font-sans">
        
//         {/* The main card with glassmorphism effect */}
//         <div className="w-full max-w-md p-6 space-y-6 bg-blue-900 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl text-white transition-all duration-300 relative z-10">
          
//           {/* Header */}
//           <div className="text-center">
//             <h1 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-200 via-white to-gray-200">
//               DataFlow Engine
//             </h1>
//             <p className="text-white/70 mt-2 text-base">
//               Upload, configure, and process your data seamlessly.
//             </p>
//           </div>

//           <form onSubmit={handleSubmit} className="space-y-8">
//             {/* 1. File Upload Section */}
//             <div>
//                 <label className="text-base font-semibold mb-3 block">1. Upload Data</label>
//                 <div
//                     onDragEnter={handleDragEnter}
//                     onDragLeave={handleDragLeave}
//                     onDragOver={handleDragOver}
//                     onDrop={handleDrop}
//                     className={`relative flex flex-col items-center justify-center w-full h-36 p-4 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer
//                     ${isDragging ? 'border-pink-400 bg-white/20' : 'border-white/40 bg-white/10 hover:bg-white/20'}`}
//                     onClick={() => document.getElementById('file-upload').click()}
//                 >
//                     <input 
//                         type="file" 
//                         id="file-upload" 
//                         className="hidden" 
//                         accept=".csv,.json,.txt,text/csv,application/json,text/plain"
//                         onChange={(e) => handleFileChange(e.target.files[0])}
//                     />
//                     {file ? (
//                          <div className="text-center">
//                             <FileIcon className="w-12 h-12 mx-auto text-green-400" />
//                             <p className="mt-2 font-semibold text-base">{file.name}</p>
//                             <p className="text-sm text-white/60">{(file.size / 1024).toFixed(2)} KB</p>
//                             <button
//                                 type="button"
//                                 onClick={(e) => {
//                                     e.stopPropagation(); // prevent opening file dialog
//                                     setFile(null);
//                                     setStatusMessage('');
//                                 }}
//                                 className="mt-3 px-3 py-1 text-xs bg-red-500/50 hover:bg-red-500/80 rounded-full transition-colors"
//                             >
//                                 Remove
//                             </button>
//                         </div>
//                     ) : (
//                         <div className="text-center text-white/70">
//                             <UploadCloudIcon className="w-12 h-12 mx-auto mb-2" />
//                             <p className="font-semibold text-base">
//                                 Drag & drop your file here
//                             </p>
//                             <p className="text-sm">or <span className="font-bold text-pink-400">click to browse</span></p>
//                              <p className="text-xs mt-3 text-white/50">Supports: CSV, JSON, TXT</p>
//                         </div>
//                     )}
//                 </div>
//             </div>

//             {/* 2. & 3. Configuration Selectors */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {/* Method Selector */}
//                 <div>
//                     <label htmlFor="method-select" className="text-base font-semibold mb-3 block">2. Select Method</label>
//                     <div className="relative">
//                         <select
//                             id="method-select"
//                             value={method}
//                             onChange={(e) => setMethod(e.target.value)}
//                             className="w-full px-4 py-3 bg-white/10 border-2 border-white/40 rounded-xl appearance-none focus:outline-none focus:border-pink-400 transition-colors cursor-pointer"
//                         >
//                             <option className="bg-zinc-800 text-white" value="sum">Sum</option>
//                             <option className="bg-zinc-800 text-white" value="avg">Average</option>
//                             <option className="bg-zinc-800 text-white" value="group">Group by Value</option>
//                         </select>
//                         <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
//                     </div>
//                 </div>

//                 {/* Precision Selector */}
//                 <div>
//                     <label htmlFor="precision-select" className="text-base font-semibold mb-3 block">3. Set Precision</label>
//                     <div className="relative">
//                         <select
//                             id="precision-select"
//                             value={precision}
//                             onChange={(e) => setPrecision(e.target.value)}
//                             className="w-full px-4 py-3 bg-white/10 border-2 border-white/40 rounded-xl appearance-none focus:outline-none focus:border-pink-400 transition-colors cursor-pointer"
//                         >
//                             <option className="bg-zinc-800 text-white" value="exact">Exact</option>
//                             <option className="bg-zinc-800 text-white" value="approx">Approximate</option>
//                         </select>
//                          <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none" />
//                     </div>
//                 </div>
//             </div>

//             {/* Status Message Display */}
//             {statusMessage && (
//               <div className={`p-4 rounded-lg text-center text-sm whitespace-pre-wrap ${messageType === 'error' ? 'bg-red-500/30 text-red-200' : 'bg-blue-500/30 text-blue-200'}`}>
//                 {statusMessage}
//               </div>
//             )}
            
//             {/* Submit Button */}
//             <button
//                 type="submit"
//                 className="w-full flex items-center justify-center gap-3 py-4 text-xl font-bold rounded-xl
//                 bg-gradient-to-r from-purple-600 via-pink-500 to-red-500
//                 hover:from-purple-700 hover:via-pink-600 hover:to-red-600
//                 shadow-lg shadow-pink-500/30 hover:shadow-xl hover:shadow-pink-500/40
//                 transition-all duration-300 transform hover:scale-105"
//             >
//               <RocketIcon className="w-6 h-6"/>
//               Process Data
//             </button>
//           </form>

//           {output && (
//             <div className="mt-6 space-y-6 p-6 bg-white/10 rounded-2xl border border-white/30 shadow-lg text-white">
//               <h2 className="text-2xl font-bold mb-4">Processing Results</h2>
//               <p className="text-sm text-white/60 mb-4">Rows Loaded: {output.rowsLoaded}</p>

//               {output.queries.map((q, idx) => (
//                 <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/20">
//                   <h3 className="text-base font-semibold mb-2">{q.description}</h3>
//                   <p className="text-xs text-white/50 mb-3">
//                     Execution Time: {q.execution_ms.toFixed(2)} ms {q.result.approximate && '(Approximate)'}
//                   </p>
//                   <div className="overflow-x-auto">
//                     <table className="min-w-full text-sm border-collapse">
//                       <thead>
//                         <tr>
//                           {q.result.columns.map((col, i) => (
//                             <th key={i} className="border-b border-white/30 px-2 py-1 text-left font-medium">{col}</th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {q.result.rows.map((row, i) => (
//                           <tr key={i} className="hover:bg-white/10">
//                             {row.map((cell, j) => (
//                               <td key={j} className="px-2 py-1">{cell}</td>
//                             ))}
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}


//         </div>
//       </div>
//       {/* {output && (
//         <div className="mt-6 space-y-6 p-6 bg-white/10 rounded-2xl border border-white/30 shadow-lg text-white">
//           <h2 className="text-2xl font-bold mb-4">Processing Results</h2>
//           <p className="text-sm text-white/60 mb-4">Rows Loaded: {output.rowsLoaded}</p>

//           {output.queries.map((q, idx) => (
//             <div key={idx} className="p-4 bg-white/5 rounded-xl border border-white/20">
//               <h3 className="text-base font-semibold mb-2">{q.description}</h3>
//               <p className="text-xs text-white/50 mb-3">
//                 Execution Time: {q.execution_ms.toFixed(2)} ms {q.result.approximate && '(Approximate)'}
//               </p>
//               <div className="overflow-x-auto">
//                 <table className="min-w-full text-sm border-collapse">
//                   <thead>
//                     <tr>
//                       {q.result.columns.map((col, i) => (
//                         <th key={i} className="border-b border-white/30 px-2 py-1 text-left font-medium">{col}</th>
//                       ))}
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {q.result.rows.map((row, i) => (
//                       <tr key={i} className="hover:bg-white/10">
//                         {row.map((cell, j) => (
//                           <td key={j} className="px-2 py-1">{cell}</td>
//                         ))}
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           ))}
//         </div>
//       )} */}
//     </>
//   );
// }


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
  // UI: which grouped query is selected
  const [selectedGroupKey, setSelectedGroupKey] = useState(null);

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

  /* ---------- Build grouped dropdown options from output.queries ---------- */
  const groupedOptions = useMemo(() => {
    if (!output || !output.queries) return [];
    // Map normalized label => { label, exactIdx, approxIdx, indices[] }
    const map = new Map();
    output.queries.forEach((q, idx) => {
      const base = normalizeLabel(q.description);
      const entry = map.get(base) || { label: base, exactIdx: null, approxIdx: null, indices: [] };
      entry.indices.push(idx);
      // use the approximate flag if present in result; fallback on "Approximate" in description
      const isApprox = !!(q.result && q.result.approximate) || /Approx/i.test(q.description);
      if (isApprox) entry.approxIdx = idx;
      else entry.exactIdx = idx;
      map.set(base, entry);
    });
    // convert map to array (keep original order by first seen)
    return Array.from(map.values()).map((v, i) => ({ key: v.label + "_" + i, ...v }));
  }, [output]);

  // ensure a default selection when output arrives
  React.useEffect(() => {
    if (!selectedGroupKey && groupedOptions.length > 0) {
      setSelectedGroupKey(groupedOptions[0].key);
    }
  }, [groupedOptions, selectedGroupKey]);

  /* ---------- Comparison / table building ---------- */
  const buildComparisonRows = () => {
    if (!output || !output.queries || !selectedGroupKey) return { headers: [], rows: [] };
    const group = groupedOptions.find(x => x.key === selectedGroupKey);
    if (!group) return { headers: [], rows: [] };

    const exact = (typeof group.exactIdx === "number") ? output.queries[group.exactIdx] : null;
    const approx = (typeof group.approxIdx === "number") ? output.queries[group.approxIdx] : null;

    // helpers to pull columns/rows safely
    const getCols = (q) => (q && q.result && Array.isArray(q.result.columns)) ? q.result.columns : [];
    const getRows = (q) => (q && q.result && Array.isArray(q.result.rows)) ? q.result.rows : [];

    const exactCols = getCols(exact);
    const approxCols = getCols(approx);
    const exactRows = getRows(exact);
    const approxRows = getRows(approx);

    // decide if GROUP BY: heuristic -> more than 1 column and multiple output rows
    const isGroupBy = (exactRows.length > 1 || approxRows.length > 1) || ( (exactCols.length>1 || approxCols.length>1) && (exactRows.length===approxRows.length && exactRows.length>0) );

    if (isGroupBy) {
      // assume first column is group key
      const groupKeyIndex = 0;
      const exactKeyToRow = new Map();
      exactRows.forEach(r => {
        const key = r[groupKeyIndex] ?? "NULL";
        exactKeyToRow.set(key, r);
      });
      const approxKeyToRow = new Map();
      approxRows.forEach(r => {
        const key = r[groupKeyIndex] ?? "NULL";
        approxKeyToRow.set(key, r);
      });

      // metric column indices (both sets may differ slightly). We'll take union of metric columns from exactCols and approxCols excluding group key col.
      const exactMetrics = exactCols.slice(1);
      const approxMetrics = approxCols.slice(1);
      const metricNames = Array.from(new Set([...exactMetrics, ...approxMetrics]));

      // union of group keys
      const allKeys = Array.from(new Set([...exactKeyToRow.keys(), ...approxKeyToRow.keys()]));

      // build rows: for each groupKey and for each metric
      const rows = [];
      for (const g of allKeys) {
        for (let m = 0; m < metricNames.length; ++m) {
          const metric = metricNames[m];
          // find metric index in exact & approx (offset by 1)
          let exactVal = null, approxVal = null;
          const exactRow = exactKeyToRow.get(g);
          const approxRow = approxKeyToRow.get(g);

          if (exactRow) {
            // find the column index for this metric in exactCols
            const idx = exactCols.indexOf(metric);
            if (idx !== -1) exactVal = exactRow[idx];
          }
          if (approxRow) {
            const idx2 = approxCols.indexOf(metric);
            if (idx2 !== -1) approxVal = approxRow[idx2];
          }

          const en = parseNumber(exactVal);
          const an = parseNumber(approxVal);
          const diff = Number.isFinite(en) && Number.isFinite(an) ? (an - en) : NaN;

          rows.push({
            group: g,
            metric,
            exact: exactVal != null ? exactVal : "—",
            approx: approxVal != null ? approxVal : "—",
            diff: Number.isFinite(diff) ? diff : null
          });
        }
      }

      return {
        headers: ["Group", "Metric", "Exact", "Approx", "Difference"],
        rows
      };
    } else {
      // non-grouped: single row expected with multiple columns (e.g., COUNT(*), SUM(value), AVG(value), MIN, MAX)
      const cols = exactCols.length ? exactCols : approxCols;
      const exactRow = exactRows[0] ?? [];
      const approxRow = approxRows[0] ?? [];

      const rows = cols.map((colName, i) => {
        const exactVal = exactRow[i] ?? null;
        const approxVal = approxRow[i] ?? null;
        const en = parseNumber(exactVal);
        const an = parseNumber(approxVal);
        const diff = Number.isFinite(en) && Number.isFinite(an) ? (an - en) : NaN;
        return {
          metric: colName,
          exact: exactVal != null ? exactVal : "—",
          approx: approxVal != null ? approxVal : "—",
          diff: Number.isFinite(diff) ? diff : null
        };
      });

      return {
        headers: ["Metric", "Exact", "Approx", "Difference"],
        rows
      };
    }
  };

  const comparison = useMemo(buildComparisonRows, [output, selectedGroupKey, groupedOptions]);

  /* ---------- Layout classes: when an output exists we show a two-column layout ---------- */
  const showOutput = !!output;
  // left panel width small, right panel = 2/3
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

          {/* RIGHT: output box (2/3 width when shown) */}
          <div className={`${rightWidth} p-6 bg-white/90 rounded-2xl shadow-xl transition-all duration-500 ${showOutput ? "block" : "hidden md:block"}`}>
            {output ? (
              <>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-black">Results</h2>
                    <p className="text-sm text-black/60">Rows Loaded: {output.rowsLoaded}</p>
                  </div>

                  {/* dropdown for selecting which query group to show */}
                  <div className="min-w-[14rem]">
                    <label className="text-xs text-black/60 block mb-1">Choose result to compare</label>
                    <select value={selectedGroupKey || ""} onChange={(e) => setSelectedGroupKey(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-sm">
                      {groupedOptions.map(opt => (
                        <option key={opt.key} value={opt.key}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* summary of all queries (small) */}
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {output.queries.map((q, i) => (
                    <div key={i} className="p-2 text-xs border rounded bg-white/30">
                      <strong className="block text-black/90">{q.description}</strong>
                      <div className="text-black/60">Time: {Number(q.executionTimeMs).toFixed(2)} ms {q.result?.approximate ? "(approx)" : ""}</div>
                    </div>
                  ))}
                </div>

                {/* Comparison table */}
                <div className="bg-white rounded p-3 border">
                  <table className="min-w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        {comparison.headers.map((h, i) => (
                          <th key={i} className="text-left px-3 py-2 border-b font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {comparison.rows.length === 0 && (
                        <tr><td colSpan={comparison.headers.length} className="p-4 text-center text-sm text-black/60">No data to display for this selection.</td></tr>
                      )}
                      {comparison.rows.map((r, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          { /* group row (optional) */ }
                          {comparison.headers[0] === "Group" ? (
                            <>
                              <td className="px-3 py-2 align-top border-b">{r.group}</td>
                              <td className="px-3 py-2 align-top border-b">{r.metric}</td>
                              <td className="px-3 py-2 align-top border-b">{r.exact}</td>
                              <td className="px-3 py-2 align-top border-b">{r.approx}</td>
                              <td className="px-3 py-2 align-top border-b">
                                {r.diff === null ? "—" : (Math.abs(r.diff) < 1e-6 ? "0" : Number(r.diff).toFixed(6))}
                              </td>
                            </>
                          ) : (
                            <>
                              <td className="px-3 py-2 align-top border-b">{r.metric}</td>
                              <td className="px-3 py-2 align-top border-b">{r.exact}</td>
                              <td className="px-3 py-2 align-top border-b">{r.approx}</td>
                              <td className="px-3 py-2 align-top border-b">
                                {r.diff === null ? "—" : (Math.abs(r.diff) < 1e-6 ? "0" : Number(r.diff).toFixed(6))}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center text-black/60">No output yet — run Process Data to see results here.</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
