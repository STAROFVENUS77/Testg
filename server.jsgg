const express = require('express');
const request = require('request');
const cors = require('cors');
const { URL } = require('url');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// ✅ Stream channel map (key: m3u8 URL)
const streams = {
  hbofamily: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbofamily',
  hbohd: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbo',
  hbosignature: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbosignature',
  hbohits: 'https://smart.pendy.dpdns.org/Smart.php?id=Hbohitshd',
  cinemax: 'https://smart.pendy.dpdns.org/Smart.php?id=Cinemax',
  animax: 'https://smart.pendy.dpdns.org/Smart.php?id=Animax',
  moviesnowhd: 'https://smart.pendy.dpdns.org/Smart.php?id=moviesnow_raj',
  starmovieshd: 'https://smart.pendy.dpdns.org/Smart.php?id=starmovies_raj',
  hits: 'https://smart.pendy.dpdns.org/Smart.php?id=Hits',
  warnertv: 'https://smart.pendy.dpdns.org/Smart.php?id=WarnerTV',
  scm: 'https://smart.pendy.dpdns.org/Smart.php?id=Weishimovie',
  dreamworks: 'https://smart.pendy.dpdns.org/Smart.php?id=Dreamworks',
  thrill: 'https://smart.pendy.dpdns.org/Smart.php?id=Thrill',
  hitsmovies: 'https://smart.pendy.dpdns.org/Smart.php?id=Hitsmovie',
  one: 'https://smart.pendy.dpdns.org/Smart.php?id=One',
  tvnmovies: 'https://smart.pendy.dpdns.org/Smart.php?id=Tvnmovie',
  celestialclassic: 'https://smart.pendy.dpdns.org/Smart.php?id=Celestial2',
  celestialmovieshd: 'https://smart.pendy.dpdns.org/Smart.php?id=Celestialindo',
  axnhd: 'https://smart.pendy.dpdns.org/Smart.php?id=Axn',
  paramountnetwork: 'https://smart.pendy.dpdns.org/Smart.php?id=Paramountnetwork',
  kplus: 'https://smart.pendy.dpdns.org/Smart.php?id=Kplus',
  rockactions: 'https://smart.pendy.dpdns.org/Smart.php?id=Rockaction',
  rockentertainment: 'https://smart.pendy.dpdns.org/Smart.php?id=Rockentertain',
  natgeohd: 'https://smart.pendy.dpdns.org/Smart.php?id=natgeohd_twn',
  natgeowild: 'https://smart.pendy.dpdns.org/Smart.php?id=natgeowild_twn',
  animalplanet: 'https://smart.pendy.dpdns.org/Smart.php?id=animalplanet_twn',
  discoveryasia: 'https://smart.pendy.dpdns.org/Smart.php?id=discoverytwn_twn',
  ci: 'https://smart.pendy.dpdns.org/Smart.php?id=ci_twn',
  discoveryhd: 'https://smart.pendy.dpdns.org/Smart.php?id=discoveryhd_twn',
  natgeohd: 'https://smart.pendy.dpdns.org/Smart.php?id=Natgeo',
  fashiontv: 'https://smart.pendy.dpdns.org/Smart.php?id=fashiontv_twn',
  history: 'https://smart.pendy.dpdns.org/Smart.php?id=History',
  bbcearthhd: 'https://smart.pendy.dpdns.org/Smart.php?id=bbcearth_twn',
  bbclifestyle: 'https://smart.pendy.dpdns.org/Smart.php?id=bbclifestyle_twn',
  natgeowild: 'https://smart.pendy.dpdns.org/Smart.php?id=Natgeowild',
  animalplanet: 'https://smart.pendy.dpdns.org/Smart.php?id=AnimalPlanet',
  tlc: 'https://smart.pendy.dpdns.org/Smart.php?id=Tlc',
  foodnetworkhd: 'https://smart.pendy.dpdns.org/Smart.php?id=Foodnetwork',
  hgtv: 'https://smart.pendy.dpdns.org/Smart.php?id=HGTV',

  set_hd: 'https://tataplay.slivcdn.com/hls/live/2011671/SETHD/master_2000.m3u8',
  sony_sab_hd: 'https://tataplay.slivcdn.com/hls/live/2011749/SABHD/master_2000.m3u8',
  sony_marathii: 'https://tataplay.slivcdn.com/hls/live/2011740/SonyMarathi/master_2000.m3u8',
  sony_pal: 'https://tataplay.slivcdn.com/hls/live/2011741/SonyPalSD/master_2000.m3u8',
  sony_aath: 'https://tataplay.slivcdn.com/hls/live/2011641/SonyAathSD/master_2000.m3u8',
  sony_yay: 'https://tataplay.slivcdn.com/hls/live/2011746/SonyYaySD/master_2000.m3u8',
  sony_max_hd: 'https://tataplay.slivcdn.com/hls/live/2011670/SonyMaxhd/master_2000.m3u8',
  sony_max: 'https://tataplay.slivcdn.com/hls/live/2011745/SonyMaxSD/master_2000.m3u8',
  sony_max2: 'https://tataplay.slivcdn.com/hls/live/2011908/MAX2/master_2000.m3u8',
  sony_wah: 'https://tataplay.slivcdn.com/hls/live/2011906/SonyWah/master_2000.m3u8',
  sony_pix_hd: 'https://tataplay.slivcdn.com/hls/live/2011748/PIXHD/master_2000.m3u8',
  sony_bbc_earth_hd: 'https://tataplay.slivcdn.com/hls/live/2011907/SonyBBCEarthHD/master_2000.m3u8',
  sony_sports_ten_1_hd: 'https://tataplay.slivcdn.com//hls/live/2011747/TEN1HD/master_2000.m3u8',
  sony_sports_ten_2_hd: 'https://tataplay.slivcdn.com/hls/live/2020434/TEN2HD/master_2000.m3u8',
  sony_sports_ten_3_hd: 'https://tataplay.slivcdn.com/hls/live/2020591/TEN3HD/master_2000.m3u8',
  sony_sports_ten_4_hd: 'https://tataplay.slivcdn.com/hls/live/2020589/ten4hd/master_2000.m3u8',
  sony_sports_ten_5_hd: 'https://tataplay.slivcdn.com/hls/live/2020593/SONYSIXHD/master_2000.m3u8',

  
  tap_sports: 'https://dice-live-ap.akamaized.net/hls/live/2102472/220939-300571/exchange220939frzbx_220939_3000/chunklist.m3u8?hdntl=exp=1754582847~acl=%2F*~id=354645d7-c8ba-4c40-9601-9f9bde6e23d5~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTI2LjIwOS41My4xODYmZXhwPTE3NTQ1ODI4NzcmZWlkPTIyMDkzOSZjaWQ9ZGNlLnRhcGdvJm9pZD0zMjUmdHlwZT1MSVZF~hmac=421818ed1328f0bf130450ffb81ec10e1f8cc37f302801dc578d24c4eb8ec777',
  
  premier_sports: 'https://dice-live-ap.akamaized.net/hls/live/2102405/220944-300574/exchange220944tkwck_220944_3000/chunklist.m3u8?hdntl=exp=1754582921~acl=%2F*~id=90abc6cc-ad55-46ec-95f5-b4abaf6c6a18~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTI2LjIwOS41My4xODYmZXhwPTE3NTQ1ODI5NTAmZWlkPTIyMDk0NCZjaWQ9ZGNlLnRhcGdvJm9pZD0zMjUmdHlwZT1MSVZF~hmac=ccb5824bc0953fc53d7782894a377deb2d2f7133ea96d60dd5963c94807979e0',
  
  premier_sports2: 'https://dice-live-ap.akamaized.net/hls/live/2102409/220945-300575/exchange220945ydtan_220945_3000/chunklist.m3u8?hdntl=exp=1754583024~acl=%2F*~id=43d7fc68-d20d-452e-9fe6-f678331ae8f7~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTI2LjIwOS41My4xODYmZXhwPTE3NTQ1ODMwNTMmZWlkPTIyMDk0NSZjaWQ9ZGNlLnRhcGdvJm9pZD0zMjUmdHlwZT1MSVZF~hmac=24bf5e6946bc3ae40a08eaeb7dcd0692bb6cf71b46711ef42a9066c219cdaf2e',
  
  tvn: 'https://dice-live-ap.akamaized.net/hls/live/2102436/274550-300235/exchange274550tryqz_274550_3000/chunklist.m3u8?hdntl=exp=1754583132~acl=%2F*~id=d6ddc24f-d282-4199-8a9e-07c362b29887~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTEyLjIwNC4xMTcuMjU1JmV4cD0xNzU0NTgzMTYxJmVpZD0yNzQ1NTAmY2lkPWRjZS50YXBnbyZvaWQ9MzI1JnR5cGU9TElWRQ~hmac=d08e550eaa87704ccf0eaef7e6c4ccd74698f2ce3826ecbb28bee4468e7132d1',
  
  tvnmovies_pinoy: 'https://dice-live-ap.akamaized.net/hls/live/2000230/274551-300568/exchange274551xuwnr_274551_3000/chunklist.m3u8?hdntl=exp=1754583192~acl=%2F*~id=1272816c-faa7-4ba4-b6f1-d9e0721d4e92~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTI2LjIwOS41My4xODYmZXhwPTE3NTQ1ODMyMjEmZWlkPTI3NDU1MSZjaWQ9ZGNlLnRhcGdvJm9pZD0zMjUmdHlwZT1MSVZF~hmac=1d3e1db72c71d775def0e0bee408a9082d291ce622b65a99cb3e227ad4f7eaa3',
  
  blast_sports: 'https://dice-live-ap.akamaized.net/hls/live/2102492/266217-300579/exchange266217vmjpk_266217_3000/chunklist.m3u8?hdntl=exp=1754583266~acl=%2F*~id=ea20740f-036c-41c0-9b77-aefd15ed14bf~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTEyLjIwNC4xMTcuMjU1JmV4cD0xNzU0NTgzMjk2JmVpZD0yNjYyMTcmY2lkPWRjZS50YXBnbyZvaWQ9MzI1JnR5cGU9TElWRQ~hmac=82192518fd0ea35d40d2570cd9007177b7875a0cf853ba74e97f83c7cc3dd8e6',
  
  premier_football: 'https://dice-live-ap.akamaized.net/hls/live/2000232/220960-300572/exchange220960ktcqf_220960_1400/chunklist.m3u8?hdntl=exp=1754583346~acl=%2F*~id=ec27a192-4434-4761-8df6-cf2355d7b442~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTI2LjIwOS41My4xODYmZXhwPTE3NTQ1ODMzNzYmZWlkPTIyMDk2MCZjaWQ9ZGNlLnRhcGdvJm9pZD0zMjUmdHlwZT1MSVZF~hmac=53a45a9487d1e465d7b011111ebc85598a38c317d255e3cc244278b441a7c96a',
  
  studio_universal: 'https://dice-live-ap.akamaized.net/hls/live/2001940/275710-300573/exchange275710vgbbu_275710_3000/chunklist.m3u8?hdntl=exp=1754583430~acl=%2F*~id=6d12d686-1b7f-4deb-876c-44bc30107a08~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTI2LjIwOS41My4xODYmZXhwPTE3NTQ1ODM0NTkmZWlkPTI3NTcxMCZjaWQ9ZGNlLnRhcGdvJm9pZD0zMjUmdHlwZT1MSVZF~hmac=1eb22d35432ff0793fea45c57d55851194e7a6e2d56f8f845f759de6a071d32e',
  
  outdoor: 'https://dice-live-ap.akamaized.net/hls/live/2102549/253911-300592/exchange253911xzlkc_253911_3000/chunklist.m3u8?hdntl=exp=1754583507~acl=%2F*~id=a840da23-1c99-4e99-b6b8-3def31f6d62e~data=hdntl,dWlkPUNUZmR0S3xlZTU2N2U3NS02NTg1LTQwOGEtYmIzOS1hZDhlYjIzMDVmNjMmaXA9MTEyLjIwNC4xMTcuMjU1JmV4cD0xNzU0NTgzNTM2JmVpZD0yNTM5MTEmY2lkPWRjZS50YXBnbyZvaWQ9MzI1JnR5cGU9TElWRQ~hmac=1bfe4b149fde35a16d7da31de3706c941d74ba49f084b32da0730b14c83c0e88',
};

