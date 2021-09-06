Q.page("TokenSociety/icons", function () {
	var className;
	var $content = $("#content");
	Q.each(document.styleSheets, function () {
		if (!Q.getObject("includes", this.href) || !this.href.includes("css/icons.css")) {
			return;
		}

		var classes = this.rules || this.cssRules;
		for (var i = 0; i < classes.length; i++) {
			className = classes[i].selectorText;

			if (!/^.tokensociety-icon-[^\s]+:before$/.test(className)) {
				continue;
			}

			$content.append($("<i />").addClass(className.replace(/^\./, "").replace(/:+.*/, "")));
		}
	});

	return function () {

	};

}, 'TokenSociety');
