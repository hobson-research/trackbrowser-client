'use strict';

const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const PersistentStorage = require(__app.basePath + "/js/common/PersistentStorage");

/**
 * HackBrowserWindowManager handles opening and closing of browser windows
 *
 * @constructor
 */
function HackBrowserWindowManager(mainProcessController) {
	var _this = this;

	var mainProcessEventEmitter;

	var browserWindowList = {};
	var createdWindowCount = 0;

	var loginWindow;
	var researchTopicWindow;
	var browserWindow;
	var helpWindow;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		loginWindow = null;
		researchTopicWindow = null;
		browserWindow = null;
		helpWindow = null;

		mainProcessEventEmitter = mainProcessController.getMainProcessEventEmitter();

		mainProcessEventEmitter.on("userNameCheckPass", function(userName) {
			console.log("userNameCheckPass event received");

			mainProcessController.setParticipantDataItem("userName", userName);

			// also set userName in ActivityRecorder
			mainProcessController.getActivityRecorder().setParticipantUserName(userName);

			_this.openResearchTopicWindow();
			_this.closeLoginWindow();
		});

		mainProcessEventEmitter.on("researchTopicInputComplete", function(msgObject) {
			console.log("researchTopicInputComplete");

			var isNewSession = msgObject.isNewSession;
			var researchTopicData = msgObject.researchTopicData;

			for (var key in researchTopicData) {
				if (researchTopicData.hasOwnProperty(key)) {
					mainProcessController.setParticipantDataItem(key, researchTopicData[key]);
				}
			}

			mainProcessController.getActivityRecorder().recordUserInfo(researchTopicData);

			if (isNewSession === true) {
				_this.openNewBrowserWindow(function() {
					_this.closeResearchTopicWindow();
				});
			} else {
				_this.closeResearchTopicWindow();
			}
		});
	};

	var attachEventHandlers = function(browserWindow) {
		var windowId = browserWindow.id;

		// save browser window's width/height when user closes it
		browserWindow.on('close', function(e) {
			var size = browserWindow.getSize();

			var sizeObject = {
				"width": size[0],
				"height": size[1]
			};

			// save to persistent storage
			PersistentStorage.setItem("browserWindowSize", sizeObject);

			e.returnValue = false;
		});

		// remove the window from browserWindowList and remove reference so that GC clear is from memory
		browserWindow.on('closed', function() {
			if (browserWindowList.hasOwnProperty(windowId)) {
				console.log("deleting window " + windowId);

				delete browserWindowList[windowId];
				browserWindow = null;
			}
		});
	};

	/* ====================================
	 public methods
	 ====================================== */
	_this.openLoginWindow = function(callback) {
		callback = callback || function() {};

		// if research topic input window is already open,
		// do nothing
		if (loginWindow !== null) {
			return;
		}

		// Create the login window
		loginWindow = new BrowserWindow({
			width:600,
			height: 400,
			resizable: false,
			frame: false
		});

		loginWindow.loadURL("file://" + __app.basePath + "/html-pages/login.html");

		loginWindow.on('closed', function() {
			loginWindow = null;
		});

		callback();
	};

	_this.closeLoginWindow = function(callback) {
		callback = callback || function() {};

		// close login window
		loginWindow.close();

		callback();
	};

	_this.openPictureDisplayWindow = function(callback) {
		callback = callback || function() {};

		callback();
	};

	_this.closePictureDisplayWindow = function(callback) {
		callback = callback || function() {};
	};

	_this.openResearchTopicWindow = function(callback) {
		callback = callback || function() {};

		// if research topic input window is already open,
		// do nothing
		if (researchTopicWindow !== null) {
			return;
		}

		researchTopicWindow = new BrowserWindow({
			width: 600,
			height: 600,
			resizable: false,
			frame: false
		});

		researchTopicWindow.loadURL("file://" + __app.basePath + "/html-pages/research-topic.html");

		researchTopicWindow.openDevTools();

		researchTopicWindow.on('closed', function() {
			researchTopicWindow = null;
		});

		callback();
	};

	_this.closeResearchTopicWindow = function(callback) {
		callback = callback || function() {};

		researchTopicWindow.close();

		callback();
	};

	_this.openNewBrowserWindow = function(callback) {
		callback = callback || function() {};

		// get last browser size
		PersistentStorage.getItem("browserWindowSize", function(err, browserSize) {
			if (err) {
				browserSize = {
					width: 1000,
					height: 800
				};
			}

			// create the browser window
			browserWindow = new BrowserWindow({
				width: browserSize.width,
				height: browserSize.height,
				frame: true
			});

			// load the HTML file for browser window
			browserWindow.loadURL("file://" + __app.basePath + "/html-pages/browser-window.html");

			// Open the DevTools (debugging)
			browserWindow.openDevTools();

			browserWindowList[browserWindow.id] = browserWindow;
			attachEventHandlers(browserWindow);

			// increase window count
			createdWindowCount++;

			callback();
		});
	};

	_this.openHelpWindow = function(callback) {
		callback = callback || function() {};

		helpWindow = new BrowserWindow({
			width: 700,
			height: 600,
			resizable: false,
			frame: false
		});

		helpWindow.loadURL("file://" + __app.basePath + "/html-pages/help.html");

		// helpWindow.openDevTools();

		helpWindow.on('closed', function() {
			helpWindow = null;
		});

		callback();
	};

	_this.closeHelpWindow = function(callback) {
		callback = callback || function() {};
	};

	_this.getBrowserWindow = function() {
		return browserWindow;
	};

	_this.getLoginWindow = function() {
		return loginWindow;
	};

	_this.getResearchTopicWinodw = function() {
		return researchTopicWindow;
	};

	init();
}

module.exports = HackBrowserWindowManager;