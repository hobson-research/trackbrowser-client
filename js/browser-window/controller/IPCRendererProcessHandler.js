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
	}

	init();
}