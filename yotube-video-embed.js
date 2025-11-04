document.addEventListener("DOMContentLoaded", () => {
  try {
    const html = document.documentElement;
    const fontFamilyVar = "--font-family";
    const robotoBold = getComputedStyle(html)
      .getPropertyValue(fontFamilyVar)
      .trim();

    const body = document.body;
    if (robotoBold) {
      Object.assign(body.style, {
        fontFamily: robotoBold,
        background: "rgba(0, 0, 0, 0)",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        margin: "0px",
      });
    }

    function createPlayerContainer() {
      const div = document.createElement("div");
      div.classList.add("youtube-video-embed-container");
      Object.assign(div.style, {
        background: "rgba(0, 0, 0, 0)",
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: "flex",
        alignItems: "center",
        alignContent: "center",
        justifyItems: "center",
        justifyContent: "center",
        border: "none",
      });
      body.appendChild(div);

      return div;
    }

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get("videoId");
    if (!videoId || videoId.trim() === "") {
      console.warn("Keine 'videoId' Parameter in der URL gefunden.");
      return;
    }

    const container = videoId ? createPlayerContainer() : "";

    let autoplay = false;
    let muted = false;
    let controls = true;
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
      console.warn("'end' muss größer als 'start' sein. 'end' wird ignoriert.");
      end = 0;
    }

    if (autoplay && !muted) {
      console.warn(
        "Autoplay mit Ton wird von vielen Browsern blockiert. 'muted' wird auf true gesetzt."
      );
      muted = true;
    }

    const embedParams = new URLSearchParams();
    embedParams.set("playsinline", "1");
    embedParams.set("rel", "0");
    embedParams.set("controls", controls ? "1" : "0");
    embedParams.set("autoplay", autoplay ? "1" : "0");
    if (muted) embedParams.set("mute", "1");
    if (start) embedParams.set("start", String(start));
    if (end) embedParams.set("end", String(end));
    if (loop) {
      embedParams.set("loop", "1");
      embedParams.set("playlist", videoId);
    }

    const src = `https://www.youtube.com/embed/${encodeURIComponent(
      videoId
    )}?${embedParams.toString()}`;

    const iframe = document.createElement("iframe");
    iframe.src = src;
    iframe.width = 1920;
    iframe.height = 1080;
    iframe.classList.add("youtube-video-embed");
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    );
    iframe.setAttribute("allowfullscreen", "");
    iframe.title = "YouTube Video Player";
    iframe.setAttribute("frameborder", 0);
    iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");

    Object.assign(iframe.style, {
      fontFamily: robotoBold,
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "flex",
      alignItems: "center",
      alignContent: "center",
      justifyItems: "center",
      justifyContent: "center",
      border: "none",
    });

    container.appendChild(iframe);

    function securityToken() {
      [body, container, iframe].forEach((element) => {
        if (!element) return;

        ["copy", "dragstart", "keydown", "select"].forEach((event) => {
          if (!event) return;

          element.addEventListener(event, (e) => e.preventDefault());
        });

        element.style.webkitUserSelect = "none";
        element.style.userSelect = "none";
      });
    }
    securityToken();
  } catch (error) {
    console.error("Error:", error);
  }
});
