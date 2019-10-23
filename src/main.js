const path = require("path");
const fs = require("fs");
const net = require("net");
const { app, BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");

const DBPATH = path.join(__dirname, "db/");
const EXPOHARBOR = "/n";

let mainwindow;

function
createwindow()
{
	mainwindow = new BrowserWindow({
		width: 1280,
		height: 720,
		minWidth: 800,
		minHeight: 600,
		autoHideMenuBar: true,
		show: false,
		webPreferences: {
			preload: path.join(__dirname, "preload.js")
		}
	});
	mainwindow.on("closed", () => {
		mainwindow = null;
	});
	mainwindow.once("ready-to-show", () => {
		mainwindow.show();
	});
	mainwindow.loadURL(`file://${__dirname}/index.html`);
}

app.on("ready", createwindow);

app.on("window-all-closed", () => {
	if(process.platform !== "darwin")
		app.quit();
});

app.on("activate", () => {
	if(mainwindow === null)
		createwindow();
});

ipcMain.on("want-to-upload", (e, arg) => {
	dialog.showOpenDialog({
		title: "Upload a Video",
		buttonLabel: "Upload",
		properties: ["openFile", "multiSelections"]
	}, (files) => {
		var file, filein, fileout, type;
		var bin, bout;
		var idx;

		if(files && files.length > 0)
			for(filein of files){
				file = path.parse(filein);
				type = file.ext.replace(".", "");
				fileout = path.join(DBPATH, file.name + "." + type);
				if(fs.existsSync(fileout)){
					idx = dialog.showMessageBoxSync({
						type: "info",
						title: "Attempt to write an existing file",
						message: "The file " + path.parse(fileout).base + " already exists in the DB. Do you want to overwrite it?",
						buttons: ["Yes", "No"]
					});
					if(idx === 1)
						continue;
				}
				bin = fs.createReadStream(filein);
				bout = fs.createWriteStream(fileout);
				bout.on("finish", () => {
					e.sender.send("file-uploaded", fileout);
				});
				bin.pipe(bout);
			}
	});
});

ipcMain.on("want-to-open", (e, arg) => {
	dialog.showOpenDialog({
		title: "Open a Video",
		buttonLabel: "Open",
		defaultPath: path.join(__dirname, "db/"),
		properties: ["openFile"]
	}, (files) => {
		if(files && files.length > 0)
			e.sender.send("file-open", files[0]);
	});
});

ipcMain.on("send-new-config", (e, arg) => {
	var stream;

	stream = net.connect(path.join(EXPOHARBOR, arg.hostname, "/tmp/catwalk.sock"));
	//stream = net.connect("/tmp/catwalk.sock");
	arg.video = path.join(EXPOHARBOR, arg.hostname, "/srv/expo/src/db/", path.parse(arg.video).base);
	stream.write(JSON.stringify(arg));
	stream.end();
});
