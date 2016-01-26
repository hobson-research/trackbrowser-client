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
		ipcMain.on("userPictureInfoRequest", handleUserPictureInfoRequest);
		ipcMain.on("userPictureWindowCloseRequest", handleUserPictureWindowCloseRequest);
		ipcMain.on("dataPathRequest", handleDataPathRequest);
		ipcMain.on("researchTopicWindowOpenRequest", handleResearchTopicWindowOpenRequest);
		ipcMain.on("researchTopicWindowCancelRequest", handleResearchTopicWindowCancelRequest);
		ipcMain.on("researchTopicInput", handleResearchTopicInput);
		ipcMain.on("userInfoRequest", handleUserInfoRequest);
		ipcMain.on("navigationData", handleNavigationData);
		ipcMain.on("scrollEventData", handleEventScrollData);
		ipcMain.on("screenshotUploadRequest", handleScreenshotUploadRequest);
		ipcMain.on("helpWindowOpenRequest", handleHelpWindowOpenRequest);
		ipcMain.on("pictureDisplayOpenRequest", handlePictureDisplayOpenRequest);
		ipcMain.on("pictureDisplayCloseRequest", handlePictureDisplayCloseRequest);
		ipcMain.on("trackingStatusChange", handleTrackingStatusChange);
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

	var handleUserPictureInfoRequest = function(event, arg) {
		console.log("IPCMainProcessHandler.handleUserPictureInfoRequest()");
		console.log(mainProcessController.getPictureInfo());

		var pictureInfoJSON = JSON.stringify(mainProcessController.getPictureInfo());

		event.sender.send("userPictureInfoResponse", pictureInfoJSON);
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

	/**
	 * ipc message handler for request to open help window
	 *
	 * @param event
	 * @param arg
	 */
	var handleHelpWindowOpenRequest = function(event, arg) {
		mainProcessController.getWindowManager().openHelpWindow();

		event.sender.send("helpWindowOpenResponse", true);
	};

	var handlePictureDisplayOpenRequest = function(event, arg) {
		mainProcessController.getWindowManager().openPictureDisplayWindow();

		event.sender.send("pictureDisplayOpenResponse", true);
	};

	var handlePictureDisplayCloseRequest = function(event, arg) {
		mainProcessController.getWindowManager().closePictureDisplayWindow();

		event.sender.send("pictureDisplayCloseResponse", true);
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

	/**
	 * ipc handler to record user's research topic information
	 *
	 * @param event
	 * @param arg
	 */
	var handleUserInfoRequest = function(event, arg) {
		event.sender.send("userInfoResponse", JSON.stringify(mainProcessController.getParticipantData()));
	};

	/**
	 * ipc handler to record navigation data
	 *
	 * @param event
	 * @param navigationDataJSON
	 */
	var handleNavigationData = function(event, navigationDataJSON) {
		var navigationDataObj = JSON.parse(navigationDataJSON);

		mainProcessController.getActivityRecorder().recordNavigation(navigationDataObj.tabViewId, navigationDataObj.url);
	};


	var handleEventScrollData = function(event, scrollDataJSON) {
		var scrollDataObj = JSON.parse(scrollDataJSON);

		mainProcessController.getActivityRecorder().recordScrollEvent(scrollDataObj.tabViewId, scrollDataObj.url);
	};

	/**
	 * ipc message handler for uploading screenshots
	 *
	 * @param event
	 * @param screenshotDataJSON
	 */
	var handleScreenshotUploadRequest = function(event, screenshotDataJSON) {
		var screenshotDataObj = JSON.parse(screenshotDataJSON);

		mainProcessController.getActivityRecorder().uploadScreenshot(screenshotDataObj.tabViewId, screenshotDataObj.url, screenshotDataObj.filePath);
	};

	/**
	 * ipc handler to turn on/off tracking status
	 *
	 * @param event
	 * @param isTrackingOn
	 */
	var handleTrackingStatusChange = function(event, isTrackingOn) {
		mainProcessController.setIsTrackingOn(isTrackingOn);

		event.sender.send("trackingStatusChangeConfirm", true);
	};

	init();
}

module.exports = IPCMainProcessHandler;