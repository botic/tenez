/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
Reservation.prototype.checkAccess = function() {
    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
        		case "main":    		return session.user.hasPermission("can_view_reservations");
        		case "cancel":    		return session.user.hasPermission("can_delete_reservations");
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for timeslot " + this._id});
    }
    return false;
};
