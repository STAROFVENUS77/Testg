const express = require('express');
const request = require('request');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ Stream channel map with logos
const streams = {
  hbofamily: {
    url: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbofamily',
    logo: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmgLxceKZ0vlSSViPM1Tp3p_U8DOBhBQavlRPttTrkpA&s'
  },
  hbohd: {
    url: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/d/d0/HBO_logo.svg'
  },
  hbosignature: {
    url: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbosignature',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/03/HBO_Signature_logo.png'
  },
  hbohits: {
    url: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbohitshd',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/HBO_Hits_logo.png'
  },
  cinemax: {
    url: 'https://smart.pendy.dpdns.org/Smart.php?id=Cinemax',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Cinemax_2016_logo.svg'
  },
  animax: {
    url: 'https://smart.pendy.dpdns.org/Smart.php?id=Animax',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/c/c1/Animax_logo.svg'
  },
  // ...add the rest with their logos
};

// 📺 Stream route
app.get('/:stream/playlist.m3u8', (req, res) => {
  const key = req.params.stream;
  if (!streams[key]) return res.status(404).send('❌ Invalid stream key');

  const streamUrl = streams[key].url;
  const baseUrl = new URL(streamUrl);
  const basePath = baseUrl.href.substring(0, baseUrl.href.lastIndexOf('/') + 1);

  request.get(streamUrl, (err, response, body) => {
    if (err || response.statusCode !== 200) {
      return res.status(502).send('❌ Failed to fetch playlist');
    }
    const modified = body.replace(/^(?!#)(.+)$/gm, (line) => {
      if (!line || line.startsWith('#')) return line;
      return `/segment.ts?url=${encodeURIComponent(new URL(line, basePath).href)}`;
    });

    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(modified);
  });
});

// 🎬 Proxy segment.ts
app.get('/segment.ts', (req, res) => {
  if (!req.query.url) return res.status(400).send('❌ No segment URL');

  request
    .get(req.query.url)
    .on('response', (r) => res.set(r.headers))
    .on('error', () => res.status(502).send('❌ Segment failed'))
    .pipe(res);
});

// 🌐 Serve Home Channel Page
app.get('/', (req, res) => {
  const channelsHtml = Object.keys(streams)
    .map(key => `
      <div class="channel" tabindex="0" onclick="playChannel('${key}')">
        <img src="${streams[key].logo}" alt="${key}">
        <span>${key}</span>
      </div>
    `).join('');

  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Home Channel</title>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { background:#111; color:#fff; margin:0; font-family:sans-serif; }
  #channelList { display:flex; flex-wrap:wrap; gap:10px; padding:10px; }
  .channel {
    background:#222; padding:8px; border-radius:8px; cursor:pointer;
    display:flex; flex-direction:column; align-items:center; width:120px;
    text-align:center; transition:transform 0.2s;
  }
  .channel:hover, .channel:focus { transform:scale(1.05); background:#333; }
  .channel img { width:100px; height:70px; object-fit:contain; border-radius:5px; background:#000; }
  video { width:100%; height:auto; background:black; }
</style>
<script src="https://cdnjs.cloudflare.com/ajax/libs/shaka-player/4.9.2/shaka-player.compiled.min.js"></script>
</head>
<body>

<h2 style="padding:10px;">📺 IPTV Home</h2>

<div id="playerContainer" style="display:none;">
  <video id="video" autoplay controls></video>
</div>

<div id="channelList">${channelsHtml}</div>

<script>
async function playChannel(key) {
  document.getElementById
