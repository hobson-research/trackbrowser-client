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
	var userNumberBoxEl;
	var userNumberTextEl;
	var researchTypeBoxEl;
	var researchTypeTextEl;
	var companiesBoxEl;
	var companiesTextEl;
	var trackingStatusBoxEl;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		userInfoBarEl = document.getElementById("user-info-bar");
		userNumberBoxEl = document.getElementById("box-user-number");
		userNumberTextEl = userNumberBoxEl.querySelector("p.info");
		researchTypeBoxEl = document.getElementById("box-research-type");
		researchTypeTextEl = researchTypeBoxEl.querySelector("p.info");
		companiesBoxEl = document.getElementById("box-companies");
		companiesTextEl = companiesBoxEl.querySelector("p.info");
		trackingStatusBoxEl = document.getElementById("box-tracking-status");

		hackBrowserWindow.getIPCHandler().requestUserInfo(function(userInfoJSON) {
			console.log(userInfoJSON);

			var userInfo = JSON.parse(userInfoJSON);
			var researchTypeText = ((userInfo.researchTypeKey === "other") ? userInfo.researchTypeOtherReason : userInfo.researchType);

			updateUserNumber(userInfo.userNumber);
			updateResearchType(researchTypeText);
			updateCompanies(userInfo.researchCompanies);
		});

		attachEventHandlers();
	};

	/**
	 * attach event handlers for menu bar buttons
	 */
	var attachEventHandlers = function() {

	};

	/* ====================================
	 public methods
	 ====================================== */

	var updateUserNumber = function(val) {
		userNumberTextEl.textContent = val;
	};

	var updateResearchType = function(val) {
		researchTypeTextEl.textContent = val;
	};

	var updateCompanies = function(val) {
		companiesTextEl.textContent = val;
	};


	init();
}