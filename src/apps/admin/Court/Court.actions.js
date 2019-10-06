/**
 * Edits a court from the location.
 */
Court.prototype.edit_action = function() {
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            this.name        = req.data.name;
            this.description = req.data.description;

            tenez.FormHandler.remove(form);

            tenez.Logger.log({
                type: "EDIT_COURT",
                message: "Edit of court: " + this.alias,
                message_de: "Platz bearbeitet: " + this.name + " (" + this.alias + ", Standort: " + this.location.name + ")"
            });
            res.redirect(this.location.href());
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("edit"));
    }

    tenez.FormHandler.registerNewForm();

	res.data.title = gettext("Platz bearbeiten");
    res.data.body = this.renderSkinAsString("editCourt");
    renderSkin("main");
};

/**
 * Shows a list with all courts of the location
 * @author Dominik Gruber
 */
Court.prototype.listTimeslots_action = function() {
	
    res.data.body = this.renderSkinAsString("listTimeslots");

    // Split timeslots into three categories: current / past / future
    var ts = new Array();
    var ts_past = new Array();
    var ts_future = new Array();            
    for(var i = 0; i < this.timeslots.count(); i++) {
		var item = this.timeslots.get(i);
    	var now = new Date();

    	if(item.periodend && item.periodend < now) {
    		ts_past.push(item);
    	} else {
    		if(item.periodstart > now) {
    			ts_future.push(item);
    		} else {
    			ts.push(item);
    		}
    	}
    }

    // Show create button
    if (session.user.hasPermission("can_add_timeslots")) {
        res.data.body += this.renderSkinAsString("listTimeslots#create");
    }
    
    // Show current timeslots
    if(ts.length > 0) {
        var timeslotlist = res.handlers.timeslotlist = new jala.ListRenderer(ts);
        timeslotlist.setPageSize(10);    
        
        res.data.list_title = gettext("Zeiteinheiten");
        res.data.showActions = true;
        res.data.body += this.renderSkinAsString("listTimeslots#list");
    }
    
    // Show future timeslots
    if(ts_future.length > 0) {
        var timeslotlist = res.handlers.timeslotlist = new jala.ListRenderer(ts_future);
        timeslotlist.setPageSize(10);    
        
        res.data.list_title = gettext("Zukünftige Zeiteinheiten");
        res.data.showActions = true;
        res.data.body += this.renderSkinAsString("listTimeslots#list");
    }
    
    // Show past timeslots
    if(ts_past.length > 0) {
        var timeslotlist = res.handlers.timeslotlist = new jala.ListRenderer(ts_past);
        timeslotlist.setPageSize(10);    
        
        res.data.list_title = gettext("Vergangene Zeiteinheiten");
        res.data.showActions = false;
        res.data.body += this.renderSkinAsString("listTimeslots#list");
    }
    
    // Render Page
    res.data.title = gettext("Zeiteinheiten") + " - " + this.name + " - " + this.location.name;
    renderSkin("main");
};


/**
 * Creates a timeslot for the court
 * @author Dominik Gruber
 */
