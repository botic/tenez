/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
Court.prototype.checkAccess = function() {
    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
                case "edit":    		return session.user.hasPermission("can_edit_courts");
                case "listTimeslots": 	return this.active && session.user.hasPermission("can_view_timeslots");
                case "createTimeslot": 	return this.active && session.user.hasPermission("can_add_timeslots");
                case "deactivate":      return this.active && session.user.isSysAdmin();
                case "activate":        return !this.active && session.user.isSysAdmin();
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for court " + this.name});
    }
    return false;
};