
const Packer = {
	pack(col) {
		let events = $(".event", col).map(el => {
				let rect = el.getBoundingClientRect();
				return {
					top: rect.top,
					bottom: rect.top + rect.height,
					el: $(el)
				};
			}).sort(this.sorter),
			colWidth = col.offsetWidth,
			lastEventEnding = null,
			columns = [];

		events.map(item => {
			// Check if a new event group needs to be started
			if (lastEventEnding !== null && item.top >= lastEventEnding) {
				// The latest event is later than any of the event in the 
				// current group. There is no overlap. Output the current 
				// event group and start a new event group.
				this.events(columns, colWidth);
				columns = [];  // This starts new event group.
				lastEventEnding = null;
			}

			// Try to place the event inside the existing columns
			let placed = false;
			for (let i=0, il=columns.length; i<il; i++) {                   
				let col = columns[i];
				if (!this.collidesWith(col[col.length-1], item)) {
					col.push(item);
					placed = true;
					break;
				}
			}

			// It was not possible to place the event. Add a new column 
			// for the current event group.
			if (!placed) {
				columns.push([item]);
			}

			// Remember the latest event end time of the current group. 
			// This is later used to determine if a new groups starts.
			if (lastEventEnding === null || item.bottom > lastEventEnding) {
				lastEventEnding = item.bottom;
			}
		});

		if (columns.length > 0) {
			this.events(columns, colWidth);
		}
	},
	sorter(a, b) {
		if (a.top < b.top) return -1;
		if (a.top > b.top) return 1;
		if (a.bottom < b.bottom) return -1;
		if (a.bottom > b.bottom) return 1;
		return 0;
	},
	// Check if two events collide.
	collidesWith(a, b) {
		return a.bottom > b.top && a.top < b.bottom;
	},
	// Expand events at the far right to use up any remaining space. 
	// Checks how many columns the event can expand into, without 
	// colliding with other events. Step 5 in the algorithm.
	expand(item, iColumn, columns) {
	    let colSpan = 1,
	    	i = iColumn + 1,
	    	il = columns.length;
	    // To see the output without event expansion, uncomment 
	    // the line below. Watch column 3 in the output.
	    //return colSpan;
		for (; i<il; i++)  {
			let col = columns[i];
			for (let j = 0; j < col.length; j++) {
				let el1 = col[j];
				if (this.collidesWith(item, el1)) {
					return colSpan;
				}
			}
			colSpan++;
		}
	    return colSpan;
	},
	// Function does the layout for a group of events.
	events(columns, colWidth) {
		let n = columns.length;
		for (let i=0; i<n; i++) {
			let col = columns[ i ];
			for (let j=0, jl=col.length; j<jl; j++) {
				let item = col[j],
					colSpan = this.expand(item, i, columns),
					left = ((i / n) * 100) +"%",
					width = (colWidth * colSpan / n - 1) +"px";
				// actual UI alteration
				item.el.css({ left, width });
			}
		}
	}
};
