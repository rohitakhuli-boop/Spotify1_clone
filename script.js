let currentSong = new Audio();
let songs = [];

// Format time mm:ss
function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

// Fetch songs from /songs directory
async function getSongs() {
    let response = await fetch("http://127.0.0.1:5501/songs/");
    let text = await response.text();

    let div = document.createElement("div");
    div.innerHTML = text;

    let links = div.getElementsByTagName("a");
    songs = [];

    for (let link of links) {
        if (link.href.endsWith(".mp3")) {
            songs.push(decodeURIComponent(link.href.split("/songs/")[1]));
        }
    }
    return songs;
}

// Play music
const playMusic = (track, pause = false) => {
    currentSong.src = `/songs/${track}`;

    if (!pause) {
        currentSong.play();
        play.src = "pause.svg";
    }

    document.querySelector(".songinfo").innerHTML =
        track.length > 50 ? track.substring(0, 50) + "..." : track;

    document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};

// Main function
async function main() {
    songs = await getSongs();

    if (songs.length === 0) return;

    playMusic(songs[0], true);

    // Show songs in playlist
    let songUL = document.querySelector(".songlist ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        songUL.innerHTML += `
        <li>
            <img src="music.svg" alt="">
            <div class="info">
                <div class="songname">${song.replaceAll("-", " ")}</div>
                <div>Rohit</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="play.svg">
            </div>
        </li>`;
    }

    // Click song to play
    Array.from(document.querySelectorAll(".songlist li")).forEach(li => {
        li.addEventListener("click", () => {
            let songName = li.querySelector(".songname").innerHTML;
            playMusic(songName.replaceAll(" ", "-"));
        });
    });

    // Play / Pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg";
        } else {
            currentSong.pause();
            play.src = "play.svg";
        }
    });

    // Update time & seek bar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML =
            `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

        if (!isNaN(currentSong.duration)) {
            document.querySelector(".circle").style.left =
                (currentSong.currentTime / currentSong.duration) * 100 + "%";
        }
    });

    // Seekbar click
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.clientWidth) * 100;
        currentSong.currentTime = (currentSong.duration * percent) / 100;
        document.querySelector(".circle").style.left = percent + "%";
    });

    // Previous
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index > 0) playMusic(songs[index - 1]);
    });

    // Next
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").pop());
        if (index < songs.length - 1) playMusic(songs[index + 1]);
    });

    // Volume control
    document.querySelector(".range input").addEventListener("input", e => {
        currentSong.volume = e.target.value / 100;
    });
}

main();

 
