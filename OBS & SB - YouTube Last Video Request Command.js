document.addEventListener("DOMContentLoaded", () => {
  try {
    const params = new URLSearchParams(location.search);
    const client = new StreamerbotClient({
      host: params.get("host") || "127.0.0.1",
      port: parseInt(params.get("port") || 8080, 10),
      endpoint: params.get("endpoint") || "/",
      password: params.get("password") || "",
      autoReconnect: true,
      immediate: true,
      onConnect: () => {
        console.log("✅ Streamer.bot verbunden!");
      },
      onDisconnect: () => {
        console.warn("⚠️ Streamer.bot getrennt - versuche Reconnect...");
      },
      onError: () => {
        console.error("❌ Streamer.bot Verbindungsfehler!");
      },
    });

    const htmlProperty = "html";
    const headProperty = "head";
    const bodyProperty = "body";

    const html =
      document.documentElement || document.querySelector(htmlProperty);
    const head = document.head || document.querySelector(headProperty);
    const body = document.body || document.querySelector(bodyProperty);

    const copy = "copy";
    const dragstart = "dragstart";
    const keydown = "keydown";
    const select = "select";

    const fontFamilyVar = "--font-family-var";
    const robotoBold = getComputedStyle(html)
      .getPropertyValue(fontFamilyVar)
      .trim();

    const clear = "";
    const zero = 0;
    const none = "none";
    const def = "default";

    let ytLastVidId = null || clear;
    let ytLastVidTitle = null || clear;
    let duration = null || zero;
    let muted = false;
    let endTimer = null || zero;
    let end = zero;
    let loop = false;
    let start = zero;
    let playerCreated = false;

    client.on("Misc.GlobalVariableUpdated", ({ data }) => {
      if (!data || !data.name) return;

      if (data.name === "ytLastVidId") {
        ytLastVidId = data.newValue;
        console.log("🔄 Aktualisierte YouTube Video-ID:", ytLastVidId);

        if (!playerCreated && ytLastVidId) {
          playerCreated = true;
          createYoutubePlayerToken();
        }
      }

      if (data.name === "ytLastVidTitle") {
        ytLastVidTitle = data.newValue;
        console.log("🔄 Aktualisierter YouTube Video-Titel:", ytLastVidTitle);
      }

      if (data.name === "ytfullUrlDelay") {
        duration = parseInt(data.newValue, 10);
        console.log("🔄 Aktualisierte Dauer (ms):", duration);
      }
    });

    const diamond = "#";
    const get = (id) =>
      document.getElementById(id) || document.querySelector(diamond + id);

    const youtubePlayerDiv = get("youtubePlayerContainerId");

    function jssYoutubePlayerDivToken() {
      const cssWidth = window
        .getComputedStyle(youtubePlayerDiv)
        .getPropertyValue("width")
        .trim();
      const cssHeight = window
        .getComputedStyle(youtubePlayerDiv)
        .getPropertyValue("height")
        .trim();

      if (cssWidth && cssHeight) {
        youtubePlayerDiv.style.width = cssWidth;
        youtubePlayerDiv.style.height = cssHeight;
      }
    }
    jssYoutubePlayerDivToken();

    const youtubePlayer = get("youtubePlayerId");

    (function htmlElementSecurityToken() {
      const elementArray = [body, youtubePlayerDiv, youtubePlayer];
      const eventArray = [copy, dragstart, keydown, select];

      elementArray.forEach((element) => {
        if (!element) return;
        eventArray.forEach((event) => {
          if (!event) return;
          element.addEventListener(event, (e) => e.preventDefault());
        });
      });

      elementArray.filter(Boolean).forEach((element) => {
        if (!element) return;
        Object.assign(element.style, {
          fontFamily: robotoBold,
          WebkitUserSelect: none,
          userSelect: none,
          cursor: def,
          pointerEvents: none,
        });
      });
    })();

    function createYoutubePlayerToken() {
      try {
        const src = "src";
        const asyncProperty = "async";
        const asyncBoolProperty = true;
        const youtubeApiUrl = "https://www.youtube.com/iframe_api";
        const loading = "loading";
        const lazy = "lazy";

        youtubePlayer.setAttribute(loading, lazy);

        const cssWidth = window
          .getComputedStyle(youtubePlayer)
          .getPropertyValue("width")
          .trim();
        const cssHeight = window
          .getComputedStyle(youtubePlayer)
          .getPropertyValue("height")
          .trim();
        const cssBorderRadius = window
          .getComputedStyle(youtubePlayer)
          .getPropertyValue("border-radius")
          .trim();

        youtubePlayer.style.width = cssWidth;
        youtubePlayer.style.height = cssHeight;
        youtubePlayer.style.borderRadius = cssBorderRadius;

        const iframeWidth = 1920 || cssWidth;
        const iframeHeight = 1080 || cssHeight;

        const script = document.createElement("script");
        script.setAttribute(asyncProperty, asyncBoolProperty);
        script.setAttribute(src, youtubeApiUrl);

        const firstScriptTag = document.getElementsByTagName("script")[zero];
        firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

        let player = null;

        window.onYouTubeIframeAPIReady = function () {
          player = new YT.Player(youtubePlayer, {
            width: iframeWidth,
            height: iframeHeight,
            videoId: ytLastVidId,
            playerVars: {
              playsinline: 1,
              rel: 0,
              controls: 1,
              autoplay: 1,
              enablejsapi: 1,
              origin: window.location.origin,
            },
            events: {
              onReady: onPlayerReady,
              onStateChange: onPlayerStateChange,
              onError: onPlayerError,
            },
          });
        };

        function onPlayerReady(event) {
          console.log("✅ YouTube Player ist bereit!");

          event.target.playVideo();

          if (muted) {
            player.mute();
          } else {
            player.unMute();
            player.setVolume(100);
          }
        }

        function clearEndTimer() {
          if (endTimer) {
            clearTimeout(endTimer);
            endTimer = null;
          }
        }

        function onPlayerStateChange(event) {
          const YTState =
            window.YT && window.YT.PlayerState ? window.YT.PlayerState : null;
          if (!YTState || !player) return;

          const stateNames = {
            [-1]: "UNSTARTED",
            [0]: "ENDED",
            [1]: "PLAYING",
            [2]: "PAUSED",
            [3]: "BUFFERING",
            [5]: "CUED",
          };

          console.log(
            `📺 Player Status: ${stateNames[event.data] || event.data}`,
          );

          if (event.data === YTState.PLAYING) {
            clearEndTimer();

            const currentTime = player.getCurrentTime();
            if (end > 0 && !loop) {
              const remaining = Math.max(0, end - currentTime);
              console.log(
                `⏲️ Stoppe Video in ${remaining.toFixed(1)}s bei Sekunde ${end}`,
              );
              endTimer = setTimeout(
                () => {
                  if (player) {
                    player.pauseVideo();
                    if (duration > 0) {
                      setTimeout(() => {
                        const iframe = youtubePlayerDiv.querySelector("iframe");
                        if (iframe) {
                          iframe.src = clear;
                        }
                      }, duration);
                    }
                  }
                },
                Math.ceil(remaining * 1000),
              );
            }
          } else if (
            event.data === YTState.PAUSED ||
            event.data === YTState.BUFFERING
          ) {
            clearEndTimer();
          } else if (event.data === YTState.ENDED) {
            clearEndTimer();
            if (loop && end === 0) {
              setTimeout(() => {
                player.seekTo(start > 0 ? start : 0, true);
                player.playVideo();
                console.log("🔄 Video loop - neu gestartet");
              }, 100);
            } else {
              if (duration > 0) {
                setTimeout(() => {
                  const iframe = youtubePlayerDiv.querySelector("iframe");
                  if (iframe) {
                    iframe.src = clear;
                  }
                }, duration);
              }
            }
          }
        }

        function onPlayerError(event) {
          console.error("❌ YouTube Player Fehler:", event.data);

          const errorCodes = {
            2: "Ungültige Video-ID",
            5: "HTML5 Player Fehler",
            100: "Video nicht gefunden",
            101: "Video nicht einbettbar (Eigentümer-Einstellung)",
            150: "Video nicht einbettbar (Eigentümer-Einstellung)",
          };
          console.error(
            `Fehlercode ${event.data}: ${errorCodes[event.data] || "Unbekannter Fehler"}`,
          );

          if (event.data === 101 || event.data === 150) {
            showImageFallbackToken();
          }
        }

        function showImageFallbackToken() {
          const iframe = youtubePlayerDiv.querySelector("iframe");
          if (iframe) {
            iframe.remove();
          }

          const ytFallBackImgTime = 5000 || duration;

          const eventArray = [copy, dragstart, keydown, select];

          const styleTag = "style";
          const style = head.querySelector(styleTag);

          const dataStyle = `
            .youtube-fallback-img[alt="${ytLastVidTitle}"] {
              background: rgba(${zero.toString()}, ${zero.toString()}, ${zero.toString()}, ${zero.toString()});
              display: flex;
              align-items: center;
              align-content: center;
              justify-items: center;
              justify-content: center;
              text-align: center;
              font-size: ${zero.toString()}px;
              color: rgba(${zero.toString()}, ${zero.toString()}, ${zero.toString()}, ${zero.toString()});
              text-shadow: ${none};
              text-decoration: ${none};
              -webkit-user-select: ${none};
              user-select: ${none};
              cursor: ${def};
              pointer-events: ${none};
            }
          `;

          if (head && style) style.innerHTML = dataStyle;

          const img = "img";

          const width = "width";
          const height = "height";
          const src = "src";
          const alt = "alt";
          const loading = "loading";
          const eager = "eager";

          const widthImg = 1920 + "px";
          const heightImg = 1080 + "px";

          const cssClassYoutubeFallbackImg = "youtube-fallback-img";

          const youtubeFallBackImgUrl = `https://img.youtube.com/vi/${ytLastVidId}/maxresdefault.jpg`;
          const youtubeFallBackAltText = ytLastVidTitle;

          const youtubeFallBackImgEl = document.createElement(img);
          youtubeFallBackImgEl.setAttribute(width, widthImg);
          youtubeFallBackImgEl.setAttribute(height, heightImg);
          youtubeFallBackImgEl.setAttribute(src, youtubeFallBackImgUrl);
          youtubeFallBackImgEl.setAttribute(alt, youtubeFallBackAltText);
          youtubeFallBackImgEl.classList.add(cssClassYoutubeFallbackImg);
          youtubeFallBackImgEl.setAttribute(loading, eager);
          eventArray.forEach((event) => {
            if (!event) return;

            youtubeFallBackImgEl.addEventListener(event, (e) =>
              e.preventDefault(),
            );
          });
          Object.assign(youtubeFallBackImgEl.style, {
            fontFamily: robotoBold,
            borderRadius: 25 + "px",
            WebkitUserSelect: none,
            userSelect: none,
            cursor: def,
            pointerEvents: none,
          });
          youtubePlayerDiv.appendChild(youtubeFallBackImgEl);

          console.warn(
            "🖼️ Embed fehlgeschlagen - zeige Bild-Fallback stattdessen.",
          );

          setTimeout(() => {
            youtubeFallBackImgEl.remove();
          }, ytFallBackImgTime);
        }
      } catch (error) {
        console.error("Fehler beim Erstellen vom YouTube Embed:", error);
      }
    }
  } catch (error) {
    console.error("Haupt-Fehler:", error);
  }
});
