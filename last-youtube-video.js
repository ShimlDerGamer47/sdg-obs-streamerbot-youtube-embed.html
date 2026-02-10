document.addEventListener("DOMContentLoaded", () => {
  try {
    const params = new URLSearchParams(window.location.search);

    const ytLastVidId = params.get("ytLastVidId") || "";
    const ytLastVidTitle = params.get("ytLastVidTitle") || "";
    const duration = parseInt(params.get("duration") || 0, 10);

    if (!ytLastVidId) {
      console.warn("Keine Video-ID gefunden!");
      return;
    }

    let autoplay = true;
    let muted = false;
    let controls = false;
    let loop = false;
    let start = 0;
    let end = 0;

    if (params.has("autoplay")) {
      const v = (params.get("autoplay") || "").toLowerCase();
      autoplay = v === "true" || v === "1";
    }
    if (params.has("muted")) {
      const v = (params.get("muted") || "").toLowerCase();
      muted = v === "true" || v === "1";
    }
    if (params.has("controls")) {
      const v = (params.get("controls") || "").toLowerCase();
      controls = v === "true" || v === "1";
    }
    if (params.has("loop")) {
      const v = (params.get("loop") || "").toLowerCase();
      loop = v === "true" || v === "1";
    }
    if (params.has("start")) {
      const v = parseInt(params.get("start"), 10);
      if (!Number.isNaN(v) && v >= 0) start = v;
    }
    if (params.has("end")) {
      const v = parseInt(params.get("end"), 10);
      if (!Number.isNaN(v) && v > 0) end = v;
    }

    if (end > 0 && end <= start) {
      console.warn("'end' muss größer als 'start' sein.");
      end = 0;
    }

    const client = new StreamerbotClient({
      host: params.get("host") || "127.0.0.1",
      port: parseInt(params.get("port") || 8080, 10),
      endpoint: params.get("endpoint") || "/",
      password: params.get("password") || "",
      autoReconnect: true,
      immediate: true,
      onConnect: () => {
        console.log("Streamer.bot verbunden!");
      },
      onDisconnect: () => {
        console.warn("Streamer.bot getrennt - versuche Reconnect...");
      },
      onError: () => {
        console.error("Streamer.bot Verbindungsfehler!");
      },
    });

    const html = document.documentElement;
    const body = document.body;

    const fontFamilyVar = "--font-family-var";
    const robotoBold = getComputedStyle(html)
      .getPropertyValue(fontFamilyVar)
      .trim();

    const copy = "copy";
    const dragstart = "dragstart";
    const keydown = "keydown";
    const select = "select";
    const none = "none";
    const def = "default";

    (function bodyToken() {
      const eventArray = [copy, dragstart, keydown, select];
      eventArray.forEach((event) => {
        if (!event) return;
        body.addEventListener(event, (e) => e.preventDefault());
      });

      if (robotoBold) {
        Object.assign(body.style, {
          fontFamily: robotoBold,
          webkitUserSelect: none,
          userSelect: none,
          cursor: def,
        });
      }
    })();

    const youtubePlayerDiv = document.getElementById(
      "youtubePlayerContainerId",
    );
    const youtubePlayer = document.getElementById("youtubePlayerId");

    if (youtubePlayerDiv && youtubePlayer && ytLastVidTitle) {
      youtubePlayer.setAttribute("title", ytLastVidTitle);
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

    let player = null;
    let endTimer = null;

    window.onYouTubeIframeAPIReady = function () {
      console.log("YouTube IFrame API bereit!");

      const playerVars = {
        playsinline: 1,
        rel: 0,
        iv_load_policy: 3,
        modestbranding: 1,
        controls: controls ? 1 : 0,
        autoplay: 1,
        mute: muted ? 1 : 0,
        start: start > 0 ? start : undefined,
        end: end > 0 ? end : undefined,
        loop: loop ? 1 : 0,
        playlist: loop ? ytLastVidId : undefined,
        enablejsapi: 1,
        origin: window.location.origin,
      };

      console.log("Player-Konfiguration:", {
        videoId: ytLastVidId,
        autoplay,
        muted,
        controls,
        loop,
        start,
        end,
      });

      player = new YT.Player("youtubePlayerId", {
        width: "100%",
        height: "100%",
        videoId: ytLastVidId,
        playerVars: playerVars,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    };

    function onPlayerReady(event) {
      console.log("✅ YouTube Player ist bereit!");

      if (muted) {
        player.mute();
        console.log("🔇 Player ist gemuted");
      } else {
        player.unMute();
        player.setVolume(100);
        console.log("🔊 Player hat Ton (100%)");
      }

      setTimeout(() => {
        event.target.playVideo();
        console.log("▶️ Video wird gestartet...");
      }, 100);
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

      console.log(`📺 Player Status: ${stateNames[event.data] || event.data}`);

      if (event.data === YTState.PLAYING) {
        clearEndTimer();

        const currentTime = player.getCurrentTime();
        const totalDuration = player.getDuration();
        console.log(
          `⏱️ Video spielt: ${currentTime.toFixed(1)}s / ${totalDuration.toFixed(1)}s`,
        );

        if (end > 0 && !loop) {
          const remaining = Math.max(0, end - currentTime);
          console.log(
            `⏲️ Stoppe Video in ${remaining.toFixed(1)}s bei Sekunde ${end}`,
          );

          endTimer = setTimeout(
            () => {
              if (player) {
                player.pauseVideo();
                console.log("⏸️ Video bei 'end' gestoppt");

                if (duration > 0) {
                  setTimeout(() => {
                    const iframe = document.querySelector("iframe");
                    if (iframe) {
                      iframe.src = "";
                      console.log(`🗑️ IFrame geleert nach ${duration}ms`);
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
        console.log("🏁 Video ist zu Ende!");

        if (loop && end === 0) {
          setTimeout(() => {
            player.seekTo(start > 0 ? start : 0, true);
            player.playVideo();
            console.log("🔄 Video loop - neu gestartet");
          }, 100);
        } else {
          if (duration > 0) {
            setTimeout(() => {
              const iframe = document.querySelector("iframe");
              if (iframe) {
                iframe.src = "";
                console.log(
                  `🗑️ IFrame geleert nach Video-Ende (${duration}ms)`,
                );
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
    }

    (function elementToken() {
      const elementArray = [youtubePlayerDiv, youtubePlayer];
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
        if (robotoBold) {
          Object.assign(element.style, {
            fontFamily: robotoBold,
            webkitUserSelect: none,
            userSelect: none,
            cursor: def,
          });
        }
      });

      if (youtubePlayer) {
        youtubePlayer.style.borderRadius = "25px";
      }
    })();

    console.log("🚀 YouTube Player Initialisierung gestartet!");
  } catch (error) {
    console.error("💥 Hauptfehler:", error);
  }
});
