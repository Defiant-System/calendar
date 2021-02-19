
const calendar = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			daysWrapper: window.find(".days-wrapper"),
		};

		// temp
		window.find(".toolbar-tool_").get(6).trigger("click");
	},
	dispatch(event) {
		let Self = calendar,
			el;
		switch (event.type) {
			// system events
			case "window.open":
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
			// custom events
			case "switch-view":
				Self.els.content.prop({ "className": "show-"+ event.arg });

				// temp
				if (["week", "day"].includes(event.arg)) {
					Self.els.daysWrapper.scrollTop(300);
				}
				return true;
		}
	}
};

window.exports = calendar;
