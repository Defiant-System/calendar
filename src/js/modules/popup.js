
// calendar.popup

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
			xNode,
			dateStart,
			dateEnd,
			append,
			match,
			rect,
			top,
			left,
			popup,
			pos,
			calId,
			id,
			type,
			name,
			list,
			eventEl,
			eventType,
			pEl,
			el;
		// console.log(event);
		switch (event.type) {
			// native events
			case "scroll":
				Self.dispatch({ type: "popup-update-origin" });
				break;
			// custom events
			case "email-event":
			case "delete-event":
			case "change-calendar-color":
				Events.dispatch({ ...event, origin: Self.origin });
				// close popup-bubble
				Self.dispatch({ type: "close-popup-bubble" });
				break;
			case "popup-time-change":
				// console.log(event);
				break;
			case "close-popup-bubble":
				el = Self.els.content.find(".popup-bubble");
				if (!el.length) return;

				// reset origin element
				Self.origin.removeClass("active");
				// remove popup element from DOM
				el.remove();

				// unbind possible event handler
				if (Self.els.wrapper) {
					Self.els.wrapper.off("scroll", Self.dispatch);
					Self.els.wrapper = false;
				}
				break;
			case "popup-no-update-origin":
			case "popup-update-origin":
				el = Self.els.content.find(".popup-bubble");
				if (!el.length) return;

				// proxy to right switch-case
				type = event.type.slice(0, event.type.indexOf("-origin")) +"-"+ el.data("type");
				// if (el.hasClass("is-new")) type = `popup-no-update-${el.data("type")}`;
				Self.dispatch({ origin: Self.origin, type, el });

				// remove popup element from DOM
				el.remove();

				// unbind possible event handler
				if (Self.els.wrapper) {
					Self.els.wrapper.off("scroll", Self.dispatch);
					Self.els.wrapper = false;
				}
				break;
			case "popup-no-update-calendar":
			case "popup-update-calendar":
				el = event.el;
				// calendar node
				id = event.origin.data("id");
				xPath = `//Calendars/i[@id = "${id}"]`;
				xNode = APP.data.selectSingleNode(xPath);

				if (event.type === "popup-no-update-calendar") {
					if (xNode.getAttribute("isNew")) {
						// remove event node
						xNode.parentNode.removeChild(xNode);
						// remove event HTML element
						event.origin.remove();
					}
				} else {
					// reset sidebar calendar element
					event.origin.removeClass("active");
					name = el.find("h3");
					name = name.text() || name.attr("placeholder");
					// update calendar name
					event.origin.find("label").html(name);
					// update xml node
					xNode.setAttribute("name", name);
				}
				break;
			case "popup-no-update-event":
			case "popup-update-event":
				el = event.el;
				// event node
				id = el.data("id");
				xPath = `.//event[@id = "${id}"]`;
				xNode = APP.xEvents.selectSingleNode(xPath);
				// DOM element
				eventEl = Self.els.content.find(`.entry[data-id="${id}"], .event[data-id="${id}"]`);
				eventEl.removeClass("isNew");

				if (event.type === "popup-no-update-event") {
					if (xNode.getAttribute("isNew")) {
						// remove event node
						xNode.parentNode.removeChild(xNode);
						// remove event HTML element
						eventEl.remove();
					}
				} else {
					name = el.find("h3");
					name = name.text() || name.attr("placeholder");
					// update event node
					xNode.setAttribute("title", name);
					xNode.removeAttribute("isNew");
					// set calendar Id
					calId = eventEl.data("calId");
					xNode.setAttribute("calendar-id", calId);
					// update DOM element
					if (eventEl.hasClass("entry") && eventEl.prop("nodeName") !== "LI") eventEl.html(name);
					else eventEl.find(".event-title, .entry-title").html(name);
				}
				break;
			case "popup-sidebar-calendar-details":
				// check if a popup already is shown
				if (Self.els.content.find(".popup-calendar").length) {
					return Self.dispatch({ type: "popup-update-calendar" });
				}

				id = event.target.data("id");
				// ui update on edit calendar element
				event.target.addClass("active");
				// xpath matching event node
				match = `//Events/Calendars/*[@id="${id}"]`;
				// DOM element to append popup
				Self.els.root = append = Self.els.content;
				Self.els.wrapper = append.find(".days-wrapper");
				// render calendar details
				popup = window.render({ template: "popup-calendar-details", match, append });

				// exclude colors
				let exclude = Events.getAvailableColor(true);
				popup.find("i.calendar-color").map(el => {
					let color = el.getAttribute("data-color");
					$(el).toggleClass("hidden", exclude.includes(color));
				});

				// position popup
				pos = Self.getPosition(event.target[0], append[0]);
				pos.top -= 46;
				// position popup
				popup.css(pos);
				// focus on first "input" field
				popup.find("h3").focus();
				// remember origin for next action
				Self.origin = event.target;

				// bind event handler
				Self.els.wrapper.on("scroll", Self.dispatch);
				break;
			case "sidebar-email-calendar":
			case "sidebar-delete-calendar":
				if (event.el.hasClass("disabled")) return;
				APP.sidebar.dispatch({ ...event, origin: Self.origin });
				// forget reference to origin
				Self.origin = false;
				break;
			case "popup-event-details":
				// conditional check
				if (!event.target.hasClass("event")) return;
				// close current bubble, if any
				Self.dispatch({ type: "popup-update-origin" });

				// event node
				id = event.target.data("id");
				xPath = `.//event[@id = "${id}"]`;
				xNode = APP.xEvents.selectSingleNode(xPath);

				// exit if node is not found
				if (!xNode) return;

				// DOM element to append popup
				Self.els.root = append = event.el;
				Self.els.wrapper = append.find(".days-wrapper");
				// remember origin for next action
				Self.origin = event.target;

				// update node attributes
				Events.updateNodeI18n(xNode);

				// xpath matching event node
				match = `//event[@id="${id}"]`;
				// render event details
				popup = window.render({ template: "popup-event", match, append });

				// position popup
				pos = Self.getPosition(event.target[0], append[0]);
				pos.top -= 43;
				// position popup
				popup.css(pos);

				if (eventType !== "day") {
					// focus on first "input" field
					popup.find("h3").focus();
					// add range array to time-starts + time-ends
					list = Render.hours({ type: "values", hourTicks: 4 });
					popup.find(".event-starts").addClass("drag-vRange_").data({ list: list.join(",") });
					popup.find(".event-ends").addClass("drag-vRange_").data({ list: list.join(",") });
				}

				// bind event handler
				Self.els.wrapper.on("scroll", Self.dispatch);
				break;
			case "popup-month-entry-details":
				// origin element
				el = $(event.target);

				// if popup exists, remove and return
				if (!el.parents(".popup-bubble").length && event.el.find(".popup-bubble").length) {
					return Self.dispatch({ type: "popup-update-origin" });
				}

				// conditions
				if (!el.hasClass("entry") && el.parent().hasClass("days")) {
					return Events.dispatch({ type: "create-event-month-view", el });
				}
				if (!el.parent().hasClass("entries-wrapper")) return;

				// remember origin for next action
				Self.origin = event.target;

				// event node
				id = event.target.data("id");
				xPath = `.//event[@id = "${id}"]`;
				xNode = APP.xEvents.selectSingleNode(xPath);

				// update node attributes
				Events.updateNodeI18n(xNode);
				// DOM element to append popup
				append = event.el;
				// inactivate old active item
				append.find(".entry.active").removeClass("active");
				// conditional check
				if (!event.target.hasClass("entry")) return;
				// make item "active"
				event.target.addClass("active");
				
				// xpath matching event node
				match = `//event[@id="${id}"]`;
				// render event details
				popup = window.render({ template: "popup-event", match, append });

				// position popup
				pos = Self.getPosition(event.target[0], append[0]);
				pos.top -= 43;
				pos.left -= 2;
				// position popup
				popup.css(pos);

				if (eventType !== "day") {
					// focus on first "input" field
					popup.find("h3").focus();
					// add range array to time-starts + time-ends
					list = Render.hours({ type: "values", hourTicks: 4 });
					popup.find(".event-starts").addClass("drag-vRange_").data({ list: list.join(",") });
					popup.find(".event-ends").addClass("drag-vRange_").data({ list: list.join(",") });
				}
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
