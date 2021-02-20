
const Events = {
	init() {
		// fast references
		this.els = {
			year: window.find(".view-year"),
			month: window.find(".view-month"),
			week: window.find(".view-week"),
			day: window.find(".view-day"),
		};
	},
	dispatch(event) {
		let Self = Events,
			Nodes = event.xNodes,
			hHeight = 44,
			htm = {
				"15": [],
				"16": [],
				"17": [],
				"18": [],
				"19": [],
				"20": [],
				"21": [],
			},
			el;
		// console.log(opt);
		switch (event.type) {
			case "populate-week":
				Nodes.map(node => {
					let starts = +node.getAttribute("starts"),
						ends = +node.getAttribute("ends"),
						dateStart = new Date(starts),
						dateEnds = new Date(ends),
						color = node.getAttribute("calId"),
						title = node.getAttribute("title"),
						hours = dateStart.getHours().toString().padStart(2, "0"),
						minutes = dateStart.getMinutes().toString().padStart(2, "0"),
						timeStarts = hours +":"+ minutes,
						top = dateStart.getHours() * hHeight,
						height = ((ends - starts) / 3600000) * hHeight;

					htm["16"].push(`<div class="event ${color}" style="top: ${top}px; height: ${height}px;">`);
					htm["16"].push(`<span class="event-time">${timeStarts}</span>`);
					htm["16"].push(`<span class="event-title">${title}</span>`);
					htm["16"].push(`</div>`);
				});

				el = Self.els.week;
				Object.keys(htm).map(key => {
					let str = htm[key].join("");
					el.find(`.col-day[data-date="${key}"]`).html(str);
				});
				break;
		}
	}
};
