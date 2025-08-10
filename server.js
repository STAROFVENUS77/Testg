
'use strict';

const express = require('express');
const got = require('got');
const { URL } = require('url');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors());

// Original MPD URL
const MPD_URL = 'https://cdn-uw2-prod.tsv2.amagi.tv/linear/amg01006-abs-cbn-abscbn-gma-x7-dash-abscbnono/7c693236-e0c1-40a3-8bd0-bb25e43f5bfc/index.mpd';

// Serve rewritten MPD
app.get('/index.mpd', async (req, res) => {
  try {
    const mpdResponse = await got(MPD_URL, { responseType: 'text' });
    let mpdContent = mpdResponse.body;

    // Convert relative segment URLs to go through our proxy
    const baseUrl = new URL(MPD_URL).origin + new URL(MPD_URL).pathname.replace(/\/[^\/]+$/, '/');
    mpdContent = mpdContent.replace(/(media|initialization)="([^"]+)"/g, (match, attr, path) => {
      const absUrl = new URL(path, baseUrl).href;
      return `${attr}="/segment?url=${encodeURIComponent(absUrl)}"`;
    });

    res.setHeader('Content-Type', 'application/dash+xml');
    res.send(mpdContent);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch MPD');
  }
});

// Serve proxied segments
app.get('/segment', async (req, res) => {
  const segmentUrl = req.query.url;
  if (!segmentUrl) return res.status(400).send('Missing url parameter');

  try {
    const stream = got.stream(segmentUrl);
    stream.on('error', (err) => {
      console.error(`Segment fetch error: ${err.message}`);
      res.destroy();
    });
    stream.pipe(res);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch segment');
  }
});

app.listen(PORT, () => {
  console.log(`✅ DASH restream server running on port ${PORT}`);
  console.log(`📺 Access MPD at: http://localhost:${PORT}/index.mpd`);
});
