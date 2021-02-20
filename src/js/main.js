
@import "./modules/events.js";
@import "./modules/render.js";
@import "./modules/view.js";


const calendar = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};

		// events data storage; temp in bluePrint
		// TODO: move data to storage files
		this.data = window.bluePrint;

		// initiate objects and view
		View.init();
		Render.init();
		Events.init();

		// parse holidays
		let xNodes = window.bluePrint.selectNodes(`//Holidays/*`);
		Events.dispatch({ type: "parse-holidays", xNodes });

		// initiate first view
		window.find(".toolbar-tool_").get(5).trigger("click");
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

				// signal events to render date range
				Events.dispatch({
					type: `populate-${event.arg}`,
					starts: View.rangeStart,
					ends: View.rangeEnd,
				});

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
