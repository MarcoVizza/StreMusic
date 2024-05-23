const APIController = (function() {
    
    const clientId = '0844eff3c0e64ea2af8707df806b8682';
    const clientSecret = '881096180b154e83b67355c12c5a8ad5';

    // metodi privati
    const _getToken = async () => {

        const result = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/x-www-form-urlencoded', 
                'Authorization' : 'Basic ' + btoa( clientId + ':' + clientSecret)
            },
            body: 'grant_type=client_credentials'
        });

        const data = await result.json();
        return data.access_token;
    }
    
    const _getGenres = async (token) => {

        const result = await fetch(`https://api.spotify.com/v1/browse/categories?locale=it_IT`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.categories.items;
    }

    const _getPlaylistByGenre = async (token, genreId) => {

        const limit = 10;
        
        const result = await fetch(`https://api.spotify.com/v1/browse/categories/${genreId}/playlists?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.playlists.items;
    }

    const _getTracks = async (token, tracksEndPoint) => {

        const limit = 10;

        const result = await fetch(`${tracksEndPoint}?limit=${limit}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data.items;
    }

    const _getTrack = async (token, trackEndPoint) => {

        const result = await fetch(`${trackEndPoint}`, {
            method: 'GET',
            headers: { 'Authorization' : 'Bearer ' + token}
        });

        const data = await result.json();
        return data;
    }

    return {
        getToken() {
            return _getToken();
        },
        getGenres(token) {
            return _getGenres(token);
        },
        getPlaylistByGenre(token, genreId) {
            return _getPlaylistByGenre(token, genreId);
        },
        getTracks(token, tracksEndPoint) {
            return _getTracks(token, tracksEndPoint);
        },
        getTrack(token, trackEndPoint) {
            return _getTrack(token, trackEndPoint);
        }
    }
})();


// Modulo UI
const UIController = (function() {

    // oggetto per mantenere i riferimenti agli elementi HTML
    const DOMElements = {
        selectGenre: '#select_genre',
        selectPlaylist: '#select_playlist',
        buttonSubmit: '#btn_submit',
        divSongDetail: '#song-detail',
        hfToken: '#hidden_token',
        divSonglist: '.song-list'
    }

    // metodi pubblici
    return {

        // metodo per ottenere i campi di input
        inputField() {
            return {
                genre: document.querySelector(DOMElements.selectGenre),
                playlist: document.querySelector(DOMElements.selectPlaylist),
                tracks: document.querySelector(DOMElements.divSonglist),
                submit: document.querySelector(DOMElements.buttonSubmit),
                songDetail: document.querySelector(DOMElements.divSongDetail)
            }
        },

        // necessità di metodi per creare opzioni di elenchi selezionabili
        createGenre(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectGenre).insertAdjacentHTML('beforeend', html);
        }, 

        createPlaylist(text, value) {
            const html = `<option value="${value}">${text}</option>`;
            document.querySelector(DOMElements.selectPlaylist).insertAdjacentHTML('beforeend', html);
        },

        // necessità di un metodo per creare un elemento di elenco tracce
        createTrack(id, name) {
            const html = `<a href="#" class="list-group-item list-group-item-action list-group-item-light" id="${id}">${name}</a>`;
            document.querySelector(DOMElements.divSonglist).insertAdjacentHTML('beforeend', html);
        },

        // necessità di un metodo per creare il dettaglio della canzone
        createTrackDetail(img, title, artist) {

            const detailDiv = document.querySelector(DOMElements.divSongDetail);
            // ogni volta che l'utente clicca su una nuova canzone, dobbiamo svuotare il div del dettaglio della canzone
            detailDiv.innerHTML = '';

            const html = 
            `
            <div class="row col-sm-6 px-0">
                <img src="${img}" alt="">        
            </div>
            <div class="row col-sm-6 px-0">
                <label for="Genre" class="form-label col-sm-12">${title}:</label>
            </div>
            <div class="row col-sm-4 px-0">
                <label for="artist" class="form-label col-sm-12">Di ${artist}:</label>
            </div> 
            `;

            detailDiv.insertAdjacentHTML('beforeend', html)

        },

        resetTrackDetail() {
            this.inputField().songDetail.innerHTML = '';
        },

        resetTracks() {
            this.inputField().tracks.innerHTML = '';
            this.resetTrackDetail();
        },

        resetPlaylist() {
            this.inputField().playlist.innerHTML = '';
            this.resetTracks();
        },
        
        storeToken(value) {
            document.querySelector(DOMElements.hfToken).value = value;
        },

        getStoredToken() {
            return {
                token: document.querySelector(DOMElements.hfToken).value
            }
        }
    }

})();

