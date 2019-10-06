/**
 * Overview of the reservation
 * @author Dominik Gruber
 */
Reservation.prototype.main_action = function() {
	
	// Grant users only access to own reservations
	if(!(session.user && session.user._id == this.user._id)) {
		res.redirect(this.user.club.href());
	}
	
	// Cancelation possible?
	res.data.canCancel = ( (new Date().getTime()) < this.timestart.getTime() - (this.user.club.cancelationperiod * 60000) );
	
    res.data.title = gettext("Reservierung") + " - " + this.timeslot.court.name + " - " + this.timeslot.court.location.name;
    res.data.pagetitle = gettext("Reservierung") + (req.data.action && req.data.action == "new" ? "sbestätigung" : "");
    res.data.body = this.renderSkinAsString("mainReservation");
    renderSkin("main");
}

/**
 * Cancels the reservation
 * @author Dominik Gruber
 */
Reservation.prototype.cancel_action = function() {

	// Grant users only access to own reservations and check if cancelation possible
	if(!(session.user && session.user._id == this.user._id && (new Date().getTime()) < this.timestart.getTime() - (this.user.club.cancelationperiod * 60000))) {
		res.redirect(this.user.club.href());
	}
	
	// Form Post
	if(req.isPost()){
        var form = tenez.FormHandler.retrieve();
        
        if(form && form.evaluate()){
            var invalidInput = false;            
            
            if(!invalidInput){
                tenez.FormHandler.remove(form);
                            	
                // Delete Reservation
    			this.cancel();
                
                res.redirect(this.timeslot.court.location.href("") + "?day=" + tenez.Date.getDateString(this.timestart, "dd.MM.yyyy"));
            }
            
            form.keepAlive();
            res.redirect(this.href("cancel"));
         }  
    }
        
    tenez.FormHandler.registerNewForm();
    
    res.data.title = gettext("Reservierung stornieren") + " - " + this.timeslot.court.name + " - " + this.timeslot.court.location.name;    res.data.body = this.renderSkinAsString("cancelReservation");
    renderSkin("main");
}
