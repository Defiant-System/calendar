
const Events = {
	init() {
		// fast references
		this.els = {
			doc: $(document),
			main: window.find(".main"),
			year: window.find(".view-year"),
			month: window.find(".view-month"),
			week: window.find(".view-week"),
			day: window.find(".view-day"),
		};

		// bind event handlers
		this.els.week.on("mousedown", this.dispatch);
	},
	dispatch(event) {
		let APP = calendar,
			Self = Events,
			Drag = Self.drag,
			Nodes = event.xNodes,
			hHeight = 44,
			pipe = {},
			xHolidays,
			xPath,
			now,
			cols,
			top, left, width, height, pos,
			clone,
			pEl,
			el;
		// console.log(opt);
		switch (event.type) {
			// native events
			case "mousedown":
				// prevent default behaviour
				event.preventDefault();
				// origin of event
				el = $(event.target);
				pEl = el.parent();

				if (!el.hasClass("event")) {
					// TODO: append new ghost event
					return;
				}

				top = el.prop("offsetTop");
				left = pEl.prop("offsetLeft") + 1;
				width = el.width();
				height = el.height();

				// clone event element
				clone = event.target.cloneNode(true);
				clone = el.parents(".days-wrapper").append(clone);
				clone.addClass("clone").css({ top, left, width, height });

				// collect info about columns
				cols = pEl.parent().find(".col-day").map(el =>
					({ left: el.offsetLeft, width: el.offsetWidth - 1 }));

				// prepare drag object
				Self.drag = {
					clickX: event.clientX,
					clickY: event.clientY,
					org: { top, left, width, height },
					snapY: 11,
					cols,
					clone,
					timeEl: el.find(".event-time"),
				};

				if (el.hasClass("event")) {
					Self.drag.orgEl = el.addClass("ghost");
				}

				// bind event handlers
				Self.els.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				top = event.clientY - Drag.clickY + Drag.org.top;
				top -= top % Drag.snapY;

				pos = event.clientX - Drag.clickX + Drag.org.left;
				pos = Drag.cols.reduce((prev, curr) =>
					Math.abs(curr.left - pos) < Math.abs(prev.left - pos) ? curr : prev);
				left = pos.left;
				width = pos.width;

				if (Drag.clone) {
					Drag.clone.css({ top, left, width });
				}
				break;
			case "mouseup":
				// reset original event element
				Drag.orgEl.removeClass("ghost");
				// clean up DOM
				Drag.clone.remove();
				// unbind event handlers
				Self.els.doc.off("mousemove mouseup", Self.dispatch);
				break;
			// custom events
			case "parse-holidays":
				// iterate holidays nodes
				Nodes.map(node => {
					let str = node.getAttribute("date") +" 01:00",
						date = new Date(str);
					node.setAttribute("starts", date.valueOf());
					node.setAttribute("calId", "gray");
				});
				break;
			case "populate-legend-holidays":
				// iterate holiday nodes
				xPath = `//Holidays/event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.data.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						date = new Date(+node.getAttribute("starts")),
						wDate = date.getDate(),
						title = node.getAttribute("title"),
						color = node.getAttribute("calId"),
						htm = `<div data-id="${id}"class="event ${color}">${title}</div>`;
					
					event.el.find(`.day-legends b[data-date="${wDate}"]`).append(htm);
				});
				break;
			case "append-now-line":
				now = Date.now();
				if (now > View.rangeStart && now < View.rangeEnd) {
					Self.els.main.find(".days-wrapper").append(`<div class="now-line"></div>`);
					Self.dispatch({ type: "update-now-line" });
				}
				break;
			case "update-now-line":
				el = Self.els.main.find(".days-wrapper .now-line");
				
				// prevents multiple timers
				clearTimeout(Self.lineTimer);
				// stop if there is no now-line in DOM
				if (!el.length) return;

				now = new Date();
				let nowDate = now.getDate(),
					nowHours = now.getHours(),
					nowMinutes = now.getMinutes(),
					nowSeconds = now.getSeconds(),
					time = Self.formatTime(nowHours, nowMinutes),
					nowTop = (nowHours * hHeight) + (nowMinutes / 60 * hHeight),
					dayLeft = el.parent().find(`.col-day[data-date="${nowDate}"]`).offset().left,
					style = `--time-top: ${nowTop}px; --day-left: ${dayLeft}px;`;
				// update now line
				el.data({ time }).attr({ style });
				// update every minute
				Self.lineTimer = setTimeout(() =>
					Self.dispatch({ type: "update-now-line" }), (60 - nowSeconds) * 1000);
				break;
			case "populate-year":
				// root DOM element
				el = Self.els.year;
				// iterate holiday nodes
				xPath = `//Holidays/event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.data.selectNodes(xPath).map(node => {
					let date = new Date(+node.getAttribute("starts")),
						iMonth = date.getFullYear() +"-"+ date.getMonth(),
						iDate = date.getDate(),
						title = node.getAttribute("title");
					// add class to day element
					el.find(`.month[data-date="${iMonth}"] b:not(.non-day) i:contains("${iDate}")`)
						.map(el => {
							if (+el.innerHTML === +iDate) {
								$(el.parentNode).addClass(`has-event holiday`).attr({ title });
							}
						});
				});
				// iterate event nodes
				xPath = `//Events/event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.data.selectNodes(xPath).map(node => {
					let starts = +node.getAttribute("starts"),
						date = new Date(starts),
						dMonth = date.getFullYear() +"-"+ date.getMonth(),
						dDate = date.getDate(),
						color = node.getAttribute("calId");
					// add class to day element
					el.find(`.month[data-date="${dMonth}"] b:not(.non-day) i:contains("${dDate}")`)
						.map(el => +el.innerHTML === +dDate ? $(el.parentNode).addClass(`has-event ${color}`) : null);
				});
				break;
			case "populate-month":
				// root DOM element
				el = Self.els.month;
				// assemble elements info
				el.find(`.days b:not(.non-day)`).map(day => {
					let el = $(day);
					pipe[el.find("i").html()] = { el, htm: [] };
				});
				// iterate holiday nodes
				xPath = `//Holidays/event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.data.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						date = new Date(+node.getAttribute("starts")),
						iDate = date.getDate(),
						title = node.getAttribute("title"),
						color = node.getAttribute("calId");
					pipe[iDate].htm.push(`<div data-id="${id}" class="entry ${color}">${title}</div>`);
				});
				// iterate event nodes
				xPath = `//Events/event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.data.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						starts = +node.getAttribute("starts"),
						date = new Date(starts),
						dayDate = date.getDate(),
						color = node.getAttribute("calId"),
						title = node.getAttribute("title");

					pipe[dayDate].htm.push(`<div data-id="${id}" class="entry ${color}">${title}</div>`);
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
				// root DOM element
				el = Self.els.week;
				// populate holidays in legend row
				Self.dispatch({ ...event, type: "populate-legend-holidays", el });
				// assemble elements info
				el.find(`.col-day`).map(col => {
					let el = $(col);
					pipe[el.data("date")] = { el, htm: [] };
				});
				// iterate event nodes
				xPath = `//Events/event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.data.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						starts = +node.getAttribute("starts"),
						ends = +node.getAttribute("ends"),
						dateStart = new Date(starts),
						dateEnd = new Date(ends),
						dayDate = dateStart.getDate(),
						color = node.getAttribute("calId"),
						title = node.getAttribute("title"),
						startHours = dateStart.getHours(),
						startMinutes = dateStart.getMinutes(),
						endHours = dateEnd.getHours(),
						endMinutes = dateEnd.getMinutes(),
						timeStarts = Self.formatTime(startHours, startMinutes),
						timeEnds = Self.formatTime(endHours, endMinutes),
						top = (startHours * hHeight) + (startMinutes / 60 * hHeight),
						height = ((ends - starts) / 3600000) * hHeight;

					pipe[dayDate].htm.push(`<div data-id="${id}" class="event ${color}" style="top: ${top}px; height: ${height}px;">`);
					pipe[dayDate].htm.push(`<span class="event-time">${timeStarts}</span>`); // —${timeEnds}
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

				// now time line
				Self.dispatch({ type: "append-now-line" });
				break;
			case "populate-day":
				// root DOM element
				el = Self.els.day;
				// populate holidays in legend row
				Self.dispatch({ ...event, type: "populate-legend-holidays", el });
				// single pipe element
				pipe = { htm: [] };
				// iterate event nodes
				xPath = `//Events/event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.data.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						starts = +node.getAttribute("starts"),
						ends = +node.getAttribute("ends"),
						dateStart = new Date(starts),
						dateEnd = new Date(ends),
						color = node.getAttribute("calId"),
						title = node.getAttribute("title"),
						startHours = dateStart.getHours(),
						startMinutes = dateStart.getMinutes(),
						endHours = dateEnd.getHours(),
						endMinutes = dateEnd.getMinutes(),
						timeStarts = Self.formatTime(startHours, startMinutes),
						timeEnds = Self.formatTime(endHours, endMinutes),
						top = (dateStart.getHours() * hHeight) + (dateStart.getMinutes() / 60 * hHeight),
						height = ((ends - starts) / 3600000) * hHeight;

					pipe.htm.push(`<div data-id="${id}" class="event ${color}" style="top: ${top}px; height: ${height}px;">`);
					pipe.htm.push(`<span class="event-time">${timeStarts}</span>`); // —${timeEnds}
					pipe.htm.push(`<span class="event-title">${title}</span>`);
					pipe.htm.push(`</div>`);
				});
				// expose rendered event html to DOM
				el.find(".col-day").html(pipe.htm.join(""));

				// now time line
				Self.dispatch({ type: "append-now-line" });

				console.log("render sidebar");
				break;
		}
	},
	formatTime(hours, minutes) {
		switch (Render.i18n.hours) {
			case "24h":
				hours = hours.toString().padStart(2, "0");
				minutes = minutes.toString().padStart(2, "0");
				return `${hours}:${minutes}`;
			case "am/pm":
				let suffix = hours < 12 ? "AM" : "PM";
				hours = hours % 12 || 12;
				minutes = minutes.toString().padStart(2, "0");
				return `${hours}:${minutes} ${suffix}`;
		}
	}
};
