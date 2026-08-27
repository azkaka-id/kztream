document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEKSI ELEMEN PLAYER ---
    const video = document.getElementById('livePlayer');
    const ytContainer = document.getElementById('youtubePlayer');

    // Bebas masukkan link YouTube (watch / live) atau link .m3u8 di sini
    const streamUrl = 'https://dsrpvv2zw9s37.cloudfront.net/api/video/v1/us-west-2.196233775518.channel.ib8afrwwNVSm.m3u8?browser_family=chrome&browser_version=150.0&cdm=wv&os_name=macOS&os_version=1.0&platform=web&player_backend=mediaplayer&player_version=1.45.0&supported_codecs=av1%2Ch265%2Ch264&token=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzM4NCJ9.eyJhd3M6Y2hhbm5lbC1hcm4iOiJhcm46YXdzOml2czp1cy13ZXN0LTI6MTk2MjMzNzc1NTE4OmNoYW5uZWwvaWI4YWZyd3dOVlNtIiwiYXdzOmFjY2Vzcy1jb250cm9sLWFsbG93LW9yaWdpbiI6Imh0dHBzOi8va2ljay5jb20saHR0cHM6Ly93d3cuZ3N0YXRpYy5jb20saHR0cHM6Ly8qLmtpY2subGl2ZSxodHRwczovL3BsYXllci5raWNrLmNvbSxodHRwczovL2FkbWluLmtpY2suY29tLGh0dHBzOi8vYmV0YS5raWNrLmNvbSxodHRwczovL25leHQua2ljay5jb20saHR0cHM6Ly9kYXNoYm9hcmQua2ljay5jb20saHR0cHM6Ly8qLnByZXZpZXcua2ljay5jb20saHR0cHM6Ly94Ym94LmtpY2suY29tLGh0dHBzOi8vcGxheXN0YXRpb24ua2ljay5jb20saHR0cHM6Ly90aXplbi5raWNrLmNvbSxodHRwczovL3dlYm9zLmtpY2suY29tLGh0dHBzOi8vKi5raWNrLXByZXByb2R1Y3Rpb24uY29tLGh0dHBzOi8vKi5raWNrLWRldmVsb3BtZW50LmNvbSIsImF3czpzdHJpY3Qtb3JpZ2luLWVuZm9yY2VtZW50IjpmYWxzZSwiYXdzOmFkcy1vcHQtb3V0Ijp0cnVlLCJleHAiOjE3ODc4MTcyOTl9.28GjUBu2rgDeTWEZ8Q2dWdFHqwX8fdspUZbEIJK4BfiAnHPzn-cmRL-yWyO2JlsigHEewhyprNnj7AYtotaqpC3iWYq0MAeiIpendQJ0FD4hLMpWvocVP5lUWlmLTOem'; 
    let ytPlayer = null; // Menyimpan instance YouTube Player

    // --- 2. FUNGSI PEMBANTU (UTILITY) ---
    function isYouTubeUrl(url) {
        return (url.includes("youtube.com") || url.includes("youtu.be"));
    }

    function getYouTubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // --- 3. LOGIKA PEMUTARAN VIDEO ---
    if (isYouTubeUrl(streamUrl)) {
        // Jika Link YouTube
        const videoId = getYouTubeId(streamUrl);
        
        if (video) video.style.display = 'none';
        if (ytContainer) ytContainer.style.display = 'block';

        // Load YouTube Iframe API jika belum ada
        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        window.onYouTubeIframeAPIReady = () => {
            ytPlayer = new YT.Player('youtubePlayer', {
                videoId: videoId,
                playerVars: {
                    'autoplay': 1,
                    'controls': 1,
                    'modestbranding': 1,
                    'rel': 0
                },
                events: {
                    'onReady': (event) => {
                        event.target.mute(); // Mute agar autoplay berjalan lancar
                        event.target.playVideo();
                    }
                }
            });
        };
    } else {
        // Jika Link .m3u8 / HLS
        if (ytContainer) ytContainer.style.display = 'none';
        if (video) video.style.display = 'block';

        const playVideo = () => {
            video.play().catch(error => {
                console.log("Autoplay dicegah oleh browser:", error);
            });
        };

        if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                playVideo();
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                playVideo();
            });
        }
    }

    // --- 4. ANIMASI HALAMAN ---
    const fadeElements = document.querySelectorAll('.fade-in-up');
    setTimeout(() => {
        fadeElements.forEach(el => {
            el.classList.add('loaded');
        });
    }, 100);

    // --- 5. LOGIKA MODAL TUTORIAL ---
    const modal = document.getElementById('tutorialModal');
    const openBtn = document.getElementById('openTutorialBtn');
    const closeBtn = document.getElementById('closeTutorialBtn');
    const closeBtnFooter = document.querySelector('.close-modal-btn');

    const openModal = () => {
        if (modal) {
            modal.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    };
    const closeModal = () => {
        if (modal) {
            modal.classList.remove('show');
            document.body.style.overflow = 'auto';
        }
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

    // --- 6. KEAMANAN / ANTI INSPECT ELEMENT ---
    function stopVideoOnInspect() {
        // Hentikan Video HTML5 jika aktif
        if (video && video.style.display !== 'none') {
            video.pause();
            video.src = '';
            video.load();
        }
        // Hentikan Video YouTube jika aktif
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            ytPlayer.stopVideo();
        }
        alert("Inspect Element terdeteksi. Video dihentikan demi keamanan.");
    }

    // Mencegah Klik Kanan & Shortcut DevTools
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    document.addEventListener('keydown', (e) => {
        if (
            e.key === 'F12' || 
            (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j')) ||
            (e.ctrlKey && (e.key === 'U' || e.key === 'u'))
        ) {
            e.preventDefault();
            stopVideoOnInspect();
        }
    });

    // Deteksi Berdasarkan Ukuran Window
    const threshold = 160;
    setInterval(() => {
        const widthThreshold = window.outerWidth - window.innerWidth > threshold;
        const heightThreshold = window.outerHeight - window.innerHeight > threshold;
        if (widthThreshold || heightThreshold) {
            stopVideoOnInspect();
        }
    }, 1000);

    // Deteksi Debugger Trap
    setInterval(() => {
        const startTime = performance.now();
        debugger;
        const endTime = performance.now();
        if (endTime - startTime > 100) {
            stopVideoOnInspect();
        }
    }, 1000);
});