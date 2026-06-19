import { H as Hls } from './hls-dru42stk.js';

const stages = document.querySelectorAll('[data-player]');

const startPlayer = (stage) => {
    const video = stage.querySelector('video[data-src]');
    const source = video ? video.dataset.src : '';

    if (!video || !source) {
        return;
    }

    const play = () => {
        const promise = video.play();

        if (promise && typeof promise.catch === 'function') {
            promise.catch(() => {});
        }
    };

    if (!stage.dataset.ready) {
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', play, { once: true });
        } else if (Hls.isSupported()) {
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            hls.on(Hls.Events.MANIFEST_PARSED, play);
            video.__hls = hls;
        } else {
            video.src = source;
            video.addEventListener('loadedmetadata', play, { once: true });
        }

        stage.dataset.ready = 'true';
    }

    stage.classList.add('is-playing');
    play();
};

stages.forEach((stage) => {
    const button = stage.querySelector('[data-play-button]');
    const video = stage.querySelector('video');

    if (button) {
        button.addEventListener('click', () => startPlayer(stage));
    }

    if (video) {
        video.addEventListener('click', () => startPlayer(stage));
        video.addEventListener('play', () => stage.classList.add('is-playing'));
    }
});
