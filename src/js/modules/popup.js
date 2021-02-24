
// calendar.areas.popup

{
	init() {
		// fast references
		this.els = {};
	},
	dispatch(event) {
		let APP = calendar,
			Self = APP.popup,
			append,
			match,
			rect,
			top,
			left,
			popup,
			pos,
			pEl,
			el;
		switch (event.type) {
			// native events
			case "scroll":
				Self.els.root.find(".popup-event").remove();
				// bind event handler
				Self.els.wrapper.unbind("scroll", Self.dispatch);
				break;
			// custom events
			case "popup-event-details":
				// conditional check
				if (!event.target.hasClass("event")) return;

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
				// add suffix
				for (let key in pos) pos[key] += "px";
				popup.css(pos);

				// bind event handler
				Self.els.wrapper.bind("scroll", Self.dispatch);
				break;
			case "popup-month-entry-details":
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
				// add suffix
				for (let key in pos) pos[key] += "px";
				popup.css(pos);
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
