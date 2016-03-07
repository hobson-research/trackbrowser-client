'use strict';

/**
 * Find function
 *
 * @param tabView
 * @constructor
 */
function SearchBox(tabView) {
	var _this = this;

	/* ====================================
	 private member variables
	 ====================================== */
	var searchWrapperEl;
	var searchInputEl;

	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		searchWrapperEl = document.createElement("div");
		searchWrapperEl.classList.add("search-wrapper");
		searchWrapperEl.innerHTML = '<input type="text" class="search" /><a class="button prev"><i class="icon ion-ios-arrow-up"></i></a> <a class="button next"><i class="icon ion-ios-arrow-down"></i></a> <a class="button close"><i class="icon ion-android-close"></i></a>';

		searchInputEl = searchWrapperEl.querySelector("input.search");

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
	_this.getSearchWrapperEl = function() {
		return searchWrapperEl;
	};


	init();
}