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
	var isInputFocusEvent;

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

		isInputFocusEvent = false;

		attachEventHandlers();
	};

	/**
	 * attach event handlers for menu bar buttons
	 */
	var attachEventHandlers = function() {
		searchInputEl.addEventListener("keyup", onSearchInputKeyUp);
		prevBtnEl.addEventListener("click", onPrevBtnClick);
		nextBtnEl.addEventListener("click", onNextBtnClick);
		closeBtnEl.addEventListener("click", onCloseBtnClick);
		tabView.getWebViewEl().addEventListener("found-in-page", onFoundInPage);
	};

	var onSearchInputKeyUp = function(e) {
		searchVal = searchInputEl.value;

		console.log(e);

		if (e.keyCode === 27) {				// esc key
			_this.close();
		} else if (e.keyCode === 13) {		// enter key
			e.preventDefault();
		} else {
			// if the keyup event is not fired from input focus event
			// and searchVal is not blank, find in page
			if (!isInputFocusEvent) {
				if (searchVal) {
					tabView.getWebViewEl().findInPage(searchVal, {});
				}
			} else {
				isInputFocusEvent = false;
			}

		}
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
		console.log(e.result);
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
		// temporarily set flag to prevent find-in-page running
		// when opening up the search box
		// focusing on input elements will fire keyup event
		isInputFocusEvent = true;

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