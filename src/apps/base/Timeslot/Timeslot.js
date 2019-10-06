/**
 * Creates a new timeslot
 * @param timestart {Date} Starting time of the slot
 * @param timeend {Date} Ending time of the slot
 * @param slotsize {Number} Slot size in minutes
 * @param periodstart {Date} Starting date of the timeslot
 * @param periodend {Date} Ending date of the timeslot
 * @param daymask {String} Daymask beginning with Monday!
 * @param price {Number} This is the standard price for one of these slots
 */
Timeslot.prototype.constructor = function(timestart, timeend, slotsize, periodstart, periodend, daymask, price) {
	if (timestart != null && timeend != null && slotsize != null && periodstart != null && price != null) {
    	this.timestart = timestart;
    	this.timeend = timeend;
    	this.slotsize = slotsize;
    	this.periodstart = periodstart;
    	this.periodend = periodend || null;    	
    	this.daymask = daymask || "1111111";
    	this.price = price;
    } else {
        throw "Invalid Timeslot! Some parts are missing!";
    }
};

/**
 * Checks if a given period is a valid timeslot for a court
 * @param start {Date} Starting date of the period
 * @param end {Date} Ending date of the period
 * @return {Boolean} True if the given period is a valid timeslot
 */
Timeslot.prototype.isValidTimeslot = function(start, end) {
	
	var df_full = new java.text.SimpleDateFormat("dd.MM.yyyy HH:mm:ss");		
	var df_date = new java.text.SimpleDateFormat("dd.MM.yyyy");
	var df_time = new java.text.SimpleDateFormat("HH:mm");		

	var wday = start.getDay() - 1;
	if(wday == -1) {
		wday = 6;
	}

	// Check                       start and end on same day                      start and end in period of timeslot                             weekday of searchdate in daymask
	if(!start || !end || df_date.format(start) != df_date.format(end) || start < this.periodstart || (this.periodend && this.periodend < end) || this.daymask.substr(wday, 1) != "1") {
		return false;
	}

	// Vars
	var found = false;
	var reqbegin = df_time.format(start);
	var reqend = df_time.format(end);
		
	// Set Beginning
	var club = getClubInPath();
	var cal = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
	cal.setTime(start);
	cal.set(java.util.Calendar.HOUR_OF_DAY, this.timestart.getHours());
	cal.set(java.util.Calendar.MINUTE, this.timestart.getMinutes());
	cal.set(java.util.Calendar.SECOND, this.timestart.getSeconds());
	
	// Set End		
	var calEnd = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
	calEnd.setTime(end);
	calEnd.set(java.util.Calendar.HOUR_OF_DAY, this.timeend.getHours());
	calEnd.set(java.util.Calendar.MINUTE, this.timeend.getMinutes());
	calEnd.set(java.util.Calendar.SECOND, this.timeend.getSeconds());

	// Loop Through All Timeslots Of Day	
	while(!found && cal.getTime() <= calEnd.getTime()) {
		var slotbegin = df_time.format(cal.getTime());
		
		// Next Slot = End
		cal.add(java.util.Calendar.MINUTE, this.slotsize);
		var slotend = df_time.format(cal.getTime());
		if(slotend == "00:00") {
			slotend = "23:59";
		}
		
		// Check if start and end match
		if(reqbegin == slotbegin && reqend == slotend) {
			found = true;
		}
	}

	return found;
}

/**
 * Returns the reservation for a given timeperiod
 * @param start {Date} Starting date of the period
 * @param end {Date} Ending date of the period
 * @return {Reservation} Reservation which is in the given period
 */
Timeslot.prototype.getReservation = function(start, end) {
	var reservation = null;
	
	var reservations = Reservation.getCollection({
		filter: "res_timeslot = " + this._id + " AND res_timestart = '" + tenez.Date.getDBString(start) + "' AND res_timeend = '" + tenez.Date.getDBString(end) +"'"
	});
	if(reservations.count() > 0) {
		reservation = reservations.get(0);
	}
	
	return reservation;
}
