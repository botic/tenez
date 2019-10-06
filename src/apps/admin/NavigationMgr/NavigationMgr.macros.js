/**
 * Checks if a User is logged in or not. This is needed for the "System" section.
 * @return {Boolean} <tt>true</tt> if a user is logged in, <tt>false</tt> if not.
 */
NavigationMgr.prototype.isLoggedIn_macro = function() {
    return session.user != null;
};

/**
 * Renders the app monitor navigation if the User is a SysAdmin.
 * @return {String} Returns the link to the application monitor
 */
NavigationMgr.prototype.appmonitor_macro = function() {
    if (session.user && session.user.isSysAdmin()) {
        return this.renderLink(root.href("appmonitor"), gettext("App-Monitor"));
    }
};

/**
 * Renders the createUser link if the User has the permission and the path contains a club.
 * @return {String} Returns the create user link
 */
NavigationMgr.prototype.createCustomer_macro = function() {
    var club = getClubInPath();

    if (club && session.user && session.user.hasPermission("can_add_users")) {
        return this.renderLink(club.href("createCustomer"), gettext("Kunden hinzufügen"));
    }
};

/**
 * Renders the locations navigation if the User has the permission and the path contains a club.
 * @return {String} Returns the list locations link
 */
NavigationMgr.prototype.listLocations_macro = function() {
    var club = getClubInPath();

    if (club && session.user && session.user.hasPermission("can_view_locations")) {
        return this.renderLink(club.href("listLocations"), gettext("Standortverwaltung"));
    }
};

/**
 * Renders all Locations for a Club if the User has the permission and the path contains a club.
 * @return {String} Returns a list of all locations for a given club
 */
NavigationMgr.prototype.showLocations_macro = function() {
    var club = getClubInPath();
    if (club && session.user && session.user.hasPermission("can_view_locations")) {
        res.push();

        for(var i = 0; i < club.locations.count(); i++) {
            if (club.locations.get(i).active) {
                res.write(this.renderLink(club.locations.get(i).href(), club.locations.get(i).name));   
            }
        }

        return res.pop();
    }
};

/**
 * Renders the user list navigation if the user has the necessary permission and the path contains a club.
 * @return {String} Returns a link to list all users of a given club
 */
NavigationMgr.prototype.listCustomers_macro = function() {
    var club = getClubInPath();
    if (club  && session.user && session.user.hasPermission("can_view_users")) {
        return this.renderLink(club.href("listCustomers"), gettext("Kundenverwaltung"));
    }
};

/**
 * Renders the PDF report navigation if the user has the necessary permission  and the path contains a club.
 * @return {String} Returns a link to list all created reports
 */
NavigationMgr.prototype.reportOverview_macro = function() {
    var club = getClubInPath();
    if (club  && session.user && session.user.hasPermission("can_view_reports")) {
        return this.renderLink(club.reports.href(), gettext("Berichte"));
    }
};

/**
 * Renders the customer-reports navigation if the user has the necessary permission and the path contains a club.
 * @return {String} Returns a link to show the customer reports
 */
NavigationMgr.prototype.reportCustomers_macro = function() {
    var club = getClubInPath();
    if (club  && session.user && session.user.hasPermission("can_view_users") && session.user.hasPermission("can_view_reports")) {
        return this.renderLink(club.reports.href("customers"), gettext("Kundenauswertung"));
    }
};

/**
 * Renders the reservation dot-charts navigation point if the user has the necessary permission and the path contains a club.
 * @return {String} Returns the navigation link of the reservation dot-charts
 */
NavigationMgr.prototype.reportReservations_macro = function() {
    var club = getClubInPath();
    if (club  && session.user && session.user.hasPermission("can_view_bookings") && session.user.hasPermission("can_view_reports")) {
        return this.renderLink(club.reports.href("reservations"), gettext("Reservierungen"));
    }
};

/**
 * Renders the UserGroup navigation if the user has the necessary permission and the path contains a club.
 * @return {String} Returns the navigation link to list all user groups
 */
NavigationMgr.prototype.reportUserGroups_macro = function() {
    var club = getClubInPath();
    if (club  && session.user && session.user.hasPermission("can_view_usergroups") && session.user.hasPermission("can_view_reports")) {
        return this.renderLink(club.reports.href("usergroups"), gettext("Kundengruppen"));
    }
};

/**
 * Renders the overview sales link if the user has the necessary permission and the path contains a club.
 * @return {String} Returns the navigation link to list the sales.
 */
NavigationMgr.prototype.reportSales_macro = function() {
    var club = getClubInPath();
    if (club  && session.user && session.user.hasPermission("can_view_bookings") && session.user.hasPermission("can_view_reports")) {
        return this.renderLink(club.reports.href("sales"), gettext("Umsatzauswertung"));
    }
};

/**
 * Renders the overview newsletter link if the user has the necessary permission and the path contains a club.
 * @return {String} Returns the navigation link to list all newsletters
 */
NavigationMgr.prototype.listNewsletters_macro = function() {
    var club = getClubInPath();
    if (club  && session.user && session.user.hasPermission("can_view_sent_newsletters")) {
        return this.renderLink(club.href("listNewsletters"), gettext("Newsletter"));
    }
};

/**
 * Renders the listUserGroup link if the User has the permission and the path contains a club.
 * @return {String} Returns a link to show all user groups
 */
NavigationMgr.prototype.listUserGroups_macro = function() {
    var club = getClubInPath();

    if (club && session.user && session.user.hasPermission("can_view_usergroups")) {
        return this.renderLink(club.href("listUserGroups"), gettext("Kundengruppen"));
    }
};

/**
 * Renders the listLog link if the User has the permission
 * @return {String} Returns the global-log or the log of the club if the path contains a club 
 */
NavigationMgr.prototype.listLog_macro = function() {
    var club = getClubInPath();

    if (session.user && session.user.hasPermission("can_view_log")) {
        if(club) {
            return this.renderLink(club.href("listLogs"), gettext("Log ansehen"));
        } else {
            return this.renderLink(root.href("listLogs"), gettext("Log ansehen"));
        }
    }
};

/**
 * Renders the sysadmin-home link if the User is a SysAdmin.
 * @return {String} Returns the link to the home of the sys-admin
 */
NavigationMgr.prototype.sysadminHome_macro = function() {
    if (session.user && session.user.isSysAdmin()) {
        return this.renderLink(root.href(), gettext("Admin-Startseite"));
    }
};