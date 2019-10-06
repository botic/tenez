/**
 * Creates a new reservation
 * @param timestart {Date} Starting time of the reservation
 * @param timeend {Date} Ending time of the reservation
 * @param transaction {Transaction} Transaction, which belongs to the reservation
 */
Reservation.prototype.constructor = function(timestart, timeend, transaction) {
    if (timestart != null && timeend != null) {
    	this.date = new Date();
    	this.timestart = timestart;
    	this.timeend = timeend;
    	this.transaction = transaction;
    } else {
        throw "Invalid Reservation! Some parts are missing!";
    }
};


/**
 * Deletes the current reservation from the system and give the used credit back to the user
 * @author Dominik Gruber
 */
Reservation.prototype.cancel = function() {
	
	// Add Transaction
    var tx = new Transaction(gettext("Stornierung der Reservierung für") + " " + this.timeslot.court.name + " (" + this.timeslot.court.location.name + "), " + tenez.Date.getDateString(this.timestart, "dd.MM.yyyy, HH:mm") + " - " + tenez.Date.getDateString(this.timeend, "HH:mm") + " " + gettext("Uhr"), this.transaction.price * -1, 0);
    this.user.transactions.add(tx);
    
    tenez.Logger.log({
        type: "ADD_CREDIT",
        message: "Added credit for user: " + this.user.name + " Credit: " + this.transaction.price,
        message_de: "Aufbuchung auf Kundenkonto von " + this.user.name + " - Betrag: " + this.transaction.price
    });

    // Remove Reservation
    tenez.Logger.log({
        type: "DELETE_RESERVATION",
        message: "Deleted reservation of user " + this.user.fullname + " (" + this.user._id + ") for court " + this.timeslot.court.name + ". " + tenez.Date.getDateString(this.timestart) + " - " + tenez.Date.getDateString(this.timeend) + ". " + this.transaction.price + " " + tenez.Money.getCode() + " (" + this.transaction.discount + "% discount)",                    
        message: "Reservierung von " + this.user.fullname + " (" + this.user._id + ") für " + this.timeslot.court.name + " storniert. " + tenez.Date.getDateString(this.timestart) + " - " + tenez.Date.getDateString(this.timeend) + ". " + this.transaction.price + " " + tenez.Money.getCode() + " (" + this.transaction.discount + "% Rabatt)"                   
    });
    
    this.transaction.reservation = null;
    this.remove();
}
