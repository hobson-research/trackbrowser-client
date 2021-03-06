'use strict';

/**
 * HackBrowserWindowController controls all activities related to a browser window
 * all browser-related public-APIs can be accessed through HackBrowserWindowController instance
 *
 * @constructor
 */
function HackBrowserWindowController() {
	const remote = require("electron").remote;
	const fs = require("fs");
	const path = require("path");

	var _this = this;

	/* ====================================
	 private member variables
	 ====================================== */
	var ipcHandler;

	var menuBar;
	var browserTabBar;
	var addressBar;
	var userInfoBar;

	var contextMenuHandler;
	var activeTabView;
	var createdTabViewCount;
	var openTabViewCount;
	var tabList;

	var isTrackingOn;
	var userName;
	var dataPath;

	var fibonacciScreenshotTimer;
	var isScreenshotDelayClear;
	var screenshotDelayTimer;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		// note that handler for IPC communication be initialized before other view components
		ipcHandler = new IPCRendererProcessHandler(_this);

		// create a new NavigationControls object associated with current browser window
		menuBar = new NavigationControls(_this);
		browserTabBar = new BrowserTabBar(_this);
		addressBar = new AddressBar(_this);
		userInfoBar = new UserInfoBar(_this);

		contextMenuHandler = new ContextMenuHandler(_this);
		createdTabViewCount = 0;
		openTabViewCount = 0;
		tabList = {};

		isTrackingOn = true;
		isScreenshotDelayClear = true;

		ipcHandler.requestUserInfo(function(userInfoObj) {
			userInfoObj = JSON.parse(userInfoObj);
			userName = userInfoObj.userName;
		});

		// retrieve data path from main process
		dataPath = null;

		// retrieve data path (for screenshots from main process)
		ipcHandler.requestDataPath(function(dataPathResponse) {
			dataPath = dataPathResponse;
		});

		_this.addNewTab("http://www.google.com/", true);

		// initialize new fibonacci counter
		_this.resetFibonacciScreenshotTimer();

		attachEventHandlers();
	};

	var attachEventHandlers = function() {
		// shortcuts
		key('⌘+f, ctrl+f', function() {
			activeTabView.getSearchBox().open();
		});

		// TODO: change to TabView refresh
		// temporarily refresh browser page for debugging
		key('ctrl+r', function() {
			console.log("reloading browser page");

			// reload the current page without using the cache
			document.location.reload(true);
		});

		key('esc', function() {
			activeTabView.getSearchBox().close();
		});
	};

	var scheduleFibonacciScreenshot = function(currDelay, prevDelay) {
		console.log("Fibonacci Screenshot - currDelay: " + currDelay + ", prevDelay: " + prevDelay);

		// in milliseconds
		var nextScreenshotDelay = 0;

		var ONE_MINUTE = 1 * 1000 * 60;
		var TWO_MINUTE = 2 * 1000 * 60;

		if ((!currDelay) || (currDelay < ONE_MINUTE)) {
			nextScreenshotDelay = ONE_MINUTE;
		} else if (currDelay === ONE_MINUTE) {
			nextScreenshotDelay = TWO_MINUTE;
		} else if (currDelay > ONE_MINUTE) {
			nextScreenshotDelay = currDelay + prevDelay;
		}

		if (fibonacciScreenshotTimer) {
			clearTimeout(fibonacciScreenshotTimer);
		}

		// schedule fibonacci timer
		fibonacciScreenshotTimer = setTimeout(function() {
			if (isTrackingOn === true) {
				_this.getActiveTabView().takeScreenshotAndRequestUpload(function() {
					scheduleFibonacciScreenshot(nextScreenshotDelay, currDelay);
				});
			}
		}, nextScreenshotDelay);
	};


	/* ====================================
	 public methods
	 ====================================== */
	_this.navigateTo = function(url) {
		activeTabView.navigateTo(url);
	};

	_this.updateWindowTitle = function(title) {
		document.title = title;
	};

	/**
	 * Create a new browser tab
	 *
	 * @param url {string} URL to open, if left null, a "blank-page" will be displayed
	 * @param activate {boolean} whether to activate the new tab immediately (optional, defaults to true)
	 *
	 * @returns {string} ID of new tab
	 */
	_this.addNewTab = function(url, activate) {
		var newTabView = new TabView(_this, browserTabBar, url);
		var newTabViewId = newTabView.getId();

		// the default option for activating tab
		// if no argument was supplied for "activate" option, turn it on
		if (activate === undefined) { activate = true; }

		// add TabView to list
		tabList[newTabViewId] = newTabView;

		// activate tab
		if (activate === true) {
			_this.activateTabById(newTabViewId);

			if (!addressBar.isAddressBarFocused()) {
				addressBar.focusOnAddressBar();
			}
		}

		// increase open tab count
		openTabViewCount++;

		return newTabViewId;
	};

	/**
	 * activates a tab
	 *
	 * @param {int} tabViewId
	 */
	_this.activateTabById = function(tabViewId) {
		console.log("activateTabById(" + tabViewId + ")");

		if (activeTabView && (activeTabView.getId() === tabViewId)) {
			console.log("already active tab");
			return;
		}

		if(tabList.hasOwnProperty(tabViewId) === true) {
			if (activeTabView) {
				activeTabView.deactivate();
			}

			activeTabView = tabList[tabViewId];

			// activate new tab view
			activeTabView.activate();

			_this.updateWindowControls();
		}
	};

	/**
	 * updates back/forward buttons' enable/disable status
	 */
	_this.updateWindowControls = function() {
		// check if active webview is still loading
		// if webViewEl.canGoBack() or webViewEl.canGoForward() is called in menuBar.updateBtnStatus()
		// before <webview> element is loaded, an exception will be thrown
		if (activeTabView.isDOMReady() === true) {
			// update back/forward button status
			menuBar.updateBtnStatus(activeTabView.getWebViewEl());

			// update reload button
			if (activeTabView.getWebViewEl().isLoading() === true) {
				menuBar.showLoadStopBtn();
			} else {
				menuBar.showReloadBtn();
			}
		} else {
			menuBar.disableBackBtn();
			menuBar.disableForwardBtn();
		}

		_this.updateWindowTitle(activeTabView.getWebViewTitle());
		addressBar.updateURL(activeTabView.getURL());
	};

	/**
	 * return BrowserTabBar handler
	 *
	 * @returns {BrowserTabBar} BrowserTabBar view component
	 */
	_this.getBrowserTabBar = function() {
		return browserTabBar;
	};

	/**
	 * return MenuBar handler
	 *
	 * @returns {MenuBar} MenuBar view component
	 */
	_this.getMenuBar = function() {
		return menuBar;
	};

	/**
	 * return active TabView object
	 *
	 * @returns {TabView} currently active TabView object
	 */
	_this.getActiveTabView = function() {
		return activeTabView;
	};

	/**
	 * getter for ContextMenuHandler
	 *
	 * @returns {ContextMenuHandler} handler for context menu actions
	 */
	_this.getContextMenuHandler = function() {
		return contextMenuHandler;
	};

	/**
	 * increment total number of created tabs including closed ones
	 * this method should be exposed publicly in case a new tab is created programmatically
	 */
	_this.incrementCreatedTabViewCount = function() {
		createdTabViewCount++;
	};

	/**
	 * return number of total created tabs including closed ones
	 *
	 * @returns {int} created tab count
	 */
	_this.getCreatedTabViewCount = function() {
		return createdTabViewCount;
	};

	/**
	 * navigate back on active TabView
	 *
	 * @returns {boolean} whether navigating backwards was successful
	 */
	_this.goBack = function() {
		var didGoBack = false;

		if ((activeTabView.isDOMReady() === true) && (activeTabView.getWebViewEl().canGoBack() === true)) {
			activeTabView.getWebViewEl().goBack();
			didGoBack = true;
		}

		return didGoBack;
	};

	/**
	 * navigate forward on active TabView
	 *
	 * @returns {boolean} whether navigating forward was successful
	 */
	_this.goForward = function() {
		var didGoForward = false;

		if ((activeTabView.isDOMReady() === true) && (activeTabView.getWebViewEl().canGoForward() === true)) {
			activeTabView.getWebViewEl().goForward();
			didGoForward = true;
		}

		return didGoForward;
	};

	/**
	 * reload (refresh) page on active TabView
	 */
	_this.reload = function() {
		activeTabView.getWebViewEl().reload();
	};

	/**
	 * stop loading a page on active TabView
	 */
	_this.stopLoading = function() {
		activeTabView.getWebViewEl().stop();
	};

	/**
	 * remove specific TabView object from tabList object
	 * for garbage collection
	 *
	 * this method should be called when a tab is closed in the browser
	 *
	 * @param tabViewId
	 */
	_this.handleTabCloseById = function(tabViewId) {
		var tabViewToClose = tabList[tabViewId];

		// remove <webview> element
		tabViewToClose.close();

		// remove tabView from tabList map
		delete tabList[tabViewId];

		openTabViewCount--;

		// if no tabs are open, close window
		if (openTabViewCount === 0) {
			var currentWindow = remote.getCurrentWindow();
			currentWindow.close();
		}
	};

	_this.getIPCHandler = function() {
		return ipcHandler;
	};

	_this.getUserInfoBar = function() {
		return userInfoBar;
	};

	/**
	 * take screenshot of active <webview> element
	 *
	 * @param {function} callback after taking the screenshot is complete
	 */
	_this.captureActiveWebView = function(callback) {
		console.log("captureActiveWebView()");

		// limit the number of screenshots being taken with timed intervals
		if (isScreenshotDelayClear === false) {
			console.log("screenshot delay hasn't been cleared yet");

			return;
		}

		// take screenshot since delay has been cleared
		// reset screenshot delay timer
		_this.resetScreenshotDelayTimer();

		var captureDate = new Date();

		var fileName = "capture_" + userName + "_" + captureDate.getFullYear() + Utility.pad((captureDate.getMonth() + 1), 2) + Utility.pad(captureDate.getDate(), 2) + "_" + Utility.pad(captureDate.getHours(), 2) + Utility.pad(captureDate.getMinutes(), 2) + Utility.pad(captureDate.getSeconds(), 2) + ".png";

		var filePath = dataPath + fileName;

		remote.getCurrentWindow().capturePage(function(img) {
			(function() {
				fs.writeFile(filePath, img.toPng(), function(err) {
					if (err) {
						console.log("[HackBrowserWindowController] Error generating screenshot file");
						console.log(err);
					}

					callback(filePath);
				});
			})();
		});
	};

	_this.getIsTrackingOn = function() {
		return isTrackingOn;
	};

	_this.setIsTrackingOn = function(isOn) {
		isTrackingOn = isOn;
		userInfoBar.setTrackingMode(isOn);

		ipcHandler.notifyTrackingStatusChange(function() {
			console.log("notified tracking status update");
		});
	};

	// reset counter for Fibonacci screenshot
	_this.resetFibonacciScreenshotTimer = function() {
		scheduleFibonacciScreenshot();
	};

	// reset screenshot-limit-timer
	_this.resetScreenshotDelayTimer = function() {
		if (screenshotDelayTimer) {
			clearTimeout(screenshotDelayTimer);
		}

		isScreenshotDelayClear = false;

		screenshotDelayTimer = setTimeout(function() {
			isScreenshotDelayClear = true;
		}, 2000);
	};

	// enable screenshot
	_this.clearScreenshotDelay = function() {
		if (screenshotDelayTimer) {
			clearTimeout(screenshotDelayTimer);
		}

		isScreenshotDelayClear = true;
	};

	init();
}
