'use strict';

/**
 * since there can only be one main process at any point,
 * all methods must be static
 */
function IPCMainProcessHandler() {
	var _this = this;

	const ipcMain = require("electron").ipcMain;

	var init = function() {
		userNameCheckHandler();
	};

	var userNameCheckHandler = function() {
		ipcMain.on('userNameCheck', function(event, arg) {
			var msgObj;

			try {
				msgObj = JSON.stringify(arg);

				console.log("Received asynchronous-message");
				console.log(msgObj);

				event.sender.send("userNameCheckResult", true);
			} catch (e) {
				event.sender.send("userNameCheckResult", false);
			}
		});
	};

	init();
}


module.exports = IPCMainProcessHandler;