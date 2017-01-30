'use strict';

const request = require("request");
const fs = require("fs");
const path = require("path");

function ActivityRecorder(mainProcessController) {
	const tbServerHost = "http://52.32.246.19";
	const tbServerPort = "8082";

	var _this = this;
	var userName;

	var init = function() {
	};

	var addCommonInfoToPostObj = function(msgObj) {
		var recordDate = new Date();

		msgObj.userName = userName;
		msgObj.date = recordDate.toGMTString();
		msgObj.timestamp = recordDate.getTime();

		return msgObj;
	};

	_this.checkServerAlive = function(errorCallback, successCallback) {
		request
			.get(tbServerHost + ":" + tbServerPort + "/api/v1/echo")
			.on('error', errorCallback)
			.on('response', successCallback);
	};

	_this.getUserPictureInfoFromServer = function(errorCallback, successCallback) {
		request(tbServerHost + ":" + tbServerPort + "/api/v1/picture/user/" + userName, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				// parse JSON-response to object
				var imageInfoObj = JSON.parse(body);

				successCallback(imageInfoObj);
			} else {
				if (error) {
					// server not responding
				} else {
					// invalid response code
				}
			}
		});
	};

	_this.recordUserInfo = function(userInfoObj) {
		// add username & datetime
		userInfoObj = addCommonInfoToPostObj(userInfoObj);
		userInfoObj.type = "research-topic";

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/researchtopic",
			formData: userInfoObj
		});
	};

	_this.recordNavigation = function(tabViewId, url) {
		var recordNavigationData = {
			type: 'navigation',
			tabViewId: tabViewId,
			url: url
		};

		// add date & time
		recordNavigationData = addCommonInfoToPostObj(recordNavigationData);

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/browsingdata",
			formData: recordNavigationData
		});
	};

	// currently, click events are not posted to server
	// instead, screenshots are sent to server when a navigation is done
	_this.recordClickEvent = function(tabViewId, url) {
		var clickData = {
			type: "click",
			tabViewId: tabViewId,
			url: url
		};

		clickData = addCommonInfoToPostObj(clickData);

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/click",
			formData: clickData
		});
	};

	_this.recordScrollEvent = function(tabViewId, url) {
		var scrollData = {
			type: "scroll",
			tabViewId: tabViewId,
			url: url
		};

		scrollData = addCommonInfoToPostObj(scrollData);

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/scroll",
			formData: scrollData
		});
	};

	_this.recordInputEvent = function(inputData) {
		inputData = addCommonInfoToPostObj(inputData);
		inputData['inputType'] = inputData.type;
		inputData['type'] = "input";

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/input",
			formData: inputData
		});
	};

	_this.recordFileDownload = function(itemData) {
		itemData = addCommonInfoToPostObj(itemData);

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/download",
			formData: itemData
		});
	};

	_this.uploadScreenshot = function(tabViewId, url, imagePath) {
		var formData = {
			type: 'screenshot',
			tabViewId: tabViewId,
			url: url,
			fileName: path.basename(imagePath),
			imageAttachment: fs.createReadStream(imagePath)
		};

		formData = addCommonInfoToPostObj(formData);

		// post image data
		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/screenshot",
			formData: formData
		}, function optionalCallback(err, httpResponse, body) {
			if (err) {
				return console.error("upload failed: " + err);
			}

			// go ahead and delete the image from local hard drive
			fs.unlink(imagePath, function(err) {

			});
		});
	};

	_this.recordTrackingStatusChange = function(isTrackingOn) {
		var trackingStatusData = {
			type: 'tracking-status',
			isTrackingOn: new Boolean(isTrackingOn).toString()	// can't be primitive boolean value
		};

		trackingStatusData = addCommonInfoToPostObj(trackingStatusData);

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/tracking-status",
			formData: trackingStatusData
		});
	};

	_this.setParticipantUserName = function(newUserName) {
		userName = newUserName;
	};

	init();
}

module.exports = ActivityRecorder;