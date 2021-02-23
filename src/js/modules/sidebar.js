
const Sidebar = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar-wrapper"),
			miniCal: window.find(".mini-calendar"),
		};

		this.dispatch({ type: "render-calendar" });

		// temp
		window.find(".toolbar-tool_").get(0).trigger("click");
	},
	dispatch(event) {
		let Self = Sidebar,
			date,
			htm;
		switch (event.type) {
			case "render-calendar":
				date = new Date(),
				htm = Render.month({ date, weekDays: 3, weekNumbers: 1 });
				// remove title
				// htm.shift();

				Self.els.miniCal.append(htm.join(""));
				break;
		}
	}
};
