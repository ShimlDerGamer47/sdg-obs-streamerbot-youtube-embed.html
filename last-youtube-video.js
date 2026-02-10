document.addEventListener("DOMContentLoaded", () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const ytLastVidId = (
      params.get("ytLastVidId") ||
      params.get("videoId") ||
      ""
    ).trim();
    const ytLastVidTitle = params.get("ytLastVidTitle") || "";
    const duration = parseInt(params.get("duration") || 0, 10);

    if (!ytLastVidId) {
      console.warn(
        "Keine Video-ID gefunden (ytLastVidId oder videoId Parameter).",
      );
      return;
    }

    let autoplay = true;
    let muted = true;
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

    // Validierung
    if (end > 0 && end <= start) {
      console.warn("'end' muss größer als 'start' sein. 'end' wird ignoriert.");
      end = 0;
    }

    if (autoplay && !muted) {
      console.warn(
        "Autoplay mit Ton wird von Browsern blockiert. 'muted' wird auf true gesetzt.",
      );
      muted = true;
    }

    const client = new StreamerbotClient({
      host: params.get("host") || "127.0.0.1",
      port: parseInt(params.get("port") || 8080, 10),
      endpoint: params.get("endpoint") || "/",
      password: params.get("password") || "",
      autoReconnect: true,
      immediate: true,
      onConnect: () => {
        console.log(
          "Der Streamer.bot hat sich über die API mit der Website verbunden!",
        );
      },
      onDisconnect: () => {
        console.warn(
          "Der Streamer.bot kann sich nicht verbinden. Der Streamer.bot versucht es erneut.",
        );
      },
      onError: () => {
        console.error(
          "Der Streamer.bot kann sich nicht verbinden mit der Website über die API!",
        );
      },
    });

    console.log(client);

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

    const youtubePlayerDiv =
      document.getElementById("youtubePlayerContainerId") ||
      document.querySelector("#youtubePlayerContainerId");
    const youtubePlayer =
      document.getElementById("youtubePlayerId") ||
      document.querySelector("#youtubePlayerId");
    if (youtubePlayerDiv && ytLastVidTitle) {
      youtubePlayer.setAttribute("title", ytLastVidTitle);
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

    let player = null;
    let endTimer = null;

    window.onYouTubeIframeAPIReady = function () {
      const playerVars = {
        playsinline: 1,
        rel: 0,
        controls: controls ? 1 : 0,
        autoplay: autoplay ? 1 : 0,
        start: start > 0 ? start : undefined,
        loop: loop ? 1 : 0,
        playlist: loop ? ytLastVidId : undefined,
        modestbranding: 1,
      };

      player = new YT.Player("youtubePlayerId", {
        width: 1920,
        height: 1080,
        videoId: ytLastVidId,
        playerVars: playerVars,
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: (e) => console.error("YT Player Fehler:", e),
        },
      });
    };

    function onPlayerReady(event) {
      console.log("YouTube Player ist bereit!");

      if (muted) {
        player.mute();
      } else {
        player.unMute();
      }

      if (start > 0) {
        try {
          player.seekTo(start, true);
        } catch (e) {
          console.warn("Konnte nicht zu Start-Position springen:", e);
        }
      }

      if (autoplay) {
        try {
          event.target.playVideo();
        } catch (err) {
          console.warn("Autoplay wurde möglicherweise blockiert:", err);
        }
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

      if (!YTState) return;

      if (event.data === YTState.PLAYING) {
        clearEndTimer();
        console.log("Video spielt jetzt");

        if (end > 0) {
          const current = player.getCurrentTime ? player.getCurrentTime() : 0;
          const remaining = Math.max(0, end - current);

          endTimer = setTimeout(
            () => {
              if (!player) return;

              if (loop) {
                player.seekTo(start > 0 ? start : 0, true);
                player.playVideo();
                console.log("Video loop zurück zu Start");
              } else {
                player.pauseVideo();
                console.log("Video bei 'end' Parameter gestoppt");

                if (duration > 0) {
                  setTimeout(() => {
                    const iframe = document.querySelector("iframe");
                    if (iframe) {
                      iframe.src = "";
                      console.log("IFrame geleert nach", duration, "ms");
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
        console.log("Video ist komplett zu Ende");

        if (loop && end === 0) {
          try {
            player.seekTo(start > 0 ? start : 0, true);
            player.playVideo();
            console.log("Video loop - neu gestartet");
          } catch (err) {
            console.warn("Loop-Fehler:", err);
          }
        } else {
          if (duration > 0) {
            setTimeout(() => {
              const iframe = document.querySelector("iframe");
              if (iframe) {
                iframe.src = "";
                console.log(
                  "IFrame geleert nach Video-Ende, duration:",
                  duration,
                  "ms",
                );
              }
            }, duration);
          }
        }
      }
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

      if (youtubePlayerDiv && youtubePlayer) {
        youtubePlayer.style.borderRadius = "25px";
      }
    })();
  } catch (error) {
    console.error("Haupt-Fehler:", error);
  }
});
