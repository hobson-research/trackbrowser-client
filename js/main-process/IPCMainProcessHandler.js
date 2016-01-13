'use strict';

const ipcMain = require("electron").ipcMain;

/**
 * since there can only be one main process at any point,
 * all methods must be static
 */
function IPCMainProcessHandler(mainProcessController) {
	var _this = this;

	var mainProcessEventEmitter;

	/* ====================================
	 private methods
	 ===================================== */
	var init = function() {
		mainProcessEventEmitter = mainProcessController.getMainProcessEventEmitter();

		attachEventHandlers();
	};

	var attachEventHandlers = function() {
		ipcMain.on("userNameCheck", handleUserNameCheck);
		ipcMain.on("researchTopicInput", handleResearchTopicInput);
		ipcMain.on("userInfoRequest", handleUserInfoRequest);
		ipcMain.on("navigationData", handleNavigationData);
	};

	var handleUserNameCheck = function(event, arg) {
		var userName = arg;

		console.log("userNameCheck message received");

		// TODO: check username check logic
		if (true) {
			event.sender.send("userNameCheckResult", true);
			mainProcessEventEmitter.emit("userNameCheckPass", userName);
		} else {
			event.sender.send("userNameCheckResult", false);
		}
	};

	var handleResearchTopicInput = function(event, arg) {
		var msgObj;

		console.log("researchTopicInput received");

		try {
			msgObj = JSON.parse(arg);

			event.sender.send("researchTopicInputResult", true);
			mainProcessEventEmitter.emit("researchTopicInputComplete", msgObj);
		} catch (err) {
			console.log("Error parsing research topic input IPC message (invalid JSON format)");

			event.sender.send("researchTopicInputResult", false);
		};
	};

	var handleUserInfoRequest = function(event, arg) {
		event.sender.send("userInfoResponse", JSON.stringify(mainProcessController.getParticipantData()));
	};

	var handleNavigationData = function(event, arg) {
		var navigationDataObj = JSON.parse(arg);

		mainProcessController.getActivityRecorder().recordNavigation(navigationDataObj.tabViewId, navigationDataObj.url);
	};

	init();
}

module.exports = IPCMainProcessHandler;