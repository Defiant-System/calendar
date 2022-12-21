
@import "./modules/events.js";
@import "./modules/render.js";
@import "./modules/packer.js";
@import "./modules/view.js";

@import "./modules/test.js";


const calendar = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};

		// put values as data-attributes on content level
		this.els.content.data({
			hours: karaqu.Moment.hours,
			weekStartsWith: karaqu.Moment.weekStartsWith,
		});

		let Self = this,
			year = (new Date()).getFullYear();

		// check storage for previously saved data
		window.storage.getItem(`events-${year}`)
			.then(storageData => {
				// events data storage; temp in bluePrint
				Self.data = window.bluePrint;
				Self.xEvents = Self.data.selectSingleNode(`//Events`);

				if (storageData) {
					// replace bluePrint data with storage data
					Self.xEvents.parentNode.replaceChild(storageData, Self.xEvents);
					Self.xEvents = Self.data.selectSingleNode(`//Events`);
				}

				// parse holidays
				let xNodes = Self.data.selectNodes(`//Holidays/*`);
				Events.dispatch({ type: "parse-holidays", xNodes });
				// parse events, set ID's
				Self.data.selectNodes(`//event[not(@id)]`).map((node, index) =>
					node.setAttribute("id", index));
				// parse events (temp)
				Self.data.selectNodes(`//event[not(@starts)]`).map(node => {
					let starts = new Date(node.getAttribute("iso-starts")),
						ends = new Date(node.getAttribute("iso-ends"));
					// convert to milliseconds
					node.setAttribute("starts", starts.valueOf());
					node.setAttribute("ends", ends.valueOf());
				});

				// dispatch initiate
				Self.dispatch({ type: "inititate-app" });
				// initiate first view
				window.find(".toolbar-tool_").get(5).trigger("click");

				// DEV-ONLY-START
				Test.init();
				// DEV-ONLY-END
			});
	},
	dispatch(event) {
		let Self = calendar,
			now,
			node,
			date,
			month,
			name,
			target,
			xPath,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// system events
			case "window.close":
				// save calendar data to storage
				// TODO: shard event data - yearly
				date = new Date();
				window.storage.setItem(`events-${date.getFullYear()}`, Self.xEvents);
				break;
			case "window.resize":
				// update now line
				Events.dispatch({ type: "update-now-line" });
				break;
			case "window.keystroke":
				switch (event.char) {
					case "esc":
						return Self.popup.dispatch({ type: "popup-no-update-origin" });
					case "return":
						// prevent default behaviour
						event.preventDefault();

						Self.popup.dispatch({ type: "popup-update-origin" });
						return;
				}
				break;
			case "open-help":
				karaqu.shell("fs -u '~/help/index.md'");
				break;
			// contextmenu events
			case "show-xml-data":
				console.log(Self.xEvents);
				break;
			case "clear-xml-data":
				// window.storage.removeItem("events-2021");
				window.storage.clear();
				break;
			case "change-event-color":
				el = event.origin.el;

				xPath = `//Palette/*[@hex="${event.arg}"]`;
				node = Self.data.selectSingleNode(xPath);

				xPath = `//Events/Calendars/*[@color = "${node.getAttribute("id")}"]`;
				node = Self.data.selectSingleNode(xPath);
				
				// proxy command to Events object
				Events.dispatch({
					type: "change-event-color",
					calId: node.getAttribute("id"),
					id: el.data("id"),
					el
				});
				// console.log(event);
				break;
			case "before-contextmenu:event":
			case "event-info":
				// proxy command to Events object
				Events.dispatch(event);
				break;
			// custom events
			case "inititate-app":
				// initiate objects and view
				View.init();
				Render.init();
				Events.init();
				// init sub objects
				Object.keys(Self).filter(i => Self[i].init).map(i => Self[i].init());
				break;
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
