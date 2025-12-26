document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("fileInput");
  const dropzone = document.getElementById("dropzone");
  const btnConvert = document.getElementById("btnConvert");
  const result = document.getElementById("result");

  if (dropzone) {
    dropzone.addEventListener("dragover", e => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", e => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        fileInput.files = e.dataTransfer.files;
      }
    });
  }

  btnConvert.addEventListener("click", () => {
    if (!fileInput.files || !fileInput.files[0]) {
      alert("画像を選択してください");
      return;
    }
    result.textContent = "画像を受け取りました";
  });
});
