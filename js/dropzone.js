const dropZone = document.getElementById("dropZone");
const fileInput = document.getElementById("fileInput");

dropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZone.classList.add("dragover");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("dragover");
});

dropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    dropZone.classList.remove("dragover");

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith(".docx") && !file.name.toLowerCase().endsWith(".xml")) {
        uploadText.innerHTML = `<br><span style="color: red">Only .docx files are allowed.</span><br>`;
        downloadsSection.innerHTML = '';
        return;
    }

    fileInput.files = e.dataTransfer.files; // mimic selecting file
    fileInput.dispatchEvent(new Event("change")); // trigger your existing handler
});
