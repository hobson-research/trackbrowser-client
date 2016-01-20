'use strict';

const request = require("request");
const fs = require("fs");
const path = require("path");

function ActivityRecorder(mainProcessController) {
	// const tbServerHost = "http://10.88.187.97";
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

	_this.recordClickEvent = function(tabViewId, url, eventData) {

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

	// TODO: add handling for file downloads
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

	_this.setParticipantUserName = function(newUserName) {
		userName = newUserName;
	};

	init();
}

module.exports = ActivityRecorder;