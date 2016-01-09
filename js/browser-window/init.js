(function() {
	'use strict';

	// bootstrap
	var init = function() {
		var hackBrowserWindow = new HackBrowserWindowController();
	};

	if (document.readyState === "complete" || document.readyState === "loaded") {
		init();
	} else {
		document.addEventListener("DOMContentLoaded", function() {
			init();
		});
	}
})(); 