const APPController = (function(UICtrl, APICtrl) {

    // ottenere il riferimento all'oggetto del campo di input
    const DOMInputs = UICtrl.inputField();

    // ottenere i generi al caricamento della pagina
    const loadGenres = async () => {
        // ottenere il token
        const token = await APICtrl.getToken();           
        // memorizzare il token sulla pagina
        UICtrl.storeToken(token);
        // ottenere i generi
        const genres = await APICtrl.getGenres(token);
        // popolare il nostro elemento di selezione dei generi
        genres.forEach(element => UICtrl.createGenre(element.name, element.id));
    }

    // creare un listener per l'evento di modifica del genere
    DOMInputs.genre.addEventListener('change', async () => {
        // reimpostare la playlist
        UICtrl.resetPlaylist();
        // ottenere il token memorizzato sulla pagina
        const token = UICtrl.getStoredToken().token;        
        // ottenere il campo di selezione del genere
        const genreSelect = UICtrl.inputField().genre;
         // ottenere l'id del genere associato al genere selezionato
         const genreId = genreSelect.options[genreSelect.selectedIndex].value;             
         // ottenere la playlist basata su un genere
         const playlist = await APICtrl.getPlaylistByGenre(token, genreId);       
         // creare un elemento di lista di riproduzione per ogni playlist restituita
         playlist.forEach(p => UICtrl.createPlaylist(p.name, p.tracks.href));
     });
      
 
    // creare un listener per l'evento di clic sul pulsante di invio
    DOMInputs.submit.addEventListener('click', async (e) => {
        // prevenire il ripristino della pagina
        e.preventDefault();
        // eliminare le tracce
        UICtrl.resetTracks();
        // ottenere il token
        const token = UICtrl.getStoredToken().token;        
        // ottenere il campo della playlist
        const playlistSelect = UICtrl.inputField().playlist;
        // ottenere il punto finale della traccia basato sulla playlist selezionata
        const tracksEndPoint = playlistSelect.options[playlistSelect.selectedIndex].value;
        // ottenere l'elenco delle tracce
        const tracks = await APICtrl.getTracks(token, tracksEndPoint);
        // creare un elemento di lista di tracce
        tracks.forEach(el => UICtrl.createTrack(el.track.href, el.track.name))
        
    });

    // creare un listener per l'evento di clic sulla selezione della traccia
    DOMInputs.tracks.addEventListener('click', async (e) => {
        // Nascondi la tendina delle canzoni dopo aver selezionato una traccia
        UICtrl.resetTracks();
        // prevenire il ripristino della pagina
        e.preventDefault();
        // reimpostare i dettagli della traccia
        UICtrl.resetTrackDetail();
        // ottenere il token
        const token = UICtrl.getStoredToken().token;
        // ottenere il punto finale della traccia
        const trackEndpoint = e.target.id;
        // ottenere l'oggetto traccia
        const track = await APICtrl.getTrack(token, trackEndpoint);
        // caricare i dettagli della traccia
        UICtrl.createTrackDetail(track.album.images[2].url, track.name, track.artists[0].name);

    });    

    return {
        init() {
            console.log('L\'app sta partendo');
            loadGenres();
        }
    }

})(UIController, APIController);

// sarà necessario chiamare un metodo per caricare i generi al caricamento della pagina
APPController.init();