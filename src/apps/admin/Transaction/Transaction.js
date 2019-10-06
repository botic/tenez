/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
Transaction.prototype.checkAccess = function() {
    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
                case "main":        return session.user.hasPermission("can_view_bookings");
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for user " + this.username});
    }
    return false;
};