Court.prototype.createTimeslot_action = function() {

	if (req.data.price) {
        req.data.price = req.data.price.replace(",", ".");
    }
	if (req.data.timestart && req.data.timestart.match(/^[0-9]{1,2}$/) != null) {
		req.data.timestart = req.data.timestart + ":00";
	}
	if (req.data.timeend && req.data.timeend.match(/^[0-9]{1,2}$/) != null) {
		req.data.timeend = req.data.timeend + ":00";
	}
	if(req.data.timeend && req.data.timeend == "24:00") {
		req.data.timeend = "00:00";
	}
	
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var timestart   = req.data.timestart;
            var timeend		= req.data.timeend;
            var slotsize	= parseInt(req.data.slotsize);
            var periodstart = req.data.periodstart;
            var periodend   = req.data.periodend;
            var price		= parseFloat(req.data.price);
            
            var daymask 	= "";
            daymask			+= (req.data.weekdays_mo ? "1" : "0");
            daymask			+= (req.data.weekdays_tu ? "1" : "0");
            daymask			+= (req.data.weekdays_we ? "1" : "0");
            daymask			+= (req.data.weekdays_th ? "1" : "0");
            daymask			+= (req.data.weekdays_fr ? "1" : "0");
            daymask			+= (req.data.weekdays_sa ? "1" : "0");
            daymask			+= (req.data.weekdays_su ? "1" : "0");
            
            var invalidInput = false;
            
            // Check if at least one day is checked
            if(daymask == "0000000") {
                form.addMessage(gettext("Die Zeiteinheit muss an mindestens einem Tag gültig sein."));
                invalidInput = true;
            }
            
            // Check if slotsize > 5
            if(slotsize < 5) {
                form.addMessage(gettext("Das Intervall muss mindestens 5 Minuten betragen."));
                invalidInput = true;
            }

        	var df_date = new java.text.SimpleDateFormat("dd.MM.yyyy");
            var df_time = new java.text.SimpleDateFormat("HH:mm");
            
            // Check if starttime < endtime
            var cal1 = new java.util.GregorianCalendar();
            cal1.setTime(df_time.parse(timestart));
            var cal2 = new java.util.GregorianCalendar();
            cal2.setTime(df_time.parse(timeend));
            if(timeend == "0:00" || timeend == "00:00") {
            	cal2.add(java.util.Calendar.DATE, 1);
            }
            if(!cal1.before(cal2)) {
                form.addMessage(gettext("Das Ende muss vor dem Beginn liegen."));
                invalidInput = true;	
            }
            
            // Check if slotsize fits in timeperiod
            var duration = (cal2.getTimeInMillis() - cal1.getTimeInMillis()) / 1000 / 60;
            if(duration % slotsize != 0) {
                form.addMessage(gettext("Die Intervallsangabe ist inkorrekt."));
                invalidInput = true;
            }

            // Check if periodstart < periodend
            var periodstart_cal = new java.util.GregorianCalendar();
            periodstart_cal.setTime(df_date.parse(periodstart));
            var periodend_cal = null;            
            if(periodend) {
                periodend_cal = new java.util.GregorianCalendar();
            	periodend_cal.setTime(df_date.parse(periodend));
            	periodend_cal.set(java.util.Calendar.HOUR_OF_DAY, 23);
            	if(!periodstart_cal.before(periodend_cal)) {
            		form.addMessage(gettext("Das Gültigkeits-Ende muss vor dem Beginn liegen."));
            		invalidInput = true;	
            	}
            }
            
            // Check if timeslot is available
            var date_periodstart = tenez.Date.getDateFromString(periodstart);
            var date_periodend = tenez.Date.getDateFromString(periodend) || new Date(2099, 11, 31, 23, 59, 59);
            var date_timestart = tenez.Date.getDateFromString(timestart);
            var date_timeend = tenez.Date.getDateFromString(timeend);
            date_timeend.setSeconds(-1);
            
            for(var i = 0; i < this.timeslots.count(); i++) {
        		var item = this.timeslots.get(i);
        		
        		var item_timeend = item.timeend;
        		item_timeend.setSeconds(-1);
        		
        		// If periods, daymasks and timespans are overlapping
        		if(tenez.Date.areOverlapping(date_periodstart, date_periodend, item.periodstart, item.periodend || new Date(2099, 11, 31, 23, 59, 59))
        			&& (parseInt(daymask, 2) & parseInt(item.daymask, 2)) != 0
        			&& tenez.Date.areOverlapping(date_timestart, date_timeend, item.timestart, item_timeend)) {
        				
                    		form.addMessage(gettext("Die Zeiteinheit überlappt mit einer bereits vorhandenen."));
                    		invalidInput = true;	
                    		break;
        		}
            }

            // Check if daymask is in period
            var date_check_mask = "0000000";
            var date_check = new Date();
            date_check.setDate(date_periodstart.getDate());
            var date_check_end = new Date();
            date_check_end.setDate(date_periodstart.getDate() + 8);
            if(date_periodend < date_check_end) { 
                date_check_end.setDate(date_periodend.getDate() + 1);
            }
            // Create daymask from period
            while(date_check < date_check_end) {
            	var pos = date_check.getDay();
            	if(pos-- == 0) {	// Sunday
            		pos = 6;
            	}
            	date_check_mask = date_check_mask.substr(0, pos) + "1" + date_check_mask.substr(pos+1, 6-pos);
            	date_check.setDate(date_check.getDate() + 1);
            }
            if(daymask && daymask != "0000000" && (daymask & date_check_mask) == 0) {
        		form.addMessage(gettext("Von den ausgewählten Tagen befindet sich keiner in der definierten Periode."));
        		invalidInput = true;	
            }
            
        	// If input is valid
            if (!invalidInput) {
                // Save
            	var date_periodend = null;
            	if(periodend) {
            	    date_periodend = tenez.Date.getDateFromString(periodend);
            		date_periodend.setHours(23);
            		date_periodend.setMinutes(59);
            		date_periodend.setSeconds(59);
            	}
            	var date_timeend = tenez.Date.getDateFromString(timeend);
            	if(timeend.match(/^0?0:00$/)) {
            		date_timeend.setHours(23);
            		date_timeend.setMinutes(59);
            		date_timeend.setSeconds(59);
            	}
            	
            	var ts = new Timeslot(tenez.Date.getDateFromString(timestart), date_timeend, slotsize, tenez.Date.getDateFromString(periodstart), date_periodend, daymask, price);
            	this.timeslots.add(ts);
            	
            	// Log
            	tenez.Logger.log({
            		type: "CREATE_TIMESLOT",
            		message: "Created new timeslot " + ts._id + ". Court: " + this.alias + ". Location: " + this.location.alias,
            		message_de: "Zeiteinheit (ID " + ts._id +") zu Platz " + this.name  + " (" + this.alias + ", Standort: " + this.location.name + ")" + " hinzugefügt"
            	});
            	
            	// Remove FormHandler and redirect
            	tenez.FormHandler.remove(form);
                res.redirect(this.href('listTimeslots'));
            }
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("createTimeslot"));
    
    }

    tenez.FormHandler.registerNewForm();
    
	res.data.title = gettext("Zeiteinheit festlegen");
	res.data.body = this.renderSkinAsString("createTimeslot");
	renderSkin("main");
}

