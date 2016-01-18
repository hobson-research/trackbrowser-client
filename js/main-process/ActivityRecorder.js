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

	var addDateTimeToPostObj = function(msgObj) {
		var recordDate = new Date();

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

	_this.getPictureURL = function(errorCallback, successCallback) {
		request(tbServerHost + ":" + tbServerPort + "/api/v1/picture/user/" + userName, function(error, response, body) {
			if (!error && response.statusCode == 200) {
				successCallback(body);
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
		// add userName to userInfoObj
		userInfoObj.userName = userName;

		userInfoObj = addDateTimeToPostObj(userInfoObj);

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/researchtopic",
			formData: userInfoObj
		});
	};

	_this.recordNavigation = function(tabViewId, url) {
		var recordNavigationData = {
			type: 'navigation',
			userName: userName,
			tabViewId: tabViewId,
			url: url
		};

		// add date & time
		recordNavigationData = addDateTimeToPostObj(recordNavigationData);

		request.post({
			url: tbServerHost + ":" + tbServerPort + "/api/v1/browsingdata",
			formData: recordNavigationData
		});
	};

	// TODO: add handling for file downloads
	_this.recordFileDownload = function() {

	};

	_this.uploadScreenshot = function(tabViewId, url, imagePath) {
		var formData = {
			type: 'screenshot',
			userName: userName,
			tabViewId: tabViewId,
			url: url,
			fileName: path.basename(imagePath),
			imageAttachment: fs.createReadStream(imagePath)
		};

		formData = addDateTimeToPostObj(formData);

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