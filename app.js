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

  // --- i18n (JP / EN) ---
  const langToggle = document.getElementById("langToggle");

  const I18N = {
    ja: {
      title: "画像 → GIF / MP4 変換",
      desc: "読み込み・変換・書き出しは、すべてお使いのブラウザ内で実行されます。\n画像をサーバーへ送信する処理はありません。",
      mp4_note: "※ MP4はブラウザ/端末によって対応状況が異なります（未対応の場合は失敗することがあります）",
      dz_title: "画像をドラッグ＆ドロップ",
      dz_sub: "またはクリックして選択（JPG / PNG / WebP）",
      preview_h: "プレビュー",
      preview_empty: "画像が未選択です",
      settings_h: "設定",
      gif_panel_note: "GIFは静止画風（2フレーム）で生成します。\nGIFは仕様上256色制限があり、写真やグラデーションでは劣化する場合があります。",
      mp4_seconds: "再生時間（秒）",
      mp4_bitrate: "ビットレート（目安）",
      btn_convert_gif: "Gifを生成",
      btn_convert_mp4: "MP4に変換",
      btn_download: "ダウンロード",
      btn_download_gif: "GIFをダウンロード",
      btn_download_mp4: "MP4をダウンロード",
      btn_reset: "リセット",
      status_choose: "画像を選択してください",
      status_ready: "変換できます",
      status_converting: "変換中...",
      status_converting_pct: "変換中... {pct}%",
      status_done: "完了。ダウンロードしてください",
      status_failed: "変換に失敗しました",
      selected_file: "選択されたファイル：",
      file_none: "（未選択）",
      about_h: "このツールの動作について",
      about_p1: "画像の読み込み・変換・書き出しは、すべてお使いのブラウザ内で行われます。サーバーへ画像を送信する処理はありません。 また、本ツールは形式変換のみを行い、AIによる加工・生成は使用していません。",
      about_p2: "ただし、ブラウザや端末の環境によって挙動が変わる場合があります。気になる方は無理に使用せず、自己責任の範囲でご利用ください。",
      rights_h: "著作権・利用上の注意",
      rights_1: "アップロード（選択）した画像の権利は、画像の権利者に帰属します",
      rights_2: "本ツールで生成されたGIF/MP4についても、元画像の権利者に帰属します",
      rights_3: "本ツールは変換処理のみで、権利の取得・移転・放棄を行いません",
      rights_4: "第三者の権利を侵害する画像の利用は禁止です",
      rights_5: "利用する画像について、適切な権利・許諾があることを確認してください",
      err_choose_image: "画像ファイルを選択してください。",
      err_select_first: "先に画像を選択してください。",
      err_gifjs_missing: "gif.jsの読み込みに失敗しました。libs/gifjs/gif.js を確認してください",
      err_mp4muxer_missing: "mp4-muxerの読み込みに失敗しました。libs/mp4-muxer/mp4-muxer.js を確認してください",
      err_webcodecs: "このブラウザはWebCodecsに対応していません",
      gif_timeout: "GIF生成がタイムアウトしました。画像サイズが大きい可能性があります",
      gif_worker_path: "GIF生成に失敗しました。workerScriptのパスを確認してください",
      gif_fail_memory: "GIF生成に失敗しました。画像サイズが大きすぎる/メモリ不足の可能性があります",
      mp4_fail_prefix: "MP4変換に失敗しました。\n原因: "
    },
    en: {
      title: "Image to GIF / MP4 Converter",
      desc: "Loading, converting, and exporting are done entirely in your browser.\nNo images are uploaded to any server.",
      mp4_note: "Note: MP4 support depends on your browser/device (it may fail if unsupported).",
      dz_title: "Drag & drop an image",
      dz_sub: "or click to choose (JPG / PNG / WebP)",
      preview_h: "Preview",
      preview_empty: "No image selected",
      settings_h: "Settings",
      gif_panel_note: "GIF is generated as a near-still image (2 frames).\nGIF is limited to 256 colors, so photos and gradients may degrade.",
      mp4_seconds: "Duration (sec)",
      mp4_bitrate: "Bitrate (approx.)",
      btn_convert_gif: "Create GIF",
      btn_convert_mp4: "Convert to MP4",
      btn_download: "Download",
      btn_download_gif: "Download GIF",
      btn_download_mp4: "Download MP4",
      btn_reset: "Reset",
      status_choose: "Please choose an image",
      status_ready: "Ready to convert",
      status_converting: "Converting...",
      status_converting_pct: "Converting... {pct}%",
      status_done: "Done. Please download.",
      status_failed: "Conversion failed",
      selected_file: "Selected file:",
      file_none: "(none)",
      about_h: "How this tool works",
      about_p1: "Loading, converting, and exporting are done entirely in your browser. No images are sent to any server. This tool only converts file formats and does not use AI editing or generation.",
      about_p2: "Behavior may vary depending on your browser or device. If you are concerned, please refrain from using it at your own discretion.",
      rights_h: "Copyright & usage notes",
      rights_1: "Rights to the chosen image belong to the original rights holder",
      rights_2: "Rights to the generated GIF/MP4 also belong to the original rights holder",
      rights_3: "This tool only performs conversion and does not transfer, waive, or claim rights",
      rights_4: "Do not use images that infringe third-party rights",
      rights_5: "Make sure you have appropriate rights/permission to use the image",
      err_choose_image: "Please select an image file.",
      err_select_first: "Please choose an image first.",
      err_gifjs_missing: "Failed to load gif.js. Check libs/gifjs/gif.js",
      err_mp4muxer_missing: "Failed to load mp4-muxer. Check libs/mp4-muxer/mp4-muxer.js",
      err_webcodecs: "This browser does not support WebCodecs.",
      gif_timeout: "GIF generation timed out. The image may be too large.",
      gif_worker_path: "GIF generation failed. Please check the workerScript path.",
      gif_fail_memory: "GIF generation failed. The image may be too large / out of memory.",
      mp4_fail_prefix: "MP4 conversion failed.\nReason: "
    }
  };

  const getInitialLang = () => {
    const saved = localStorage.getItem("imgtool_lang");
    if (saved === "ja" || saved === "en") return saved;
    const nav = (navigator.language || "").toLowerCase();
    return nav.startsWith("ja") ? "ja" : "ja"; // JP-first default
  };

  let currentLang = getInitialLang();

  let mode = "gif"; // "gif" | "mp4"
  const t = (key, vars) => {
    const dict = I18N[currentLang] || I18N.ja;
    let s = dict[key] ?? I18N.ja[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replaceAll(`{${k}}`, String(v));
      }
    }
    return s;
  };

  const refreshUiTexts = () => {
    // mode dependent button label
    if (mode === "gif") {
      btnConvert.textContent = t("btn_convert_gif");
    } else {
      btnConvert.textContent = t("btn_convert_mp4");
    }

    // download button label
    if (!btnDownload.hidden) {
      btnDownload.textContent = mode === "gif" ? t("btn_download_gif") : t("btn_download_mp4");
    } else {
      btnDownload.textContent = t("btn_download");
    }

    // panel note line-break handling
    const gifNote = document.querySelector("[data-i18n-html='gif_panel_note']");
    if (gifNote) gifNote.innerHTML = t("gif_panel_note").split("\n").join("<br>");
  
    // Ensure file name placeholder is localized
    if (fileNameEl && !fileNameEl.textContent.trim()) {
      fileNameEl.textContent = t("file_none");
    }
};

  const applyLang = () => {
    document.documentElement.lang = currentLang;

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const key = el.getAttribute("data-i18n-html");
      el.innerHTML = t(key).split("\n").map((line) => line.trim()).join("<br>");
    });

    if (langToggle) {
      langToggle.textContent = currentLang === "ja" ? "English" : "JP 日本語";
      langToggle.setAttribute("aria-label", currentLang === "ja" ? "Switch to English" : "日本語に切り替え");
    }

    refreshUiTexts();
  };

  const setLang = (lang) => {
    currentLang = lang;
    localStorage.setItem("imgtool_lang", currentLang);
    applyLang();
  };

  if (langToggle) {
    langToggle.addEventListener("click", () => {
      setLang(currentLang === "ja" ? "en" : "ja");
      // keep status but if it's one of the canned messages, re-render it
      if (statusEl) {
        const s = statusEl.textContent || "";
        // best-effort mapping
        if (s.includes("画像を選択") || s.includes("choose an image")) setStatus(t("status_choose"));
        if (s.includes(t("status_ready")) || s.includes("Ready")) setStatus(t("status_ready"));
      }
    });
  }

  // apply initial language once
  applyLang();
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
    btnDownload.textContent = t("btn_download");
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

    btnConvert.textContent = isGif ? t("btn_convert_gif") : t("btn_convert_mp4");
    clearOutput();
    setStatus(selectedFile ? t("status_ready") : t("status_choose"));
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
    btnConvert.textContent = mode === "gif" ? t("btn_convert_gif") : t("btn_convert_mp4");

    clearOutput();
    setStatus(t("status_choose"));
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
      alert(t("err_choose_image"));
      return;
    }

    selectedFile = file;
    if (fileNameEl) fileNameEl.textContent = file.name;

    showPreview(file);
    clearOutput();

    btnConvert.disabled = false;
    setStatus(t("status_ready"));
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
      alert(t("err_gifjs_missing"));
      return;
    }
    if (!selectedFile) {
      alert(t("err_select_first"));
      return;
    }

    btnConvert.disabled = true;
    btnConvert.textContent = "生成中...";
    clearOutput();
    setStatus(t("status_converting"));

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
        alert(t("gif_timeout"));
        btnConvert.disabled = false;
        btnConvert.textContent = t("btn_convert_gif");
        setStatus(t("status_failed"));
      }, 60000);

      gif.on("progress", (p) => {
        const pct = Math.round((p || 0) * 100);
        setStatus(t('status_converting_pct',{pct}));
      });

      gif.on("finished", (blob) => {
        finished = true;
        clearTimeout(watchdog);

        outputBlob = blob;
        outputName = "converted.gif";

        btnDownload.hidden = false;
        btnDownload.textContent = t("btn_download_gif");

        btnConvert.disabled = false;
        btnConvert.textContent = t("btn_convert_gif");
        setStatus(t("status_done"));
      });

      if (typeof gif.on === "function") {
        gif.on("error", (err) => {
          console.error(err);
          clearTimeout(watchdog);
          alert(t("gif_worker_path"));
          btnConvert.disabled = false;
          btnConvert.textContent = t("btn_convert_gif");
          setStatus(t("status_failed"));
        });
      }

      gif.render();
    } catch (e) {
      console.error(e);
      alert(t("gif_fail_memory"));
      btnConvert.disabled = false;
      btnConvert.textContent = t("btn_convert_gif");
      setStatus(t("status_failed"));
    }
  }

  async function convertMp4() {
    if (!selectedFile) {
      alert(t("err_select_first"));
      return;
    }
    if (!("VideoEncoder" in window) || !("VideoFrame" in window)) {
      alert(t("err_webcodecs"));
      return;
    }
    if (!window.Mp4Muxer) {
      alert(t("err_mp4muxer_missing"));
      return;
    }

    const seconds = Math.max(3, Math.min(30, Number(mp4Seconds?.value || 3)));
    const qualityPct = Math.max(40, Math.min(100, Number(mp4Quality?.value || 90)));

    btnConvert.disabled = true;
    btnConvert.textContent = t("status_converting");
    clearOutput();
    setStatus(t("status_converting"));

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
      const candidates = [
        // Baseline
        "avc1.42E01E", "avc1.42E01F", "avc1.42001E", "avc1.42001F",
        // Main
        "avc1.4D401E", "avc1.4D401F", "avc1.4D4028",
        // High (try broader levels)
        "avc1.64001E", "avc1.64001F", "avc1.640028", "avc1.640032", "avc1.640033"
      ];
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
          setStatus(t('status_converting_pct',{pct}));
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
      btnDownload.textContent = t("btn_download_mp4");
      setStatus(t("status_done"));
    } catch (e) {
      console.error(e);

      const msg = (e && e.message) ? e.message : String(e);
      alert("MP4変換に失敗しました。\n原因: " + msg);
      setStatus(t("status_failed"));
    } finally {
      btnConvert.disabled = false;
      btnConvert.textContent = mode === "gif" ? t("btn_convert_gif") : t("btn_convert_mp4");
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
