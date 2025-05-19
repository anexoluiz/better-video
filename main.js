// ==UserScript==
// @name         better video
// @namespace    userscript-namespace
// @version      0.1
// @description  ViolentMonkey Userscript
// @match        *://*/*
// @grant        none
// ==/UserScript==

window.addEventListener("load", () => {
  function addOverlayToVideo(video) {
    const container = document.createElement("div");
    container.classList.add("video-container");
    video.parentNode.insertBefore(container, video);
    container.appendChild(video);

    const controls = document.createElement("div");
    controls.classList.add("custom-controls");
    container.appendChild(controls);

    const playPauseBtn = document.createElement("button");
    playPauseBtn.innerHTML = "▶️";
    controls.appendChild(playPauseBtn);

    const seekBar = document.createElement("input");
    seekBar.type = "range";
    seekBar.value = 0;
    seekBar.classList.add("seek-bar");
    controls.appendChild(seekBar);

    const volumeBtn = document.createElement("button");
    volumeBtn.innerHTML = "🔊";
    controls.appendChild(volumeBtn);

    const pipBtn = document.createElement("button");
    pipBtn.innerHTML = "PIP";
    controls.appendChild(pipBtn);

    const castBtn = document.createElement("button");
    castBtn.innerHTML = "📺";
    controls.appendChild(castBtn);

    const fullscreenBtn = document.createElement("button");
    fullscreenBtn.innerHTML = "⛶";
    controls.appendChild(fullscreenBtn);

    const style = document.createElement("style");
    style.textContent = `
                .video-container {
                    position: relative;
                    width: 600px;
                    margin: auto;
                }

                video {
                    position: relative;
                    z-index: -1; /* Colocar o vídeo atrás */
                }

                .custom-controls {
                    position: absolute;
                    bottom: 0;
                    left: 0;
                    width: 100%;
                    display: flex;
                    align-items: center;
                    background: rgba(0, 0, 0, 0.5);
                    border-radius: 10px;
                    padding: 10px;
                    z-index: 9999; /* Z-index alto para o overlay */
                }

                button {
                    margin: 0 10px;
                    padding: 10px;
                    color: white;
                    background-color: transparent;
                    border: none;
                    cursor: pointer;
                    font-size: 20px;
                }

                .seek-bar {
                    flex: 1;
                    margin: 0 10px;
                }

                .volume-indicator {
                    position: absolute;
                    background: rgba(0, 0, 0, 0.8);
                    color: white;
                    padding: 5px;
                    border-radius: 5px;
                    display: none;
                }
                .video-container:fullscreen {
                    width: 100%;
                    height: 100%;
                    position: fixed; /* Para ocupar toda a tela */
                    top: 0;
                    left: 0;
                    z-index: 9999; /* Para garantir que fique acima de outros elementos */
                }
                .video-container:fullscreen video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover; /* Para manter a proporção do vídeo */
                }
                .volume-slider {
                    display: none; /* Inicialmente oculto */
                    position: absolute;
                    background: rgba(0, 0, 0, 0.8);
                    width: 100px; /* Largura da barra de volume */
                    height: 5px; /* Altura da barra de volume */
                    border-radius: 5px;
                    z-index: 10000; /* Para garantir que fique acima de outros elementos */
                }

                .volume-slider input {
                    width: 100%;
                }

                .volume-slider {
                  display: none;
                  position: absolute;
                  transform: rotate(-90deg);
                  transform-origin: bottom left;
                  left: -20px !important; /* Mais próximo do botão */
                  top: -40px !important;
                }
            `;
    document.head.appendChild(style);

    let isSeeking = false;
    let isVolumeChanging = false;
    let volumeIndicator = null;
    let hideVolumeTimer;

    let volumeSlider = document.createElement("div");
    volumeSlider.classList.add("volume-slider");
    const volumeInput = document.createElement("input");
    volumeInput.type = "range";
    volumeInput.min = 0;
    volumeInput.max = 1;
    volumeInput.step = 0.01;
    volumeInput.value = video.volume;
    volumeSlider.appendChild(volumeInput);
    document.body.appendChild(volumeSlider);

    volumeBtn.addEventListener("mouseenter", () => {
      volumeSlider.style.display = "block";
      positionVolumeSlider(volumeBtn);
      clearTimeout(hideVolumeTimer);
    });

    volumeBtn.addEventListener("mouseleave", () => {
      hideVolumeTimer = setTimeout(() => {
        volumeSlider.style.display = "none";
      }, 300);
    });

    volumeSlider.addEventListener("mouseenter", () => {
      clearTimeout(hideVolumeTimer);
    });

    volumeSlider.addEventListener("mouseleave", () => {
      hideVolumeTimer = setTimeout(() => {
        volumeSlider.style.display = "none";
      }, 300);
    });

    volumeInput.addEventListener("input", () => {
      video.volume = volumeInput.value;
    });

    function positionVolumeSlider(button) {
      const rect = button.getBoundingClientRect();
      volumeSlider.style.left = `${rect.left}px`;
      volumeSlider.style.top = `${rect.top - 120}px`;
    }

    playPauseBtn.addEventListener("click", () => {
      if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = "⏸️";
      } else {
        video.pause();
        playPauseBtn.innerHTML = "▶️";
      }
    });

    container.addEventListener("click", (e) => {
      if (e.target === container || e.target === video) {
        if (video.paused) {
          video.play();
          playPauseBtn.innerHTML = "⏸️";
        } else {
          video.pause();
          playPauseBtn.innerHTML = "▶️";
        }
      }
    });

    video.addEventListener("ended", () => {
      playPauseBtn.innerHTML = "▶️";
    });

    video.addEventListener("timeupdate", () => {
      const value = (video.currentTime / video.duration) * 100;
      seekBar.value = value;
    });

    seekBar.addEventListener("input", () => {
      const time = (seekBar.value / 100) * video.duration;
      video.currentTime = time;
    });

    volumeBtn.addEventListener("click", () => {
      video.muted = !video.muted;
      volumeBtn.innerHTML = video.muted ? "🔇" : "🔊";
    });

    pipBtn.addEventListener("click", async () => {
      if (video !== document.pictureInPictureElement) {
        await video.requestPictureInPicture();
      } else {
        await document.exitPictureInPicture();
      }
    });

    fullscreenBtn.addEventListener("click", () => {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        if (container.requestFullscreen) {
          container.requestFullscreen();
        } else if (container.webkitRequestFullscreen) {
          container.webkitRequestFullscreen();
        }
      }
    });

    let seekIndicator = null;

    seekBar.addEventListener("mousedown", (e) => {
      isSeeking = true;
      showSeekIndicator(e);
    });

    document.addEventListener("mousemove", (e) => {
      if (isSeeking) {
        const rect = seekBar.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const percentage = Math.min(Math.max(0, offsetX / rect.width), 1);
        const time = percentage * video.duration;
        video.currentTime = time;
        updateSeekIndicator(percentage);
      }
    });

    document.addEventListener("mouseup", () => {
      isSeeking = false;
      if (seekIndicator) {
        seekIndicator.style.display = "none";
      }
    });

    function showSeekIndicator(e) {
      if (!seekIndicator) {
        seekIndicator = document.createElement("div");
        seekIndicator.classList.add("volume-indicator");
        document.body.appendChild(seekIndicator);
      }
      seekIndicator.style.display = "block";
      positionSeekIndicator(e);
    }

    function updateSeekIndicator(percentage) {
      seekIndicator.textContent = `Seek: ${(percentage * 100).toFixed(0)}%`;
    }

    function positionSeekIndicator(e) {
      seekIndicator.style.left = `${e.clientX}px`;
      seekIndicator.style.top = `${e.clientY - 30}px`;
    }

    container.addEventListener("mouseenter", () => {
      controls.style.display = "flex";
    });

    container.addEventListener("mouseleave", () => {
      controls.style.display = "none";
    });

    document.addEventListener("mousemove", (e) => {
      if (isVolumeChanging) {
        const volume = Math.min(Math.max(0, e.clientY / window.innerHeight), 1);
        video.volume = volume;
        volumeInput.value = volume;
        updateVolumeIndicator(volume);
      }
    });

    document.addEventListener("mouseup", () => {
      isVolumeChanging = false;
      if (volumeIndicator) {
        volumeIndicator.style.display = "none";
      }
    });

    function showVolumeIndicator(e) {
      if (!volumeIndicator) {
        volumeIndicator = document.createElement("div");
        volumeIndicator.classList.add("volume-indicator");
        document.body.appendChild(volumeIndicator);
      }
      volumeIndicator.style.display = "block";
      updateVolumeIndicator(video.volume);
      positionVolumeIndicator(e);
    }

    function updateVolumeIndicator(volume) {
      volumeIndicator.textContent = `Volume: ${(volume * 100).toFixed(0)}%`;
    }

    function positionVolumeIndicator(e) {
      volumeIndicator.style.left = `${e.clientX}px`;
      volumeIndicator.style.top = `${e.clientY - 30}px`;
    }

    volumeBtn.addEventListener("mousedown", (e) => {
      isVolumeChanging = true;
      showVolumeIndicator(e);
    });

    document.addEventListener("fullscreenchange", () => {
      if (document.fullscreenElement) {
        controls.style.display = "flex";
      } else {
        controls.style.display = "none";
      }
    });
  }

  function observeNewVideos() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            const newlyAddedVideos = node.querySelectorAll("video");
            newlyAddedVideos.forEach((vid) => {
              addOverlayToVideo(vid);
              vid.addEventListener("loadeddata", () => addOverlayToVideo(vid));
            });
          }
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  const videos = document.querySelectorAll("video");
  videos.forEach((video) => {
    addOverlayToVideo(video);
  });

  observeNewVideos();
});
