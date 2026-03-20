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
const list= document.querySelector("#playlist"); 
const folderBtn = document.getElementById("folder-btn");
const socket = io("http://localhost:3000", {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 10,
});// State 
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
    if (!playlist || playlist.length === 0) return;  
    if (index < 0 || index >= playlist.length) return;  
    const song = playlist[index];
    audio.src = song.path;
    songTitle.textContent = song.name;
    songArtist.textContent = "Local File";
    currentTimeEl.textContent = "0:00";
    progressBar.value = 0;
};

// Play or pause 
const togglePlay = () => {
    if (playlist.length === 0) return;
    const pausedState= document.querySelectorAll("#playlist li"); 
    if (isPlaying) {
        audio.pause();
        playBtn.textContent = "▶";
        albumArt.classList.remove("playing");
        pausedState[currentIndex].classList.add("paused");
        isPlaying = false;
        socket.emit("pause");
    } else {
    pausedState[currentIndex].classList.remove("paused");    
    playSong();
    }
};

// Next and previous 
const nextSong = () => {
    if (playlist.length === 0) return;
    currentIndex = (currentIndex + 1) % playlist.length;
    loadSong(currentIndex);
    if (isPlaying) audio.play();
    activateHighlight();
    socket.emit("next");
};

const prevSong = () => {
    if (playlist.length === 0) return;
    currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    loadSong(currentIndex);
    if (isPlaying) audio.play();
    activateHighlight();
    socket.emit("prev");
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
    renderPlaylist();
    activateHighlight();
    socket.emit("songList",playlist);
});
// Make the playlist 
const renderPlaylist = ()=>{
    list.innerHTML="";
    for(let i =0;i<playlist.length;i++){
        const item=document.createElement("li");
        item.textContent= playlist[i].name;
        item.addEventListener("click",()=>{
            currentIndex=i;
            loadSong(i);
            playSong();
            activateHighlight();
            socket.emit("songChange",i);
        });
        list.appendChild(item);
    }
};
// Play song
const playSong=()=>{
audio.play();
isPlaying=true;
playBtn.textContent="⏸";
albumArt.classList.add("playing");
activateHighlight();
socket.emit("play");

};
//Highlight which song is playing
const activateHighlight=()=>{
const songs = document.querySelectorAll("#playlist li");
for(let i=0;i<songs.length;i++){
if(i== currentIndex){  songs[i].classList.add("active");  
}else{
    songs[i].classList.remove("active");
}
};
};
// Open folder
const openFolder= async ()=>{
const files = await window.electronAPI.openFolder();
if(files.length===0) return;

playlist=files;
currentIndex=0;
loadSong(currentIndex);
renderPlaylist();
activateHighlight();
socket.emit("songList",playlist);
};
// Sync played media controls with newly added devices
socket.on("syncState",(state) =>{
loadSong(state.currentIndex);
if(state.isPlaying){
    playSong();
    
}else{
  playBtn.textContent= "▶";
  albumArt.classList.remove("playing");
}
audio.currentTime=state.currentTime;
playlist=state.songList;
renderPlaylist();
activateHighlight();
});
// Button listeners 
playBtn.addEventListener("click", togglePlay);
nextBtn.addEventListener("click", nextSong);
prevBtn.addEventListener("click", prevSong);
folderBtn.addEventListener("click", openFolder);
// Action listeners
socket.on("pause",()=>{
    isPlaying=true;  
    togglePlay();
});
socket.on("play",()=>{
    isPlaying=false;  
    togglePlay();
});
socket.on("next",()=>{
  nextSong();
});
socket.on("prev",()=>{
  prevSong();
});
socket.on("seek",(time)=>{
  audio.currentTime=time;
});
socket.on("songChange",(index)=>{
  currentIndex=index;
  loadSong(index);
  activateHighlight();
});
// Updating the data every 5secs
setInterval(() => {
    if (isPlaying) {
        socket.emit("timeUpdate", audio.currentTime);
    }
}, 5000);