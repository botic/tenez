// Define the tenez namespace
if (!global.tenez) {
    global.tenez = {};
}


tenez.DateImpl = function() {
    return this;
};

/**
 * Adds or subtracts a given number of days from the given date
 * @param date {java.util.Date} The Date
 * @param days {int} Days to add / subtract
 * @author Dominik Gruber
 */
tenez.DateImpl.prototype.addDaysToDate = function(date, days) {
    var cal = new java.util.GregorianCalendar();
    cal.setTime(date);
    cal.add(java.util.Calendar.DATE, parseInt(days, 10));
    return cal.getTime();
};

/**
 * Returns a string usable for db-queries from a Java Date
 * @param date {java.util.Date} The Date
 * @param format {String} Date Format String
 * @return {String} Returns the formatted date
 */
tenez.DateImpl.prototype.getDateString = function(date, format) {
	var df = new java.text.SimpleDateFormat(format || "yyyy-MM-dd HH:mm:ss");
    return df.format(date);
};

/**
 * Returns a string usable for db-queries from a Java Date
 * @param date {java.util.Date} The Date
 * @return {String} Returns the formatted date
 */
tenez.DateImpl.prototype.getDBString = function(date) {
	return this.getDateString(date, "yyyy-MM-dd HH:mm:ssZ");
};

/**
 * Returns the weekday of a given date as string
 * @param date {Date} The Date
 * @return {String} Returns the weekday (text)
 */
tenez.DateImpl.prototype.getWeekdayString = function(date) {
	var wday = new Array();
	wday[0] = gettext("Sonntag");
	wday[1] = gettext("Montag");
	wday[2] = gettext("Dienstag");
	wday[3] = gettext("Mittwoch");
	wday[4] = gettext("Donnerstag");
	wday[5] = gettext("Freitag");
	wday[6] = gettext("Samstag");

	return wday[date.getDay()];
}

/**
 * Returns the daymask for a given date (eg "1_______" for Monday) - used for timeslot db-queries
 * @param date The Date
 */
tenez.DateImpl.prototype.getDaymask = function(date) {	
	var daymask = "_______";
	switch(date.getDay()) {
		case 1: 	
			daymask = "1______";								
			break;
		case 2: 	
			daymask = "_1_____";								
			break;
		case 3: 	
			daymask = "__1____";
			break;	
		case 4: 	
			daymask = "___1___";
			break;
		case 5: 	
			daymask = "____1__";
			break;
		case 6: 	
			daymask = "_____1_";
			break;
		case 0: 	
			daymask = "______1";
			break;
	}
	
	return daymask;
}

/**
 * Returns a JavaScript Date Object based on a given date - usable for DB inputs
 * @param date String in format 'dd.mm.yyyy' or 'dd.mm.yyyy hh:mm' or 'hh:mm'
 */
tenez.DateImpl.prototype.getDateFromString = function(date) {

	var ok = false;
	
	var re_date = date.match(/^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})/);
	var re_time = date.match(/([0-9]{1,2}):([0-9]{2})$/);

	var days_of_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
	
	var ret_d = 1;
	var ret_m = 0;
	var ret_y = 1970;
	var ret_h = 0;
	var ret_min = 0;
	
	if(re_date) {
		var d = parseInt(re_date[1], 10);
		var m = parseInt(re_date[2], 10);
		var y = parseInt(re_date[3], 10);
		
		// Leap Year
		if(m == 2 && y % 4 == 0) {
			days_of_month[1]++;
		}
		
		if(m >= 1 && m <= 12 && d >= 1 && d <= days_of_month[m-1]) {
			ret_y = y;
			ret_m = m-1;
			ret_d = d;
			ok = true;
		}
	}
	
	if(re_time) {
		var h = parseInt(re_time[1], 10);
		var min = parseInt(re_time[2], 10);
		if(h >= 0 && h <= 23 && min >= 0 && min <= 59) {
			ret_h = h;
			ret_min = min;
			ok = true;
		}
	}
	
	if(ok) {
		return new Date(ret_y, ret_m, ret_d, ret_h, ret_min);
	}
	
	return null;
}

/**
 * Returns a JavaScript Date Object based on a given time - usable for DB inputs
 * @param hour
 * @param min
 */
tenez.DateImpl.prototype.getTime = function(hour, min) {
    return new Date(1970,00,01,hour,min);
};

/**
 * Returns whether two time periods are overlapping or not
 * @param a_start Begin-Date of the first time period
 * @param a_end End-Date of the first time period
 * @param b_start Begin-Date of the second time period
 * @param b_end End-Date of the second time period
 */
tenez.DateImpl.prototype.areOverlapping = function(a_start, a_end, b_start, b_end) {

	// A     |----|
	// B  |----|
	if(a_start >= b_start && a_start <= b_end && a_end >= b_start && a_end >= b_end) {
		return true;
	}

	// A  |----|
	// B    |----|
	if(a_start <= b_start && a_start <= b_end && a_end >= b_start && a_end <= b_end) {
		return true;
	}

	// A  |-------|
	// B    |--|
	if(a_start <= b_start && a_start <= b_end && a_end >= b_start && a_end >= b_end) {
		return true;
	}

	// A    |--|
	// B  |-------|
	if(a_start >= b_start && a_start <= b_end && a_end >= b_start && a_end <= b_end) {
		return true;
	}
	
	return false;
};

/**
 * Returns a string usable for report-suffixes
 * @param date {java.util.Date} The Date
 */
tenez.DateImpl.prototype.getReportString = function(date) {
	var df = new java.text.SimpleDateFormat("yyyy-MM-dd");
    return df.format(date);
};

tenez.Date = new tenez.DateImpl();