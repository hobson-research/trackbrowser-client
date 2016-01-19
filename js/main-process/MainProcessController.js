'use strict';

// import {IPCMainProcessHandler} from "./js/main-process/IPCMainProcessHandler";
const electron = require("electron");
const app = electron.app;
const fs = require("fs");
const dialog = require("dialog");
const EventEmitter = require("events").EventEmitter;
const session = require("electron").session;
const HackBrowserWindowManager = require(GLOBAL.__app.basePath + "/js/main-process/HackBrowserWindowManager");
const IPCMainProcessHandler = require(GLOBAL.__app.basePath + "/js/main-process/IPCMainProcessHandler");
const ActivityRecorder = require(GLOBAL.__app.basePath + "/js/main-process/ActivityRecorder.js");

function MainProcessController() {
	var _this = this;

	var windowManager;
	var recorder;
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
		attachEventHandlers();

		isTrackingOn = true;
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
			session.defaultSession.on("will-download", function(event, item, webContents) {
				console.log(item);
			});

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

	var startBrowser = function() {
		// create a shared EventEmitter for windowManager to communicate with ipcHandler
		mainProcessEventEmitter = new EventEmitter();

		windowManager = new HackBrowserWindowManager(_this);
		recorder = new ActivityRecorder(_this);
		ipcHandler = new IPCMainProcessHandler(_this);

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
		return recorder;
	};

	_this.getWindowManager = function() {
		return windowManager;
	};

	_this.getPictureInfo = function() {
		return pictureInfo;
	};

	_this.setPictureInfo = function(newPictureInfo) {
		pictureInfo = newPictureInfo;
	};

	_this.getIsTrackingOn = function() {
		return isTrackingOn;
	};

	_this.setIsTrackingOn = function(isOn) {
		isTrackingOn = isOn;
	};
}

module.exports = MainProcessController;