
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

		this.dispatch({ type: "render-calendar" });

		// temp
		window.find(".toolbar-tool_").get(0).trigger("click");
	},
	dispatch(event) {
		let APP = calendar,
			Self = APP.sidebar,
			date,
			width,
			isOn,
			htm;
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
				htm = Render.month({ date, weekDays: 3, weekNumbers: 1, nav: ["sidebar-go-prev", "sidebar-go-next"] });
				// remove title
				// htm.shift();

				Self.els.miniCal.append(htm.join(""));
				break;
			case "sidebar-go-prev":
			case "sidebar-go-next":
				console.log(event);
				break;
		}
	}
}
