/**
 * Setting the skin directories
 */
HopObject.prototype.onRequest = function() {
    res.skinpath = [app.properties["skinDir.base"], app.properties["skinDir.admin"]];

    if (req.data.http_browser.indexOf("MSIE 6") > 0 && req.action.indexOf("browsersupport") < 0) {
        res.redirect(root.href("browsersupport"));
    }

    if (!this.checkAccess()) {
        if (getClubInPath() != null) {
            res.redirect(getClubInPath().href());   
        } else {
            res.redirect(root.href());
        }
    }

    if (session.user) {
        res.handlers.adminuser = session.user;
    }

    res.handlers.navigation = root.navigation;
};

/**
 * Override this function to check the permissions for the given HopObject!
 * @return {Boolean} true if the user can access the ressource, false if not. 
 */
HopObject.prototype.checkAccess = function() {
    return true;
};