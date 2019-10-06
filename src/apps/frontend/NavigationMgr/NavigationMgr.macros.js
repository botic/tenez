/**
 * Checks if a User is logged in or not. This is needed for the "System" section.
 * @return {Boolean} <tt>true</tt> if a user is logged in, <tt>false</tt> if not.
 */
NavigationMgr.prototype.isLoggedIn_macro = function() {
    return session.user != null;
};

/**
 * Renders the sign in or sign out link in the navigation.
 * @return {String} Returns the sign in link if the user is not logged in 
 */
NavigationMgr.prototype.toggleSignin_macro = function() {
    if (session.user && session.user.canAccess()) {
        return html.linkAsString({"href": session.user.href()}, gettext("Kontostand"));
    } else {
        return html.linkAsString({"href": this._parent.href("signin")}, gettext("Anmelden"));
    }
};

/**
 * Renders the profile or register link in the navigation.
 * @return {String} Returns the register link if the user is not logged in
 */
NavigationMgr.prototype.toggleRegister_macro = function() {
    if (session.user && session.user.canAccess()) {
        return html.linkAsString({"href": session.user.href("edit")}, gettext("Kundendaten"));
    } else {
        return html.linkAsString({"href": this._parent.href("register")}, gettext("Registrieren"));
    }
};
