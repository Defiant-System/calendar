
@import "./modules/render.js";
@import "./modules/view.js";


const calendar = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};

		// initiate objects and view
		Render.init();
		View.init();

		// initiate first view
		window.find(".toolbar-tool_").get(7).trigger("click");
	},
	dispatch(event) {
		let Self = calendar,
			date,
			month,
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
				View.switch(event.arg);
				return true;
			case "view-go":
				View.go(event.arg);
				break;
			case "select-month":
				month = $(event.target).parents(".month");
				date = month.data("date").split("-");
				View.switch("month", true);
				View.go(new Date(date[0], date[1], 1));
				break;
		}
	}
};

window.exports = calendar;
