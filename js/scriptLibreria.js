document.addEventListener('DOMContentLoaded', function () {
    const favoriteSongsContainer = document.getElementById('favorite_songs');
  
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
  
    favorites.forEach(song => {
      const songElement = document.createElement('div');
      songElement.classList.add('songItem');
      songElement.innerHTML = `
        <img src="${song.img}" alt="Poster">
        <div class="title">${song.title}</div>
        <div class="subtitle">${song.artist}</div>
      `;
      favoriteSongsContainer.appendChild(songElement);
    });
  });
  