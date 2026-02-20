(function () {
  const fileInput = document.getElementById("fileInput");
  const uploadZone = document.getElementById("uploadZone");
  const browseBtn = document.getElementById("browseBtn");
  const fileList = document.getElementById("fileItems");
  const emptyMsg = document.getElementById("emptyMsg");
  const searchInput = document.getElementById("search");
  const statCount = document.getElementById("statCount");
  const statSize = document.getElementById("statSize");

  const STORAGE_KEY = "fileOrganizerFiles";
  const files = [];
  let currentCategory = "all";

  const CATEGORIES = [
    { id: "all", label: "All" },
    { id: "images", label: "Images" },
    { id: "videos", label: "Videos" },
    { id: "documents", label: "Documents" },
    { id: "others", label: "Others" },
  ];

  function getCategory(type, name) {
    if (type) {
      if (type.startsWith("image/")) return "images";
      if (type.startsWith("video/")) return "videos";
      if (
        type.startsWith("text/") ||
        type === "application/pdf" ||
        /^application\/(msword|vnd\.openxmlformats|vnd\.ms-)/.test(type)
      )
        return "documents";
    }
    const ext = (name || "").split(".").pop().toLowerCase();
    const imageExt = ["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"];
    const videoExt = ["mp4", "webm", "mov", "avi", "mkv"];
    const docExt = ["pdf", "doc", "docx", "txt", "rtf", "xls", "xlsx", "ppt", "pptx"];
    if (imageExt.includes(ext)) return "images";
    if (videoExt.includes(ext)) return "videos";
    if (docExt.includes(ext)) return "documents";
    return "others";
  }

  function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
  }

  function loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        parsed.forEach((f) => {
          files.push({
            name: f.name,
            size: f.size,
            type: f.type != null ? f.type : "",
          });
        });
      }
    } catch (_) {}
  }

  function addFile(name, size, type) {
    files.push({ name, size, type: type || "" });
    saveToStorage();
    renderList(searchInput.value);
  }

  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }

  function removeFile(fileObj) {
    const idx = files.indexOf(fileObj);
    if (idx !== -1) {
      files.splice(idx, 1);
      saveToStorage();
      renderList(searchInput.value);
    }
  }

  function updateStats() {
    const totalBytes = files.reduce((sum, f) => sum + f.size, 0);
    statCount.textContent = files.length === 1 ? "1 file" : `${files.length} files`;
    statSize.textContent = formatSize(totalBytes);
  }

  function renderList(filter) {
    updateStats();
    const term = (filter || "").trim().toLowerCase();
    let list = files;
    if (currentCategory !== "all") {
      list = list.filter((f) => getCategory(f.type, f.name) === currentCategory);
    }
    if (term) {
      list = list.filter((f) => f.name.toLowerCase().includes(term));
    }

    fileList.innerHTML = "";
    list.forEach((f) => {
      const li = document.createElement("li");
      const label = document.createElement("span");
      label.textContent = `${f.name} (${formatSize(f.size)})`;
      const deleteBtn = document.createElement("button");
      deleteBtn.type = "button";
      deleteBtn.className = "delete-btn";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => removeFile(f));
      li.appendChild(label);
      li.appendChild(deleteBtn);
      fileList.appendChild(li);
    });

    if (list.length === 0) {
      emptyMsg.textContent =
        files.length === 0
          ? "No files uploaded yet."
          : "No matching files found.";
      emptyMsg.classList.remove("hidden");
    } else {
      emptyMsg.classList.add("hidden");
    }
  }

  function handleFiles(fileListFromInput) {
    if (!fileListFromInput.length) return;
    for (let i = 0; i < fileListFromInput.length; i++) {
      const file = fileListFromInput[i];
      addFile(file.name, file.size, file.type);
    }
  }

  browseBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", (e) => {
    handleFiles(e.target.files || []);
    e.target.value = "";
  });

  uploadZone.addEventListener("click", (e) => {
    if (e.target === browseBtn) return;
    fileInput.click();
  });

  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });

  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });

  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");
    handleFiles(e.dataTransfer.files || []);
  });

  searchInput.addEventListener("input", () => renderList(searchInput.value));

  const filterBar = document.getElementById("filterBar");
  CATEGORIES.forEach((cat) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-btn";
    btn.dataset.category = cat.id;
    btn.textContent = cat.label;
    btn.addEventListener("click", () => {
      currentCategory = cat.id;
      filterBar.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      renderList(searchInput.value);
    });
    filterBar.appendChild(btn);
  });

  loadFromStorage();
  renderList();
  filterBar.querySelector(".filter-btn").classList.add("active");
})();
