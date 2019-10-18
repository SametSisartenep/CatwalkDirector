var vjs;
var uploadbtn, openbtn;

vjs = videojs("viewport");
uploadbtn = document.querySelector("#upload");
openbtn = document.querySelector("#open");

uploadbtn.addEventListener("click", () => {
	ipcRenderer.send("want-to-upload");
});

openbtn.addEventListener("click", () => {
	ipcRenderer.send("want-to-open");
});

ipcRenderer.on("file-uploaded", (e, arg) => {
	console.log("uploaded ", arg);
});

ipcRenderer.on("file-open", (e, arg) => {
	vjs.src({src: arg});
	console.log("opened ", arg);
});
