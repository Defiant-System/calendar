
// calendar.areas.sidebar

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			sidebar: window.find(".sidebar"),
			wrapper: window.find(".sidebar-wrapper"),
			reelWrapper: window.find(".reel-wrapper"),
			calendars: window.find(".sidebar .wrapper.calendars"),
			dayEntries: window.find(".sidebar .day-entries"),
		};

		// reference to contextual date
		this.date = new Date();

		// auto render sídebar contents
		this.dispatch({ type: "render-calendar-list" });
		this.dispatch({ type: "render-calendar" });

		// temp
		setTimeout(() => window.find(".toolbar-tool_").get(0).trigger("click"), 300);
	},
	dispatch(event) {
		let APP = calendar,
			Self = APP.sidebar,
			now,
			moment,
			iYear,
			iMonth,
			iDate,
			starts,
			ends,
			width,
			isOn,
			str,
			htm,
			match,
			target,
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
					
					// close event popup, if showing
					APP.popup.dispatch({ type: "close-popup-event" });
				} else {
					window.width += width;
					Self.els.sidebar.cssSequence("show", "transitionend", el =>
						// update now line
						Events.dispatch({ type: "update-now-line" }));

					// select "today"
					Self.els.reelWrapper.find("b.today").trigger("click");
				}
				
				return !isOn;
			case "toggle-calendars":
				el = $(event.target);
				if (el.attr("type") !== "checkbox") return;
				console.log(event);
				break;
			case "select-minical-day":
				el = $(event.target);
				if (!el.hasClass("day") || el.hasClass("non-day")) return;
				// close event popup, if showing
				APP.popup.dispatch({ type: "close-popup-event" });
				// indicate selected day
				el.parent().find(".selected").removeClass("selected");
				el.addClass("selected");

				// render day entries
				now = new Date();
				iYear = Self.date.getFullYear();
				iMonth = Self.date.getMonth();
				iDate = +el.text();
				starts = new Date(iYear, iMonth, iDate, 0, 0);
				ends = new Date(starts);
				ends.setDate(ends.getDate() + 1);

				// legend text
				moment = new defiant.Moment(starts);
				str = moment.format("MMMM D, YYYY");
				if (now.getFullYear() === iYear &&
					now.getMonth() === iMonth &&
					now.getDate() === iDate) str = "<i>Today</i> "+ str;
				Self.els.dayEntries.find("legend span:first").html(str);

				// render events
				Events.dispatch({
					type: "populate-sidebar-entries",
					el: Self.els.dayEntries.find(".list-wrapper"),
					starts: starts.valueOf(),
					ends: ends.valueOf(),
				});
				break;
			case "select-sidebar-entry":
				target = $(event.target);
				el = Self.els.content;
				if (!target.data("id")) return;
				// popup event details
				APP.popup.dispatch({ type: "popup-event-details", target, el });
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
			case "render-calendar-list":
				match = "//Calendars";
				target = Self.els.calendars.find(".list-wrapper");
				// render calendar list
				window.render({ template: "calendar-list", match, target });
				break;
			case "render-calendar":
				htm = Render.month({ date: Self.date, weekNumbers: 1, mini: 1 });
				htm.unshift(`<div class="mini-cal-wrapper ${event.className || ""}">`);
				htm.push(`</div>`);
				el = Self.els.reelWrapper.append(htm.join(""));

				// populate month entries
				iYear = Self.date.getFullYear();
				iMonth = Self.date.getMonth();
				starts = new Date(iYear, iMonth, 1, 0, 0);
				ends = new Date(starts);
				ends.setMonth(ends.getMonth() + 1);
				Events.dispatch({
					type: "populate-mini-cal",
					starts: starts.valueOf(),
					ends: ends.valueOf(),
					el,
				});
				break;
		}
	}
}
