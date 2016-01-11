'use strict';

const electron = require("electron");
const BrowserWindow = electron.BrowserWindow;
const PersistentStorage = require(__app.basePath + "/js/common/PersistentStorage");

/**
 * HackBrowserWindowManager handles opening and closing of browser windows
 *
 * @constructor
 */
function HackBrowserWindowManager() {
	var _this = this;

	var windowList = {};
	var createdWindowCount = 0;

	_this.openLoginWindow = function() {
		// Create the login window
		var loginWindow = new BrowserWindow({
			width:600,
			height: 400,
			resizable: false,
			frame: false
		});

		loginWindow.loadUrl("file://" + __app.basePath + "/html-pages/login.html");

		loginWindow.openDevTools();
	};

	_this.openPictureDisplayWindow = function() {

	};

	_this.openResearchTopicWindow = function() {

	};

	_this.openNewBrowserWindow = function(url) {
		var _this = this;

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
			newWindow.webContents.openDevTools();

			windowList[newWindow.id] = newWindow;
			_this.attachEventHandlers(newWindow);

			// increase window count
			createdWindowCount++;
		});
	};

	_this.attachEventHandlers = function(browserWindow) {
		let _this = this;

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

		// remove the window from windowList and remove reference so that GC clear is from memory
		browserWindow.on('closed', function() {
			if (_this.windowList.hasOwnProperty(windowId)) {
				console.log("deleting window " + windowId);

				delete _this.windowList[windowId];
				browserWindow = null;
			}
		});
	};
}

module.exports = HackBrowserWindowManager;