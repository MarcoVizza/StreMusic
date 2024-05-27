document.addEventListener('DOMContentLoaded', function () {
  const songs = document.querySelectorAll('.songItem');
  const audio = document.getElementById('audio');
  const posterMasterPlay = document.getElementById('poster_master_play');
  const title = document.getElementById('title');
  const playBtn = document.getElementById('play');
  const seekBar = document.getElementById('seek');
  const currentStart = document.getElementById('currentStart');
  const currentEnd = document.getElementById('currentEnd');
  const nextBtn = document.getElementById('next');
  const prevBtn = document.getElementById('prev');
  const progressBar = document.querySelector('.bar2');
  const volumeControl = document.getElementById('volume');
  const volumeBar = document.querySelector('.vol_bar');
  const masterPlay = document.getElementById('master_play');
  const heartIcon = document.getElementById('cuore');

  let currentSongIndex = localStorage.getItem('currentSongIndex') !== null ? parseInt(localStorage.getItem('currentSongIndex')) : 0;

  const savedSong = localStorage.getItem('currentSong');
  const savedTime = localStorage.getItem('currentTime');
  const isPlaying = localStorage.getItem('isPlaying') === 'true';
  const masterPlayVisible = localStorage.getItem('masterPlayVisible') === 'true';

  if (savedSong) {
    audio.src = savedSong;
    audio.currentTime = savedTime ? parseFloat(savedTime) : 0;
    if (isPlaying) {
      audio.play();
    }
    updatePlayButton();
    updateSongDetails(currentSongIndex);
  }

  if (masterPlayVisible) {
    masterPlay.style.display = 'flex';
  }

  songs.forEach((song, index) => {
    song.addEventListener('click', () => {
      currentSongIndex = index;
      playSong(currentSongIndex);
    });
  });

  const playlistItems = document.querySelectorAll('.spotify-playlists .item');
  playlistItems.forEach(item => {
    item.addEventListener('click', () => {
      const songId = item.getAttribute('data-song-id');
      const song = document.querySelector(`.songItem:nth-child(${songId})`);
      currentSongIndex = songId - 1;
      playSong(currentSongIndex);
    });
  });

  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play();
      localStorage.setItem('isPlaying', 'true');
    } else {
      audio.pause();
      localStorage.setItem('isPlaying', 'false');
    }
    updatePlayButton();
  });

  nextBtn.addEventListener('click', playNextSong);
  prevBtn.addEventListener('click', playPrevSong);

  audio.addEventListener('timeupdate', () => {
    const progress = (audio.currentTime / audio.duration) * 100;
    seekBar.value = progress;
    currentStart.innerText = formatTime(audio.currentTime);
    currentEnd.innerText = formatTime(audio.duration);
    progressBar.style.width = `${progress}%`;

    localStorage.setItem('currentTime', audio.currentTime);
  });

  seekBar.addEventListener('input', () => {
    audio.currentTime = (seekBar.value / 100) * audio.duration;
  });

  volumeControl.addEventListener('input', () => {
    const volume = volumeControl.value / 100;
    audio.volume = volume;
    volumeBar.style.width = `${volumeControl.value}%`;
  });

  heartIcon.addEventListener('click', toggleHeart);

  function updatePlayButton() {
    if (audio.paused) {
      playBtn.classList.remove('bi-pause-fill');
      playBtn.classList.add('bi-play-fill');
    } else {
      playBtn.classList.remove('bi-play-fill');
      playBtn.classList.add('bi-pause-fill');
    }
  }

  function formatTime(time) {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  function playNextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length;
    playSong(currentSongIndex);
  }

  function playPrevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
    playSong(currentSongIndex);
  }

  function playSong(index) {
    const song = songs[index];
    const src = song.getAttribute('data-src');
    const img = song.getAttribute('data-img');
    const titleText = song.getAttribute('data-title');
    const artistText = song.getAttribute('data-artist');

    audio.src = src;
    posterMasterPlay.src = img;
    title.innerHTML = `${titleText}<div class="subtitle">${artistText}</div>`;
    audio.play();
    masterPlay.style.display = 'flex';
    updatePlayButton();

    localStorage.setItem('currentSong', src);
    localStorage.setItem('currentSongIndex', index);
    localStorage.setItem('isPlaying', 'true');
    localStorage.setItem('masterPlayVisible', 'true');
    updateHeartIcon();
  }

  function updateSongDetails(index) {
    const song = songs[index];
    const img = song.getAttribute('data-img');
    const titleText = song.getAttribute('data-title');
    const artistText = song.getAttribute('data-artist');
    posterMasterPlay.src = img;
    title.innerHTML = `${titleText}<div class="subtitle">${artistText}</div>`;
    updateHeartIcon();
  }

  function updateHeartIcon() {
    const currentSongSrc = songs[currentSongIndex].getAttribute('data-src');
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (favorites.some(song => song.src === currentSongSrc)) {
      heartIcon.classList.add('bi-heart-fill');
      heartIcon.classList.remove('bi-heart');
    } else {
      heartIcon.classList.add('bi-heart');
      heartIcon.classList.remove('bi-heart-fill');
    }
  }

  function toggleHeart() {
    const currentSong = {
      src: songs[currentSongIndex].getAttribute('data-src'),
      img: songs[currentSongIndex].getAttribute('data-img'),
      title: songs[currentSongIndex].getAttribute('data-title'),
      artist: songs[currentSongIndex].getAttribute('data-artist')
    };

    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const songIndex = favorites.findIndex(song => song.src === currentSong.src);
    if (songIndex !== -1) {
      favorites.splice(songIndex, 1);
    } else {
      favorites.push(currentSong);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    updateHeartIcon();
  }

  // Inizializza l'icona del cuore al caricamento
  updateHeartIcon();
});

document.addEventListener('DOMContentLoaded', () => {
  const userName = sessionStorage.getItem('userName');
  if (userName) {
    document.getElementById('greeting').textContent = `Hi ${userName}`;
  }
});
