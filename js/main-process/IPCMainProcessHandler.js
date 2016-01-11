'use strict';

/**
 * since there can only be one main process at any point,
 * all methods must be static
 */
function IPCMainProcessHandler() {
	var _this = this;

	const ipc = require("ipc");

	var init = function() {
		userNameCheckHandler();
	};

	var userNameCheckHandler = function() {
		ipc.on('userNameCheck', function(event, arg) {
			var msgObj;

			try {
				msgObj = JSON.stringify(arg);

				console.log("Received asynchronous-message");
				console.log(msgObj);

				event.sender.send("asynchronous-reply", true);
			} catch (e) {
				event.sender.send("asynchronous-reply", false);
			}
		});
	};

	init();
}


module.exports = IPCMainProcessHandler;