
const View = {
	init() {
		// fast references
		this.els = {
			content: window.find("content"),
			daysWrapper: window.find(".days-wrapper"),
			year: window.find(".view-year"),
			month: window.find(".view-month"),
			week: window.find(".view-week"),
			day: window.find(".view-day"),
		};

		// defaults
		this.active = "year";
		this.date = new Date();
		// this.date = new Date(2020, 11, 29);
		// this.date = new Date(2021, 0, 10);

		// this.go("now");
	},
	switch(type, noGo) {
		this.els.content.prop({ "className": "show-"+ type });
		this.active = type;
		if (!noGo) this.go();
	},
	go(to) {
		let date = this.date,
			type = this.active,
			methods = {
				year:  { g: "getFullYear", s: "setFullYear" },
				month: { g: "getMonth",    s: "setMonth" },
				week:  { g: "getWeek",     s: "setWeek" },
				day:   { g: "getDate",     s: "setDate" },
			},
			method = methods[type];
		
		switch (to) {
			case "now":
				this.date = date = new Date();
				break;
			case "-1":
				date[method.s](date[method.g]() - 1);
				break;
			case "1":
				date[method.s](date[method.g]() + 1);
				break;
			default:
				if (to) date = to;
		}

		Render[type]({ date, el: this.els[this.active] });
	}
};
