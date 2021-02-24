
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
			wrapper,
			append,
			match,
			rect,
			top,
			left,
			popup,
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
				// DOM element to append popup
				Self.els.root = append = event.el;
				Self.els.wrapper = wrapper = append.find(".days-wrapper");

				// remove potential existing popup
				append.find(".popup-event").remove();
				// xpath matching event node
				match = `//event[@id="${event.target.data("id")}"]`;
				// render event details
				popup = window.render({ template: "popup-event", match, append });

				// position popup
				// pEl = event.target.parent();
				// top = (event.target.prop("offsetTop") - wrapper.prop("scrollTop")) +"px";
				// left = (pEl.prop("offsetLeft") + pEl.prop("offsetWidth") + 11) +"px";
				let pos = Self.getPosition(event.target, append);
				popup.css(pos);

				// bind event handler
				Self.els.wrapper.bind("scroll", Self.dispatch);
				break;
		}
	},
	getPosition(el, pEl) {
		let top = 300,
			left = 300,
			pos = { top, left };


		// add suffix
		for (let key in pos) pos[key] += "px";

		return pos;
	}
}
