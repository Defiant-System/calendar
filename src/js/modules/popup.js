
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
			htm,
			el;
		switch (event.type) {
			case "popup-event-details":
				window.render({
					template: "popup-event",
					// match: `//*`,
					append: event.el.parents(".days-wrapper"),
				});
				break;
		}
	}
}
