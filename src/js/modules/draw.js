
const Draw = {
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
			str = [];
		// title: month
		str.push(`<h2><b>${I18n.months[date.getMonth()]}</b> ${date.getFullYear()}</h2>`);
		str.push(`<div class="month">`);
		
		// weekdays
		str.push(`<div class="weekdays">`);
		I18n.days.map((name, index) => {
			let className = index >= 5 ? `class="weekend"` : ``;
			str.push(`<b ${className}>${name.slice(0,3)}</b>`);
		});
		str.push(`</div>`);

		// days
		[...Array(42)].map((a, index) => {
			console.log(index);
		});

		str.push(`</div>`);

		opt.el.html(str.join(""));
	},
	year() {
		
	}
};
