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
	var pictureDisplayWindow;
	var researchTopicWindow;
	var browserWindow;
	var browserPictureDisplayWindow;
	var helpWindow;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		loginWindow = null;
		pictureDisplayWindow = null;
		researchTopicWindow = null;
		browserWindow = null;
		browserPictureDisplayWindow = null;
		helpWindow = null;

		mainProcessEventEmitter = mainProcessController.getMainProcessEventEmitter();

		mainProcessEventEmitter.on("userNameCheckPass", handleUserNameCheckPass);
		mainProcessEventEmitter.on("userPictureWindowCloseRequest", handleUserPictureWindowCloseRequest);
		mainProcessEventEmitter.on("researchTopicInputComplete", handleResearchTopicInputComplete);
	};

	var attachEventHandlersToBrowserWindow = function(browserWindow) {
		var windowId = browserWindow.id;

		browserWindow.on("move", function(e) {
			_this.repositionBrowserPictureDisplayWindow();
		});

		browserWindow.on("resize", function(e) {
			_this.repositionBrowserPictureDisplayWindow();
		});

		browserWindow.on("blur", function(e) {
			setTimeout(function() {
				setBrowserPictureDisplayWindowVisibility(false);
			}, 50);
		});

		browserWindow.on("focus", function(e) {
			setBrowserPictureDisplayWindowVisibility(true);
		});

		// save browser window's width/height when user closes it
		browserWindow.on("close", function(e) {
			var size = browserWindow.getSize();

			var sizeObject = {
				"width": size[0],
				"height": size[1]
			};

			// save to persistent storage
			PersistentStorage.setItem("browserWindowSize", sizeObject);

			// also close in-browser picture display
			_this.closeBrowserPictureDisplayWindow();

			e.returnValue = false;
		});

		// remove the window from browserWindowList and remove reference so that GC clear is from memory
		browserWindow.on("closed", function() {
			if (browserWindowList.hasOwnProperty(windowId)) {
				console.log("deleting window " + windowId);

				delete browserWindowList[windowId];
				browserWindow = null;
			}
		});
	};

	var attachEventHandlersToBrowserPictureWindow = function(pictureWindow) {
		pictureWindow.on("move", function(e) {
			repositionBrowserWindowRelativeToPictureWindow();
		});
	};

	/**
	 * event handler for username check pass result
	 *
	 * @param {string} userName
	 */
	var handleUserNameCheckPass = function(userName) {
		mainProcessController.setParticipantDataItem("userName", userName);

		// also set userName in ActivityRecorder
		mainProcessController.getActivityRecorder().setParticipantUserName(userName);

		// get picture URL
		mainProcessController.getActivityRecorder().getUserPictureInfoFromServer(
			function(err) {
				dialog.showErrorBox('Error retrieving picture URL', 'Server is not responding. ');
			},
			function(imageInfoObj) {
				console.log("HackBrowserWindowManager.handleUserNameCheckPass()");
				console.log(imageInfoObj);
				mainProcessController.setPictureInfo(imageInfoObj);

				// _this.openResearchTopicWindow();
				_this.openPictureDisplayWindow();
				_this.closeLoginWindow();
			}
		);
	};

	/**
	 * close "picture display" window and open research topic input window
	 */
	var handleUserPictureWindowCloseRequest= function() {
		_this.openResearchTopicWindow();
		_this.closePictureDisplayWindow();
	};

	/**
	 * handle user's research topic information input from window
	 * and pass it to an ActivityRecorder instance to post to TrackBrowser server
	 *
	 * @param {object} msgObject containing user's research topic data
	 */
	var handleResearchTopicInputComplete = function(msgObject) {
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
	};

	var setBrowserPictureDisplayWindowVisibility = function(isVisible) {
		// if either browserWindow or browserPictureDisplayWindow is not open, do nothing
		if ((browserWindow === null) || (browserPictureDisplayWindow === null)) return;

		if (isVisible === true) {
			browserPictureDisplayWindow.showInactive();
		} else {
			if (browserPictureDisplayWindow.isFocused() === false) {
				browserPictureDisplayWindow.hide();
			}
		}
	};

	var repositionBrowserWindowRelativeToPictureWindow = function() {
		// if either browserWindow or browserPictureDisplayWindow is not open, do nothing
		if ((browserWindow === null) || (browserPictureDisplayWindow === null)) return;

		var browserWindowBounds = browserWindow.getBounds();
		var pictureWindowBounds = browserPictureDisplayWindow.getBounds();

		var newXPos = pictureWindowBounds.x - browserWindowBounds.width - 10;
		var newYPos = pictureWindowBounds.y;

		browserWindow.setPosition(newXPos, newYPos);
	};


	/* ====================================
	 public methods
	 ====================================== */
	/**
	 * open login window
	 *
	 * @param callback
	 */
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

		// loginWindow.openDevTools();

		loginWindow.on('closed', function() {
			loginWindow = null;
		});

		callback();
	};

	/**
	 * close login window
	 *
	 * @param callback
	 */
	_this.closeLoginWindow = function(callback) {
		callback = callback || function() {};

		// close login window
		loginWindow.close();

		callback();
	};

	/**
	 * open "picture display" window
	 *
	 * @param callback
	 */
	_this.openPictureDisplayWindow = function(callback) {
		callback = callback || function() {};

		// if research topic input window is already open,
		// do nothing
		if (pictureDisplayWindow !== null) {
			return;
		}

		var pictureInfo = mainProcessController.getPictureInfo();

		var windowWidth = 600;

		// if the image's width is smaller than default window width,
		// fit the window's width to image width
		if (windowWidth > pictureInfo.width) {
			windowWidth = pictureInfo.width;
		}

		// calculate width/height ratio
		var widthHeightRatio = pictureInfo.width / pictureInfo.height;

		var windowHeight = Math.ceil(windowWidth * (1 / widthHeightRatio)) + 60;

		// create the picture display window
		pictureDisplayWindow = new BrowserWindow({
			width: windowWidth,
			height: windowHeight,
			resizable: false,
			frame: false
		});

		pictureDisplayWindow.loadURL("file://" + __app.basePath + "/html-pages/picture-display.html");

		// pictureDisplayWindow.openDevTools();

		pictureDisplayWindow.on('closed', function() {
			pictureDisplayWindow = null;
		});

		callback();
	};

	/**
	 * close "picture display" window
	 *
	 * @param callback
	 */
	_this.closePictureDisplayWindow = function(callback) {
		callback = callback || function() {};

		// close login window
		pictureDisplayWindow.close();

		callback();
	};

	/**
	 * open "research topic" window
	 *
	 * @param callback
	 */
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

		// researchTopicWindow.openDevTools();

		researchTopicWindow.on('closed', function() {
			researchTopicWindow = null;
		});

		callback();
	};

	/**
	 * close "research topic" window
	 *
	 * @param callback
	 */
	_this.closeResearchTopicWindow = function(callback) {
		callback = callback || function() {};

		researchTopicWindow.close();

		callback();
	};

	/**
	 * open a new browser(TrackBrowser) window
	 * @param callback
	 */
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
			// browserWindow.openDevTools();

			browserWindowList[browserWindow.id] = browserWindow;
			attachEventHandlersToBrowserWindow(browserWindow);

			_this.openBrowserPictureDisplayWindow();

			// increase window count
			createdWindowCount++;

			callback();
		});
	};

	/**
	 * open in-browser "picture display" window
	 *
	 * @param callback
	 */
	_this.openBrowserPictureDisplayWindow = function(callback) {
		callback = callback || function() {};

		console.log("HackBrowserWindowManager.openBrowserPictureDisplayWindow()");

		// if browser picture display window is already open,
		// do nothing
		if (browserPictureDisplayWindow !== null) {
			return;
		}

		var pictureInfo = mainProcessController.getPictureInfo();

		// make max window width small
		var windowWidth = 250;

		// if the image's width is smaller than default window width,
		// fit the window's width to image width
		if (windowWidth > pictureInfo.width) {
			windowWidth = pictureInfo.width;
		}

		// calculate width/height ratio
		var widthHeightRatio = pictureInfo.width / pictureInfo.height;
		var windowHeight = Math.ceil(windowWidth * (1 / widthHeightRatio));

		// create the picture display window
		browserPictureDisplayWindow = new BrowserWindow({
			width: windowWidth,
			height: windowHeight,
			resizable: false,
			frame: false
		});

		browserPictureDisplayWindow.loadURL("file://" + __app.basePath + "/html-pages/browser-window-picture-display.html");
		browserPictureDisplayWindow.setAlwaysOnTop(true);

		browserPictureDisplayWindow.on('closed', function() {
			browserPictureDisplayWindow = null;
		});

		attachEventHandlersToBrowserPictureWindow(browserPictureDisplayWindow);

		callback();
	};

	/**
	 * close in-browser "picture display" window
	 *
	 * @param callback
	 */
	_this.closeBrowserPictureDisplayWindow = function(callback) {
		callback = callback || function() {};

		// close login window
		browserPictureDisplayWindow.close();

		callback();
	};

	_this.repositionBrowserPictureDisplayWindow = function() {
		// if either browserWindow or browserPictureDisplayWindow is not open, do nothing
		if ((browserWindow === null) || (browserPictureDisplayWindow === null)) return;

		var browserWindowBounds = browserWindow.getBounds();

		var newXPos = browserWindowBounds.x + browserWindowBounds.width + 10;
		var newYPos = browserWindowBounds.y;

		browserPictureDisplayWindow.setPosition(newXPos, newYPos);
	};

	/**
	 * open help window
	 *
	 * @param callback
	 */
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

	/**
	 * close help window
	 *
	 * @param callback
	 */
	_this.closeHelpWindow = function(callback) {
		callback = callback || function() {};

		helpWindow.close();

		callback();
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