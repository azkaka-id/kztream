document.addEventListener('DOMContentLoaded', () => {
    /* --- HLS.js Video Player Logic --- */
    const video = document.getElementById('livePlayer');
    
    // URL Asli Stream
    const originalUrl = 'https://manifest.media-delivery.net/kbs2/index.m3u8?token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMTI4R0NNIn0..Q_khzDYClLeLvpd_.b2Tuw63lDyqeg-XF1QyBeRt4FhtvqEeWebKBuhcIYyduLp3Q6u_pog9rF9-1EDFGjg0tzSIT12z2FNH5_SfVbrWcKSmPOCcMiIOkvuTz6oU9_Kik5TxpsWXhUqWtyIazjGzwrwlgKaymICqF9hiD78f4eU5wN2yJnQi-3srLDrTHDay2JY4QJ8LbWSKOlxCuAL2tDMfMckyKZwT_taETBW56Lm3-8SaFlAsah_QboW0b_jXVPLAtgqPH2CJyNFR9Dz6BdzsRVMXFVaGYfgU5enNCIRUMwwPt3ykEHC08fPGabfsk18Xs5DIFPZmmLhPM4u4VFSXGPA922-RU1zONvsa-5Yw7X00KUE-2KRp4cKnHf6t9v6nz9pwafEpQxZVcJaJKfXR6Dj4L6VPXHN2OFm37FJDTY2Wlo7bGAMGZbr6D7rGtM0YCOg54x85VsxjLNnMYAiLn42zHyZM0dHWirgvbx_cTXJRfdoDR4KP4aA8soyAUkQ0Ouv-yGLZSagRlCkyKjDuZBJiN9yfBuigIq3zmPOzpop5afy5MWNfpBU-pZ127BMbFg9N--bnj_l0sU5ZFCoComcENw-c6W5DnSNthIsfFwMk.Ymv57eAK_5SSqPyZke1aTA&platformLanguage=id';
    
    // URL Proxy CORS (Gunakan AllOrigins jika corsproxy.io mengalami pembatasan rate-limit)
    const proxyUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(originalUrl);

    let isUsingProxy = false;

    const playVideo = () => {
        video.play().catch(error => {
            console.log("Autoplay dicegah oleh browser. Pengguna harus mengklik player:", error);
        });
    };

    if (Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });

        // Coba muat URL Asli terlebih dahulu
        hls.loadSource(originalUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            playVideo();
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (data.fatal) {
                switch (data.type) {
                    case Hls.ErrorTypes.NETWORK_ERROR:
                        console.error("Gagal memuat video dari URL asli. Memencet fallback proxy CORS...", data);
                        
                        // Jika belum mencoba proxy, coba beralih ke proxy URL
                        if (!isUsingProxy) {
                            isUsingProxy = true;
                            hls.loadSource(proxyUrl);
                            hls.startLoad();
                        } else {
                            // Jika proxy juga gagal, coba muat ulang setelah beberapa detik
                            hls.startLoad();
                        }
                        break;
                    case Hls.ErrorTypes.MEDIA_ERROR:
                        console.error("Masalah media, mencoba memulihkan...", data);
                        hls.recoverMediaError();
                        break;
                    default:
                        hls.destroy();
                        break;
                }
            }
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Fallback untuk browser Safari / Apple yang memiliki dukungan HLS bawaan
        video.src = originalUrl;
        video.addEventListener('loadedmetadata', function () {
            playVideo();
        });
    }

    /* --- Page Load Animations --- */
    const fadeElements = document.querySelectorAll('.fade-in-up');
    setTimeout(() => {
        fadeElements.forEach(el => {
            el.classList.add('loaded');
        });
    }, 100);

    /* --- Modal Popup Logic --- */
    const modal = document.getElementById('tutorialModal');
    const openBtn = document.getElementById('openTutorialBtn');
    const closeBtn = document.getElementById('closeTutorialBtn');
    const closeBtnFooter = document.querySelector('.close-modal-btn');

    const openModal = () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';
    };

    const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    };

    if (openBtn) openBtn.addEventListener('click', openModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeBtnFooter) closeBtnFooter.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
            closeModal();
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('livePlayer');

    // --- FUNGSI MENGHENTIKAN VIDEO ---
    function stopVideoOnInspect() {
        if (video) {
            video.pause();
            video.src = ''; // Menghapus source video
            video.load();   // Reset player
            alert("Inspect Element terdeteksi. Video dihentikan demi keamanan.");
        }
    }

    // --- DETEKSI 1: MENCEGAH KLIK KANAN & SHORTCUT INSPECT ---
    document.addEventListener('contextmenu', (e) => e.preventDefault()); // Matikan Klik Kanan

    document.addEventListener('keydown', (e) => {
        // Matikan F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
            e.preventDefault();
            stopVideoOnInspect();
        }
    });

    // --- DETEKSI 2: DETEKSI DEVTOOLS BERDASARKAN UKURAN WINDOW ---
    const threshold = 160; // Beda ukuran piksel saat DevTools terbuka
    setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        
        if (widthThreshold || heightThreshold) {
            stopVideoOnInspect();
        }
    }, 1000);

    // --- DETEKSI 3: DETEKSI TRAP DEBUGGER (Untuk DevTools Terpisah/Undocked) ---
    setInterval(() => {
        const startTime = performance.now();
        debugger; // Jika DevTools terbuka, baris ini akan menghentikan sementara JavaScript
        const endTime = performance.now();

        // Jika jeda waktu lebih lama dari 100ms, artinya DevTools sedang terbuka
        if (endTime - startTime > 100) {
            stopVideoOnInspect();
        }
    }, 1000);
});