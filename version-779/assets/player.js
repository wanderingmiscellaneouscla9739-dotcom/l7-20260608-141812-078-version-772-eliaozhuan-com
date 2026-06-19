(function () {
  function bindPlayer(box) {
    var video = box.querySelector("video");
    var cover = box.querySelector(".player-cover");
    if (!video || !cover) {
      return;
    }
    var stream = video.getAttribute("data-stream");
    var initialized = false;
    var hlsInstance = null;

    function attach() {
      if (initialized || !stream) {
        return;
      }
      initialized = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = stream;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        return;
      }
      video.src = stream;
    }

    function play() {
      attach();
      cover.classList.add("is-hidden");
      video.controls = true;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          cover.classList.remove("is-hidden");
          video.controls = false;
        });
      }
    }

    cover.addEventListener("click", play);
    video.addEventListener("play", function () {
      cover.classList.add("is-hidden");
    });
    video.addEventListener("error", function () {
      if (hlsInstance && typeof hlsInstance.recoverMediaError === "function") {
        hlsInstance.recoverMediaError();
      }
    });
  }

  function init() {
    Array.prototype.slice.call(document.querySelectorAll("[data-player]")).forEach(bindPlayer);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
