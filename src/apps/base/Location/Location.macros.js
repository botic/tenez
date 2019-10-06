/**
 *  Macro to list a timetable for each court of the location
 */
Location.prototype.showTimetables_macro = function(param) {
    res.push();

    var day = req.data.day;
	
	// Render Timetable For Each Court
	for(var i = 0; i < this.courts.count(); i++) {
		var court = this.courts.get(i);
        if (court.active == true) {
		    res.handlers.timetable = court.getTimetable(day);
		    court.renderSkin("timetable");
        }
	} 
	
	return res.pop();
};
