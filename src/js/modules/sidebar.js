
// calendar.areas.sidebar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar"),
			wrapper: window.find(".sidebar-wrapper"),
			reelWrapper: window.find(".reel-wrapper"),
		};

		// reference to contextual date
		this.date = new Date();

		// auto render sídebar contents
		this.dispatch({ type: "render-calendar" });

		// temp
		setTimeout(() => window.find(".toolbar-tool_").get(0).trigger("click"), 300);
	},
	dispatch(event) {
		let APP = calendar,
			Self = APP.sidebar,
			starts,
			ends,
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
			case "toggle-calendars":
				el = $(event.target);
				if (el.attr("type") !== "checkbox") return;
				console.log(event);
				break;
			case "sidebar-go-prev":
				// next month + render HTML
				Self.date.setMonth(Self.date.getMonth() - 1);
				Self.dispatch({ type: "render-calendar", className: "prepend" });
				// animation + clean up
				Self.els.reelWrapper.cssSequence("go-prev", "transitionend", wEl => {
					wEl.find(".mini-cal-wrapper")
						.removeClass("prepend")
						.get(0).remove();
					wEl.removeClass("go-prev");
				});
				break;
			case "sidebar-go-next":
				// next month + render HTML
				Self.date.setMonth(Self.date.getMonth() + 1);
				Self.dispatch({ type: "render-calendar" });
				// animation + clean up
				Self.els.reelWrapper.cssSequence("go-next", "transitionend", wEl => {
					wEl.find(".mini-cal-wrapper").get(0).remove();
					wEl.removeClass("go-next");
				});
				break;
			case "render-calendar":
				htm = Render.month({ date: Self.date, weekNumbers: 1, mini: 1 });
				htm.unshift(`<div class="mini-cal-wrapper ${event.className || ""}">`);
				htm.push(`</div>`);
				el = Self.els.reelWrapper.append(htm.join(""));

				starts = Self.date.valueOf();
				ends = new Date(starts);
				ends.setMonth(ends.getMonth() + 1);
				Events.dispatch({
					type: "populate-mini-cal",
					ends: ends.valueOf(),
					starts,
					el,
				});
				break;
		}
	}
}
