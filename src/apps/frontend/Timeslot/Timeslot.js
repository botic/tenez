/**
 * Checks if the Court and the Location of the Timeslot are active at the moment.
 * @return {Boolean} Returns true if the court AND the location are active
 */
Timeslot.prototype.checkAccess = function() {
    return this.court.active && this.court.location.active;
};