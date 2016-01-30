'use strict';

/**
 * TabView consists of a browser tab and it's associated webview
 *
 * @param {HackBrowserWindowController} hackBrowserWindow - the browser window
 * @param {BrowserTabBar} browserTabBar
 * @param {string} url - initial url
 *
 * @constructor
 */
function TabView(hackBrowserWindow, browserTabBar, url) {
	var _this = this;

	const fs = require("fs");

	/* ====================================
	 private member variables
	 ====================================== */
	var webViewEl;
	var webViewTitle;
	var webViewURL;
	var webViewWrapperEl;
	var tabViewId;
	var browserTab;
	var isDOMReady;
	var isWaitingForScreenshotWhenActivated;


	/* ====================================
	 private methods
	 ====================================== */
	/**
	 * create a new <webview> element and linked browser tab
	 *
	 * @param url
	 */
	var init = function(url) {
		webViewEl = document.createElement("webview");
		webViewTitle = "New Tab";
		webViewURL = url;
		webViewWrapperEl = document.getElementById("webview-wrapper");
		isDOMReady = false;
		tabViewId = "wv-" + hackBrowserWindow.getCreatedTabViewCount();
		isWaitingForScreenshotWhenActivated = false;

		// increase created tab view count
		hackBrowserWindow.incrementCreatedTabViewCount();

		// assign tabViewId to <webview> element's id
		webViewEl.setAttribute("id", tabViewId);
		webViewEl.setAttribute("plugins", "");
		webViewEl.setAttribute("disablewebsecurity", "");

		if (url === null) {
			_this.navigateTo("http://www.google.com/");
		} else {
			_this.navigateTo(url);
		}

		// append the webview element to screen (#webview-wrapper)
		webViewWrapperEl.appendChild(webViewEl);

		browserTab = browserTabBar.createTab(tabViewId);
		attachEventHandlers();
	};

	var attachEventHandlers = function() {
		webViewEl.addEventListener("load-commit", handleLoadCommit);
		webViewEl.addEventListener("did-finish-load", handleDidFinishLoad);
		webViewEl.addEventListener("did-fail-load", handleDidFailLoad);
		webViewEl.addEventListener("did-frame-finish-load", handleDidFrameFinishLoad);
		webViewEl.addEventListener("did-start-loading", handleDidStartLoading);
		webViewEl.addEventListener("did-stop-loading", handleDidStopLoading);
		webViewEl.addEventListener("did-get-response-details", handleDidGetResponseDetails);
		webViewEl.addEventListener("did-get-redirect-request", handleDidGetRedirectRequest);
		webViewEl.addEventListener("dom-ready", handleDOMReady);
		webViewEl.addEventListener("page-title-updated", handlePageTitleUpdated);
		webViewEl.addEventListener("page-favicon-updated", handlePageFaviconUpdated);
		webViewEl.addEventListener("new-window", handleNewWindow);
		webViewEl.addEventListener("will-navigate", handleWillNavigate);
		webViewEl.addEventListener("did-navigate", handleDidNavigate);
		webViewEl.addEventListener("did-navigate-in-page", handleDidNavigateInPage);
		webViewEl.addEventListener("console-message", handleConsoleMessage);
	};


	var takeScreenshotAndRequestUpload = function() {
		hackBrowserWindow.captureActiveWebView(function(imgPath) {
			hackBrowserWindow.getIPCHandler().requestScreenshotUpload(tabViewId, webViewURL, imgPath, function() {});
		});
	};

	var handleLoadCommit = function(e) {
		console.log("[" + tabViewId + "] load-commit");

		if (e.isMainFrame === true) {
			webViewURL = e.url;

			if (hackBrowserWindow.getActiveTabView() === _this) {
				hackBrowserWindow.updateWindowTitle(webViewURL);
			}

			if (hackBrowserWindow.getActiveTabView() === _this) {
				hackBrowserWindow.updateWindowControls();
			}
		}
	};

	var handleDidFinishLoad = function() {
		console.log("[" + tabViewId + "] did-finish-load");
	};

	var handleDidFailLoad = function(e) {
		console.log("[" + tabViewId + "] did-fail-load");
		console.log(e);
	};

	var handleDidFrameFinishLoad = function(e) {
		console.log("[" + tabViewId + "] did-frame-finish-load");

		webViewURL = webViewEl.getURL();
	};

	var handleDidStartLoading = function() {
		console.log("[" + tabViewId + "] did-start-loading");

		// set loading icon
		browserTab.startLoading();

		if (hackBrowserWindow.getActiveTabView() === _this) {
			hackBrowserWindow.getMenuBar().showLoadStopBtn();
		}
	};

	var handleDidStopLoading = function() {
		console.log("[" + tabViewId + "] did-stop-loading");

		// clear loading icon
		browserTab.stopLoading();

		// take screenshot and notify main process via ipc
		if (hackBrowserWindow.getIsTrackingOn() === true) {
			// send ipc message to record navigation
			hackBrowserWindow.getIPCHandler().sendNavigationData(tabViewId, webViewEl.getURL(), function(result) {
				if (result === true) {
					console.log("[" + tabViewId + "] navigation data successfully recorded to server");
				}
			});

			if (hackBrowserWindow.getActiveTabView() === _this) {
				takeScreenshotAndRequestUpload();
			}

			else {
				isWaitingForScreenshotWhenActivated = true;
			}
		} else {
			console.log("Tracking mode is turned off");
		}

		if (hackBrowserWindow.getActiveTabView() === _this) {
			hackBrowserWindow.getMenuBar().showReloadBtn();
		}
	};

	var handleDidGetResponseDetails = function(e) {
		console.log("[" + tabViewId + "] did-get-response-details");
	};

	var handleDidGetRedirectRequest = function(e) {
		console.log("[" + tabViewId + "] did-get-redirect-request");
	};

	var handleDOMReady = function() {
		console.log("[" + tabViewId + "] dom-ready");

		var TRACK_SCRIPT_PATH = __dirname + "/../js/browser-window/inject/inject-to-webview.js";

		isDOMReady = true;

		// insert custom script to <webview> to handle click events
		fs.readFile(TRACK_SCRIPT_PATH, "utf-8", function(err, injectScript) {
			if (err) {
				console.log("[" + tabViewId + "] error loading inject script");
				return;
			}

			webViewEl.executeJavaScript(injectScript);
			console.log("[" + tabViewId + "] successfully injected script to webview");
		});
	};

	var handlePageTitleUpdated = function(e) {
		console.log("[" + tabViewId + "] page-title-updated");

		webViewTitle = e.title;

		// update tab title
		_this.updateTabTitle(webViewTitle);

		if (hackBrowserWindow.getActiveTabView() === _this) {
			hackBrowserWindow.updateWindowTitle(webViewTitle);
		}
	};

	var handlePageFaviconUpdated = function(e) {
		console.log("[" + tabViewId + "] page-favicon-updated");

		// the last element in favicons array is used
		// TODO: if multiple favicon items are returned and last element is invalid, use other ones
		_this.updateTabFavicon(e.favicons[e.favicons.length - 1]);
	};

	var handleNewWindow = function(e) {
		console.log("[" + tabViewId + "] new-window");

		hackBrowserWindow.addNewTab(e.url, true);

		console.log(e);
	};

	var handleWillNavigate = function(e) {
		console.log("[" + tabViewId + "] will-navigate");
		console.log(e);
	};

	var handleDidNavigate = function(e) {
		console.log("[" + tabViewId + "] did-navigate");
		console.log(e);

		webViewURL = e.url;
	};

	var handleDidNavigateInPage = function(e) {
		console.log("[" + tabViewId + "] did-navigate-in-page");
		console.log(e);

		if (hackBrowserWindow.getActiveTabView() === _this) {
			hackBrowserWindow.updateWindowControls();
		}
	};

	var handleConsoleMessage = function(e) {
		console.log("[" + tabViewId + "] console-message");

		// check if message text begins with curly braces (for json format)
		// most of the time, non-json formats would be filtered here
		// if the first character of message text is curly braces
		// but the message text is not json format, an exception is thrown
		if (e.message[0] == '{') {
			try {
				var msgObject = JSON.parse(e.message);
				console.log(msgObject);

				// if contextmenu action, pass it to context menu handler
				if (msgObject.eventType === "contextmenu") {
					hackBrowserWindow.getContextMenuHandler().handleWebViewContextMenu(msgObject);
				}

				else if (msgObject.eventType === "scroll") {
					hackBrowserWindow.getIPCHandler().sendScrollEventData(tabViewId, webViewURL);
					takeScreenshotAndRequestUpload();
				}

				else if ((msgObject.eventType === "focus") && (msgObject.type === "input/password")) {
					// hackBrowserWindow.setIsTrackingOn(false);
				}

				else if ((msgObject.eventType === "blur") && (msgObject.type === "input/password")) {
					// hackBrowserWindow.setIsTrackingOn(true);


				}
			} catch(err) {
				// console.error(err);
				// since the console-message is not a HackBrowser message, do nothing
			}
		}
	};


	/* ====================================
	 public methods
	 ====================================== */
	_this.navigateTo = function(url) {
		var URLInfo = URIParser.parse(url);

		// if an invalid URl is passed
		if (URLInfo.isValid !== true) {
			// do nothing
			return;
		}

		if (URLInfo.type === "http") {
			webViewEl.setAttribute("src", URLInfo.formattedURI);
		}

		else if (URLInfo.type === "file") {
			console.log("User has entered a file URL into the addressbar: " + url);
			webViewEl.setAttribute("src", URLInfo.formattedURI);
		}

		else if (URLInfo.type === "page") {
			console.log("Opening HTML template file " + url);
			webViewEl.setAttribute("src", URLInfo.formattedURI);
		}

		else if (URLInfo.type === "internal") {
			console.log("User has navigated to an internal link: " + url);
		}

		else if (URLInfo.type === "search") {
			console.log("User has searched " + url);
			webViewEl.setAttribute("src", URLInfo.formattedURI);
		}
	};

	/**
	 * activate TabView (user clicks on this browser tab)
	 */
	_this.activate = function() {
		webViewEl.style.visibility = "visible";
		browserTab.activate();
	};

	/**
	 * deactivate TabView (user clicks on another browser tab)
	 */
	_this.deactivate = function() {
		webViewEl.style.visibility = "hidden";
		browserTab.deactivate();
	};

	/**
	 * check whether navigation actions (back, forward, reload, etc) can be performed on <webview>
	 *
	 * @returns {boolean} whether dom-ready was fired at least once in the <webview> object
	 */
	_this.isDOMReady = function() {
		return isDOMReady;
	};

	/**
	 * close current TabView
	 */
	_this.close = function() {
		// remove webview element
		webViewWrapperEl.removeChild(webViewEl);
	};

	_this.getId = function() {
		return tabViewId;
	};

	_this.getWebViewEl = function() {
		return webViewEl;
	};

	_this.getWebViewTitle = function() {
		return webViewTitle;
	};

	_this.getURL = function() {
		return webViewURL;
	};

	_this.updateTabFavicon = function(imageURL) {
		browserTab.updateTabFavicon(imageURL);
	};

	_this.updateTabTitle = function(title) {
		browserTab.updateTitle(title);
	};

	init(url);
}