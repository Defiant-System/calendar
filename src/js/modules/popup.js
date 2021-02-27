
// calendar.areas.popup

{
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
		};
	},
	dispatch(event) {
		let APP = calendar,
			Self = APP.popup,
			xPath,
			xEvent,
			append,
			match,
			rect,
			top,
			left,
			popup,
			pos,
			id,
			list,
			eventEl,
			pEl,
			el;
		switch (event.type) {
			// native events
			case "scroll":
				Self.dispatch({ type: "popup-update-event" });
				break;
			// custom events
			case "popup-time-change":
				console.log(event);
				break;
			case "popup-no-update-event":
			case "popup-update-event":
				el = Self.els.content.find(".popup-event");

				// event node
				id = el.data("id");
				xPath = `./event[@id = "${id}"]`;
				xEvent = APP.xEvents.selectSingleNode(xPath);
				// DOM element
				eventEl = Self.els.content.find(`.entry[data-id="${id}"], .event[data-id="${id}"]`);
				eventEl.removeClass("isNew");

				if (event.type === "popup-no-update-event") {
					if (xEvent.getAttribute("isNew")) {
						// remove event node
						xEvent.parentNode.removeChild(xEvent);
						// remove event HTML element
						eventEl.remove();
					}
				} else {
					let title = el.find("h3").text();
					// update event node
					xEvent.setAttribute("title", title);
					// update DOM element
					if (eventEl.hasClass("entry")) eventEl.html(title);
					else eventEl.find(".event-title").html(title);
				}

				// remove popup element from DOM
				el.remove();
				// unbind possible event handler
				Self.els.wrapper.off("scroll", Self.dispatch);
				break;
			case "popup-event-details":
				// conditional check
				if (!event.target.hasClass("event")) return;

				if (event.el.find(".popup-event").length) {
					return Self.dispatch({ type: "popup-update-event" });
				}

				// DOM element to append popup
				Self.els.root = append = event.el;
				Self.els.wrapper = append.find(".days-wrapper");

				// remove potential existing popup
				append.find(".popup-event").remove();
				// xpath matching event node
				match = `//event[@id="${event.target.data("id")}"]`;
				// render event details
				popup = window.render({ template: "popup-event", match, append });

				// position popup
				pos = Self.getPosition(event.target[0], append[0]);
				pos.top -= 43;
				// position popup
				popup.css(pos);
				// focus on first "input" field
				popup.find("h3").focus();

				// add range array to time-starts + time-ends
				list = Render.hours({ type: "values", hourTicks: 4 });
				popup.find(".event-starts").addClass("drag-vRange_").data({ list: list.join(",") });
				popup.find(".event-ends").addClass("drag-vRange_").data({ list: list.join(",") });

				// bind event handler
				Self.els.wrapper.on("scroll", Self.dispatch);
				break;
			case "popup-month-entry-details":
				// origin element
				el = $(event.target);

				// if popup exists, remove and return
				if (!el.parents(".popup-event").length && event.el.find(".popup-event").length) {
					return Self.dispatch({ type: "popup-update-event" });
				}

				// conditions
				if (!el.hasClass("entry") && el.parent().hasClass("days")) {
					return Events.dispatch({ type: "create-event-month-view", el });
				}
				if (!el.parent().hasClass("entries-wrapper")) return;

				// DOM element to append popup
				append = event.el;
				// inactivate old active item
				append.find(".entry.active").removeClass("active");
				// remove potential existing popup
				append.find(".popup-event").remove();
				// conditional check
				if (!event.target.hasClass("entry")) return;
				// make item "active"
				event.target.addClass("active");
				
				// xpath matching event node
				match = `//event[@id="${event.target.data("id")}"]`;
				// render event details
				popup = window.render({ template: "popup-event", match, append });

				// position popup
				pos = Self.getPosition(event.target[0], append[0]);
				pos.top -= 43;
				pos.left -= 2;
				// position popup
				popup.css(pos);
				// focus on first "input" field
				popup.find("h3").focus();

				// add range array to time-starts + time-ends
				list = Render.hours({ type: "values", hourTicks: 4 });
				popup.find(".event-starts").addClass("drag-vRange_").data({ list: list.join(",") });
				popup.find(".event-ends").addClass("drag-vRange_").data({ list: list.join(",") });
				break;
		}
	},
	getPosition(el, rEl) {
		let pEl = el,
			pos = {
				top: el.offsetHeight / 2,
				left: el.offsetWidth + 15,
			};
		while (pEl !== rEl) {
			pos.top += (pEl.offsetTop - pEl.parentNode.scrollTop);
			pos.left += (pEl.offsetLeft - pEl.parentNode.scrollLeft);
			pEl = pEl.offsetParent;
		}
		return pos;
	}
}
