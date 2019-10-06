/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
Root.prototype.checkAccess = function() {
    if (req.action == "main" || req.action == "browsersupport" || req.action == "signin" || req.action == "signout" || req.action.startsWith("jala")) {
        return true;
    }

    if (session.user) {
        // Only SysAdmins can access actions of Root
        if (session.user.isSysAdmin()) {
            return true;
        } else {
            tenez.Logger.log({message: "Bad access by user " + session.user.username + " for root"});
        }
    }
    return false;
};

/**
* Returns a filtered collection of all Logs. 
* @param query {String} the term to search.
*/
Root.prototype.filteredLogsCollection = function(query) {
    return Log.getCollection({
        "order": "log_date DESC",
        "filter": query
    });
};