
const Events = {
	init() {
		// fast references
		this.els = {
			doc: $(document),
			content: window.find("content"),
			main: window.find(".main"),
			year: window.find(".view-year"),
			month: window.find(".view-month"),
			week: window.find(".view-week"),
			day: window.find(".view-day"),
		};

		// bind event handlers
		window.find(".view-week, .view-day").on("mousedown", this.dispatch);
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
			xNode,
			cal,
			now, hours, minutes, seconds, time,
			top, left, width, height, pos, type,
			pEl, cols, clone, htm, id,
			el;
		// console.log(opt);
		switch (event.type) {
			// native events
			case "mousedown":
				// defaults
				el = $(event.target);
				pEl = el.parent();
				type = "move";

				// if popup exists, remove and return
				let exists = el.parents("[data-area]").find(".popup-bubble");
				if (exists.length) return pEl.trigger("scroll");
				
				// conditional checks
				if (!el.hasClass("col-day")
						&& (!el.hasClass("event") || el.parents(".popup-bubble").length)
						|| el.parents(".day-legends").length
						|| event.button === 2) {
					return;
				}

				// prevent default behaviour
				event.preventDefault();

				if (el.hasClass("col-day")) {
					// time
					hours = Math.floor(event.offsetY / hHeight);
					minutes = event.offsetY - (hours * hHeight);
					minutes = minutes - (minutes % (hHeight / 2));

					// pos & dim
					top = (hours * hHeight) + minutes;
					left = 0;
					width = el.width() - 2;
					height = hHeight / 2;

					// get color of first available calendar
					cal = Self.getCalendar();

					// render new event HTML
					htm = Self.renderEvent({
						id: Self.createEventId(),
						isNew: true,
						type: "week",
						title: "New Event",
						timeStarts: Self.formatTime(hours, (minutes / hHeight) * 60),
						calId: cal.id,
						color: cal.color,
						height,
						top,
					});

					// prepare for resize
					pEl = el;
					el = clone = pEl.append(htm);
					type = "s-resize";

				} else {
					// pos & dim
					top = el.prop("offsetTop") + 1;
					left = pEl.prop("offsetLeft") + el.prop("offsetLeft") + 1;
					width = el.width();
					height = el.height();
					
					// type of operation
					if (event.offsetY < 5) type = "n-resize";
					if (event.offsetY > height - 5) type = "s-resize";

					// clone event element
					clone = event.target.cloneNode(true);
					clone = el.parents(".days-wrapper").append(clone);
					clone.addClass("clone").css({ top, left, width, height });
				}

				// collect info about columns
				cols = pEl.parent().find(".col-day").map(el =>
					({ el, left: el.offsetLeft + 1, width: el.offsetWidth - 2 }));

				// prepare drag object
				Self.drag = {
					timeEl: clone.find(".event-time"),
					clickX: event.clientX,
					clickY: event.clientY,
					org: { el, top, left, width, height },
					snapY: hHeight / 4,
					cols,
					clone,
					type,
				};

				// TODO: fix this
				if (!el.hasClass("isNew")) {
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
						if (!event.shiftKey) top -= top % Drag.snapY;
						left = Drag.org.left;
						width = Drag.org.width;
						height = Drag.org.height + (Drag.org.top - top);
						break;
					case "s-resize":
						top = Drag.org.top;
						left = Drag.org.left;
						width = Drag.org.width;
						height = event.clientY - Drag.clickY + Drag.org.height;
						if (!event.shiftKey) height -= height % Drag.snapY;
						break;
					case "move":
						pos = event.clientX - Drag.clickX + Drag.org.left;
						pos = Drag.cols.reduce((prev, curr) => Math.abs(curr.left - pos) < Math.abs(prev.left - pos) ? curr : prev);
						top = event.clientY - Drag.clickY + Drag.org.top;
						if (!event.shiftKey) top -= top % Drag.snapY;
						left = pos.left;
						width = pos.width;
						height = Drag.org.height;
						break;
				}
				// time update
				hours = Math.floor(top / hHeight);
				minutes = Math.round(((top % hHeight) / hHeight) * 60);
				time = Self.formatTime(hours, minutes);
				Drag.timeEl.html(time);
				// UI update
				Drag.clone.css({ top, left, width, height });
				break;
			case "mouseup":
				// fast reference to original element
				el = Drag.org.el;

				// unbind event handlers
				Self.els.doc.off("mousemove mouseup", Self.dispatch);

				// update original event-time
				time = Drag.clone.find(".event-time").html();
				el.find(".event-time").html(time);

				// update original event
				top = Drag.clone.prop("offsetTop") + 1;
				left = Drag.clone.prop("offsetLeft");
				width = Drag.clone.prop("offsetWidth");
				height = Drag.clone.prop("offsetHeight");
				el.css({ top, width, height });

				// reset original event element
				el.removeClass("ghost");

				// change DOM parent if needed
				if (left !== Drag.org.left) {
					let col = Drag.cols.find(col => col.left === left);
					col.el.appendChild(el[0]);
				}

				if (top === Drag.org.top && left === Drag.org.left && height === Drag.org.height) {
					// no change - pop up event details
					el.trigger("click");
				}

				id = el.data("id");
				let sDate = el.parents(".days-wrapper").data("date"),
					sDay = el.parent().data("date").padStart(2, "0"),
					sTime = el.find(".event-time").html(),
					starts = `${sDate}-${sDay} ${sTime}`,
					topHeight = top + height,
					eHours = Math.floor(topHeight / hHeight).toString().padStart(2, "0"),
					eMinutes = Math.round(((topHeight % hHeight) / hHeight) * 60).toString().padStart(2, "0"),
					ends = `${sDate}-${sDay} ${eHours}:${eMinutes}`,
					startsDate = new Date(starts),
					endsDate = new Date(ends),
					calId = el.data("calId"),
					title = el.find(".event-title").html();

				// clean up DOM
				if (Drag.clone.hasClass("isNew")) {
					id = Self.createEventId();
					// create new event node
					htm = `<event isNew="true" id="${id}" starts="${startsDate.valueOf()}" ends="${endsDate.valueOf()}" calendar-id="${calId}" title="${title}"/>`;
					xNode = APP.xEvents.appendChild($.nodeFromString(htm));
					// update node attributes
					Self.updateNodeI18n(xNode);

					// update event element with ID
					el.data({ id }).trigger("click");

				} else {
					// event node
					xPath = `.//event[@id= "${id}"]`;
					xNode = APP.xEvents.selectSingleNode(xPath);
					// update node
					xNode.setAttribute("starts", startsDate.valueOf());
					xNode.setAttribute("ends", endsDate.valueOf());
					// update node attributes
					Self.updateNodeI18n(xNode);

					// remove clone from DOM
					Drag.clone.remove();
				}

				// pack column events
				Drag.cols.map(item => Packer.pack(item.el));
				break;
			// custom events
			case "before-contextmenu:event": {
				let calId = event.el.data("calId"),
					xCalendar = APP.data.selectSingleNode(`//Calendars/i[@id="${calId}"]`),
					paletteColors = {};
				// populate palette colors
				APP.data.selectNodes(`//Palette/i`).map(node =>
					paletteColors[node.getAttribute("id")] = node.getAttribute("hex"));

				// get app color state
				let activeColor = paletteColors[xCalendar.getAttribute("color")],
					availableColors = APP.data.selectNodes(`//Calendars/i`)
						.map(node => paletteColors[node.getAttribute("color")]);
				// iterate menu options
				APP.data.selectNodes(`//Menu[@for="event"]/Menu[@type="colors"]/Color`)
					.map(xColor => {
						let value = xColor.getAttribute("arg");

						// toggle "active"
						if (value === activeColor) xColor.setAttribute("active", "1");
						else xColor.removeAttribute("active");

						// toggle visibility
						if (availableColors.includes(value)) xColor.removeAttribute("type");
						else xColor.setAttribute("type", "hidden");
					});
				} break;
			case "email-event":
			case "event-info":
				console.log(event);
				break;
			case "change-calendar-color":
				el = event.origin;

				let oldColor = el.data("color"),
					newColor = event.target.data("color");

				// xml node
				xPath = `//Calendars/i[@id= "${el.data("id")}"]`;
				xNode = APP.data.selectSingleNode(xPath);
				xNode.setAttribute("color", newColor);

				// change color of origin element
				el.data({ color: newColor });
				el.find(".form-checkbox_").removeClass(oldColor).addClass(newColor);

				// update all event in DOM view
				Self.els.main.find(`.event.${oldColor}, .entry.${oldColor}`)
					.removeClass(oldColor).addClass(newColor);
				break;
			case "delete-event":
				el = event.origin;
				id = el.data("id");
				// xml node
				xPath = `.//event[@id="${id}"]`;
				xNode = APP.xEvents.selectSingleNode(xPath);
				// remove event node
				xNode.parentNode.removeChild(xNode);
				// remember parent element
				pEl = el.parents(".col-day");
				// remove element from DOM
				Self.els.content.find(`.event[data-id="${id}"], .entry[data-id="${id}"]`).remove();

				// pack column events
				pEl.map(column => Packer.pack(column));
				break;
			case "change-event-color":
				// xml node
				xPath = `.//event[@id= "${event.id}"]`;
				xNode = APP.xEvents.selectSingleNode(xPath);

				// get calendar details
				cal = Self.getCalendar(event.calId);
				// update XML node
				xNode.setAttribute("calendar-id", cal.id);
				// update DOM element
				event.el
					.prop({ className: `event ${cal.color}` })
					.data({ calId: cal.id });
				break;
			case "create-event-month-view":
				pipe = {
					type: "month",
					id: Self.createEventId(),
					color: "purple",
					title: "New Event",
					starts: new Date("2021-02-16 12:00"), // TODO
					ends: new Date("2021-02-16 13:00"),
				};
				htm = Self.renderEvent(pipe);
				el = event.el.find(".entries-wrapper").prepend(htm);

				// create new event node
				htm = `<event isNew="true" id="${pipe.id}" starts="${pipe.starts.valueOf()}" ends="${pipe.ends.valueOf()}" calendar-id="${pipe.color}" title="${pipe.title}"/>`;
				xNode = APP.xEvents.appendChild($.nodeFromString(htm));
				// auto trigger click event
				el.trigger("click");
				break;
			case "parse-holidays":
				// iterate holidays nodes
				Nodes.map(node => {
					let str = node.getAttribute("date") +" 01:00",
						date = new Date(str);
					node.setAttribute("starts", date.valueOf());
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
						calId = node.getAttribute("calendar-id"),
						color = node.parentNode.getAttribute("color") || Self.getCalendar(calId).color,
						htm = `<div data-id="${id}" data-calId="${calId}" class="event ${color}">${title}</div>`;
					
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
					dayLeft = el.parent().find(`.col-day[data-date="${nowDate}"]`).offset().left;
				// update now line
				el.data({ time }).css({
					"--time-top": `${nowTop}px`,
					"--day-left": `${dayLeft}px`,
				});
				// update every minute
				Self.lineTimer = setTimeout(() =>
					Self.dispatch({ type: "update-now-line" }), (60 - seconds) * 1000);
				break;
			case "populate-year":
			case "populate-mini-cal":
				// root DOM element
				el = event.el || Self.els.year;
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
				xPath = `.//event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.xEvents.selectNodes(xPath).map(node => {
					let starts = +node.getAttribute("starts"),
						date = new Date(starts),
						dMonth = date.getFullYear() +"-"+ date.getMonth(),
						dDate = date.getDate(),
						calId = node.getAttribute("calendar-id"),
						color = node.parentNode.getAttribute("color") || Self.getCalendar(calId).color;
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
						calId = node.getAttribute("calendar-id"),
						color = node.parentNode.getAttribute("color") || Self.getCalendar(calId).color,
						htm = Self.renderEvent({ type: "month", id, calId, color, title });
					// add event html to pipe
					pipe[iDate].htm.push(htm);
				});
				// iterate event nodes
				xPath = `.//event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.xEvents.selectNodes(xPath).map(node => {
					// skip holidays - its already done
					if (node.parentNode.nodeName === "Holidays") return;

					let id = node.getAttribute("id"),
						starts = +node.getAttribute("starts"),
						date = new Date(starts),
						dayDate = date.getDate(),
						calId = node.getAttribute("calendar-id"),
						color = node.parentNode.getAttribute("color") || Self.getCalendar(calId).color,
						title = node.getAttribute("title"),
						htm = Self.renderEvent({ type: "month", id, calId, color, title });
					// add event html to pipe
					pipe[dayDate].htm.push(htm);
				});
				// expose rendered event html to DOM
				Object.keys(pipe).map(key => {
					let htm = pipe[key].htm.join("");
					if (htm) {
						pipe[key].el.find(".entries-wrapper").append(htm);
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
				xPath = `.//event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.xEvents.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						starts = +node.getAttribute("starts"),
						ends = +node.getAttribute("ends"),
						dateStart = new Date(starts),
						dateEnd = new Date(ends),
						dayDate = dateStart.getDate(),
						calId = node.getAttribute("calendar-id"),
						color = node.parentNode.getAttribute("color") || Self.getCalendar(calId).color,
						title = node.getAttribute("title"),
						startHours = dateStart.getHours(),
						startMinutes = dateStart.getMinutes(),
						endHours = dateEnd.getHours(),
						endMinutes = dateEnd.getMinutes(),
						timeStarts = Self.formatTime(startHours, startMinutes),
						timeEnds = Self.formatTime(endHours, endMinutes),
						top = (startHours * hHeight) + (startMinutes / 60 * hHeight),
						height = ((ends - starts) / 3600000) * hHeight,
						htm = Self.renderEvent({ type: "week", id, calId, color, top, height, timeStarts, title });
					// add event html to pipe, if not all-day event
					if (ends) pipe[dayDate].htm.push(htm);
				});

				// expose rendered event html to DOM
				Object.keys(pipe).map(key => {
					let htm = pipe[key].htm.join("");
					if (htm) pipe[key].el.html(htm);
				});

				// pack column events
				el.find(`.col-day`).map(column => Packer.pack(column));

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
				xPath = `.//event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.xEvents.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						starts = +node.getAttribute("starts"),
						ends = +node.getAttribute("ends"),
						dateStart = new Date(starts),
						dateEnd = new Date(ends),
						calId = node.getAttribute("calendar-id"),
						color = node.parentNode.getAttribute("color") || Self.getCalendar(calId).color,
						title = node.getAttribute("title"),
						startHours = dateStart.getHours(),
						startMinutes = dateStart.getMinutes(),
						endHours = dateEnd.getHours(),
						endMinutes = dateEnd.getMinutes(),
						timeStarts = Self.formatTime(startHours, startMinutes),
						timeEnds = Self.formatTime(endHours, endMinutes),
						top = (startHours * hHeight) + (startMinutes / 60 * hHeight),
						height = ((ends - starts) / 3600000) * hHeight,
						htm = Self.renderEvent({ type: "day", id, calId, color, top, height, timeStarts, title });
					// add event html to pipe, if not all-day event
					if (ends) pipe.htm.push(htm);
				});
				// expose rendered event html to DOM
				el.find(".col-day").html(pipe.htm.join(""));

				// pack column events
				el.find(`.col-day`).map(column => Packer.pack(column));

				// now time line
				Self.dispatch({ type: "append-now-line" });

				console.log("render sidebar");
				break;
			case "populate-sidebar-entries":
				// reset pipe to array
				pipe = [];
				// iterate event nodes
				xPath = `.//event[@starts >= "${event.starts}" and @starts < "${event.ends}"]`;
				APP.xEvents.selectNodes(xPath).map(node => {
					let id = node.getAttribute("id"),
						calId = node.getAttribute("calendar-id"),
						color = node.parentNode.getAttribute("color") || Self.getCalendar(calId).color,
						title = node.getAttribute("title"),
						starts = +node.getAttribute("starts"),
						ends = +node.getAttribute("ends"),
						dateStart = new Date(starts),
						dateEnd = new Date(ends),
						startHours = dateStart.getHours(),
						startMinutes = dateStart.getMinutes(),
						endHours = dateEnd.getHours(),
						endMinutes = dateEnd.getMinutes(),
						startsTime = Self.formatTime(startHours, startMinutes),
						endsTime = Self.formatTime(endHours, endMinutes),
						allDay = !!ends === false,
						htm = Self.renderEvent({ type: "sidebar-entry", id, calId, color, title, startsTime, endsTime, allDay });
					// add event html to pipe
					pipe.push(htm);
				});
				// expose rendered event html to DOM
				event.el.html(`<ul>${pipe.join("")}</ul>`);
				break;
		}
	},
	updateNodeI18n(node) {
		// update event node with i18n values
		let starts = +node.getAttribute("starts"),
			ends = +node.getAttribute("ends"),
			dateStart = new karaqu.Moment(starts),
			dateEnd = new karaqu.Moment(ends);

		node.setAttribute("iso-starts", dateStart.format("YYYY-MM-DD HH:mm"));
		node.setAttribute("iso-ends", dateEnd.format("YYYY-MM-DD HH:mm"));
		node.setAttribute("i18n-date", dateStart.format("D MMM YYYY"));
		node.setAttribute("i18n-starts", dateStart.format("HH:mm"));
		node.setAttribute("i18n-ends", dateEnd.format("HH:mm"));
	},
	renderEvent(opt) {
		let isNew = opt.isNew ? "isNew" : "",
			time,
			htm;
		switch (opt.type) {
			case "sidebar-entry":
				time = opt.allDay ? `all-day` : `${opt.startsTime} - ${opt.endsTime}`;
				htm = `<li data-id="${opt.id}" data-calId="${opt.calId}" class="event entry ${opt.color} ${opt.allDay ? "cal-date": ""}">
							<span class="entry-title">${opt.title}</span>
							<span class="entry-time">${time}</span>
						</li>`;
				break;
			case "month":
				htm = `<div data-id="${opt.id}" data-calId="${opt.calId}" class="entry ${opt.color} ${isNew}">${opt.title}</div>`;
				break;
			case "week":
			case "day":
				htm = `<div data-context="event" data-id="${opt.id}" data-calId="${opt.calId}" class="event ${opt.color} ${isNew}" style="top: ${opt.top}px; height: ${opt.height}px;">
						<span class="event-time">${opt.timeStarts}</span>
						<span class="event-title">${opt.title}</span>
					</div>`;
				break;
		}
		return htm.replace(/\t|\n/g, "");
	},
	formatTime(hours, minutes) {
		switch (Render.i18n.hours) {
			case "24h":
				hours = hours.toString().padStart(2, "0");
				minutes = minutes.toString().padStart(2, "0");
				return `${hours}:${minutes}`;
			case "am/pm":
				let suffix = hours < 12 ? "AM" : "PM";
				hours = hours % 12 || 12;
				minutes = minutes.toString().padStart(2, "0");
				return `${hours}:${minutes} ${suffix}`;
		}
	},
	getCalendar(id) {
		let query = id ? `[@id="${id}"]` : "",
			xCalendar = calendar.data.selectSingleNode(`//Calendars/*${query}`),
			name = xCalendar.getAttribute("name"),
			color = xCalendar.getAttribute("color");
		if (!id) id = xCalendar.getAttribute("id");
		return { id, color, name };
	},
	createCalendarId() {
		let ids = calendar.data.selectNodes("//Calendars/i").map(node => +node.getAttribute("id"));
		return Math.max(...ids) + 1;
	},
	getAvailableColor(all) {
		let used = calendar.data.selectNodes("//Calendars/i").map(node => `[@id!='${node.getAttribute("color")}']`),
			available = calendar.data.selectNodes(`//Palette/i${used.join("")}`).map(node => node.getAttribute("id"));
		if (all) {
			return available || ["blue"];
		}
		return available.length ? available[0] : "blue";
	},
	createEventId() {
		let ids = calendar.xEvents.selectNodes(".//event").map(node => +node.getAttribute("id")),
			idMax = Math.max(...ids);
		return idMax ? idMax + 1 : 1;
	}
};
