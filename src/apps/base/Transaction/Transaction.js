/**
 * Creates a new transaction
 * @param action {String} Posting text of the booking
 * @param grossvalue {Number} Original value of the Transaction (Bruttowert)
 * @param discount {Number} discount in percent, [0.0, 1.0]
 * @param reservation {Reservation} Reservation which belongs to the transaction
 */
Transaction.prototype.constructor = function(action, grossvalue, discount, reservation) {
    if (action != null && grossvalue != null && discount != null) {
        if (discount < 0 || discount > 1) {
            throw "Invalid discount!";
        }

        this.date   = new Date();
        this.action = action;
        this.grossvalue = grossvalue;
        this.discount   = discount.toFixed(4);
        this.price      = (grossvalue - (grossvalue * discount)).toFixed(2);
        this.reservation = reservation || null;
    } else {
        throw "Some arguments missing!";   
    }
};

