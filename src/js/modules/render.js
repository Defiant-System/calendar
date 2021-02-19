
const Render = {
	init() {
		this.i18n = {
			months: ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			firstWeekDay: 1, // 6
			hours: "24h", // "am/pm",
		};
	},
	hours(htm) {
		htm.push(`<div class="col-hours">`);
		[...Array(23)].map((a, index) => {
			let className = [],
				hour = (index + 1).toString().padStart("0", 1)
			// office hours
			if (index > 6 && index < 18) className.push("work-hours");

			className = (className.length) ? ` class="${className.join(" ")}"` : ``;
			htm.push(`<b${className}>${hour}:00</b>`);
		});
		htm.push(`</div>`);
	},
	day(opt) {
		// return;
		let I18n = this.i18n,
			now = new Date,
			date = opt.date || now,
			iYear = date.getFullYear(),
			iMonth = date.getMonth(),
			iDate = date.getDate(),
			iDay = date.getDay() - 1,
			htm = [];
		
		// sunday check
		if (iDay < 0) iDay = 6;

		// title: day
		htm.push(`<h2><i>${I18n.days[iDay]}</i> <b>${I18n.months[iMonth]} ${iDate}</b> ${iYear}</h2>`);
		htm.push(`<div class="day">`);
			
			// legend
			htm.push(`<div class="day-legends">`);
			htm.push(`<u class="col-hours"></u>`);
			htm.push(`<b></b>`);
			htm.push(`</div>`);
			// day wrapper
			htm.push(`<div class="day"><div class="days-wrapper">`);
			// hours column
			this.hours(htm);
			// day column
			htm.push(`<div class="col-day"></div>`);
			htm.push(`</div></div>`);
		
		// closing tag
		htm.push(`</div>`);

		opt.el.html(htm.join(""))
			.find(".days-wrapper").scrollTop(320);
	},
	week(opt) {
		// return;
		let I18n = this.i18n,
			now = new Date,
			nowYear = now.getFullYear(),
			nowMonth = now.getMonth(),
			nowDate = now.getDate(),
			date = opt.date || now,
			htm = [];

		// reset date to first of the week
		date.setWeek(date.getWeek());

		let dateIndex = date.getDate(),
			iYear = date.getFullYear(),
			iMonth = date.getMonth(),
			iDay = now.getDay();
		
		// title: week
		htm.push(`<h2><b>${I18n.months[iMonth]}</b> ${iYear}</h2>`);
		htm.push(`<div class="week">`);

			// row: weekdays
			htm.push(`<div class="weekdays">`);
			htm.push(`<u class="col-hours"></u>`);
			I18n.days.map((name, index) => {
				let wDate = new Date(iYear, iMonth, dateIndex + index),
					iwDate = wDate.getDate(),
					className = [];

				if (index >= 5) className.push("weekend");
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
			I18n.days.map((name, index) => {
				let className = [],
					dayIndex = dateIndex + index;

				if (index >= 5) className.push("weekend");

				className = (className.length) ? ` class="${className.join(" ")}"` : ``;
				htm.push(`<b${className}></b>`);
			});
			htm.push(`</div>`);

			// row: days
			htm.push(`<div class="days"><div class="days-wrapper">`);
				// hours column
				this.hours(htm);

				// weekdays
				I18n.days.map((name, index) => {
					let className = ["col-day"];
					if (index >= 5) className.push("col-weekend");

					htm.push(`<div class="${className.join(" ")}"></div>`);
				});
			htm.push(`</div></div>`);

		// closing tag
		htm.push(`</div>`);

		opt.el.html(htm.join(""))
			.find(".days-wrapper").scrollTop(320);
	},
	month(opt) {
		let I18n = this.i18n,
			now = new Date,
			nowYear = now.getFullYear(),
			nowMonth = now.getMonth(),
			nowDate = now.getDate(),
			date = opt.date || now,
			weekDays = opt.weekDays || 3,
			htm = [];
		
		// reset date to first of the month
		date.setDate(1);

		let iYear = date.getFullYear(),
			iMonth = date.getMonth(),
			iDay = date.getDay();

		// title: month
		htm.push(`<h2><b>${I18n.months[iMonth]}</b> ${iYear}</h2>`);
		htm.push(`<div class="month">`);
		
		// month name
		htm.push(`<h3>${I18n.months[iMonth]}</h3>`);

		// weekdays
		htm.push(`<div class="weekdays">`);
		I18n.days.map((name, index) => {
			let className = index >= 5 ? ` class="weekend"` : ``;
			htm.push(`<b${className}>${name.slice(0, weekDays)}</b>`);
		});
		htm.push(`</div>`);

		// iterate 42 days
		htm.push(`<div class="days">`);
		[...Array(42)].map((a, index) => {
			let mDate = new Date(iYear, iMonth, index - iDay + 2),
				imDate = mDate.getDate(),
				className = [];

			if ([0,6].includes(mDate.getDay())) className.push("weekend");
			if (mDate.getMonth() !== iMonth) className.push("non-day");
			if (mDate.getFullYear() === nowYear &&
				mDate.getMonth() === nowMonth &&
				mDate.getDate() === nowDate) className.push("today");

			className = (className.length) ? ` class="${className.join(" ")}"` : ``;
			htm.push(`<b${className}><i>${imDate}</i></b>`);
		});
		htm.push(`</div>`);

		// closing tag
		htm.push(`</div>`);
		
		if (opt.el) {
			opt.el.html(htm.join(""));
		} else {
			return htm;
		}
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
				mHtm = this.month({ date: mDate, weekDays: 1 });
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