// 📺 Stream route: /CHANNEL_NAME/playlist.m3u8
app.get('/:stream/playlist.m3u8', (req, res) => {
  const key = req.params.stream;
  const streamUrl = streams[key];
  if (!streamUrl) return res.status(404).send('❌ Invalid stream key');

  const baseUrl = new URL(streamUrl);
  const basePath = baseUrl.href.substring(0, baseUrl.href.lastIndexOf('/') + 1);

  request.get(streamUrl, (err, response, body) => {
    if (err || response.statusCode !== 200) {
      return res.status(502).send('❌ Failed to fetch playlist');
    }
    const modified = body.replace(/^(?!#)(.+)$/gm, (line) => {
      line = line.trim();
      if (!line || line.startsWith('#')) return line;
      const fullUrl = new URL(line, basePath).href;
      return `/segment.ts?url=${encodeURIComponent(fullUrl)}`;
    });

    res.set('Content-Type', 'application/vnd.apple.mpegurl');
    res.send(modified);
  });
});

// 🎬 Proxy segment.ts
app.get('/segment.ts', (req, res) => {
  const segmentUrl = req.query.url;
  if (!segmentUrl) return res.status(400).send('❌ No segment URL');

  request
    .get(segmentUrl)
    .on('response', (r) => res.set(r.headers))
    .on('error', () => res.status(502).send('❌ Segment failed'))
    .pipe(res);
});

// 🌐 Serve Home Channel Page
app.get('/', (req, res) => {
  const channelsHtml = Object.keys(streams)
    .map(key => `
      <div class="channel" tabindex="0" onclick="playChannel('${key}')">
        <img src="https://via.placeholder.com/100x70?text=${key}" alt="${key}">
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
  .channel img { width:100px; height:70px; object-fit:cover; border-radius:5px; }
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
  document.getElementById('channelList').style.display = 'none';
  document.getElementById('playerContainer').style.display = 'block';

  const manifestUri = '/' + key + '/playlist.m3u8';
  const video = document.getElementById('video');
  const player = new shaka.Player(video);

  player.addEventListener('error', e => {
    console.error('Error code', e.detail.code, e.detail);
    setTimeout(() => player.load(manifestUri), 3000);
  });

  try {
    await player.load(manifestUri);
    console.log('✅ Loaded', manifestUri);
  } catch (e) {
    console.error('❌ Failed to load stream', e);
  }
}
</script>
</body>
</html>
  `);
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});
