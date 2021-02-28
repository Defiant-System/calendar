
const Render = {
	init() {
		this.i18n = defiant.Moment.i18n;
	},
	hours(opt, htm) {
		let I18n = this.i18n,
			list = [],
			minutes;

		switch (opt.hourTicks) {
			case 2: minutes = ["00", "30"]; break;
			case 4: minutes = ["00", "15", "30", "45"]; break;
			default: minutes = ["00"];
		}

		[...Array(24)].map((a, hours) => {
			minutes.map(minute => {
				let time;
				switch (I18n.hours) {
					case "24h":
						time = hours.toString().padStart(2, "0") +":"+ minute;
						break;
					case "am/pm":
						time = (hours % 12 || 12) +":"+ minute + ((hours < 12) ? " AM" : " PM");
						break;
				}
				list.push(time);
			});
		});

		if (opt.type === "values") return list;
		else {
			htm.push(`<div class="col-hours">`);
			list.map((time, index) => {
				let className = [];
				if (index > 6 && index < 18) className.push("work-hours");
				className = (className.length) ? ` class="${className.join(" ")}"` : ``;
				if (index > 0) htm.push(`<b${className}>${time}</b>`);
			});
			htm.push(`</div>`);
		}
	},
	day(opt) {
		let I18n = this.i18n,
			now = new Date,
			date = opt.date || now,
			iYear = date.getFullYear(),
			iMonth = date.getMonth(),
			iDate = date.getDate(),
			iDay = date.getDay() - 1,
			mDate = `${iYear}-${(iMonth+1).toString().padStart(2, "0")}`,
			htm = [];
		
		// sunday check
		if (iDay < 0) iDay = 6;

		// title: day
		htm.push(`<h2><i>${I18n.days[iDay]}</i> <b>${I18n.months[iMonth]} ${iDate}</b> ${iYear}</h2>`);
		htm.push(`<div class="day-layout">`);
			
			// day view
			htm.push(`<div class="day">`);
			// legend
			htm.push(`<div class="day-legends">`);
			htm.push(`<u class="col-hours"></u>`);
			htm.push(`<b data-date="${iDate}"></b>`);
			htm.push(`</div>`);
			// day wrapper
			htm.push(`<div class="day-content"><div class="days-wrapper" data-date="${mDate}">`);
			// hours column
			this.hours({ type: "html" }, htm);
			// day column
			htm.push(`<div class="col-day" data-date="${iDate}"></div></div></div>`);
			htm.push(`</div>`);
		
			// upcoming events
			htm.push(`<div class="upcoming"></div>`);

		// closing tag
		htm.push(`</div>`);

		opt.el.html(htm.join(""))
			.find(".days-wrapper").scrollTop(320);
	},
	week(opt) {
		let I18n = this.i18n,
			now = new Date,
			days = [...I18n.days],
			nowYear = now.getFullYear(),
			nowMonth = now.getMonth(),
			nowDate = now.getDate(),
			date = opt.date || now,
			dDay = date.getDay(),
			htm = [],
			toStart = 1;
		
		switch (I18n.weekStartsWith) {
			case 5:
				toStart = days.splice(5, 2);
				days = toStart.concat(days);
				toStart = -2;
				break;
			case 6:
				toStart = days.splice(6, 1);
				days = toStart.concat(days);
				toStart = -1;
				break;
		}

		// sunday check
		if (dDay === 0) dDay = 7;

		// reset date to first of the week
		date.setDate(date.getDate() - dDay + toStart);

		let dateIndex = date.getDate(),
			iYear = date.getFullYear(),
			iMonth = date.getMonth(),
			iDay = now.getDay(),
			mDate = `${iYear}-${(iMonth+1).toString().padStart(2, "0")}`;
		
		// title: week
		htm.push(`<h2><b>${I18n.months[iMonth]}</b> ${iYear}</h2>`);
		htm.push(`<div class="week">`);

			// row: weekdays
			htm.push(`<div class="weekdays">`);
			htm.push(`<u class="col-hours"></u>`);
			days.map((name, index) => {
				let wDate = new Date(iYear, iMonth, dateIndex + index + ((toStart < 0) ? 1 : 0)),
					iwDate = wDate.getDate(),
					className = [];

				if (toStart === 1 && index >= 5) className.push("weekend");
				if (toStart === -1 && (index >= 6 || index === 0)) className.push("weekend");
				if (toStart === -2 && index <= 1) className.push("weekend");
				if (wDate.getFullYear() === nowYear &&
					wDate.getMonth() === nowMonth &&
					wDate.getDate() === nowDate) className.push("today");
				
				className = (className.length) ? ` class="${className.join(" ")}"` : ``;
				htm.push(`<b${className}><i>${name.slice(0, 3)}</i><i>${iwDate}</i></b>`);
			});
			htm.push(`</div>`);

			// row: legends
			htm.push(`<div class="day-legends">`);
			htm.push(`<u class="col-hours"></u>`);
			days.map((name, index) => {
				let wDate = new Date(iYear, iMonth, dateIndex + index + ((toStart < 0) ? 1 : 0)),
					iwDate = wDate.getDate(),
					className = [];

				if (toStart === 1 && index >= 5) className.push("weekend");
				if (toStart === -1 && (index >= 6 || index === 0)) className.push("weekend");
				if (toStart === -2 && index <= 1) className.push("weekend");

				className = (className.length) ? ` class="${className.join(" ")}"` : ``;
				htm.push(`<b${className} data-date="${iwDate}"></b>`);
			});
			htm.push(`</div>`);

			// row: days
			htm.push(`<div class="days"><div class="days-wrapper" data-date="${mDate}">`);
				// hours column
				this.hours({ type: "html" }, htm);

				// weekdays
				days.map((name, index) => {
					let wDate = new Date(iYear, iMonth, dateIndex + index + ((toStart < 0) ? 1 : 0)),
						iwDate = wDate.getDate(),
						className = ["col-day"];
					if (toStart === 1 && index >= 5) className.push("col-weekend");
					if (toStart === -1 && (index >= 6 || index === 0)) className.push("col-weekend");
					if (toStart === -2 && index <= 1) className.push("col-weekend");

					htm.push(`<div class="${className.join(" ")}" data-date="${iwDate}"></div>`);
				});
			htm.push(`</div></div>`);

		// closing tag
		htm.push(`</div>`);

		opt.el.html(htm.join(""))
			.find(".days-wrapper").scrollTop(320);
	},
	month(opt) {
		let date = new defiant.Moment(opt.date),
			meta = date.render(opt),
			htm = [];
		// console.log( meta );

		// title: month
		htm.push(`<h2><b>${meta.i18nMonth}</b> ${meta.i18nYear}</h2>`);
		htm.push(`<div class="month" data-date="${meta.yearMonth}">`);
		
		// month name
		htm.push(`<h3>${meta.i18nMonth}</h3>`);

		// loop weekdays
		htm.push(`<div class="weekdays">`);
		if (opt.weekNumbers) {
			htm.push(`<b class="week-nr"></b>`);
		}
		meta.weekdays.map(day => {
			let className = day.type ? ` class="${day.type.join(" ")}"` : "";
			htm.push(`<b${className}>${day.name}</b>`);
		});
		htm.push(`</div>`);

		// loop days
		htm.push(`<div class="days">`);
		meta.days.map(day => {
			if (opt.weekNumbers && day.week) {
				return htm.push(`<b class="week-nr">${day.week}</b>`);
			}
			if (day.date) {
				let className = day.type ? ` class="${day.type.join(" ")}"` : "";
				htm.push(`<b${className}><i>${day.date}</i>`);
				if (!opt.mini) htm.push(`<div class="entries-wrapper"></div>`);
				htm.push(`</b>`);
			}
		});
		htm.push(`</div>`);

		// closing tag
		htm.push(`</div>`);

		if (opt.el) opt.el.html(htm.join(""));
		else return htm;
	},
	year(opt) {
		let now = new Date,
			date = opt.date || now,
			htm = [];
		
		// title: year
		htm.unshift(`<h2>${date.getFullYear()}</h2>`);

		// reset date to first month of the year
		date.setMonth(0);

		let iYear = date.getFullYear(),
			iMonth = date.getMonth();

		// iterate 12 months
		[...Array(12)].map((a, index) => {
			let mDate = new Date(iYear, iMonth + index),
				mHtm = this.month({ date: mDate, weekdayNameLength: 1 });
			// remove title
			mHtm.shift();
			// add to rendered html
			htm = htm.concat(mHtm);
		});

		opt.el.html(htm.join(""));

		// reset date to today
		date.setMonth(now.getMonth());
	}
};
