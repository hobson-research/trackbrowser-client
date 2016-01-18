'use strict';

/**
 * since there can only be one main process at any point,
 * all methods must be static
 */
function IPCMainProcessHandler(mainProcessController) {
	const ipcMain = require("electron").ipcMain;

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
		ipcMain.on("userNameRequest", handleUserNameRequest);
		ipcMain.on("userNameCheck", handleUserNameCheck);
		ipcMain.on("userPictureURLRequest", handleUserPictureURLRequest);
		ipcMain.on("userPictureWindowCloseRequest", handleUserPictureWindowCloseRequest);
		ipcMain.on("dataPathRequest", handleDataPathRequest);
		ipcMain.on("researchTopicWindowOpenRequest", handleResearchTopicWindowOpenRequest);
		ipcMain.on("researchTopicWindowCancelRequest", handleResearchTopicWindowCancelRequest);
		ipcMain.on("researchTopicInput", handleResearchTopicInput);
		ipcMain.on("userInfoRequest", handleUserInfoRequest);
		ipcMain.on("navigationData", handleNavigationData);
		ipcMain.on("screenshotUploadRequest", handleScreenshotUploadRequest);
		ipcMain.on("helpWindowOpenRequest", handleHelpWindowOpenRequest);
	};

	var handleUserNameRequest = function(event, arg) {
		event.sender.send("userNameResponse", mainProcessController.getParticipantUserName());
	};

	var handleUserNameCheck = function(event, arg) {
		var userName = arg;

		// TODO: check username check logic

		if (true) {
			event.sender.send("userNameCheckResult", true);
			mainProcessEventEmitter.emit("userNameCheckPass", userName);
		} else {
			event.sender.send("userNameCheckResult", false);
		}
	};

	var handleUserPictureURLRequest = function(event, arg) {
		event.sender.send("userPictureURLResponse", mainProcessController.getPictureURL());
	};

	var handleUserPictureWindowCloseRequest = function(event, arg) {
		event.sender.send("userPictureWindowCloseResponse", true);
		mainProcessEventEmitter.emit("userPictureWindowCloseRequest", true);
	};

	var handleDataPathRequest = function(event, arg) {
		event.sender.send("dataPathResponse", GLOBAL.__app.dataPath);
	};

	var handleResearchTopicWindowOpenRequest = function(event, arg) {
		mainProcessController.getWindowManager().openResearchTopicWindow();

		event.sender.send("researchTopicWindowOpenResponse", true);
	};

	var handleResearchTopicWindowCancelRequest = function(event, isNewSession) {
		if (isNewSession === true) {
			mainProcessController.getWindowManager().openLoginWindow(function() {
				mainProcessController.getWindowManager().closeResearchTopicWindow();
			});
		} else {
			mainProcessController.getWindowManager().closeResearchTopicWindow();
		}
	};

	var handleHelpWindowOpenRequest = function(event, arg) {
		mainProcessController.getWindowManager().openHelpWindow();

		event.sender.send("helpWindowOpenResponse", true);
	};

	var handleResearchTopicInput = function(event, arg) {
		var msgObj;

		try {
			msgObj = JSON.parse(arg);

			event.sender.send("researchTopicUpdated", true);
			mainProcessEventEmitter.emit("researchTopicInputComplete", msgObj);

			mainProcessController.getWindowManager().getBrowserWindow().webContents.executeJavaScript("hackBrowserWindow.getUserInfoBar().syncUserInfoFromMainProcess()");
		} catch (err) {
			console.log("Error parsing research topic input IPC message (invalid JSON format)");

			event.sender.send("researchTopicUpdated", false);
		}
	};

	var handleUserInfoRequest = function(event, arg) {
		event.sender.send("userInfoResponse", JSON.stringify(mainProcessController.getParticipantData()));
	};

	var handleNavigationData = function(event, arg) {
		var navigationDataObj = JSON.parse(arg);

		mainProcessController.getActivityRecorder().recordNavigation(navigationDataObj.tabViewId, navigationDataObj.url);
	};

	var handleScreenshotUploadRequest = function(event, screenshotDataJSON) {
		var screenshotDataObj = JSON.parse(screenshotDataJSON);

		mainProcessController.getActivityRecorder().uploadScreenshot(screenshotDataObj.tabViewId, screenshotDataObj.url, screenshotDataObj.filePath);
	};

	init();
}

module.exports = IPCMainProcessHandler;