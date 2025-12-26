// Image Tool (GIF / MP4) - client-side only
// GIF: gif.js (worker)
// MP4: WebCodecs + mp4-muxer

document.addEventListener("DOMContentLoaded", () => {
  const btnGif = document.getElementById("btnGif");
  const btnMp4 = document.getElementById("btnMp4");
  const panelGif = document.getElementById("panelGif");
  const panelMp4 = document.getElementById("panelMp4");

  const dropzone = document.getElementById("dropzone");
  const fileInput = document.getElementById("fileInput");

  const previewImg = document.getElementById("previewImg");
  const previewEmpty = document.getElementById("previewEmpty");

  const btnConvert = document.getElementById("btnConvert");
  const btnDownload = document.getElementById("btnDownload");
  const btnReset = document.getElementById("btnReset");
  const fileNameEl = document.getElementById("fileName");
  const statusEl = document.getElementById("status");

  const mp4Seconds = document.getElementById("mp4Seconds");
  const mp4Quality = document.getElementById("mp4Quality");
  const mp4QualityVal = document.getElementById("mp4QualityVal");

  // Hard fail if critical DOM nodes missing
  if (!btnGif || !btnMp4 || !dropzone || !fileInput || !btnConvert || !btnDownload || !btnReset) {
    console.error("Missing DOM elements. Check ids in index.html");
    return;
  }

  let mode = "gif";
  let selectedFile = null;
  let previewUrl = null;

  let outputBlob = null;
  let outputName = null;

  function setStatus(text) {
    if (statusEl) statusEl.textContent = text;
  }

  function revokePreview() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    previewUrl = null;
  }

  function clearOutput() {
    outputBlob = null;
    outputName = null;
    btnDownload.hidden = true;
    btnDownload.textContent = "ダウンロード";
  }

  function setMode(next) {
    mode = next;
    const isGif = mode === "gif";

    btnGif.classList.toggle("active", isGif);
    btnMp4.classList.toggle("active", !isGif);
    btnGif.setAttribute("aria-selected", String(isGif));
    btnMp4.setAttribute("aria-selected", String(!isGif));

    if (panelGif) panelGif.hidden = !isGif;
    if (panelMp4) panelMp4.hidden = isGif;

    btnConvert.textContent = isGif ? "Gifを生成" : "MP4に変換";
    clearOutput();
    setStatus(selectedFile ? "変換できます" : "画像を選択してください");
  }

  // Tabs
  btnGif.addEventListener("click", (e) => { e.preventDefault(); setMode("gif"); });
  btnMp4.addEventListener("click", (e) => { e.preventDefault(); setMode("mp4"); });

  // MP4 slider label
  if (mp4Quality && mp4QualityVal) {
    mp4QualityVal.textContent = `${mp4Quality.value}%`;
    mp4Quality.addEventListener("input", () => {
      mp4QualityVal.textContent = `${mp4Quality.value}%`;
    });
  }

  function clearPreview() {
    revokePreview();
    selectedFile = null;

    if (previewImg) {
      previewImg.src = "";
      previewImg.style.display = "none";
    }
    if (previewEmpty) previewEmpty.style.display = "block";

    fileInput.value = "";
    if (fileNameEl) fileNameEl.textContent = "（未選択）";

    btnConvert.disabled = true;
    btnConvert.textContent = mode === "gif" ? "Gifを生成" : "MP4に変換";

    clearOutput();
    setStatus("画像を選択してください");
  }

  function showPreview(file) {
    revokePreview();
    previewUrl = URL.createObjectURL(file);

    if (previewImg) {
      previewImg.src = previewUrl;
      previewImg.style.display = "block";
    }
    if (previewEmpty) previewEmpty.style.display = "none";
  }

  function handleFile(file) {
    if (!file) return;

    if (!file.type || !file.type.startsWith("image/")) {
      alert("画像ファイルを選択してください。");
      return;
    }

    selectedFile = file;
    if (fileNameEl) fileNameEl.textContent = file.name;

    showPreview(file);
    clearOutput();

    btnConvert.disabled = false;
    setStatus("変換できます");
  }

  // Upload interactions
  dropzone.addEventListener("click", () => fileInput.click());
  dropzone.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") fileInput.click();
  });

  fileInput.addEventListener("change", (e) => {
    const file = e.target.files?.[0];
    handleFile(file);
  });

  dropzone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "#2563eb";
  });
  dropzone.addEventListener("dragleave", () => {
    dropzone.style.borderColor = "#cfd6ea";
  });
  dropzone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropzone.style.borderColor = "#cfd6ea";
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  });

  btnReset.addEventListener("click", clearPreview);

  btnDownload.addEventListener("click", () => {
    if (!outputBlob) return;
    const url = URL.createObjectURL(outputBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = outputName || (mode === "gif" ? "converted.gif" : "converted.mp4");
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  });

  async function decodeImageToCanvas() {
    if (!previewUrl) throw new Error("no preview");
    const img = new Image();
    img.src = previewUrl;
    await img.decode();

    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(img, 0, 0);

    return { canvas, ctx, width: canvas.width, height: canvas.height };
  }

  async function convertGif() {
if (typeof window.GIF !== "function") {
      alert("gif.js の読み込みに失敗しました。libs/gifjs/gif.js を確認してください。");
      return;
    }
    if (!selectedFile) {
      alert("先に画像を選択してください。");
      return;
    }

    btnConvert.disabled = true;
    btnConvert.textContent = "生成中...";
    clearOutput();
    setStatus("変換中...");

    try {
      const { ctx, width, height } = await decodeImageToCanvas();

      const gif = new window.GIF({
        workers: 2,
        quality: 6,
        dither: false,
        workerScript: "./libs/gifjs/gif.worker.js",
        width,
        height,
      });

      const delayMs = 100;
      gif.addFrame(ctx, { copy: true, delay: delayMs });
      gif.addFrame(ctx, { copy: true, delay: delayMs });

      let finished = false;

      const watchdog = setTimeout(() => {
        if (finished) return;
        try { gif.abort(); } catch (_) {}
        alert("GIF生成がタイムアウトしました。画像サイズが大きい可能性があります。");
        btnConvert.disabled = false;
        btnConvert.textContent = "Gifを生成";
        setStatus("変換に失敗しました");
      }, 60000);

      gif.on("progress", (p) => {
        const pct = Math.round((p || 0) * 100);
        setStatus(`変換中... ${pct}%`);
      });

      gif.on("finished", (blob) => {
        finished = true;
        clearTimeout(watchdog);

        outputBlob = blob;
        outputName = "converted.gif";

        btnDownload.hidden = false;
        btnDownload.textContent = "Gifをダウンロード";

        btnConvert.disabled = false;
        btnConvert.textContent = "Gifを生成";
        setStatus("変換完了。ダウンロードしてください。");
      });

      if (typeof gif.on === "function") {
        gif.on("error", (err) => {
          console.error(err);
          clearTimeout(watchdog);
          alert("GIF生成に失敗しました。workerScript のパスを確認してください。");
          btnConvert.disabled = false;
          btnConvert.textContent = "Gifを生成";
          setStatus("変換に失敗しました");
        });
      }

      gif.render();
    } catch (e) {
      console.error(e);
      alert("GIF生成に失敗しました。画像サイズが大きすぎる／メモリ不足の可能性があります。");
      btnConvert.disabled = false;
      btnConvert.textContent = "Gifを生成";
      setStatus("変換に失敗しました");
    }
  }

  async function convertMp4() {
    if (!selectedFile) {
      alert("先に画像を選択してください。");
      return;
    }
    if (!("VideoEncoder" in window) || !("VideoFrame" in window)) {
      alert("このブラウザはWebCodecsに未対応です。");
      return;
    }
    if (!window.Mp4Muxer) {
      alert("mp4-muxer の読み込みに失敗しました。libs/mp4-muxer/mp4-muxer.js を確認してください。");
      return;
    }

    const seconds = Math.max(3, Math.min(30, Number(mp4Seconds?.value || 3)));
    const qualityPct = Math.max(40, Math.min(100, Number(mp4Quality?.value || 90)));

    btnConvert.disabled = true;
    btnConvert.textContent = "変換中...";
    clearOutput();
    setStatus("変換中...");

    try {
      const decoded = await decodeImageToCanvas();
      let canvas = decoded.canvas;
      let width = decoded.width;
      let height = decoded.height;

      // H.264 encoder often requires even dimensions (4:2:0). Pad to even if needed.
      if (width % 2 !== 0 || height % 2 !== 0) {
        const padded = document.createElement("canvas");
        padded.width = width + (width % 2);
        padded.height = height + (height % 2);
        const pctx = padded.getContext("2d");
        pctx.fillStyle = "#000";
        pctx.fillRect(0, 0, padded.width, padded.height);
        pctx.drawImage(canvas, 0, 0);
        canvas = padded;
        width = padded.width;
        height = padded.height;
      }

      const fps = 30;
      const frames = seconds * fps;

      const minBps = 3_000_000;
      const maxBps = 12_000_000;
      const bps = Math.round(minBps + (maxBps - minBps) * ((qualityPct - 40) / 60));

      const target = new window.Mp4Muxer.ArrayBufferTarget();
      const muxer = new window.Mp4Muxer.Muxer({
        target,
        fastStart: "in-memory",
        video: { codec: "avc", width, height, frameRate: fps }
      });

      const encoder = new VideoEncoder({
        output: (chunk, meta) => muxer.addVideoChunk(chunk, meta),
        error: (e) => { throw e; }
      });

      // Pick a supported H.264 profile/level for this device
      const candidates = ["avc1.42E01E", "avc1.4D401E", "avc1.64001E"]; // baseline, main, high
      let chosen = null;

      for (const c of candidates) {
        try {
          const support = await VideoEncoder.isConfigSupported({
            codec: c,
            width,
            height,
            bitrate: bps,
            framerate: fps
          });
          if (support && support.supported) { chosen = c; break; }
        } catch (_) {}
      }

      if (!chosen) {
        throw new Error("No supported H.264 encoder config (WebCodecs).");
      }

      encoder.configure({
        codec: chosen,
        width,
        height,
        bitrate: bps,
        framerate: fps
      });

      const bitmap = await createImageBitmap(canvas);
      const frameDurationUs = Math.round(1_000_000 / fps);

      for (let i = 0; i < frames; i++) {
        const timestamp = i * frameDurationUs;
        const vf = new VideoFrame(bitmap, { timestamp });
        encoder.encode(vf, { keyFrame: i === 0 });
        vf.close();

        if (i % 30 === 0) {
          const pct = Math.round((i / frames) * 100);
          setStatus(`変換中... ${pct}%`);
          await new Promise((r) => setTimeout(r, 0));
        }
      }

      await encoder.flush();
      encoder.close();
      bitmap.close();

      muxer.finalize();

      const blob = new Blob([target.buffer], { type: "video/mp4" });
      outputBlob = blob;
      outputName = "converted.mp4";

      btnDownload.hidden = false;
      btnDownload.textContent = "MP4をダウンロード";
      setStatus("変換完了。ダウンロードしてください。");
    } catch (e) {
      console.error(e);

      const msg = (e && e.message) ? e.message : String(e);
      alert("MP4変換に失敗しました。\n原因: " + msg);
      setStatus("変換に失敗しました");
    } finally {
      btnConvert.disabled = false;
      btnConvert.textContent = mode === "gif" ? "Gifを生成" : "MP4に変換";
    }
  }

  btnConvert.addEventListener("click", async () => {
    if (mode === "gif") await convertGif();
    else await convertMp4();
  });

  // init
  setMode("gif");
  clearPreview();
});
