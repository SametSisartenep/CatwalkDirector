var vjs;
var uploadbtn, openbtn, cfgbtn;

vjs = videojs("viewport");
uploadbtn = document.querySelector("#upload");
openbtn = document.querySelector("#open");
cfgbtn = document.querySelector("#sendcfg");

uploadbtn.addEventListener("click", () => {
	ipcRenderer.send("want-to-upload");
});

openbtn.addEventListener("click", () => {
	ipcRenderer.send("want-to-open");
});

cfgbtn.addEventListener("click", () => {
	ipcRenderer.send("send-new-config", {hi: "there", there: "hi"});
});

ipcRenderer.on("file-uploaded", (e, arg) => {
	console.log("uploaded ", arg);
});

ipcRenderer.on("file-open", (e, arg) => {
	vjs.src({src: arg});
	console.log("opened ", arg);
});
