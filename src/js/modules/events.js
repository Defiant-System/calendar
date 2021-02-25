
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
			xEvent,
			xHolidays,
			xPath,
			now, hours, minutes, seconds, time,
			top, left, width, height, pos, type,
			pEl, cols, clone,
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

				// pos & dim
				top = el.prop("offsetTop") + 1;
				left = pEl.prop("offsetLeft") + 1;
				width = el.width();
				height = el.height();

				// type of operation
				type = "move";
				if (event.offsetY < 5) type = "n-resize";
				if (event.offsetY > height - 5) type = "s-resize";

				// clone event element
				clone = event.target.cloneNode(true);
				clone = el.parents(".days-wrapper").append(clone);
				clone.addClass("clone").css({ top, left, width, height });

				// collect info about columns
				cols = pEl.parent().find(".col-day").map(el =>
					({ left: el.offsetLeft + 1, width: el.offsetWidth - 2 }));

				// prepare drag object
				Self.drag = {
					timeEl: clone.find(".event-time"),
					clickX: event.clientX,
					clickY: event.clientY,
					org: { el, top, left, width, height },
					snapY: 11,
					cols,
					clone,
					type,
				};

				if (el.hasClass("event")) {
					el.addClass("ghost");
				}

				// bind event handlers
				Self.els.doc.on("mousemove mouseup", Self.dispatch);
				break;
			case "mousemove":
				// type of operation
				switch (Drag.type) {
					case "n-resize":
						top = event.clientY - Drag.clickY + Drag.org.top;
						top -= top % Drag.snapY;
						left = Drag.org.left;
						width = Drag.org.width;
						height = Drag.org.height + (Drag.org.top - top);
						break;
					case "s-resize":
						top = Drag.org.top;
						left = Drag.org.left;
						width = Drag.org.width;
						height = event.clientY - Drag.clickY + Drag.org.height;
						height -= height % Drag.snapY;
						break;
					case "move":
						pos = event.clientX - Drag.clickX + Drag.org.left;
						pos = Drag.cols.reduce((prev, curr) => Math.abs(curr.left - pos) < Math.abs(prev.left - pos) ? curr : prev);
						top = event.clientY - Drag.clickY + Drag.org.top;
						top -= top % Drag.snapY;
						left = pos.left;
						width = pos.width;
						height = Drag.org.height;
						break;
				}
				// time update
				hours = Math.floor(top / hHeight);
				minutes = ((top % hHeight) / hHeight) * 60;
				time = Self.formatTime(hours, minutes);
				Drag.timeEl.html(time);
				// UI update
				Drag.clone.css({ top, left, width, height });
				break;
			case "mouseup":
				// event node
				xPath = `//Events/event[@id= "${Drag.org.el.data("id")}"]`;
				xEvent = APP.data.selectSingleNode(xPath);

				// update original event
				top = Drag.clone.css("top");
				left = Drag.clone.css("left");
				width = Drag.clone.css("width");
				height = Drag.clone.css("height");
				Drag.org.el.css({ top, width, height });

				// update original event-time
				time = Drag.clone.find(".event-time").html();
				Drag.org.el.find(".event-time").html(time);

				// reset original event element
				Drag.org.el.removeClass("ghost");
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
				hours = now.getHours();
				minutes = now.getMinutes();
				seconds = now.getSeconds();
				time = Self.formatTime(hours, minutes);

				let nowDate = now.getDate(),
					nowTop = (hours * hHeight) + (minutes / 60 * hHeight),
					dayLeft = el.parent().find(`.col-day[data-date="${nowDate}"]`).offset().left,
					style = `--time-top: ${nowTop}px; --day-left: ${dayLeft}px;`;
				// update now line
				el.data({ time }).attr({ style });
				// update every minute
				Self.lineTimer = setTimeout(() =>
					Self.dispatch({ type: "update-now-line" }), (60 - seconds) * 1000);
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
						top = (startHours * hHeight) + (startMinutes / 60 * hHeight),
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
