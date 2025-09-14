// server/index.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { execFile } = require('child_process');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors()); // allow requests from your React dev server

// uploads folder inside server
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const upload = multer({ dest: uploadsDir });

// Add this mapping at top-level (near other requires)
// method -> array of { description, query }
// server/queryMap.js
const QUERY_MAP = {
  "count": [
    `{"Total Row Count (Exact)", "SELECT COUNT(*) FROM data"}`,
    `{"Approximate Total Row Count (10% Sample)", "SELECT COUNT(*) FROM data SAMPLE 10%"}`
  ],

  "sum": [
    `{"Total Sum of 'value' (Exact)", "SELECT SUM(value) FROM data"}`,
    `{"Approximate Total Sum of 'value' (10% Sample)", "SELECT SUM(value) FROM data SAMPLE 10%"}`
  ],

  "avg": [
    `{"Overall Average of 'value' (Exact)", "SELECT AVG(value) FROM data"}`,
    `{"Approximate Overall Average of 'value' (10% Sample)", "SELECT AVG(value) FROM data SAMPLE 10%"}`
  ],

  "minmax": [
    `{"Min and Max of 'value' (Exact)", "SELECT MIN(value), MAX(value) FROM data"}`,
    `{"Approximate Min and Max of 'value' (10% Sample)", "SELECT MIN(value), MAX(value) FROM data SAMPLE 10%"}`  
  ],

  "group": [
    `{"GROUP BY with COUNT, SUM and AVG", "SELECT category, COUNT(*), SUM(value), AVG(value) FROM data GROUP BY category"}`,
    `{"Approximate GROUP BY with COUNT, SUM and AVG (20% Sample)", "SELECT category, COUNT(*), SUM(value), AVG(value) FROM data GROUP BY category SAMPLE 20%"}`  
  ],

  "complex": [
    `{"Complex Query with Aliases", "SELECT category, COUNT(*) AS item_count, AVG(value) AS average_price FROM data GROUP BY category"}`
  ]
};



// Replace the existing handler with this:
app.post('/api/process', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success:false, error:'no file uploaded' });

  const savedPath = path.resolve(req.file.path);
  const exePath = path.resolve(__dirname, '../build/aqe.exe');

  let queriesText = null;
  const method = req.body && req.body.method ? String(req.body.method).trim() : null;
  const precision = req.body && req.body.precision ? String(req.body.precision).trim() : "exact";

  if (req.body && req.body.queries && String(req.body.queries).trim().length > 0) {
    // If explicit queries provided, just use them
    queriesText = String(req.body.queries).trim();

  } else if (!method) {
    // No method provided -> safe default
    queriesText = [
      `{"Total Row Count (Exact)", "SELECT COUNT(*) FROM data"}`,
      `{"Group-wise Average", "SELECT category, AVG(value) FROM data GROUP BY category"}`
    ].join("\n");

  } else {
    // Use prebuilt map
    if (!QUERY_MAP[method]) {
      try { fs.unlinkSync(savedPath); } catch {}
      return res.status(400).json({ success:false, error:`Unknown or missing method '${method}'` });
    }

    // Get prebuilt queries and join them line by line
    const selectedQueries = QUERY_MAP[method];
    queriesText = selectedQueries.join("\n");
  }

  // Write queries to temp file
  let queriesFilePath = null;
  try {
    const uniq = Date.now() + '_' + Math.floor(Math.random()*100000);
    const qfn = `queries_${uniq}.txt`;
    queriesFilePath = path.join(uploadsDir, qfn);
    fs.writeFileSync(queriesFilePath, queriesText, { encoding: 'utf8' });
  } catch (e) {
    console.error("Failed to write queries file:", e);
    try { fs.unlinkSync(savedPath); } catch {}
    return res.status(500).json({ success:false, error: 'failed to prepare queries file' });
  }

  const args = [savedPath, queriesFilePath, '--json'];
  execFile(exePath, args, { maxBuffer: 200 * 1024 * 1024 }, (error, stdout, stderr) => {
    try { fs.unlinkSync(savedPath); } catch {}
    try { fs.unlinkSync(queriesFilePath); } catch {}

    if (error) {
      console.error('Engine exec error:', error, 'stderr:', stderr);
      return res.status(500).json({ success:false, error:'engine execution failed', details: stderr || error.message });
    }

    try {
      const cleaned = stdout.trim();
      const parsed = JSON.parse(cleaned);
      // console.log(parsed) ;
      return res.json({ success:true, data: parsed });
    } catch (e) {
      console.error('Invalid JSON from engine. Raw stdout:', stdout, 'stderr:', stderr);
      return res.status(500).json({ success:false, error:'invalid engine output', raw: stdout, logs: stderr });
    }
  });
});



app.get('/ping', (req,res) => res.send('ok'));

const PORT = 4000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
