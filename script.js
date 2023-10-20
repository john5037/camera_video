// Get DOM elements
const video = document.querySelector("video");
const recordBtnCont = document.querySelector(".record-btn-cont");
const recordBtn = document.querySelector(".record-btn");
const captureBtnCont = document.querySelector(".capture-btn-cont");
const captureBtn = document.querySelector(".capture-btn");
const timer = document.querySelector(".timer");
const filterLayer = document.querySelector(".filter-layer");
const allFilters = document.querySelectorAll(".filter");

// Initialize variables
let recordFlag = false;
let transparentColor = "transparent";
let recorder;
let chunks = [];
let timerID;
let counter = 0; // Represents total seconds

const constraints = {
    video: true,
    audio: true
};

// Start capturing video
navigator.mediaDevices.getUserMedia(constraints)
    .then((stream) => {
        video.srcObject = stream;

        recorder = new MediaRecorder(stream);
        recorder.addEventListener("start", (e) => {
            chunks = [];
        });
        recorder.addEventListener("dataavailable", (e) => {
            chunks.push(e.data);
        });
        recorder.addEventListener("stop", (e) => {
            // Conversion of media chunks data to video
            const blob = new Blob(chunks, { type: "video/mp4" });

            if (db) {
                const videoID = shortid();
                const dbTransaction = db.transaction("video", "readwrite");
                const videoStore = dbTransaction.objectStore("video");
                const videoEntry = {
                    id: `vid-${videoID}`,
                    blobData: blob
                };
                videoStore.add(videoEntry);
            }
        });
    });

// Event listeners
recordBtnCont.addEventListener("click", () => {
    if (!recorder) return;

    recordFlag = !recordFlag;

    if (recordFlag) { // start
        recorder.start();
        recordBtn.classList.add("scale-record");
        startTimer();
    } else { // stop
        recorder.stop();
        recordBtn.classList.remove("scale-record");
        stopTimer();
    }
});

captureBtnCont.addEventListener("click", () => {
    captureBtn.classList.add("scale-capture");

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const tool = canvas.getContext("2d");
    tool.drawImage(video, 0, 0, canvas.width, canvas.height);
    // Filtering 
    tool.fillStyle = transparentColor;
    tool.fillRect(0, 0, canvas.width, canvas.height);

    const imageURL = canvas.toDataURL();

    if (db) {
        const imageID = shortid();
        const dbTransaction = db.transaction("image", "readwrite");
        const imageStore = dbTransaction.objectStore("image");
        const imageEntry = {
            id: `img-${imageID}`,
            url: imageURL
        };
        imageStore.add(imageEntry);
    }

    setTimeout(() => {
        captureBtn.classList.remove("scale-capture");
    }, 500);
});

// Timer functions
function startTimer() {
    timer.style.display = "block";
    timerID = setInterval(displayTimer, 1000);
}

function displayTimer() {
    const totalSeconds = counter;
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    timer.innerText = `${hours}:${minutes}:${seconds}`;
    counter++;
}

function stopTimer() {
    clearInterval(timerID);
    timer.innerText = "00:00:00";
    timer.style.display = "none";
}

// Filter selection logic
allFilters.forEach((filterElem) => {
    filterElem.addEventListener("click", () => {
        // Get style
        transparentColor = getComputedStyle(filterElem).getPropertyValue("background-color");
        filterLayer.style.backgroundColor = transparentColor;
    });
});
