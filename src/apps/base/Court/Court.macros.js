/**
 *  Macro to list each reservationslot in a timetable
 */
Court.prototype.showTimetableItems_macro = function(param) {

	res.push();

	var timetable = res.handlers.timetable;

	// Render TimetableItems
	var canReserve = false;
	for(key in timetable) {
		var item = timetable[key];

		if(item.reservation) {
			this.renderSkin("timetableItemReserved", {item: item});
		} else {
			// Check Reservationperiod for Frontend
			var club = getClubInPath();
			if(isFrontend() && (new Date()).getTime() >= item.start.getTime() - (club.reservationperiod * 60000)) {
				this.renderSkin("timetableItemUnused", {item: item});
			} else {
				this.renderSkin("timetableItemFree", {item: item});
			}
		}
		
		canReserve = true;
	}

	// If Court cannot be reserved today render other template
	if(!canReserve) {
		this.renderSkin("timetableItemNoSlots");
	}

	return res.pop();
};
