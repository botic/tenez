/**
 * Edit the timeslot
 * @author Dominik Gruber
 */
Timeslot.prototype.edit_action = function() {
	// Check if timeslot is editable
	if(this.periodend && this.periodend < new Date()) {
    	res.redirect(this.court.href('listTimeslots'));
	}
	
	// Check form input
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var invalidInput = false;
        	var periodend = null;

        	// Validate periodend
        	if(req.data.periodend) {
	            periodend = tenez.Date.getDateFromString(req.data.periodend);
	    		periodend.setHours(23);
	    		periodend.setMinutes(59);
	    		periodend.setSeconds(59);
	            
	            // Check if no reservations after new periodend
	    		if(!this.periodend || (this.periodend && this.periodend > periodend)) {
		        	var reservations = Reservation.getCollection({
		        		filter: "res_timeslot = " + this._id + " AND res_timestart > '" + tenez.Date.getDBString(periodend) + "'"
		        	});
		        	if(reservations.count() > 0) {
		        		form.addMessage(gettext("Ungültiges Periodenende. Es liegen Reservierungen nach dem angegebenen Datum vor."));
		        		invalidInput = true;	        		
		        	}
	    		}
	            
	            // Check if periodend > periodbegin
	            if(periodend < this.periodbegin) {
	        		form.addMessage(gettext("Das Ende der Periode darf nicht vor dem Beginn liegen."));
	        		invalidInput = true;	
	            }	
        	}
      
            // Save
            if(!invalidInput) {
            	this.periodend = periodend;
            	
            	tenez.FormHandler.remove(form);

            	tenez.Logger.log({
            		type: "EDIT_TIMESLOT",
            		message: "Edit of timeslot: " + this._id,
            		message_de: "Timeslot bearbeitet: " + this._id + " (Platz: " + this.court.name + ", Standort: " + this.court.location.name + ")"
            	});
            	res.redirect(this.court.href('listTimeslots'));
            }
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("edit"));
    }

    tenez.FormHandler.registerNewForm();

	res.data.title = gettext("Zeiteinheit bearbeiten") + " - " + this.court.name + " - " + this.court.location.name;
    res.data.body = this.renderSkinAsString("editTimeslot");
    renderSkin("main");
};

/**
 * Delete the timeslot
 * @author Dominik Gruber
 */
Timeslot.prototype.delete_action = function() {
    if(req.isPost()){
        var form = tenez.FormHandler.retrieve();
        
        if(form && form.evaluate()){
            var invalidInput = false;

            // Check if no reservations
        	if(this.reservations.count() > 0) {
        		form.addMessage(gettext("Die Einheit kann nicht gelöscht werden, da Reservierungen vorgenommen worden sind."));
        		invalidInput = true;
        	}
            
            if(!invalidInput){
                tenez.FormHandler.remove(form);
                
                tenez.Logger.log({
                    type: "DELETE_TIMESLOT",
                    message: "Deleted timeslot: " + this._id + ". Period: " + this.periodstart + " - " + this.periodend + ". Time: " + this.timestart + " - " + this.timeend + ". Interval: " + this.slotsize + ". Daymask: " + this.daymask + ". Price: " + this.price,
                    message_de: "Zeiteinheit (ID " + this._id + ") von Platz " + this.court.name + " (Standort " + this.court.location.name + ") gelöscht "
                });
                
                this.remove();
                
                res.redirect(this.court.href("listTimeslots"));
            }
            
            form.keepAlive();
            res.redirect(this.href("delete"));
         }  
    }
        
    tenez.FormHandler.registerNewForm();
    
    res.data.title = gettext("Zeiteinheit löschen") + " - " + this.court.name + " - " + this.court.location.name;
    res.data.body = this.renderSkinAsString("deleteTimeslot");
    renderSkin("main");
}

/**
 * Reserves a timeslot
 * @author Dominik Gruber
 */
