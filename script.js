const audio = document.getElementById("audio");
const playBtn = document.getElementById("play-btn");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const progressBar = document.getElementById("progress-bar");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const volumeBar = document.getElementById("volume-bar");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");
const fileInput = document.getElementById("file-input");
const albumArt = document.getElementById("album-art");

// State 
let playlist = [];
let currentIndex = 0;
let isPlaying = false;

// Format time 
const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};

// Loading songs by index 
const loadSong = (index) => {
    const song = playlist[index];
    audio.src = song.url;
    songTitle.textContent = song.name;
    songArtist.textContent = "Local File";
    currentTimeEl.textContent = "0:00";
    progressBar.value = 0;
};

// Play or pause 
const togglePlay = () => {
    if (playlist.length === 0) return;

    if (isPlaying) {
        audio.pause();
        playBtn.textContent = "▶";
        albumArt.classList.remove("playing");
    } else {
        audio.play();
        playBtn.textContent = "⏸";
        albumArt.classList.add("playing");
    }
    isPlaying = !isPlaying;
};

// Next and previous 
const nextSong = () => {
    if (playlist.length === 0) return;
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(currentIndex);
    if (isPlaying) audio.play();
};

const prevSong = () => {
    if (playlist.length === 0) return;
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentIndex);
    if (isPlaying) audio.play();
};

// Update progress bar  
audio.addEventListener("timeupdate", () => {
    if (audio.duration) {
        progressBar.value = (audio.currentTime / audio.duration) * 100;
        currentTimeEl.textContent = formatTime(audio.currentTime);
        totalTimeEl.textContent = formatTime(audio.duration);
    }
});

// Seek when progress bar is dragged 
progressBar.addEventListener("input", () => {
    audio.currentTime = (progressBar.value / 100) * audio.duration;
});

// Volume 
volumeBar.addEventListener("input", () => {
    audio.volume = volumeBar.value / 100;
});

// Auto play next song when current ends 
audio.addEventListener("ended", () => {
    nextSong();
});

// Load files from file picker 
fileInput.addEventListener("change", (e) => {
    const files = Array.from(e.target.files);

    playlist = files.map((file) => ({
        name: file.name.replace(/\.[^/.]+$/, ""),
        url: URL.createObjectURL(file),
    }));

    currentIndex = 0;
    loadSong(currentIndex);
    songArtist.textContent = `${playlist.length} songs loaded`;
});

// Button listeners 
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);