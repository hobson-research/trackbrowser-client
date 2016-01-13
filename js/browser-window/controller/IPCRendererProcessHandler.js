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
		ipcRenderer.on("userInfoResponse", function(e, userInfo) {
			callback(userInfo);
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

	}

	init();
}