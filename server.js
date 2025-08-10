// server.js — HLS Restreamer with preset channels & playlist rewriting
'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const got = require('got');
const { URL } = require('url');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));

// Preset channel list
const channels = {
  cinemo: 'https://d1bail49udbz1k.cloudfront.net/out/v1/78e282e04f0944f3ad0aa1db7a1be645/index_3.m3u8',
  kidsflix: 'https://stream-us-east-1.getpublica.com/playlist.m3u8?network_id=50',
  cartoonnetwork: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118123.m3u8',
  disneyjr: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118127.m3u8',
  nickelodeon: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118128.m3u8',
  disneychannel: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118124.m3u8'
};

// Root
app.get('/', (req, res) => {
  res.json({
    message: '✅ IPTV Restreamer running',
    available_channels: Object.keys(channels)
  });
});

// Generic playlist proxy with URL param
app.get('/playlist', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url');
  await sendPlaylist(target, req, res);
});

// Segment proxy
app.get('/segment', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url');
  await pipeStream(target, res, 'video/mp2t');
});

// Create endpoints for each preset channel
Object.entries(channels).forEach(([name, url]) => {
  app.get(`/${name}`, async (req, res) => {
    await sendPlaylist(url, req, res);
  });
});

// Helper: Send playlist with segment URL rewrite
async function sendPlaylist(target, req, res) {
  try {
    const url = new URL(target);
    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    const body = await got(url, {
      timeout: { request: 15000 },
      headers: {
        'User-Agent': 'Mozilla/5.0 (Render Restreamer)',
        'Referer': url.origin
      }
    }).text();

    // Rewrite all segment URLs to go through /segment
    const rewritten = body.replace(
      /^(?!#)(.*\.ts.*)$/gm,
      seg => `/segment?url=${new URL(seg, url).href}`
    );

    res.send(rewritten);
  } catch (err) {
    console.error(`Playlist error for ${target}:`, err.message);
    res.status(500).send('Error fetching playlist');
  }
}

// Helper: Pipe binary stream
async function pipeStream(target, res, contentType) {
  try {
    const url = new URL(target);
    res.setHeader('Content-Type', contentType);
    const stream = got.stream(url, {
      timeout: { request: 15000 },
      headers: {
        'User-Agent': '
Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36',
        'Referer': url.origin
      }
    });
    stream.on('error', err => {
      console.error('Segment fetch error:', err.message);
      res.end();
    });
    stream.pipe(res);
  } catch (err) {
    res.status(500).send('Error streaming segment');
  }
}

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
