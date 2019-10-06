/**
 * Renders the timetable for all courts of the location
 * @author Dominik Gruber
 */
Location.prototype.main_action = function() {
    // Set searchdate to today
	var today = new java.util.Date();
	var cal = new java.util.GregorianCalendar();
	cal.setTime(today);	// Set Time to 0:00 (very long-winded, thx to Java)
	cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
	cal.set(java.util.Calendar.MINUTE, 0);
	cal.set(java.util.Calendar.SECOND, 0);
	today = cal.getTime();
	var day = cal.getTime();

	// If form submitted -> set searchdate to submitted date
	if(req.data.day) {
		var form_day = req.data.day;
		if(form_day.match(/^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})$/)) {
			var df = new java.text.SimpleDateFormat("dd.MM.yyyy");
			day = df.parse(form_day);
			cal.setTime(day);
		}
	}

	req.data.day = day;
	res.data.day = cal.getTime();
	res.data.day_diff = Math.ceil((day.getTime() - today.getTime()) / 1000 / 60 / 60 / 24);   // Difference in days (for DatePicker)

	// Show Main Skin
	res.data.title = this.name;
	res.data.body = this.renderSkinAsString("overview");
	renderSkin("main");
};
