var request = require("request");

function ActivityRecorder() {
	var _this = this;

	_this.checkServerAlive = function(errorCallback, successCallback) {
		request
			.get('http://52.32.246.19:8082/api/v1/echo')
			.on('error', errorCallback)
			.on('response', successCallback);
	};
}

module.exports = ActivityRecorder;