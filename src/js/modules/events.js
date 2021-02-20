
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
			pipe = {},
			el;
		// console.log(opt);
		switch (event.type) {
			case "populate-year":
				// iterate event nodes
				Nodes.map(node => {
					let starts = +node.getAttribute("starts"),
						dateStart = new Date(starts),
						dMonth = dateStart.getFullYear() +"-"+ dateStart.getMonth(),
						dDate = dateStart.getDate(),
						color = node.getAttribute("calId");
					// add class to day element
					Self.els.year.find(`.month[data-date="${dMonth}"] b:not(.non-day) i:contains("${dDate}")`)
						.map(el => +el.innerHTML === +dDate ? $(el.parentNode).addClass(`has-event ${color}`) : null);
				});
				break;
			case "populate-month":
				// assemble elements info
				Self.els.month.find(`.days b:not(.non-day)`).map(day => {
					let el = $(day);
					pipe[el.find("i").html()] = { el, htm: [] };
				});

				// iterate event nodes
				Nodes.map(node => {
					let starts = +node.getAttribute("starts"),
						dateStart = new Date(starts),
						dayDate = dateStart.getDate(),
						color = node.getAttribute("calId"),
						title = node.getAttribute("title");

					pipe[dayDate].htm.push(`<div class="entry ${color}">${title}</div>`);
				});

				// expose rendered event html to DOM
				Object.keys(pipe).map(key => {
					let htm = pipe[key].htm.join("");
					if (htm) {
						htm = `<div class="entries-wrapper">${htm}</div>`;
						pipe[key].el.append(htm);
					}
				});
				break;
			case "populate-week":
				// assemble elements info
				Self.els.week.find(`.col-day`).map(col => {
					let el = $(col);
					pipe[el.data("date")] = { el, htm: [] };
				});

				// iterate event nodes
				Nodes.map(node => {
					let starts = +node.getAttribute("starts"),
						ends = +node.getAttribute("ends"),
						dateStart = new Date(starts),
						dateEnds = new Date(ends),
						dayDate = dateStart.getDate(),
						color = node.getAttribute("calId"),
						title = node.getAttribute("title"),
						hours = dateStart.getHours().toString().padStart(2, "0"),
						minutes = dateStart.getMinutes().toString().padStart(2, "0"),
						timeStarts = hours +":"+ minutes,
						top = dateStart.getHours() * hHeight,
						height = ((ends - starts) / 3600000) * hHeight;

					pipe[dayDate].htm.push(`<div class="event ${color}" style="top: ${top}px; height: ${height}px;">`);
					pipe[dayDate].htm.push(`<span class="event-time">${timeStarts}</span>`);
					pipe[dayDate].htm.push(`<span class="event-title">${title}</span>`);
					pipe[dayDate].htm.push(`</div>`);
				});

				// expose rendered event html to DOM
				Object.keys(pipe).map(key => {
					let htm = pipe[key].htm.join("");
					if (htm) {
						pipe[key].el.html(htm);
					}
				});
				break;
			case "populate-day":
				console.log(123);
				break;
		}
	}
};
