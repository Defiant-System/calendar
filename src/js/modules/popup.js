
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
			append,
			match,
			rect,
			top,
			left,
			popup,
			pEl,
			el;
		switch (event.type) {
			case "popup-event-details":
				// DOM element to append popup
				append = event.el.parents(".days");
				// remove potential existing popup
				append.find(".popup-event").remove();
				// xpath matching event node
				match = `//event[@id="${event.el.data("id")}"]`;
				// render event details
				popup = window.render({ template: "popup-event", match, append });

				pEl = event.el.parent();
				top = (event.el.prop("offsetTop") - append.find(".days-wrapper").prop("scrollTop")) +"px";
				left = (pEl.prop("offsetLeft") + pEl.prop("offsetWidth") + 11) +"px";
				popup.css({ top, left });
				break;
		}
	}
}