/**
 * Deactivates a court and saves it as deactivated
 */
Court.prototype.deactivate_action = function() {
    if (this.active == false) {
        res.redirect(this.location.href("listCourts"));
    }
    
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var timeslotIds = ["-11111"];
            for (var i = 0; i < this.timeslots.count(); i++) {
                timeslotIds.push(this.timeslots.get(i)._id);
            }

            var reservations = Reservation.getCollection({
                filter: "res_timeslot IN (" + timeslotIds.join(", ") + ") AND res_timestart > '" + tenez.Date.getDBString(new Date()) + "'"
            });
            if(reservations.count() > 0) {
                form.addMessage(gettext("Platz kann nicht deaktiviert werden. Es liegen Reservierungen nach dem aktuellen Datum vor."));
            } else {
                this.active = false;
                tenez.FormHandler.remove(form);
                res.redirect(this.location.href("listCourts"));
            }

            form.keepAlive();
            res.redirect(this.href("deactivate"));
        }
    }

    tenez.FormHandler.registerNewForm();
    res.data.title = gettext("Platz deaktivieren");
	res.data.body = this.renderSkinAsString("deactivate");
	renderSkin("main");
};
/**
 * Activates a deactivated court
 */
Court.prototype.activate_action = function() {
    if (this.active == false) {
        this.active = true;
        res.redirect(this.location.href("listCourts"));
    }
}