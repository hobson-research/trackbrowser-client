'use strict';

// shared globally
GLOBAL.__app = {
	basePath: __dirname,
	dataPath: __dirname + "/.data/"
};

// import {IPCMainProcessHandler} from "./js/main-process/IPCMainProcessHandler";
const electron = require("electron");
const app = electron.app;
const fs = require("fs");
const dialog = require("dialog");
const HackBrowserWindowManager = require("./js/main-process/HackBrowserWindowManager");
const IPCMainProcessHandler = require("./js/main-process/IPCMainProcessHandler");
const ActivityRecorder = require("./js/common/ActivityRecorder.js");

app.on("window-all-closed", function() {
	if (process.platform != "darwin") {
		console.log("quitting app");

		app.quit();
	}
});

var startBrowser = function() {
	var windowManager = new HackBrowserWindowManager();
	var recorder = new ActivityRecorder();

	recorder.checkServerAlive(
		function(err) {
			dialog.showErrorBox('Server Not Responding', 'Server is not responding. ');

			app.quit();
		},
		function(response) {
			if (response.statusCode === 200) {
				windowManager.openLoginWindow();
			}
		}
	);

	// windowManager.openNewBrowserWindow();
};

app.on("ready", function() {
	// check if .data directory exists
	fs.exists(GLOBAL.__app.dataPath, function(exists) {
		if (exists === false) {
			// create directory if .data directory doesn't exist
			// TODO: check directory create permissions on Linux
			fs.mkdir(GLOBAL.__app.dataPath, function(err) {
				if (err) {
					// TODO: show error messagebox and quit app
					dialog.showMessageBox({
						type: "info",
						buttons: ["ok"],
						title: GLOBAL.__app.dataPath,
						message: JSON.stringify(err),
						detail: JSON.stringify(err)
					});
				} else {
					startBrowser();
				}
			});
		} else {
			startBrowser();
		}
	});
}); 