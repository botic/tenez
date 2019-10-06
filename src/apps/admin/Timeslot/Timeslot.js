/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
Timeslot.prototype.checkAccess = function() {
    if (session.user && this.court.active && this.court.location.active) {
        if (session.user.canAccess()) {
            switch(req.action) {
            	case "edit":    		return session.user.hasPermission("can_edit_timeslots");
            	case "delete":    		return session.user.hasPermission("can_delete_timeslots");
            	case "reserve":    		return session.user.hasPermission("can_add_reservations");
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for timeslot " + this._id});
    }
    return false;
};