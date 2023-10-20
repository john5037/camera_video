setTimeout(() => {
    if (db) {
        // Retrieve videos
        const videoDBTransaction = db.transaction("video", "readonly");
        const videoStore = videoDBTransaction.objectStore("video");
        const videoRequest = videoStore.getAll();

        videoRequest.onsuccess = (e) => {
            const videoResult = videoRequest.result;
            const galleryCont = document.querySelector(".gallery-cont");

            videoResult.forEach((videoObj) => {
                const mediaElem = document.createElement("div");
                mediaElem.classList.add("media-cont");
                mediaElem.setAttribute("id", videoObj.id);

                const url = URL.createObjectURL(videoObj.blobData);

                mediaElem.innerHTML = `
                    <div class="media">
                        <video autoplay loop src="${url}"></video>
                    </div>
                    <div class="delete action-btn">DELETE</div>
                    <div class="download action-btn">DOWNLOAD</div>
                `;

                galleryCont.appendChild(mediaElem);

                // Event listeners
                const deleteBtn = mediaElem.querySelector(".delete");
                deleteBtn.addEventListener("click", deleteListener);
                const downloadBtn = mediaElem.querySelector(".download");
                downloadBtn.addEventListener("click", downloadListener);
            });
        };

        // Retrieve images
        const imageDBTransaction = db.transaction("image", "readonly");
        const imageStore = imageDBTransaction.objectStore("image");
        const imageRequest = imageStore.getAll();

        imageRequest.onsuccess = (e) => {
            const imageResult = imageRequest.result;
            const galleryCont = document.querySelector(".gallery-cont");

            imageResult.forEach((imageObj) => {
                const mediaElem = document.createElement("div");
                mediaElem.classList.add("media-cont");
                mediaElem.setAttribute("id", imageObj.id);

                const url = imageObj.url;

                mediaElem.innerHTML = `
                    <div class="media">
                        <img src="${url}" />
                    </div>
                    <div class="delete action-btn">DELETE</div>
                    <div class="download action-btn">DOWNLOAD</div>
                `;

                galleryCont.appendChild(mediaElem);

                // Event listeners
                const deleteBtn = mediaElem.querySelector(".delete");
                deleteBtn.addEventListener("click", deleteListener);
                const downloadBtn = mediaElem.querySelector(".download");
                downloadBtn.addEventListener("click", downloadListener);
            });
        };
    }
}, 100);

// Remove UI and DB records
function deleteListener(e) {
    const id = e.target.parentElement.getAttribute("id");
    const type = id.slice(0, 3);
    const transactionType = type === "vid" ? "video" : "image";

    const dbTransaction = db.transaction(transactionType, "readwrite");
    const objectStore = dbTransaction.objectStore(transactionType);
    objectStore.delete(id);

    // Remove from the UI
    e.target.parentElement.remove();
}

// Download content
function downloadListener(e) {
    const id = e.target.parentElement.getAttribute("id");
    const type = id.slice(0, 3);
    const transactionType = type === "vid" ? "video" : "image";

    const dbTransaction = db.transaction(transactionType, "readwrite");
    const objectStore = dbTransaction.objectStore(transactionType);
    const request = objectStore.get(id);

    request.onsuccess = (e) => {
        const result = request.result;
        const contentURL = type === "vid" ? URL.createObjectURL(result.blobData) : result.url;
        const fileName = type === "vid" ? "stream.mp4" : "image.jpg";

        const a = document.createElement("a");
        a.href = contentURL;
        a.download = fileName;
        a.click();
    };
}