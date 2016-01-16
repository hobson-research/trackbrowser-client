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
		userName = mainProcessController.getParticipantUserName();
	};

	_this.checkServerAlive = function(errorCallback, successCallback) {
		request
			.get(tbServerHost + ":" + tbServerPort + "/api/v1/echo")
			.on('error', errorCallback)
			.on('response', successCallback);
	};

	_this.recordUserInfo = function(userInfoObj) {
		// add userName to userInfoObj
		userInfoObj.userName = userName;

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/researchtopic",
			formData: userInfoObj
		});
	};

	_this.recordNavigation = function(tabViewId, url) {
		var recordDate = new Date();

		var recordNavigationData = {
			type: 'navigation',
			userName: userName,
			tabViewId: tabViewId,
			date: recordDate.toGMTString(),
			timestamp: recordDate.getTime(),
			url: url
		};

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/browsingdata",
			formData: recordNavigationData
		});
	};

	_this.uploadScreenshot = function(tabViewId, imagePath) {
		var recordDate = new Date();

		var formData = {
			type: 'screenshot',
			userName: userName,
			tabViewId: tabViewId,
			date: recordDate.toGMTString(),
			timestamp: recordDate.getTime(),
			fileName: path.basename(imagePath),
			imageAttachment: fs.createReadStream(imagePath)
		};

		console.log("in postImage()");
		console.log("imagePath is " + imagePath);

		// post image data
		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/screenshot",
			formData: formData
		}, function optionalCallback(err, httpResponse, body) {
			if (err) {
				return console.error("upload failed: " + err);
			}

			console.log('Upload successful!, server response with body');
			console.log(body);

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