const DEG = 0.0174532925199;

var uploadbtn, openbtn, cfgbtn;
var hostnameinput, cliprinput, rotationinput, applycfgbtn;
var machconfig;
var source, viewport, preview;
var dctx, pctx;
var aspect;
var vwidth, vheight;

/* file management UI */
uploadbtn = document.querySelector("#upload");
openbtn = document.querySelector("#open");
sendcfgbtn = document.querySelector("#sendcfg");
/* machine config UI */
hostnameinput = document.querySelector("[name=hostname]");
cliprinput = {
	minx: document.querySelector("[name=minx]"),
	miny: document.querySelector("[name=miny]"),
	maxx: document.querySelector("[name=maxx]"),
	maxy: document.querySelector("[name=maxy]")
};
rotationinput = document.querySelector("[name=rotation]");
applycfgbtn = document.querySelector("#applycfg");
/* visualization UI */
source = document.querySelector("#source");
viewport = document.querySelector("#viewport");
preview = document.querySelector("#preview");
dctx = viewport.getContext("2d");
pctx = preview.getContext("2d");
/* actual machine config */
machconfig = {
	hostname: "",
	video: "",
	clipr: {
		minx: 0, miny: 0,
		maxx: 0, maxy: 0
	},
	rotation: 0
};

function
refreshviewports()
{
	vwidth = videojs(source).videoWidth();
	vheight = videojs(source).videoHeight();
	aspect = vwidth/vheight || 1;
	viewport.width = 768*aspect;
	viewport.height = 768;
	preview.width = 200*aspect;
	preview.height = 200;
	machconfig.clipr.minx = 0;
	machconfig.clipr.miny = 0;
	machconfig.clipr.maxx = vwidth;
	machconfig.clipr.maxy = vheight;
}

function
Dx(rect)
{
	return rect.maxx-rect.minx;
}

function
Dy(rect)
{
	return rect.maxy-rect.miny;
}

function
drawrect(ctx, rect, color, width)
{
	ctx.beginPath();
	ctx.lineWidth = width || 2;
	ctx.strokeStyle = color || "black";
	ctx.rect(rect.minx, rect.miny, Dx(rect), Dy(rect));
	ctx.stroke();
}

function
scalerect(rect)
{
	var wr, hr;

	wr = viewport.width/vwidth;
	hr = viewport.height/vheight;
	return {
		minx: rect.minx*wr, miny: rect.miny*hr,
		maxx: rect.maxx*wr, maxy: rect.maxy*hr
	};
}

function
processframe()
{
	const depth = 4;
	var frame;
	var npixel;
	var i;

	dctx.drawImage(source, 0, 0, viewport.width, viewport.height);
	drawrect(dctx, scalerect(machconfig.clipr), "yellow");
	pctx.drawImage(source, machconfig.clipr.minx, machconfig.clipr.miny, Dx(machconfig.clipr), Dy(machconfig.clipr), 0, 0, preview.width, preview.height);
}

function
play()
{
	if(source.paused || source.ended)
		return;
	processframe();
	setTimeout(play, 0);
}

source.addEventListener("play", play, false);

uploadbtn.addEventListener("click", () => {
	ipcRenderer.send("want-to-upload");
});

openbtn.addEventListener("click", () => {
	ipcRenderer.send("want-to-open");
});

sendcfgbtn.addEventListener("click", () => {
	ipcRenderer.send("send-new-config", machconfig);
});

applycfgbtn.addEventListener("click", () => {
	machconfig.hostname = hostnameinput.value || "";
	machconfig.clipr.minx = parseInt(cliprinput.minx.value) || 0;
	machconfig.clipr.miny = parseInt(cliprinput.miny.value) || 0;
	machconfig.clipr.maxx = parseInt(cliprinput.maxx.value) || vwidth;
	machconfig.clipr.maxy = parseInt(cliprinput.maxy.value) || vheight;
	machconfig.rotation = parseFloat(rotationinput.value) || 0;
	pctx.resetTransform();
	pctx.translate(preview.width/2, preview.height/2);
	pctx.rotate(machconfig.rotation*DEG);
	pctx.translate(-preview.width/2, -preview.height/2);
});

ipcRenderer.on("file-uploaded", (e, arg) => {
	console.log("uploaded ", arg);
});

ipcRenderer.on("file-open", (e, arg) => {
	source.src = arg;
	machconfig.video = arg;
	videojs(source).on("loadedmetadata", () => {
		refreshviewports();
	});
	console.log("opened ", arg);
});

refreshviewports();
