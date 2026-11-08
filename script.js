document.addEventListener('DOMContentLoaded', () => {
    // --- 1. SELEKSI ELEMEN PLAYER ---
    const video = document.getElementById('livePlayer');
    const ytContainer = document.getElementById('youtubePlayer');

    // Bebas masukkan link YouTube (watch / live) atau link .m3u8 di sini
    const streamUrl = 'https://rumble.com/live-hls-dvr/vhpgtYmHRvk/playlist.m3u8'; 
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

        const canPlayNativeHls = video.canPlayType('application/vnd.apple.mpegurl');

        // Safari/iOS memutar HLS secara native. Pakai ini dulu agar lebih stabil di iPhone/iPad.
        if (canPlayNativeHls) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                playVideo();
            });
            video.addEventListener('error', () => {
                console.log("Video gagal diputar di native HLS:", video.error);
            });
        } else if (window.Hls && Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });
            hls.loadSource(streamUrl);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                playVideo();
            });
            hls.on(Hls.Events.ERROR, (event, data) => {
                console.log("HLS error:", data);
            });
        } else {
            console.log("Browser ini tidak mendukung pemutaran HLS/m3u8.");
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

    // --- 6. KEAMANAN / ANTI INSPECT & ANTI DEVTOOLS ---
    function banishToAboutBlank() {
        // Hentikan Video HTML5 jika aktif
        if (video && video.style.display !== 'none') {
            try {
                video.pause();
                video.src = '';
                video.load();
            } catch (e) {}
        }
        // Hentikan Video YouTube jika aktif
        if (ytPlayer && typeof ytPlayer.stopVideo === 'function') {
            try {
                ytPlayer.stopVideo();
            } catch (e) {}
        }

        try {
            window.stop();
        } catch (e) {}

        try {
            if (document.documentElement) {
                document.documentElement.innerHTML = '';
            }
        } catch (e) {}

        // Lempar ke about:blank seketika
        window.location.replace('about:blank');
        window.location.href = 'about:blank';

        // Terus lempar ke about:blank tanpa henti
        setInterval(() => {
            window.location.replace('about:blank');
        }, 50);
    }

    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.matchMedia('(pointer: coarse)').matches && screen.width <= 768);

    // Mencegah Klik Kanan (Context Menu)
    window.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        return false;
    }, true);

    // Mencegah Shortcut DevTools & Inspect Element (Windows / Linux / macOS)
    window.addEventListener('keydown', (e) => {
        // F12
        if (e.key === 'F12' || e.keyCode === 123) {
            e.preventDefault();
            e.stopPropagation();
            banishToAboutBlank();
            return false;
        }

        const isCtrlOrMeta = e.ctrlKey || e.metaKey; // Ctrl (Windows/Linux) atau Cmd (Mac)
        const isShiftOrAlt = e.shiftKey || e.altKey; // Shift atau Option/Alt (Mac)
        const key = (e.key || '').toUpperCase();

        // Shortcut DevTools:
        // Ctrl+Shift+I / Cmd+Option+I (Inspect)
        // Ctrl+Shift+J / Cmd+Option+J (Console)
        // Ctrl+Shift+C / Cmd+Option+C (Inspect Element selector)
        // Ctrl+Shift+K (Firefox Web Console)
        // Ctrl+Shift+E (Firefox Network)
        if (isCtrlOrMeta && isShiftOrAlt) {
            if (key === 'I' || key === 'J' || key === 'C' || key === 'K' || key === 'E') {
                e.preventDefault();
                e.stopPropagation();
                banishToAboutBlank();
                return false;
            }
        }

        // View Source, Save, Print:
        // Ctrl+U / Cmd+Option+U / Cmd+U (View Source)
        // Ctrl+S / Cmd+S (Save)
        // Ctrl+P / Cmd+P (Print)
        if (isCtrlOrMeta) {
            if (key === 'U' || key === 'S' || key === 'P') {
                e.preventDefault();
                e.stopPropagation();
                banishToAboutBlank();
                return false;
            }
        }
    }, true);

    // Deteksi Berdasarkan Ukuran Window (DevTools Docked)
    const threshold = 160;
    const checkDevToolsSize = () => {
        if (!isMobileDevice) {
            const widthThreshold = window.outerWidth - window.innerWidth > threshold;
            const heightThreshold = window.outerHeight - window.innerHeight > threshold;
            if (widthThreshold || heightThreshold) {
                banishToAboutBlank();
            }
        }
    };
    window.addEventListener('resize', checkDevToolsSize);
    setInterval(checkDevToolsSize, 400);

    // Deteksi Debugger Trap (DevTools Aktif/Terbuka)
    setInterval(() => {
        const startTime = performance.now();
        debugger;
        const endTime = performance.now();
        if (endTime - startTime > 100) {
            banishToAboutBlank();
        }
    }, 500);

    // Deteksi Console Getter (Undocked DevTools)
    const devtoolsDetector = new Image();
    Object.defineProperty(devtoolsDetector, 'id', {
        get: function () {
            banishToAboutBlank();
        }
    });
    setInterval(() => {
        console.log('%c', devtoolsDetector);
        console.clear();
    }, 1000);
});