Timeslot.prototype.reserve_action = function() {
	
	var invalidInput = false;
	
	var start = res.data.start = req.data.start;
	
	var timestart = new Date(parseInt(start, 10));
	var timeend = new Date(parseInt(start, 10) + (this.slotsize * 60000));
	if(tenez.Date.getDateString(timeend, "HH:mm") == "00:00") {
		timeend.setTime(timeend.getTime() - 1000);
	}
	
	// Check date
	if(!timestart || !timeend || timestart > timeend || timestart == "Invalid Date" || timeend == "Invalid Date") {
		res.redirect(this.court.location.href(""));
	}
	
	res.data.timestart = timestart;
	res.data.timeend = timeend;	
	var price_std = res.data.price_std = this.price;
	
	// Parse input
	if(req.data.discount) {
		req.data.discount = req.data.discount.replace(",", ".");
	}
	if(req.data.price) {
		req.data.price = req.data.price.replace(",", ".");
	}
	
	// Check form input
	if (req.isPost()) {
        // This is just to be on the secure side...
        if(!this.court.active || !this.court.location.active) {
            throw "Invalid state of Court or Location!";
        }
        
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
        	var username = req.data.username;
    		var club = getClubInPath();
        	var user = club.users.get(username);
        	var quantity = parseInt(req.data.quantity, 10);
        	var discount = parseFloat(req.data.discount) || 0;
        	var price = parseFloat(req.data.price);

        	// Check Quantity
        	if(!quantity || quantity < 1 || quantity > 52) {
        		form.addMessage(gettext("Ungültige Anzahl."));
        		invalidInput = true;        	
        	} else {
        		// Foreach reservation
        		var calStart = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
        		calStart.setTime(timestart);
        		var calEnd = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
        		calEnd.setTime(timeend);
        		for(var i = 0; i < quantity; i++) {
        			// Check if day / start / end are valid
        			if(!this.isValidTimeslot(calStart.getTime(), calEnd.getTime())) {
        				form.addMessage(gettext("Die Zeiteinheit am") + " " + tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy") + " " + gettext("von") + " " + tenez.Date.getDateString(calStart.getTime(), "HH:mm") + " - " + tenez.Date.getDateString(calEnd.getTime(), "HH:mm") + " " + gettext("Uhr ist nicht verfügbar") + ".");
        				invalidInput = true;         		
        			} else {        	
        				// Check if timeslot is free
        				var reservation = this.getReservation(calStart.getTime(), calEnd.getTime());
        				if(reservation != null) {
            				form.addMessage(gettext("Die Zeiteinheit am") + " " + tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy") + " " + gettext("von") + " " + tenez.Date.getDateString(calStart.getTime(), "HH:mm") + " - " + tenez.Date.getDateString(calEnd.getTime(), "HH:mm") + " " + gettext("Uhr ist bereits reserviert") + ".");
        					invalidInput = true;
        				}
        			}        		
        			
        			// Next Timeslot = Next Week
        			calStart.setTime(timestart)
					calStart.add(java.util.Calendar.DATE, 7 * (i+1));
        			calEnd.setTime(timeend);
        			calEnd.add(java.util.Calendar.DATE, 7 * (i+1));
        		}
        	}
        	
        	// Check if discount & price calculation are valid
        	var price_calc = this.price * quantity * (1 - (discount / 100));
        	if(isNaN(price_calc) ||  price_calc.toFixed(2) != price) {
        		form.addMessage(gettext("Ungültige Angabe von Rabatt bzw. Gesamtpreis."));
        		invalidInput = true;
        	}
        	
        	// Check User
        	if(!user) {
        		form.addMessage(gettext("Ungültige Kundenwahl."));
        		invalidInput = true;
        	} else {
        		// Check if user has enough credit
        		if(!invalidInput && user.isprepaid && price != 0 && user.getBalance() < price) {
            		form.addMessage(gettext("Der Kunde hat nicht genug Guthaben."));
            		invalidInput = true;        			
        		}
        	}

            // Save
            if(!invalidInput) {
            	var item = new Object();
            	item.timestart = timestart;
            	item.timeend = timeend;
            	item.dates = "";
            	item.user = user;
            	item.court = this.court;
            	item.price = price;
            	item.discount = discount;
            	
            	// Save each reservation
            	var calStart = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
        		calStart.setTime(timestart);
        		var calEnd = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
        		calEnd.setTime(timeend);
        		for(var i = 0; i < quantity; i++) {
        			calStart.set(java.util.Calendar.MILLISECOND, 0);
        			calEnd.set(java.util.Calendar.MILLISECOND, 0);
        			
        			// Add date for reservation-confirmation
        			item.dates += tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy") + "<br />";
        			
        			// Reservation
        			var reservation = new Reservation(calStart.getTime(), calEnd.getTime());
                    reservation.user = user;
                    this.reservations.add(reservation);
                	
                	tenez.Logger.log({
                		type: "CREATE_RESERVATION",
                		message: "Reservation for " + user.firstname + " " + user.lastname + " (" + user.username  + ") of " + this.court.name + " (" + this.court.location.name + ") on " + tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy, HH:mm") + " - " + tenez.Date.getDateString(calEnd.getTime(), "HH:mm"),
                		message_de: "Reservierung für " + user.firstname + " " + user.lastname + " (" + user.username  + ") von " + this.court.name + " (" + this.court.location.name + ") für " + tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy, HH:mm") + " - " + tenez.Date.getDateString(calEnd.getTime(), "HH:mm") + " Uhr"
                	});

        			// Transaction
                    var tx = new Transaction(gettext("Reservierung für") + " " + this.court.name + " (" + this.court.location.name + "), " + tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy, HH:mm") + " - " + tenez.Date.getDateString(calEnd.getTime(), "HH:mm") + " " + gettext("Uhr"), this.price * -1, discount / 100);
                    tx.reservation = reservation;
                    user.transactions.add(tx);
                    reservation.transaction = tx;

                    if (discount > 0) {
                        var tx2 = new Transaction(gettext("Rabatt") + " " + gettext("zur Buchungsnr.") + " " + tx._id, Math.abs(tx.price - tx.grossvalue), 1);
                        user.transactions.add(tx2);
                    }
                    
                    tenez.Logger.log({
                        type: "ADD_DEBIT",
                        message: "Added debit for user: "  + user.firstname + " " + user.lastname + " (" + user.username  + ") Debit: " + price,
                        message_de: "Abbuchung auf Kundenkonto von " + user.firstname + " " + user.lastname + " (" + user.username  + ") - Betrag: " + price
                    });
                	
        			// Next Timeslot = Next Week
        			calStart.setTime(timestart)
					calStart.add(java.util.Calendar.DATE, 7 * (i+1));
        			calEnd.setTime(timeend);
        			calEnd.add(java.util.Calendar.DATE, 7 * (i+1));
        		}
            	
            	tenez.FormHandler.remove(form);
            	
        	    res.data.title = gettext("Reservierungsbestätigung") + " - " + this.court.name + " - " + this.court.location.name;
        		res.data.item = item;
        	    res.data.body = this.renderSkinAsString("reservationConfirmation");
        	    renderSkin("main");	
        	    return;
            }
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("reserve") + "?start=" + start);
	}
        
    tenez.FormHandler.registerNewForm();
    
    res.data.title = gettext("Reservierung") + " - " + this.court.name + " - " + this.court.location.name;
    res.data.body = this.renderSkinAsString("reserve");
    renderSkin("main");
}
