var vjs;
var uploadbtn;

vjs = videojs("viewport");
uploadbtn = document.querySelector("#upload");

uploadbtn.addEventListener("click", () => {
	ipcRenderer.send("want-to-upload");
});

ipcRenderer.on("file-uploaded", (e, arg) => {
	console.log(arg);
});
