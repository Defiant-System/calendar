
const calendar = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			daysWrapper: window.find(".days-wrapper"),
		};

		// temp
		this.els.daysWrapper.scrollTop(100);
	},
	dispatch(event) {
		switch (event.type) {
			case "window.open":
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
		}
	}
};

window.exports = calendar;
