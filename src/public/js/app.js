const socket = io();    // Automatically Make & Connect the socket

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

let myStream;
let muted = false;
let cameraOff = false;

let roomName;

async function getCameras() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();        // Get Device List
        const cameras = devices.filter(device => device.kind === "videoinput");
        const currentCamera = myStream.getVideoTracks()[0];

        cameras.forEach(camera => {
            const option = document.createElement("option")
            option.value = camera.deviceId;
            option.innerText = camera.label;

            if (currentCamera.label == camera.label) {
                option.selected = true;
            }

            camerasSelect.appendChild(option);
        });
    } catch(e) {
        console.log(e);
    }
}

async function getMedia(deviceID) {
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user"},
    };
    const cameraConstraints = {
        audio: true,
        video: { deviceID: { exact: deviceID} },
    }
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceID? cameraConstraints : initialConstrains
        );
        // console.log(myStream);
        myFace.srcObject = myStream;
        if (!deviceID) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    // console.log(myStream.getAudioTracks());
    myStream.getAudioTracks().forEach((track) => track.enabled = !track.enabled);
    if(!muted) {
        muteBtn.innerText="Unmute"
        muted = true;
    } else {
        muteBtn.innerText="Mute"
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled));
    if (cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

/*
Welcome
*/
const welcome = document.getElementById("welcome");
const call = document.getElementById("call");
call.hidden = true;

function handleCameraChange() {
    // console.log(camerasSelect.value)
    getMedia(camerasSelect.value);
}
camerasSelect.addEventListener("input", handleCameraChange);

const welcomeForm = welcome.querySelector("form");

function startMedia() {
    welcome.hidden = true;
    call.hidden = false;
    getMedia();
}

function handleWelcomeSubmit(event) {
    event.preventDefault();

    const input = welcomeForm.querySelector("input");
    // console.log(input.value);
    socket.emit("join_room", input.value, startMedia);
    roomName = input.value;
    input.value=""
}
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

/*
Socket
*/
socket.on("welcome", () => {
    console.log("Somebody joined");
});