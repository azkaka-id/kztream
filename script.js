document.addEventListener('DOMContentLoaded', () => {

    document.addEventListener('DOMContentLoaded', () => {

        /* --- HLS.js Video Player Logic --- */
        const video = document.getElementById('livePlayer');

        // Ganti URL ini dengan link .m3u8 Anda
        const streamUrl = 'http://eotyfrt.cluster029.hosting.ovh.net/p/s/1,fd,l/stream.m3u8';

        // Mengecek dukungan HLS.js di browser (Chrome, Firefox, Windows)
        if (Hls.isSupported()) {
            const hls = new Hls({
                // Konfigurasi opsional agar streaming lebih mulus
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, function () {
                // Video diputar otomatis (pastikan atribut 'muted' ada di HTML agar autoplay berfungsi)
                video.play().catch(error => console.log("Autoplay dicegah oleh browser:", error));
            });
        }
        // Fallback untuk browser yang mendukung HLS secara native (seperti Safari di iOS/Mac)
        else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', function () {
                video.play().catch(error => console.log("Autoplay dicegah oleh browser:", error));
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

        openBtn.addEventListener('click', openModal);
        closeBtn.addEventListener('click', closeModal);
        closeBtnFooter.addEventListener('click', closeModal);

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('show')) {
                closeModal();
            }
        });
    });
    /* --- Page Load Animations --- */
    // Menambahkan class 'loaded' untuk memicu transisi CSS (fade in up)
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

    // Fungsi membuka popup
    const openModal = () => {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Mencegah scroll di background
    };

    // Fungsi menutup popup
    const closeModal = () => {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto'; // Mengembalikan scroll
    };

    // Event Listener untuk tombol
    openBtn.addEventListener('click', openModal);
    closeBtn.addEventListener('click', closeModal);
    closeBtnFooter.addEventListener('click', closeModal);

    // Menutup popup saat area di luar card (backdrop) diklik
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Menutup modal dengan tombol Escape pada keyboard
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('show')) {
            closeModal();
        }
    });

});