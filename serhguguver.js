// server.js — full HLS/DASH restreamer with playlist rewriting and robust streaming
'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const got = require('got');
const { URL } = require('url');
const stream = require('stream');
const { pipeline } = require('stream/promises');

const app = express();
const PORT = process.env.PORT || 3000;

// --- configuration
const DEFAULT_TIMEOUT_MS = 20000; // per-request timeout
const USER_AGENT = 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36';

// Optional: preset channels (add more if you want)
const CHANNELS = {
  cinemo: 'https://d1bail49udbz1k.cloudfront.net/out/v1/78e282e04f0944f3ad0aa1db7a1be645/index_3.m3u8',
  kidsflix: 'https://stream-us-east-1.getpublica.com/playlist.m3u8?network_id=50',
  cartoonnetwork: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118123.m3u8',
  disneyjr: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118127.m3u8',
  nickelodeon: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118128.m3u8',
  disneychannel: 'https://nxt.plus:8443/live/restreamstalker/mzfJKHLK86fy/118124.m3u8'
};

// --- middleware
app.use(cors());
app.use(morgan('dev'));

// health / root
app.get('/', (req, res) => {
  res.json({
    msg: '✅ IPTV Restreamer running',
    channels: Object.keys(CHANNELS)
  });
});

// Generic playlist proxy (useful if you want to pass arbitrary URL)
app.get('/playlist', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url param');
  return sendPlaylist(target, req, res);
});

// Segment proxy endpoint (streams binary segments)
app.get('/segment', async (req, res) => {
  const target = req.query.url;
  if (!target) return res.status(400).send('Missing url param');
  return pipeStream(target, req, res);
});

// Create endpoints for preset channels (e.g., /cinemo)
for (const [name, url] of Object.entries(CHANNELS)) {
  app.get(`/${name}`, async (req, res) => {
    return sendPlaylist(url, req, res);
  });
}

/**
 * Fetch a playlist (.m3u8 or .mpd). If HLS, rewrite segment/variant URLs to point to /segment.
 * Supports:
 *  - .m3u8 master + variant playlists (rewrites non-comment lines)
 *  - simple .mpd (proxied as-is, with content-type application/dash+xml)
 */
async function sendPlaylist(target, req, res) {
  try {
    const url = new URL(target);
    const isDASH = /\.mpd($|\?)/i.test(url.href);
    const isHLS = /\.m3u8($|\?)/i.test(url.href) || !isDASH;

    // fetch playlist as text
    const body = await got(url.href, {
      timeout: { request: DEFAULT_TIMEOUT_MS },
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': url.origin,
        'Accept': '*/*'
      }
    }).text();

    if (isDASH) {
      res.setHeader('Content-Type', 'application/dash+xml');
      return res.send(body);
    }

    // For HLS playlists, rewrite URIs so segments and sub-playlists go through /segment
    // We will treat any line that is not a comment (#) and is non-empty as a URI to rewrite.
    const base = url.href.substring(0, url.href.lastIndexOf('/') + 1);

    const rewritten = body.split(/\r?\n/).map(line => {
      if (!line || line.trim().startsWith('#')) return line;
      // If line already looks like a full url -> use that, else resolve relative to playlist
      try {
        const resolved = new URL(line, base).href;
        // encodeURI for readability but encodeURIComponent for query param safety
        return `/segment?url=${encodeURIComponent(resolved)}`;
      } catch (err) {
        // fallback: try concatenation
        try {
          const resolved = new URL(base + line).href;
          return `/segment?url=${encodeURIComponent(resolved)}`;
        } catch (e) {
          return line;
        }
      }
    }).join('\n');

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    // Allow cross origin from anywhere (player will request from the browser)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(rewritten);
  } catch (err) {
    console.error('sendPlaylist error:', err.message || err);
    if (err.response && err.response.statusCode) {
      return res.status(err.response.statusCode).send('Upstream fetch error');
    }
    return res.status(500).send('Error fetching playlist');
  }
}

/**
 * Pipe binary stream from upstream to client.
 * Copies important headers (Content-Type, Content-Length, Cache-Control, etc.)
 * Avoids forwarding hop-by-hop headers.
 */
async function pipeStream(target, req, res) {
  try {
    // validate url
    const url = new URL(target);

    // Start streaming request
    const upstream = got.stream(url.href, {
      timeout: { request: DEFAULT_TIMEOUT_MS },
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': url.origin,
        'Accept': '*/*'
      }
    });

    upstream.on('error', err => {
      // If client already closed, upstream error will be logged here
      console.error('upstream stream error:', err.message || err);
      try { if (!res.headersSent) res.status(502).send('Upstream stream error'); } catch(e){}
    });

    upstream.on('response', (upRes) => {
      // set status code from upstream if possible
      try { res.statusCode = upRes.statusCode; } catch(e){}

      // copy selected headers
      const disallowed = new Set([
        'connection',
        'content-encoding',
        'transfer-encoding',
        'keep-alive',
        'proxy-authenticate',
        'proxy-authorization',
        'te',
        'trailer',
        'upgrade'
      ]);

      for (const [k, v] of Object.entries(upRes.headers)) {
        if (disallowed.has(k.toLowerCase())) continue;
        // Some CDNs send 'content-type' as array; express expects string
        if (Array.isArray(v)) {
          res.setHeader(k, v.join(', '));
        } else {
          res.setHeader(k, v);
        }
      }

      // Force CORS header for browser players
      if (!res.getHeader('Access-Control-Allow-Origin')) {
        res.setHeader('Access-Control-Allow-Origin', '*');
      }
    });

    // Pipe upstream to client using pipeline for proper error handling
    await pipeline(upstream, res);

  } catch (err) {
    console.error('pipeStream error:', err.message || err);
    if (!res.headersSent) res.status(500).send('Error streaming segment');
  }
}

// 404 fallback
app.use((req, res) => res.status(404).send('Not found'));

// start server
app.listen(PORT, () => {
  console.log(`🚀 Restreamer listening on port ${PORT}`);
});
