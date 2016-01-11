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
	};

	var userNameCheckHandler = function() {
		ipcMain.on("userNameCheck", function(event, arg) {
			var msgObj;

			console.log("userNameCheck message received");

			try {
				msgObj = JSON.stringify(arg);

				console.log("Received asynchronous-message");
				console.log(msgObj);

				event.sender.send("userNameCheckResult", true);
				mainProcessEventEmitter.emit("userNameCheckPass");
			} catch (e) {
				event.sender.send("userNameCheckResult", false);
			}
		});

	};

	init();
}

module.exports = IPCMainProcessHandler;