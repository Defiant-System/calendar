
const Render = {
	init() {
		this.i18n = {
			months: ["January", "Febuary", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
			days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
			firstWeekDay: 1, // 6
			hours: "24h", // "am/pm",
		};
	},
	day() {
		
	},
	week() {
		
	},
	month(opt) {
		let I18n = this.i18n,
			now = new Date,
			date = opt.date || now,
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
			htm.push(`<b${className}>${name.slice(0,3)}</b>`);
		});
		htm.push(`</div>`);

		// days
		htm.push(`<div class="days">`);
		[...Array(42)].map((a, index) => {
			let mDate = new Date(iYear, iMonth, index - iDay + 2),
				imDate = mDate.getDate(),
				className = [];

			if ([0,6].includes(mDate.getDay())) className.push("weekend");
			if (mDate.getMonth() !== iMonth) className.push("non-day");
			if (mDate.getFullYear() === now.getFullYear() &&
				mDate.getMonth() === now.getMonth() &&
				mDate.getDate() === now.getDate()) className.push("today");

			className = (className.length) ? ` class="${className.join(" ")}"` : ``;
			htm.push(`<b${className}><i>${imDate}</i></b>`);
		});
		htm.push(`</div>`);

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

		[...Array(12)].map((a, index) => {
			let mDate = new Date(iYear, iMonth + index),
				mHtm = this.month({ date: mDate });
			// remove title
			mHtm.shift();
			// add to rendered html
			htm = htm.concat(mHtm);
		});

		opt.el.html(htm.join(""));
	}
};
