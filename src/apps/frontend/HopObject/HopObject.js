/**
 * Setting the skin directories
 */
HopObject.prototype.onRequest = function() {
    var club = getClubInPath();
    if (club) {
        res.handlers.navigation = club.navigation;
        res.handlers.club       = club;

        var frontend = app.properties["skinDir.frontend"];
        var useragent = req.data["http_browser"];
        if (useragent) {
            if (useragent.indexOf("AppleWebKit/") > 0 && useragent.indexOf("Mobile/") > 0) {
                frontend = app.properties["skinDir.frontend-mobile"];
            }
        }

        if (app.properties["skinDir." + club.alias] != null) {
            res.skinpath = [app.properties["skinDir.base"], app.properties["skinDir." + club.alias], frontend];
        } else {
            res.skinpath = [app.properties["skinDir.base"], frontend];
        }
    } else {
        res.redirect("http://tenez.at");
    }

    if (!this.checkAccess()) {
        if (club) {
            res.redirect(club.href());
        } else {
            res.redirect(root.href());
        }
    }

    if (session.user) {
        if (session.user.canAccess()) {
            res.handlers.frontenduser = session.user;
        } else {
            session.logout();
        }
    }
};

/**
 * Override this function to check the permissions for the given HopObject!
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
HopObject.prototype.checkAccess = function() {
    return true;
};