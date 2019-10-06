/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
ReportMgr.prototype.checkAccess = function() {
    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
                case "main":            
                case "renderReport":    return session.user.hasPermission("can_view_reports");
                case "customers":       return session.user.hasPermission("can_view_users");
                case "usergroups":      return session.user.hasPermission("can_view_usergroups");
                case "reservations":    return session.user.hasPermission("can_view_bookings");
                case "sales":           return session.user.hasPermission("can_view_bookings");
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for reportmanager"});
    }

    return false;
};