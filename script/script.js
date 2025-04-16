function toggleMenu() {
    document.getElementById("menu").classList.toggle("show");
}
document.addEventListener('DOMContentLoaded', async () => {
    const videoElement = document.getElementById('video');
    const videoContainer = document.getElementById('video-container');
    const channelListElement = document.getElementById('channelList');
    const categorySelector = document.getElementById('categorySelector');
    const player = new shaka.Player(videoElement);
    const ui = new shaka.ui.Overlay(player, videoContainer, videoElement);
    const controls = ui.getControls();
    player.addEventListener('error', onErrorEvent);
    function onErrorEvent(event) {
        console.error('Error code', event.detail.code, 'object', event.detail);
    }
    function parseClearKey(keyString) {
        const [keyId, key] = keyString.split(':');
        return { [keyId]: key };
    }
    function isMP4(url) {
        return url.endsWith('.mp4');
    }
    async function loadChannel(channel) {
        try {
            if (isMP4(channel.src)) {
                videoElement.src = channel.src;
                videoElement.loop = true;
                videoElement.play();
            } else {
                    const clearkeyConfig = parseClearKey(channel.key);
                    player.configure({
                        drm: {
                            clearKeys: clearkeyConfig,
                        },
                    });
                await player.load(channel.src);
                const textTracks = player.getTextTracks();
                let selectedTrack = textTracks.find(track => track.language === 'en');
                if (!selectedTrack && textTracks.length > 0) {
                    selectedTrack = textTracks[0];
                }
                if (selectedTrack) {
                    player.selectTextTrack(selectedTrack);
                    player.setTextTrackVisibility(true);
                }
            }
        } catch (error) {
            console.error('Error loading channel:', error);
        }
    }
    function populateChannels() {
        channelListElement.innerHTML = "";
        const selectedCategory = categorySelector.value;
        const filteredChannels = channels.filter(channel => channel.category === selectedCategory);
        filteredChannels.forEach((channel, index) => {
            const li = document.createElement('li');
            li.textContent = `${index + 1}. ${channel.name}`;
            li.onclick = () => {
                document.querySelectorAll('.channel-list li').forEach(el => el.classList.remove('active'));
                li.classList.add('active');
                loadChannel(channel);
            };
            channelListElement.appendChild(li);
            if (index === 0) li.click();
        });
    }
    function searchChannels() {
        let input = document.getElementById('searchInput').value.toLowerCase();
        document.querySelectorAll('.channel-list li').forEach(channel => {
            channel.style.display = channel.textContent.toLowerCase().includes(input) ? "block" : "none";
        });
    }
    categorySelector.addEventListener('change', populateChannels);
    populateChannels();
    window.searchChannels = searchChannels;
});
document.addEventListener('contextmenu', (e) => e.preventDefault());
function ctrlShiftKey(e, keyCode) {
    return e.ctrlKey && e.shiftKey && e.keyCode === keyCode.charCodeAt(0);
}
document.onkeydown = (e) => {
    if (
        e.keyCode === 123 ||
        ctrlShiftKey(e, 'I') ||
        ctrlShiftKey(e, 'J') ||
        ctrlShiftKey(e, 'C') ||
        (e.ctrlKey && e.keyCode === 'U'.charCodeAt(0))
    )
        return false;
};
