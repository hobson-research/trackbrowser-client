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
		ipcMain.on("userNumberCheck", handleUserNameCheck);
		ipcMain.on("researchTopicInput", handleResearchTopicInput);
		ipcMain.on("userDataRequest", handleUserDataRequest);
	};

	var handleUserNameCheck = function(event, arg) {
		var userName = arg;

		console.log("userNumberCheck message received");

		// TODO: check username logic
		if (true) {
			event.sender.send("userNumberCheckResult", true);
			mainProcessEventEmitter.emit("userNumberCheckPass", userName);
			console.log(mainProcessEventEmitter);
		} else {
			event.sender.send("userNumberCheckResult", false);
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

	var handleUserDataRequest = function(event, arg) {

	};

	init();
}

module.exports = IPCMainProcessHandler;