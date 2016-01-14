'use strict';

/**
 * TrackBrowser user information bar
 *
 * @param hackBrowserWindow
 * @constructor
 */
function IPCRendererProcessHandler(hackBrowserWindow) {
	const ipcRenderer = require("electron").ipcRenderer;

	var _this = this;

	/* ====================================
	 private member variables
	 ====================================== */
	var userInfoBarEl;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		userInfoBarEl = document.getElementById("user-info-bar");

		attachEventHandlers();
	};

	/**
	 * attach event handlers for menu bar buttons
	 */
	var attachEventHandlers = function() {

	};


	/* ====================================
	 public methods
	 ====================================== */
	_this.requestUserInfo = function(callback) {
		console.log("IPCRendererProcessHandler.requestUserInfo()");

		ipcRenderer.send("userInfoRequest", true);
		ipcRenderer.on("userInfoResponse", function(e, userInfoObj) {
			callback(userInfoObj);
		});
	};

	_this.requestDataPath = function(callback) {
		console.log("IPCRendererProcessHandler.requestDataPath");

		ipcRenderer.send("dataPathRequest", true);
		ipcRenderer.on("dataPathResponse", function(e, dataPath) {
			callback(dataPath);
		});
	};

	_this.requestResearchTopicWindowOpen = function(callback) {
		console.log("IPCRendererProcessHandler.requestResearchTopicWindowOpen()");

		callback = callback || function() {};

		ipcRenderer.send("researchTopicWindowOpenRequest", true);
		ipcRenderer.on("researchTopicWindowOpenResponse", function(e, result) {
			callback(result);
		});
	};

	_this.requestHelpWindowOpen = function(callback) {
		console.log("IPCRendererProcessHandler.requestHelpWindowOpen()");

		callback = callback || function() {};

		ipcRenderer.send("helpWindowOpenRequest", true);
		ipcRenderer.on("helpWindowOpenResponse", function(e, result) {
			callback(result);
		});
	};

	_this.sendNavigationData = function(tabViewId, url, callback) {
		var sendMsgObj = {
			tabViewId: tabViewId,
			url: url
		};

		ipcRenderer.send("navigationData", JSON.stringify(sendMsgObj));
		ipcRenderer.on("navigationDataRecorded", function(e, result) {
			callback(result);
		});
	};

	_this.sendScreenshotData = function(tabViewId, url, fileName, callback) {

	};

	init();
}