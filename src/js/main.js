
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
		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		// parse holidays
		let xNodes = this.data.selectNodes(`//Holidays/*`);
		Events.dispatch({ type: "parse-holidays", xNodes });
		// parse events (temp)
		this.data.selectNodes(`//Events/*[not(@starts)]`).map(node => {
			let starts = new Date(node.getAttribute("date-starts")),
				ends = new Date(node.getAttribute("date-ends"));

			node.setAttribute("starts", starts.valueOf());
			node.setAttribute("ends", ends.valueOf());
		});

		// initiate first view
		window.find(".toolbar-tool_").get(5).trigger("click");
	},
	dispatch(event) {
		let Self = calendar,
			date,
			month,
			name,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.open":
				break;
			case "window.resize":
				// update now line
				Events.dispatch({ type: "update-now-line" });
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
			// custom events
			case "toggle-sidebar":
				return Self.sidebar.dispatch(event);
			case "switch-view":
				View.switch(event.arg);
				return true;
			case "view-go":
				View.go(event.arg);
				break;
			case "select-month":
				month = $(event.target).parents(".month");
				if (!month.length) return;
				date = month.data("date").split("-");
				View.switch("month", true);
				View.go(new Date(date[0], date[1], 1));
				break;
			default:
				if (event.el) {
					pEl = event.el.parents("div[data-area]");
					name = pEl.attr("data-area");
					if (pEl.length && Self[name].dispatch) {
						Self[name].dispatch(event);
					}
				}
		}
	},
	sidebar: @import "./modules/sidebar.js",
};

window.exports = calendar;
