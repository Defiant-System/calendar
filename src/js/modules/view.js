
const View = {
	init() {
		// fast references
		this.els = {
			toolbar: window.find(".win-caption-toolbar_"),
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

		// update toolbar
		this.els.toolbar.find(`.toolbar-tool_[data-click="switch-view"]`).removeClass("tool-active_");
		this.els.toolbar.find(`.toolbar-tool_[data-arg="${type}"]`).addClass("tool-active_");

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
			method = methods[type],
			tDate,
			tYear,
			tMonth,
			tWeek,
			tDay;
		
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

		// calculation helpers
		tYear = date.getFullYear();
		tMonth = date.getMonth();
		tWeek = date.getWeek();
		tDay = date.getDate();

		switch (type) {
			case "year":
				// calculate range start
				tDate = new Date(tYear, 0);
				this.rangeStart = tDate.valueOf();
				// calculate range end
				tDate.setFullYear(tYear + 1);
				this.rangeEnd = tDate.valueOf();
				break;
			case "month":
				// calculate range start
				tDate = new Date(tYear, tMonth);
				this.rangeStart = tDate.valueOf();
				// calculate range end
				tDate.setMonth(tMonth + 1);
				this.rangeEnd = tDate.valueOf();
				break;
			case "week":
				// calculate range start
				tDate = new Date(tYear, tMonth, tDay);
				tDate.setWeek(tWeek);
				this.rangeStart = tDate.valueOf();
				// calculate range end
				tDate.setWeek(tWeek + 1);
				this.rangeEnd = tDate.valueOf();
				break;
			case "day":
				// calculate range start
				tDate = new Date(tYear, tMonth, tDay);
				this.rangeStart = tDate.valueOf();
				// calculate range end
				tDate.setDate(tDay + 1);
				this.rangeEnd = tDate.valueOf();
				break;
		}

		Render[type]({ date, el: this.els[this.active] });

		// signal events to render date range
		Events.dispatch({
			type: `populate-${type}`,
			starts: this.rangeStart,
			ends: this.rangeEnd,
		});
	}
};
