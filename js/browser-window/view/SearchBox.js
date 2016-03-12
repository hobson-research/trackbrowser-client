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
	var prevBtnEl;
	var nextBtnEl;
	var closeBtnEl;
	var searchVal;

	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		searchWrapperEl = document.createElement("div");
		searchWrapperEl.classList.add("search-wrapper");
		searchWrapperEl.innerHTML = '<div class="search-input-wrapper"><input type="text" class="search" /><div class="match-display"></div><div class="button-group"><a class="button prev"><i class="icon ion-ios-arrow-up"></i></a><a class="button next"><i class="icon ion-ios-arrow-down"></i></a></div></div><a class="button close"><i class="icon ion-android-close"></i></a>';

		searchInputEl = searchWrapperEl.querySelector("input.search");

		prevBtnEl = searchWrapperEl.querySelector(".prev");
		nextBtnEl = searchWrapperEl.querySelector(".next");
		closeBtnEl = searchWrapperEl.querySelector(".close");

		attachEventHandlers();
	};

	/**
	 * attach event handlers for menu bar buttons
	 */
	var attachEventHandlers = function() {
		searchInputEl.addEventListener("keyup", function(e) {
			searchVal = searchInputEl.value;

			// Enter key
			if (e.charCode === 13) {
				e.preventDefault();
			}

			if (searchVal) {
				tabView.getWebViewEl().findInPage(searchVal, {

				});
			}
		});

		prevBtnEl.addEventListener("click", onPrevBtnClick);
		nextBtnEl.addEventListener("click", onNextBtnClick);
		closeBtnEl.addEventListener("click", onCloseBtnClick);
		tabView.getWebViewEl().addEventListener("found-in-page", onFoundInPage);
	};

	var onPrevBtnClick = function(e) {
		tabView.getWebViewEl().findInPage(searchVal, {
			forward: false,
			findNext: true
		});

		e.preventDefault();
	};

	var onNextBtnClick = function(e) {
		tabView.getWebViewEl().findInPage(searchVal, {
			findNext: true
		});

		e.preventDefault();
	};

	var onCloseBtnClick = function(e) {
		e.preventDefault();

		_this.close();
	};

	var onFoundInPage = function(e) {
		console.log(e);
	};

	var updateFindResult = function(index, totalCount) {

	};


	/* ====================================
	 public methods
	 ====================================== */
	_this.getSearchWrapperEl = function() {
		return searchWrapperEl;
	};

	_this.open = function() {
		searchWrapperEl.style.display = "block";
		searchInputEl.focus();
	};

	_this.close = function() {
		// stop find
		tabView.getWebViewEl().stopFindInPage("clearSelection");

		searchWrapperEl.style.display = "none";
	};



	init();
}