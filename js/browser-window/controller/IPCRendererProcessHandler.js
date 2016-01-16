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
		ipcRenderer.on("researchTopicUpdated", handleResearchTopicUpdated);
	};

	var handleResearchTopicUpdated = function(event, arg) {
		console.log("IPCRendererProcessHandler.handleResearchTopicUpdated()");
		hackBrowserWindow.getUserInfoBar().syncUserInfoFromMainProcess();
	};

	/* ====================================
	 public methods
	 ====================================== */
	_this.requestUserInfo = function(callback) {
		console.log("IPCRendererProcessHandler.requestUserInfo()");

		ipcRenderer.send("userInfoRequest", true);
		ipcRenderer.once("userInfoResponse", function(e, userInfoObj) {
			callback(userInfoObj);
		});
	};

	_this.requestDataPath = function(callback) {
		console.log("IPCRendererProcessHandler.requestDataPath");

		ipcRenderer.send("dataPathRequest", true);
		ipcRenderer.once("dataPathResponse", function(e, dataPath) {
			callback(dataPath);
		});
	};

	_this.requestResearchTopicWindowOpen = function(callback) {
		console.log("IPCRendererProcessHandler.requestResearchTopicWindowOpen()");

		callback = callback || function() {};

		ipcRenderer.send("researchTopicWindowOpenRequest", true);
		ipcRenderer.once("researchTopicWindowOpenResponse", function(e, result) {
			callback(result);
		});
	};

	_this.requestHelpWindowOpen = function(callback) {
		console.log("IPCRendererProcessHandler.requestHelpWindowOpen()");

		callback = callback || function() {};

		ipcRenderer.send("helpWindowOpenRequest", true);
		ipcRenderer.once("helpWindowOpenResponse", function(e, result) {
			callback(result);
		});
	};

	_this.sendNavigationData = function(tabViewId, url, callback) {
		var sendMsgObj = {
			tabViewId: tabViewId,
			url: url
		};

		ipcRenderer.send("navigationData", JSON.stringify(sendMsgObj));
		ipcRenderer.once("navigationDataRecorded", function(e, result) {
			callback(result);
		});
	};

	_this.requestScreenshotUpload = function(tabViewId, url, filePath, callback) {
		callback = callback || function() {};

		var screenshotDataObj = {
			tabViewId: tabViewId,
			url: url,
			filePath: filePath
		};

		ipcRenderer.send("screenshotUploadRequest", JSON.stringify(screenshotDataObj));
		ipcRenderer.once("screenshotUploadResponse", function(e, result) {
			callback(result);
		});
	};

	init();
}