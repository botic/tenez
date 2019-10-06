/**
 * Creates a new court
 * @param name {String} Name of the court
 * @param alias {String} Alias of the court
 * @param description {String} Description of the court
 * @param sortorder {Number} Number for the sort sequence in the frontend
 * @param active {Boolean} State of the court. True if the court is in use
 */
Court.prototype.constructor = function(name, alias, description, sortorder, active) {
    if (name && alias && sortorder != null && active != null) {
        this.name = name;
        this.alias = alias;
        this.description = description;
        this.sortorder = sortorder;
        this.active = active;
    } else {
        throw "Invalid Court! Some parts are missing!";
    }
};


/**
 * Returns the timetable for the court on the given day
 * @param day {java.util.Date}
 * @author Dominik Gruber
 */
Court.prototype.getTimetable = function(day) {

	// Collection of Timeslots
	var timeslotItems = new Array();
	
	// Get Club
	var club = this._parent._parent._parent._parent;
    
	// Date
	var cal = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
	cal.setTime(day);
	
	// Date Formatter
	var df_full = new java.text.SimpleDateFormat("dd.MM.yyyy HH:mm");		
	var df_date = new java.text.SimpleDateFormat("dd.MM.yyyy");
	var df_time = new java.text.SimpleDateFormat("HH:mm");		

	// Daymask for SQL-Statement
	var daymask = tenez.Date.getDaymask(day);
	
	// Get Timeslots from DB
	var tslts = Timeslot.getCollection({
        order:  "tsl_timestart ASC",
		filter: "tsl_court = " + this._id + " AND tsl_periodstart <= '" + tenez.Date.getDBString(day) + "' AND (tsl_periodend IS NULL OR tsl_periodend > '" + tenez.Date.getDBString(day) + "') AND tsl_daymask LIKE '" + daymask + "'"
	});

	// Loop through all Timeslots
	var j = 0;
	for(var i = 0; i < tslts.count(); i++) {

		var timeslot = tslts.get(i);
		
		// Set Beginning
		cal.set(java.util.Calendar.HOUR_OF_DAY, timeslot.timestart.getHours());
		cal.set(java.util.Calendar.MINUTE, timeslot.timestart.getMinutes());
		
		// Set End		
		var dayEnd = df_full.parse(df_date.format(day) + " " + 
				((timeslot.timeend.getHours() == 0 && timeslot.timeend.getMinutes() == 0) ? "23" : timeslot.timeend.getHours()) + ":" +
				((timeslot.timeend.getHours() == 0 && timeslot.timeend.getMinutes() == 0) ? "59" : timeslot.timeend.getMinutes()));

		var calEnd = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
		calEnd.setTime(dayEnd);
		
		// Loop
		while(calEnd.after(cal)) {
			
			// New TimetableItem Object
			var item = new Object();
			item.start = cal.getTime();
			item.duration = timeslot.slotsize;
			item.priceRegular = timeslot.price;
			item.link_reserve = timeslot.href("reserve") + "?start=" + cal.getTimeInMillis();

			// Discount Price
			item.price_std = item.price = timeslot.price;
			if(session.user) {
				item.price = timeslot.price * (1.0 - session.user.getDiscount());
			}
			
			// Slot End = Next Slot
			cal.add(java.util.Calendar.MINUTE, timeslot.slotsize);
			if(tenez.Date.getDateString(cal.getTime(), "HH:mm") == "00:00") {
				cal.add(java.util.Calendar.SECOND, -1);
			}
			item.end = cal.getTime();
			
			// Check Reservation
			item.reservation = timeslot.getReservation(item.start, item.end) || false;
			
			// Add To Collection
			timeslotItems[j++] = item;
		}
	}
	
	return timeslotItems;
}
