// track.js is executed once dom-ready event is passed from the webview
// No need to add an event listener for dom-ready

// Wrap inside an anonymous function to avoid namespace clash with original document
/**
	Event types to be sent to HackBrowser
	Because communication between each <webview> and TrackBrowserWindow is done via console,
	only necessary information is stringified and sent through console

	click 			User (left) click
	contextmenu		User right click
	message			Just a simple message
 */
(function() {
	'use strict';

	var debounce = function(func, wait, immediate) {
		var timeout;
		return function() {
			var context = this, args = arguments;
			var later = function() {
				timeout = null;
				if (!immediate) func.apply(context, args);
			};
			var callNow = immediate && !timeout;
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
			if (callNow) func.apply(context, args);
		};
	};

	var handleScrollDebounced = debounce(function(e) {
		var sendToBrowserWindowObj = {
			eventType: e.type
		};

		// send information to TrackBrowserWindow through console
		console.log(JSON.stringify(sendToBrowserWindowObj));
	}, 500);

	// extract necessary information from event object
	var getTargetElementTypeObj = function(e) {
		var returnObj = {};

		returnObj.nodeName = e.srcElement.nodeName;

		// check if image node
		if (e.srcElement.nodeName === 'IMG') {
			returnObj.type = 'image';
		}

		// check if input node
		else if (e.srcElement.nodeName === 'INPUT') {
			// Check if text type
			if (e.srcElement.type === 'text') {
				returnObj.type = 'input/text';

				// Store input information
				returnObj.inputId = e.srcElement.id;
				returnObj.inputValue = e.srcElement.value;
				returnObj.inputName = e.srcElement.name;
				returnObj.inputOuterHTML = e.srcElement.outerHTML;
			}

			// Check if password type
			else if (e.srcElement.type === 'password') {
				returnObj.type = 'input/password';
			}
		}

		else {
			var isLinkElement = false;

			// check if link element
			// srcElement may not be a link element (<a>) as the inner part
			// of the <a> element have other nodes such as <strong> or <img>
			// therefore, loop through bubbling path to see if link element exists
			// TODO: add other information for screen capture (offsetX and offsetY)
			for (var i = 0; i < e.path.length; i++) {
				if (e.path[i].nodeName === 'A') {
					var linkEl = e.path[i];

					returnObj.type = 'link';
					returnObj.href = linkEl.href;
					returnObj.target = linkEl.target;

					isLinkElement = true;

					// no need to traverse up anymore
					break;
				}
			}

			if (isLinkElement === false) {
				returnObj.type = "document";
			}
		}

		// return result
		return returnObj;
	}; // END: var getTargetElementTypeObj = function(e) {}


	// handle MouseEvent objects (both clicks and right click)
	var handleMouseEvent = function(e) {
		// Check to see if right-clicked on a link
		var elementTypeObj = getTargetElementTypeObj(e);

		var sendToBrowserWindowObj = {
			eventType: e.type,
			clientX: e.clientX,
			clientY: e.clientY
		};

		// Loop through elementTypeObj and append it to sendToBrowserWindowObj
		for (var key in elementTypeObj) {
			if (elementTypeObj.hasOwnProperty(key)) {
				sendToBrowserWindowObj[key] = elementTypeObj[key];
			}
		}

		// send information to TrackBrowserWindow through console
		console.log(JSON.stringify(sendToBrowserWindowObj));
	};

	// attach event handler for scrolls
	// debounced wrapper is used to avoid events being fired excessively
	window.addEventListener("scroll", handleScrollDebounced);

	// attach event handler for regular clicks
	document.addEventListener('click', function(e) {
		handleMouseEvent(e);
		console.log(e);
	}); // END: document.addEventListener('click', function(e) {}

	// attach event handler for right clicks
	document.addEventListener('contextmenu', function(e) {
		handleMouseEvent(e);
		console.log(e);
	}); // END: document.addEventListener('contextmenu', function(e) {}

	// attach event handlers for focus/blur events
	// the third parameter enforces focus/blur events to bubble
	document.addEventListener('focus', function(e) {
		handleMouseEvent(e);
		console.log(e);
	}, true);

	document.addEventListener('blur', function(e) {
		handleMouseEvent(e);
		console.log(e);
	}, true);
})();
