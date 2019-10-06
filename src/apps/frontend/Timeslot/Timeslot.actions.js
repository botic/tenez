/**
 * Reserves a timeslot
 * @author Dominik Gruber
 */
Timeslot.prototype.reserve_action = function() {
	
	var club = this.court.location.club;	
	var user = session.user;
	
	// Check User
	if(!user) {
		session.data.login_desturl = this.href("reserve") + "?start=" + req.data.start;
		res.redirect(club.href("signin"));
	}
	
	var invalidInput = false;	
	var start = res.data.start = req.data.start;
	
	// Check if timeslot can be reserved (Reservationperiod)
	if(!start || !((new Date()).getTime() < start - (club.reservationperiod * 60000))) {
		res.redirect(club.href(""));
	}
	
	// Generate dates
	var timestart = new Date(parseInt(start, 10));
	var timeend = new Date(parseInt(start, 10) + (this.slotsize * 60000));
	if(tenez.Date.getDateString(timeend, "HH:mm") == "00:00") {
		timeend.setTime(timeend.getTime() - 1000);
	}
	
	// Check dates
	if(!timestart || !timeend || timestart > timeend || timestart == "Invalid Date" || timeend == "Invalid Date") {
		res.redirect(club.href(""));
	}
	
	res.data.timestart = timestart;
	res.data.timeend = timeend;	
	var price = res.data.price = this.price * (1 - session.user.getDiscount());
	var discount = res.data.discount = session.user.getDiscount();
		
	// Check if timeslot is valid
	var calStart = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
	calStart.setTime(timestart);
	var calEnd = new java.util.GregorianCalendar(java.util.TimeZone.getTimeZone(club.timezone));
	calEnd.setTime(timeend);
	if(!this.isValidTimeslot(calStart.getTime(), calEnd.getTime())) {
		res.redirect(this.court.location.href(""));         		
	}	
	
	// Check form input
	if (req.isPost()) {
        // This is just to be on the secure side...
        if(!this.court.active || !this.court.location.active) {
            throw "Invalid state of Court or Location!";
        }

        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
			
        	// Check if timeslot is free
    		var reservation = this.getReservation(calStart.getTime(), calEnd.getTime());
    		if(reservation != null) {
    			form.addMessage(gettext("Die Zeiteinheit am") + " " + tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy") + " " + gettext("von") + " " + tenez.Date.getDateString(calStart.getTime(), "HH:mm") + " - " + tenez.Date.getDateString(calEnd.getTime(), "HH:mm") + " " + gettext("Uhr ist bereits reserviert") + ".");
    			invalidInput = true;
    		}
        	
			// Check Credit
			if(user.isprepaid && price != 0 && user.getBalance() < price) {
        		form.addMessage(gettext("Sie haben nicht genug Guthaben."));
        		invalidInput = true;        			
    		}
    	 	
        	// Save
            if(!invalidInput) {

        		var reservation = new Reservation(timestart, timeend);
                reservation.user = user;
                this.reservations.add(reservation);
            	
            	tenez.Logger.log({
            		type: "CREATE_RESERVATION",
            		message: "Reservation for " + user.firstname + " " + user.lastname + " (" + user.username  + ") of " + this.court.name + " (" + this.court.location.name + ") on " + tenez.Date.getDateString(timestart.getTime(), "dd.MM.yyyy, HH:mm") + " - " + tenez.Date.getDateString(timeend.getTime(), "HH:mm"),
            		message_de: "Reservierung für " + user.firstname + " " + user.lastname + " (" + user.username  + ") von " + this.court.name + " (" + this.court.location.name + ") für " + tenez.Date.getDateString(timestart.getTime(), "dd.MM.yyyy, HH:mm") + " - " + tenez.Date.getDateString(timeend.getTime(), "HH:mm") + " Uhr"
            	});

    			// Transaction
                var tx = new Transaction(gettext("Reservierung für") + " " + this.court.name + " (" + this.court.location.name + "), " + tenez.Date.getDateString(calStart.getTime(), "dd.MM.yyyy, HH:mm") + " - " + tenez.Date.getDateString(calEnd.getTime(), "HH:mm") + " " + gettext("Uhr"), this.price * -1, discount);
                tx.reservation = reservation;
                user.transactions.add(tx);
                reservation.transaction = tx;
                
                if (discount > 0) {
                    var tx2 = new Transaction(gettext("Rabatt") + " " + gettext("zur Buchungsnr.") + " " + tx._id, Math.abs(tx.price - tx.grossvalue), 1);
                    user.transactions.add(tx2);
                }
                
                tenez.Logger.log({
                    type: "ADD_DEBIT",
                    message: "Added debit for user: " + user.firstname + " " + user.lastname + " (" + user.username  + ") Debit: " + price,
                    message_de: "Abbuchung auf Kundenkonto von " + user.firstname + " " + user.lastname + " (" + user.username  + ") - Betrag: " + price
                });
            	
            	tenez.FormHandler.remove(form);
            	res.redirect(reservation.href("") + "?action=new");
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
