function registerUser() {
    const name = document.getElementById('name').value;
    sessionStorage.setItem('userName', name);
    window.location.href = 'home.html';
}