
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
			el;
		switch (event.type) {
			case "popup-event-details":
				// DOM element to append popup
				append = event.el.parents(".days-wrapper");
				// remove potential existing popup
				append.find(".popup-event").remove();
				// render event details
				window.render({
					template: "popup-event",
					match: `//event[@id="${event.el.data("id")}"]`,
					append,
				});
				break;
		}
	}
}
