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
	var matchDisplayEl;
	var ordinalIndexEl;
	var totalCountEl;
	var prevBtnEl;
	var nextBtnEl;
	var closeBtnEl;
	var searchVal;
	var isInputFocusEvent;

	var NO_MATCH_CLASS = "no-match";

	/* ====================================
	 private methods
	 ====================================== */
	var init = function() {
		searchWrapperEl = document.createElement("div");
		searchWrapperEl.classList.add("search-wrapper");
		searchWrapperEl.innerHTML = '<div class="search-input-wrapper"><input type="text" class="search" /><div class="match-display"><span class="ordinal-index">0</span> of <span class="total-count">0</span></div><div class="button-group"><a class="button prev"><i class="icon ion-ios-arrow-up"></i></a><a class="button next"><i class="icon ion-ios-arrow-down"></i></a></div></div><a class="button close"><i class="icon ion-android-close"></i></a>';

		searchInputEl = searchWrapperEl.querySelector("input.search");
		matchDisplayEl = searchWrapperEl.querySelector(".match-display");
		ordinalIndexEl = searchWrapperEl.querySelector(".ordinal-index");
		totalCountEl = searchWrapperEl.querySelector(".total-count");

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

		if (searchVal == "") {
			hideFindResult();
		} else {
			showFindResult();
		}

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

		if (e.result.hasOwnProperty("activeMatchOrdinal")) {
			updateOrdinalIndex(e.result.activeMatchOrdinal);
		}

		if (e.result.hasOwnProperty("matches")) {
			updateTotalMatchCount(e.result.matches);
		}
	};

	var updateOrdinalIndex = function(ordinalIndex) {
		console.log("updateOrdinalIndex(" + ordinalIndex + ")");
		ordinalIndexEl.innerHTML = ordinalIndex;
	};

	var updateTotalMatchCount = function(totalMatchCount) {
		if (totalMatchCount === 0) {
			matchDisplayEl.classList.add(NO_MATCH_CLASS);
		} else {
			matchDisplayEl.classList.remove(NO_MATCH_CLASS);
		}

		totalCountEl.innerHTML = totalMatchCount;
	};

	var showFindResult = function() {
		matchDisplayEl.style.display = "block";
	};

	var hideFindResult = function() {
		matchDisplayEl.style.display = "none";
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