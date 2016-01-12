'use strict';

/**
 * since there can only be one main process at any point,
 * all methods must be static
 */
function IPCMainProcessHandler(mainProcessEventEmitter) {
	var _this = this;

	const ipcMain = require("electron").ipcMain;

	/* ====================================
	 private methods
	 ===================================== */
	var init = function() {
		userNameCheckHandler();
		researchTopicHandler();
	};

	var userNameCheckHandler = function() {
		ipcMain.on("userNumberCheck", function(event, arg) {
			var userName = arg;

			console.log("userNumberCheck message received");

			// TODO: check username logic
			if (true) {
				event.sender.send("userNumberCheckResult", true);
				mainProcessEventEmitter.emit("userNumberCheckPass", userName);
			} else {
				event.sender.send("userNumberCheckResult", false);
			}
		});
	};

	var researchTopicHandler = function() {
		ipcMain.on("researchTopicInput", function(event, arg) {
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
		});
	};

	init();
}

module.exports = IPCMainProcessHandler;