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


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		mainProcessEventEmitter = mainProcessController.getMainProcessEventEmitter();

		mainProcessEventEmitter.on("userNameCheckPass", function(userName) {
			console.log("userNameCheckPass event received");

			mainProcessController.setParticipantDataItem("userName", userName);

			// also set userName in ActivityRecorder
			mainProcessController.getActivityRecorder().setParticipantUserName(userName);

			_this.openResearchTopicWindow();

			// close login window
			loginWindow.close();
		});

		mainProcessEventEmitter.on("researchTopicInputComplete", function(researchTopicData) {
			console.log("researchTopicInputComplete");

			for (var key in researchTopicData) {
				if (researchTopicData.hasOwnProperty(key)) {
					mainProcessController.setParticipantDataItem(key, researchTopicData[key]);
				}
			}

			_this.openNewBrowserWindow(function() {
				// close research input window
				researchTopicWindow.close();
			});
		});
	};

	var attachEventHandlers = function(browserWindow) {
		var windowId = browserWindow.id;

		// save browser window's width/height when user closes it
		browserWindow.on('close', function() {
			var size = browserWindow.getSize();

			var sizeObject = {
				"width": size[0],
				"height": size[1]
			};

			// save to persistent storage
			PersistentStorage.setItem("browserWindowSize", sizeObject);
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

		// Create the login window
		loginWindow = new BrowserWindow({
			width:600,
			height: 400,
			resizable: false,
			frame: false
		});

		loginWindow.loadURL("file://" + __app.basePath + "/html-pages/login.html");

		// loginWindow.openDevTools();

		callback();
	};

	_this.openPictureDisplayWindow = function(callback) {
		callback = callback || function() {};

		callback();
	};

	_this.openResearchTopicWindow = function(callback) {
		callback = callback || function() {};

		researchTopicWindow = new BrowserWindow({
			width: 700,
			height: 600,
			resizable: false,
			frame: false
		});

		researchTopicWindow.loadURL("file://" + __app.basePath + "/html-pages/research-topic.html");

		// researchTopicWindow.openDevTools();

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
			var newWindow = new BrowserWindow({
				width: browserSize.width,
				height: browserSize.height,
				frame: true
			});

			// load the HTML file for browser window
			newWindow.loadURL("file://" + __app.basePath + "/html-pages/browser-window.html");

			// Open the DevTools (debugging)
			newWindow.openDevTools();

			browserWindowList[newWindow.id] = newWindow;
			attachEventHandlers(newWindow);

			// increase window count
			createdWindowCount++;

			callback();
		});
	};

	init();
}

module.exports = HackBrowserWindowManager;