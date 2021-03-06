'use strict';

/**
 * IPC handler for renderer process
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

	_this.requestPictureDisplayOpen = function(callback) {
		callback = callback || function() {};

		ipcRenderer.send("pictureDisplayOpenRequest", true);
		ipcRenderer.once("pictureDisplayOpenResponse", function(e, result) {
			callback(result);
		});
	};

	_this.sendNavigationData = function(tabViewId, url, callback) {
		var sendMsgObj = {
			tabViewId: tabViewId,
			url: url
		};

		ipcRenderer.send("navigationData", JSON.stringify(sendMsgObj));
	};

	_this.sendMouseEventData = function(tabViewId, url) {
		var sendMsgObj = {
			tabViewId: tabViewId,
			url: url
		};

		ipcRenderer.send("mouseEventData", JSON.stringify(sendMsgObj));
	};

	_this.sendScrollEventData = function(tabViewId, url) {
		var sendMsgObj = {
			tabViewId: tabViewId,
			url: url
		};

		ipcRenderer.send("scrollEventData", JSON.stringify(sendMsgObj));
	};

	_this.sendInputEventData = function(tabViewId, url, inputData) {
		var inputDataObj = inputData;

		inputDataObj['tabViewId'] = tabViewId;
		inputDataObj['url'] = url;

		ipcRenderer.send("inputEventData", JSON.stringify(inputDataObj));
	};

	_this.requestScreenshotUpload = function(tabViewId, url, filePath) {
		var screenshotDataObj = {
			tabViewId: tabViewId,
			url: url,
			filePath: filePath
		};

		ipcRenderer.send("screenshotUploadRequest", JSON.stringify(screenshotDataObj));
	};

	_this.notifyTrackingStatusChange = function(callback) {
		callback = callback || function() {};

		ipcRenderer.send("trackingStatusChange", hackBrowserWindow.getIsTrackingOn());
		ipcRenderer.once("trackingStatusChangeConfirm", function(e, result) {
			callback(result);
		});
	};

	init();
}