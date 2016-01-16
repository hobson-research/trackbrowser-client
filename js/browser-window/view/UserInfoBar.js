'use strict';

/**
 * TrackBrowser user information bar
 *
 * @param hackBrowserWindow
 * @constructor
 */
function UserInfoBar(hackBrowserWindow) {
	var _this = this;

	/* ====================================
	 private member variables
	 ====================================== */
	var userInfoBarEl;
	var userNameBoxEl;
	var userNameTextEl;
	var researchTypeBoxEl;
	var researchTypeTextEl;
	var companiesBoxEl;
	var companiesTextEl;
	var helpBoxEl;
	var trackingStatusBoxEl;
	var trackingStatusTextEl;
	var trackingStatusSwitchWrapperEl;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		userInfoBarEl = document.getElementById("user-info-bar");
		userNameBoxEl = document.getElementById("box-user-name");
		userNameTextEl = userNameBoxEl.querySelector("p.info");
		researchTypeBoxEl = document.getElementById("box-research-type");
		researchTypeTextEl = researchTypeBoxEl.querySelector("p.info");
		companiesBoxEl = document.getElementById("box-companies");
		companiesTextEl = companiesBoxEl.querySelector("p.info");
		helpBoxEl = document.getElementById("box-link-help");
		trackingStatusBoxEl = document.getElementById("box-tracking-status");
		trackingStatusTextEl = trackingStatusBoxEl.querySelector("p.info");
		trackingStatusSwitchWrapperEl = document.getElementById("tracking-switch-wrapper");
		_this.syncUserInfoFromMainProcess();

		attachEventHandlers();
	};

	/**
	 * attach event handlers for menu bar buttons
	 */
	var attachEventHandlers = function() {
		researchTypeBoxEl.addEventListener("click", handleResearchTypeBoxClick);
		companiesBoxEl.addEventListener("click", handleCompaniesBoxClick);
		trackingStatusBoxEl.addEventListener("click", handleTrackingStatusBoxClick);
		helpBoxEl.addEventListener("click", handleHelpBoxClick);
	};

	var handleResearchTypeBoxClick = function(e) {
		hackBrowserWindow.getIPCHandler().requestResearchTopicWindowOpen();

		e.preventDefault();
	};

	var handleCompaniesBoxClick = function(e) {
		hackBrowserWindow.getIPCHandler().requestResearchTopicWindowOpen();

		e.preventDefault();
	};

	var handleTrackingStatusBoxClick = function(e) {
		e.preventDefault();

		toggleTrackingMode();
	};

	var handleHelpBoxClick = function(e) {
		hackBrowserWindow.getIPCHandler().requestHelpWindowOpen();

		e.preventDefault();
	};

	var toggleTrackingMode = function() {
		if (hackBrowserWindow.getIsTrackingOn() === false) {
			hackBrowserWindow.setIsTrackingOn(true);

		} else {
			hackBrowserWindow.setIsTrackingOn(false);
		}
	};

	/* ====================================
	 public methods
	 ====================================== */

	_this.updateUserName = function(val) {
		userNameTextEl.textContent = val;
	};

	_this.updateResearchType = function(val) {
		researchTypeTextEl.textContent = val;
	};

	_this.updateCompanies = function(val) {
		companiesTextEl.textContent = val;
	};

	_this.syncUserInfoFromMainProcess = function() {
		console.log("UserInfoBar.syncUserInfoFromMainProcess()");

		hackBrowserWindow.getIPCHandler().requestUserInfo(function(userInfoJSON) {
			console.log(userInfoJSON);

			try {
				var userInfo = JSON.parse(userInfoJSON);
				var researchTypeText = ((userInfo.researchTypeKey === "other") ? userInfo.researchTypeOtherReason : userInfo.researchType);

				_this.updateUserName(userInfo.userName);
				_this.updateResearchType(researchTypeText);
				_this.updateCompanies(userInfo.researchCompanies);
			} catch (ex) {
				console.log("invalid JSON returned for user info");
			}
		});
	};

	_this.setTrackingMode = function(enable) {
		if (enable === true) {
			trackingStatusSwitchWrapperEl.classList.add("on");
			trackingStatusTextEl.textContent = "On";
		} else {
			trackingStatusSwitchWrapperEl.classList.remove("on");
			trackingStatusTextEl.textContent = "Off";
		}
	};

	init();
}