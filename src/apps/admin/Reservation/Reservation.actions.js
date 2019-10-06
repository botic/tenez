/**
 * Overview of the reservation
 * @author Dominik Gruber
 */
Reservation.prototype.main_action = function() {
    res.data.title = gettext("Reservierung") + " - " + this.timeslot.court.name + " - " + this.timeslot.court.location.name;
    res.data.body = this.renderSkinAsString("mainReservation");
    renderSkin("main");
}

/**
 * Cancels the reservation
 * @author Dominik Gruber
 */
Reservation.prototype.cancel_action = function() {
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
    
    res.data.title = gettext("Reservierung stornieren") + " - " + this.timeslot.court.name + " - " + this.timeslot.court.location.name;
    res.data.body = this.renderSkinAsString("cancelReservation");
    renderSkin("main");
}
