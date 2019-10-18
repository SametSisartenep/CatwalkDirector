const path = require("path");
const fs = require("fs");
const { app, BrowserWindow } = require("electron");
const { ipcMain, dialog } = require("electron");

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
	mainwindow.loadURL(`file://${__dirname}/index.html`);
	mainwindow.on("closed", () => {
		mainwindow = null;
	});
	mainwindow.once("ready-to-show", () => {
		mainwindow.show();
	});
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
	dialog.showOpenDialog({ properties: ['openFile'] }, (files) => {
		var filein, fileout, type;
		var ts;
		var bin, bout;

		if(files){
			filein = path.parse(files[0]);
			type = filein.ext.replace(".", "");
			ts = Date.now();
			fileout = path.join(__dirname, "db/", filein.name + "." + ts + "." + type);
			bin = fs.createReadStream(files[0]);
			bout = fs.createWriteStream(fileout);
			bin.pipe(bout);
			bout.on("finish", () => {
				e.sender.send("file-uploaded", fileout);
			});
		}
	});
});
