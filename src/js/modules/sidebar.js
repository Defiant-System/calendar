
// calendar.areas.sidebar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar"),
			wrapper: window.find(".sidebar-wrapper"),
			miniCal: window.find(".mini-calendar"),
		};

		// auto render sídebar contents
		this.dispatch({ type: "render-calendar" });

		// temp
		// setTimeout(() => window.find(".toolbar-tool_").get(0).trigger("click"), 300);
	},
	dispatch(event) {
		let APP = calendar,
			Self = APP.sidebar,
			date,
			width,
			isOn,
			htm,
			el;
		switch (event.type) {
			case "toggle-sidebar":
				isOn = Self.els.sidebar.hasClass("show");
				width = Self.els.wrapper.width();

				if (isOn) {
					window.width -= width;

					Self.els.sidebar.cssSequence("!show", "transitionend", el =>
						// update now line
						Events.dispatch({ type: "update-now-line" }));
				} else {
					window.width += width;

					Self.els.sidebar.cssSequence("show", "transitionend", el =>
						// update now line
						Events.dispatch({ type: "update-now-line" }));
				}
				
				return !isOn;
			case "render-calendar":
				date = new Date(),
				htm = Render.month({ date, weekNumbers: 1, mini: 1 });
				// htm = Render.month({ date, weekDays: 3, weekNumbers: 1 });
				// remove title
				// htm.shift();

				Self.els.miniCal.append(htm.join(""));
				break;
			case "toggle-calendars":
				el = $(event.target);
				if (el.attr("type") !== "checkbox") return;
				console.log(event);
				break;
			case "sidebar-go-prev":
			case "sidebar-go-next":
				console.log(event);
				break;
		}
	}
}
