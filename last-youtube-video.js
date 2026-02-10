document.addEventListener("DOMContentLoaded", () => {
  try {
    const params = new URLSearchParams(window.location.search);
    const ytLastVidId = params.get("ytLastVidId") || "";
    const ytLastVidTitle = params.get("ytLastVidTitle") || "";
    const duration = parseInt(params.get("duration") || 60000, 10);

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

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(script, firstScriptTag);

    let player;
    let done = false;

    window.onYouTubeIframeAPIReady = function () {
      player = new YT.Player("youtubePlayerId", {
        width: 1920,
        height: 1080,
        videoId: ytLastVidId,
        title: ytLastVidTitle,
        playerVars: {
          playsinline: 1,
          autoplay: 1,
          controls: 0,
          modestbranding: 1,
          rel: 0,
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });

      const iframe = document.querySelector("iframe");
      iframe.loading = "eager";
    };

    function onPlayerReady(event) {
      console.log("YouTube Player ist bereit!");
      event.target.playVideo();
    }

    function onPlayerStateChange(event) {
      if (event.data == YT.PlayerState.PLAYING && !done) {
        console.log("Video spielt - stoppe in 6 Sekunden");
        setTimeout(stopVideo, 6000);
        done = true;
      }
    }

    function stopVideo() {
      if (player) {
        player.stopVideo();
        console.log("Video gestoppt");

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
