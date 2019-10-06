/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
Location.prototype.checkAccess = function() {
    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
                case "main":            return this.active && session.user.hasPermission("can_view_locations") && session.user.hasPermission("can_view_courts");
                case "edit":            return session.user.hasPermission("can_edit_locations");
                case "listCourts":      return this.active && session.user.hasPermission("can_view_courts");
                case "createCourt":     return this.active && session.user.hasPermission("can_add_courts");
                case "deactivate":      return this.active && session.user.isSysAdmin();
                case "activate":        return !this.active && session.user.isSysAdmin();
                case "saveCourtOrder":  if (this.active && session.user.hasPermission("can_edit_courts")) {
                                            return true;
                                        } else {
                                            res.status = 403;
                                            res.abort();
                                        }
                                        break;
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for location " + this.alias});
    }

    return false;
};