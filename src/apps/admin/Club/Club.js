/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
Club.prototype.checkAccess = function() {
    if (req.action == "main" || req.action == "signin" || req.action == "signout") {
        return true;
    }

    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
                case "edit":            return session.user.hasPermission("can_edit_club");
                case "listCustomers":   return session.user.hasPermission("can_view_users");
                case "createCustomer":  return session.user.hasPermission("can_add_users");
                case "listLocations":   return session.user.hasPermission("can_view_locations");
                case "createLocation":      return session.user.hasPermission("can_add_locations");
                case "listUserGroups":      return session.user.hasPermission("can_view_usergroups");
                case "createUserGroup":     return session.user.hasPermission("can_add_usergroups");
                case "createNewsletter":    return session.user.hasPermission("can_send_newsletters");
                case "listNewsletters":     return session.user.hasPermission("can_view_sent_newsletters");
                case "importUsers":	        return session.user.isSysAdmin();
                case "exportUsers":	        return session.user.hasPermission("can_view_users");
                case "listLogs":            return session.user.hasPermission("can_view_log");
                case "saveLocationOrder":   if (session.user.hasPermission("can_edit_locations")) {
                                                return true;
                                            } else {
                                                res.status = 403;
                                                res.abort();
                                            }
                                            break;

            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for club " + this.alias});
    }

    return false;
};