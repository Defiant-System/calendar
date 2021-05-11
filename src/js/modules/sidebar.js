
// calendar.sidebar

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
		this.selectedDate = new Date();

		// auto render sídebar contents
		this.dispatch({ type: "render-calendar-list" });
		this.dispatch({ type: "render-calendar" });

		// temp
		// setTimeout(() => window.find(".toolbar-tool_").get(0).trigger("click"), 300);
		// setTimeout(() => window.find(".cal-edit").get(2).trigger("click"), 900);
		// setTimeout(() => window.find(".add-calendar span").trigger("click"), 900);
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
			value,
			el;
		// console.log(event);
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
					APP.popup.dispatch({ type: "close-popup-bubble" });
				} else {
					window.width += width;
					Self.els.sidebar.cssSequence("show", "transitionend", el =>
						// update now line
						Events.dispatch({ type: "update-now-line" }));

					// select "today"
					Self.els.reelWrapper.find("b.today").trigger("click");
				}
				
				return !isOn;
			case "toggle-sidebar-block":
				str = event.el.attr("toggle-text");
				isOn = event.el.attr("toggle-on") === "1";

				event.el.attr("toggle-on", isOn ? "0" : "1");
				event.el.attr("toggle-text", event.el.html());
				event.el.html(str);
				event.el.parents(".wrapper").toggleClass("collapsed", isOn);
				break;
			case "toggle-calendar":
				el = event.el.parents("li");
				
				let events = Self.els.content.find(`.event[data-calId="${el.data("id")}"]`);
				events.toggleClass("hidden", events.hasClass("hidden"));

				// re-pack column events
				Self.els.content.find(`.col-day`).map(column => Packer.pack(column));
				break;
			case "edit-calendar-entry":
				// close popup-bubble, if any
				APP.popup.dispatch({ type: "close-popup-bubble" });

				target = event.el.parent();
				// popup event details
				APP.popup.dispatch({ type: "popup-sidebar-calendar-details", target });
				break;
			case "select-minical-day":
				el = $(event.target);
				if (!el.hasClass("day") || el.hasClass("non-day")) return;
				// close event popup, if showing
				APP.popup.dispatch({ type: "close-popup-bubble" });
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

				// remembers selected date
				Self.selectedDate = starts;

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

				value = Self.selectedDate.valueOf();
				if (starts.valueOf() < value && ends.valueOf() > value) {
					value = Self.selectedDate.getDate();
					el.find(".day:not(.non-day) i").map(day => {
						if (+day.innerText === value) {
							$(day.parentNode).addClass("selected");
						}
					});
				}
				break;
			case "sidebar-add-calendar": {
				// close event popup, if showing
				APP.popup.dispatch({ type: "close-popup-bubble" });

				let id = Events.createCalendarId(),
					color = Events.getAvailableColor(),
					name = defiant.i18n("New Calendar"),
					xCalendar = $.nodeFromString(`<i isNew="true" id="${id}" color="${color}" name="${name}"/>`);
				
				// add node to app data
				xCalendar = APP.data.selectSingleNode(`.//Calendars`).appendChild(xCalendar);

				let match = `//Calendars/*[@id="${id}"]`,
					newCalendar = window.render({ template: "sidebar-calendar-entry", match });
				// append new item to sidebar
				newCalendar = event.el.before(newCalendar);
				// trigger popup for edit
				newCalendar.find(".cal-edit").trigger("click");

				// requestAnimationFrame(() => {
				// 	let target = window.find(".popup-bubble h3")[0];
				// 	document.getSelection().selectAllChildren(target);
				// });
				break; }
			case "sidebar-delete-calendar": {
				let id = event.origin.data("id"),
					xPath = `.//Calendars/*[@id="${id}"]`,
					xCalendar = APP.data.selectSingleNode(xPath),
					color = xCalendar.getAttribute("color");
				
				// remove node from app data
				xCalendar.parentNode.removeChild(xCalendar);

				Self.els.content.find(`.day.${color}`).removeClass(color);

				// remove any rendered events from DOM
				Self.els.content.find(`.event[data-calId="${id}"], .entry[data-calId="${id}"]`).remove();

				// re-pack column events
				Self.els.content.find(`.col-day`).map(column => Packer.pack(column));

				// remove all calendar entries connected to calendar
				APP.xEvents.selectNodes(`.//event[@calendar-id = "${id}"]`).map(node =>
					node.parentNode.removeChild(node));

				// remove from sidebar list
				event.origin.remove();
				// close event popup, if showing
				APP.popup.dispatch({ type: "close-popup-bubble" });
				break; }
			case "sidebar-email-calendar":
				console.log("TODO:", event);
				break;
		}
	}
}
