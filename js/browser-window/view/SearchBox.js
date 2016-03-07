'use strict';

/**
 * Find function
 *
 * @param hackBrowserWindow
 * @constructor
 */
function SearchBox(hackBrowserWindow) {
	var _this = this;

	/* ====================================
	 private member variables
	 ====================================== */
	var searchInputEl;


	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		searchInputEl = document.getElementById("address-bar");
		attachEventHandlers();
	};

	/**
	 * attach event handlers for menu bar buttons
	 */
	var attachEventHandlers = function() {
		searchInputEl.addEventListener("keypress", function(e) {
			// Enter key
			if (e.charCode === 13) {
				e.preventDefault();

				// update url value
				var searchVal = searchInputEl.value;
			}
		});
	};


	/* ====================================
	 public methods
	 ====================================== */

	init();
}