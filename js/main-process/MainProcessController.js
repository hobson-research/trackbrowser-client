'use strict';

// import {IPCMainProcessHandler} from "./js/main-process/IPCMainProcessHandler";
const electron = require("electron");
const app = electron.app;
const fs = require("fs");
const path = require("path");
const dialog = require("dialog");
const EventEmitter = require("events").EventEmitter;
const session = require("electron").session;
const HackBrowserWindowManager = require(GLOBAL.__app.basePath + "/js/main-process/HackBrowserWindowManager");
const IPCMainProcessHandler = require(GLOBAL.__app.basePath + "/js/main-process/IPCMainProcessHandler");
const ActivityRecorder = require(GLOBAL.__app.basePath + "/js/main-process/ActivityRecorder.js");

function MainProcessController() {
	var _this = this;

	var windowManager;
	var activityRecorder;
	var ipcHandler;
	var mainProcessEventEmitter;
	var pictureInfo = {
		url: null,
		width: 0,
		height: 0
	};
	var isTrackingOn;

	var participantData = {
		userName: null,
		researchType: null,
		researchTypeKey: null,
		researchTypeOtherReason: null,
		researchCompanies: null
	};

	var init = function() {
		isTrackingOn = true;

		// attempt to enable Pepper Flash Player plugin
		// binary for pepper flash file is saved in {app-directory}/binaries/
		enablePepperFlashPlayer();

		attachEventHandlers();
	};

	var attachEventHandlers = function() {
		app.on("window-all-closed", function() {
			console.log("window-all-closed, quitting");

			if (process.platform != "darwin") {
				console.log("quitting app");

				app.quit();
			}
		});

		app.on("ready", function() {
			session.defaultSession.on("will-download", handleWillDownload);

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
	};

	/**
	 * attempt to enable flash with Pepper Flash player
	 *
	 * supported OS versions
	 * Windows 7 64-bit, Mac OS 64-bit
	 */
	var enablePepperFlashPlayer = function() {
		var ppapi_flash_path = null;

		// specify flash path based on OS
		if(process.platform  == 'win32'){
			// Windows 7
			// TODO: check if this binary file also works on Windows 8, Windows 10
			ppapi_flash_path = path.join(GLOBAL.__app.basePath, "/binaries/pepflashplayer32_20_0_0_286.dll");
		} else if (process.platform == 'darwin') {
			// Mac OS
			// TODO: check if different distributions of Mac OS can share same plugin binary
			ppapi_flash_path = path.join(GLOBAL.__app.basePath, "/binaries/PepperFlashPlayer.plugin");
		}

		// in case ppapi_flash_path is set
		if (ppapi_flash_path) {
			console.log("enabling Pepper Flash Player plugin");
			console.log("binary path: " + ppapi_flash_path);

			app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path);
			app.commandLine.appendSwitch('ppapi-flash-version', '20.0.0.286');
		}
	};

	var startBrowser = function() {
		// create a shared EventEmitter for windowManager to communicate with ipcHandler
		mainProcessEventEmitter = new EventEmitter();

		windowManager = new HackBrowserWindowManager(_this);
		activityRecorder = new ActivityRecorder(_this);
		ipcHandler = new IPCMainProcessHandler(_this);

		activityRecorder.checkServerAlive(
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
	};

	var handleWillDownload = function(event, item, webContents) {
		item.on("done", function(e, state) {
			// if tracking mode is turned off, do nothing
			if (isTrackingOn === false) {
				return;
			}

			if (state === "completed") {
				var itemInfoObj = {
					type: "file-download",
					fileSize: item.getTotalBytes(),
					fileURL: item.getURL(),
					fileName: item.getFilename(),
					fileMimeType: item.getMimeType()
				};

				activityRecorder.recordFileDownload(itemInfoObj);
			}
		});
	};

	_this.start = function() {
		init();
	};

	_this.getMainProcessEventEmitter = function() {
		return mainProcessEventEmitter;
	};

	_this.setParticipantDataItem = function(key, value) {
		participantData[key] = value;
	};

	_this.getParticipantUserName = function() {
		return participantData.userName;
	};

	/**
	 * get participant's data (username, research type, companies, etc)
	 *
	 * @returns {object}
	 */
	_this.getParticipantData = function() {
		return participantData;
	};

	_this.getActivityRecorder = function() {
		return activityRecorder;
	};

	_this.getWindowManager = function() {
		return windowManager;
	};

	_this.getPictureInfo = function() {
		return pictureInfo;
	};

	_this.setPictureInfo = function(pictureInfoObj) {
		pictureInfo = pictureInfoObj;
	};

	_this.getIsTrackingOn = function() {
		return isTrackingOn;
	};

	_this.setIsTrackingOn = function(isOn) {
		isTrackingOn = isOn;
	};
}

module.exports = MainProcessController;