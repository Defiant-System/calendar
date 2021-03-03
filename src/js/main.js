
@import "./modules/events.js";
@import "./modules/render.js";
@import "./modules/view.js";


const calendar = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};

		// put values as data-attributes on content level
		this.els.content.data({
			hours: defiant.Moment.hours,
			weekStartsWith: defiant.Moment.weekStartsWith,
		});

		// events data storage; temp in bluePrint
		// TODO: move data to storage files
		this.data = window.bluePrint;
		this.xEvents = this.data.selectSingleNode(`//Events`);


		// parse holidays
		let xNodes = this.data.selectNodes(`//Holidays/*`);
		Events.dispatch({ type: "parse-holidays", xNodes });
		// parse events, set ID's
		this.data.selectNodes(`//event[not(@id)]`).map((node, index) =>
			node.setAttribute("id", index));
		// parse events (temp)
		this.data.selectNodes(`//event[not(@starts)]`).map(node => {
			let starts = new Date(node.getAttribute("iso-starts")),
				ends = new Date(node.getAttribute("iso-ends"));
			// convert to milliseconds
			node.setAttribute("starts", starts.valueOf());
			node.setAttribute("ends", ends.valueOf());
		});

		// initiate objects and view
		View.init();
		Render.init();
		Events.init();
		// init sub objects
		Object.keys(this).filter(i => this[i].init).map(i => this[i].init());

		// initiate first view
		window.find(".toolbar-tool_").get(7).trigger("click");

		// setTimeout(() => window.find(".entry, .event").get(1).trigger("click"), 300);
	},
	dispatch(event) {
		let Self = calendar,
			node,
			date,
			month,
			name,
			target,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.open":
				break;
			case "window.close":
				// TODO: save event data to storage
				break;
			case "window.resize":
				// update now line
				Events.dispatch({ type: "update-now-line" });
				break;
			case "window.keystroke":
				switch (event.char) {
					case "esc":
						return Self.popup.dispatch({ type: "popup-no-update-event" });
					case "return":
						// prevent default behaviour
						event.preventDefault();

						Self.popup.dispatch({ type: "popup-update-event" });
						return;
				}
				break;
			case "open-help":
				defiant.shell("fs -u '~/help/index.md'");
				break;
			// contextmenu events
			case "show-xml-data":
				console.log(Self.xEvents);
				break;
			case "change-event-color":
				node = Self.data.selectSingleNode(`//Palette/*[@hex="${event.arg}"]`);
				event.origin.el.prop({ className: `event ${node.getAttribute("name")}` });
				break;
			case "event-calendar-info":
			case "delete-event-calendar":
				console.log(event);
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
				if (event.target) {
					target = $(event.target);
					pEl = target.parents("div[data-area]");
					name = pEl.attr("data-area");
					if (pEl.length && Self[name].dispatch) {
						Self[name].dispatch({ ...event, target });
					}
				}
		}
	},
	sidebar: @import "./modules/sidebar.js",
	popup: @import "./modules/popup.js",
};

window.exports = calendar;
