/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
UserGroup.prototype.checkAccess = function() {
    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
            case "edit":    		return session.user.hasPermission("can_edit_usergroups");
            case "listCustomers":   return session.user.hasPermission("can_view_users");
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for usergroup " + this.name});
    }

    return false;
};