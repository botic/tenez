/**
 * Init Start Overview
 */
Root.prototype.main_action = function() {
    
	res.data.show_init_link = true;
	if(root.addresses.countries.get("AUT") != null && root.addresses.countries.get("AUT").cities.get("3363") != null) {
    	res.data.show_init_link = false;
	}
	
	this.renderSkin("Root");
};


/**
 * Action: Creates Main-Data (Countries, Currencies, Permission, Sysadmin,...)
 * @author Dominik Gruber
 * @member Root
 */

Root.prototype.init_action = function() {
	this.initCountries();
	this.initCurrencies();
	this.initPermissions();
	this.initSysadmin();
	
    res.redirect(this.href());
}

/**
 * Creates Countries with Cities
 * @member Root
 */
Root.prototype.initCountries = function() {
    app.addRepository('modules/helma/File.js');
    var file = new java.io.BufferedReader(new java.io.InputStreamReader(new java.io.FileInputStream("apps/tenez/config/zipcodes-cities-austria.csv"), "UTF-8"));

    // Create Country
    var austria = new Country("AUT", "Österreich");
    root.addresses.countries.add(austria);
    
    // Read Cities from File
    var line;
    do {
        line = file.readLine();
        if (line) {
            var zip = line.substr(0, line.indexOf(";"));
            var name = line.substr(line.indexOf(";") + 1);
            austria.cities.add(new City(zip, name));
            app.debug("Added City " + name);
        }
    } while (line != null);
};

/**
 * Creates some basic Currencies like Euro, Dollar or British Pound.
 * @member Root
 */
Root.prototype.initCurrencies = function() {
    root.currencies.add(new Currency("Euro", "EUR", 1));
    root.currencies.add(new Currency("US-Dollar", "USD", 1.48));
    root.currencies.add(new Currency("Canadian Dollar", "CAD", 1.57));
    root.currencies.add(new Currency("British Pound", "GBP", 0.90));
    root.currencies.add(new Currency("Romanian New Leu", "RON", 4.21));
    root.currencies.add(new Currency("Swiss Franc", "CHF", 1.50));
    root.currencies.add(new Currency("Russian Rouble", "RUB", 43.81));
}

/**
 * Creates roles, permissions
 * @author Manuel Mayrhofer, Dominik Gruber
 * @member Root
 */
Root.prototype.initPermissions = function() {
    
    // Create roles
    var pgSysadmin = new PermissionGroup("Systemadministrator");
    var pgHallenwart = new PermissionGroup("Hallenwart");
    var pgVorstand = new PermissionGroup("Vorstand");
    var pgVerkaeufer = new PermissionGroup("GuthabenVerkaeufer");
    
    // Create permissions
    var can_access_own = new Permission("can_access_own");
    var can_access_all = new Permission("can_access_all");
    var can_edit_club = new Permission("can_edit_club");
    var can_add_club = new Permission("can_add_club");
    var can_delete_club = new Permission("can_delete_club");
    var can_view_locations = new Permission("can_view_locations");
    var can_edit_locations = new Permission("can_edit_locations");
    var can_add_locations = new Permission("can_add_locations");
    var can_delete_locations = new Permission("can_delete_locations");
    var can_view_courts = new Permission("can_view_courts");
    var can_edit_courts = new Permission("can_edit_courts");
    var can_add_courts = new Permission("can_add_courts");
    var can_delete_courts = new Permission("can_delete_courts");
    var can_view_timeslots = new Permission("can_view_timeslots");
    var can_edit_timeslots = new Permission("can_edit_timeslots");
    var can_add_timeslots = new Permission("can_add_timeslots");
    var can_delete_timeslots = new Permission("can_delete_timeslots");
    var can_view_reservations = new Permission("can_view_reservations");
    var can_add_reservations = new Permission("can_add_reservations");
    var can_delete_reservations = new Permission("can_delete_reservations");
    var can_view_sysadmins = new Permission("can_view_sysadmins");
    var can_edit_sysadmins = new Permission("can_edit_sysadmins");
    var can_add_sysadmins = new Permission("can_add_sysadmins");
    var can_delete_sysadmins = new Permission("can_delete_sysadmins");
    var can_view_users = new Permission("can_view_users");
    var can_edit_users = new Permission("can_edit_users");
    var can_add_users = new Permission("can_add_users");
    var can_delete_users = new Permission("can_delete_users");
    var can_view_usergroups = new Permission("can_view_usergroups");
    var can_edit_usergroups = new Permission("can_edit_usergroups");
    var can_add_usergroups = new Permission("can_add_usergroups");
    var can_set_permissiongroup = new Permission("can_set_permissiongroup");
    var can_view_permissiongroups = new Permission("can_view_permissiongroups");
    var can_edit_permissiongroups = new Permission("can_edit_permissiongroups");
    var can_add_permissiongroups = new Permission("can_add_permissiongroups");
    var can_delete_permissiongroups = new Permission("can_delete_permissiongroups");
    var can_view_reports = new Permission("can_view_reports");
    var can_view_sent_newsletters = new Permission("can_view_sent_newsletters");
    var can_send_newsletters = new Permission("can_send_newsletters");
    var can_view_bookings = new Permission("can_view_bookings");
    var can_add_bookings = new Permission("can_add_bookings");
    var can_view_log = new Permission("can_view_log");

    
     // Allocate permissions to role
    pgSysadmin.authorizations.add(new Authorization(can_access_own));
    pgSysadmin.authorizations.add(new Authorization(can_access_all));
    pgSysadmin.authorizations.add(new Authorization(can_edit_club));
    pgSysadmin.authorizations.add(new Authorization(can_add_club));
    pgSysadmin.authorizations.add(new Authorization(can_delete_club));
    pgSysadmin.authorizations.add(new Authorization(can_view_locations));
    pgSysadmin.authorizations.add(new Authorization(can_edit_locations));
    pgSysadmin.authorizations.add(new Authorization(can_add_locations));
    pgSysadmin.authorizations.add(new Authorization(can_delete_locations));
    pgSysadmin.authorizations.add(new Authorization(can_view_courts));
    pgSysadmin.authorizations.add(new Authorization(can_edit_courts));
    pgSysadmin.authorizations.add(new Authorization(can_add_courts));
    pgSysadmin.authorizations.add(new Authorization(can_delete_courts));
    pgSysadmin.authorizations.add(new Authorization(can_view_timeslots));
    pgSysadmin.authorizations.add(new Authorization(can_edit_timeslots));
    pgSysadmin.authorizations.add(new Authorization(can_add_timeslots));
    pgSysadmin.authorizations.add(new Authorization(can_delete_timeslots));
    pgSysadmin.authorizations.add(new Authorization(can_view_reservations));
    pgSysadmin.authorizations.add(new Authorization(can_add_reservations));
    pgSysadmin.authorizations.add(new Authorization(can_delete_reservations));
    pgSysadmin.authorizations.add(new Authorization(can_view_sysadmins));
    pgSysadmin.authorizations.add(new Authorization(can_edit_sysadmins));
    pgSysadmin.authorizations.add(new Authorization(can_add_sysadmins));
    pgSysadmin.authorizations.add(new Authorization(can_delete_sysadmins));
    pgSysadmin.authorizations.add(new Authorization(can_view_users));
    pgSysadmin.authorizations.add(new Authorization(can_edit_users));
    pgSysadmin.authorizations.add(new Authorization(can_add_users));
    pgSysadmin.authorizations.add(new Authorization(can_delete_users));
    pgSysadmin.authorizations.add(new Authorization(can_view_usergroups));
    pgSysadmin.authorizations.add(new Authorization(can_edit_usergroups));
    pgSysadmin.authorizations.add(new Authorization(can_add_usergroups));
    pgSysadmin.authorizations.add(new Authorization(can_set_permissiongroup));
    pgSysadmin.authorizations.add(new Authorization(can_view_permissiongroups));
    pgSysadmin.authorizations.add(new Authorization(can_edit_permissiongroups));
    pgSysadmin.authorizations.add(new Authorization(can_add_permissiongroups));
    pgSysadmin.authorizations.add(new Authorization(can_delete_permissiongroups));
    pgSysadmin.authorizations.add(new Authorization(can_view_reports));
    pgSysadmin.authorizations.add(new Authorization(can_view_sent_newsletters));
    pgSysadmin.authorizations.add(new Authorization(can_send_newsletters));
    pgSysadmin.authorizations.add(new Authorization(can_view_bookings));
    pgSysadmin.authorizations.add(new Authorization(can_add_bookings));
    pgSysadmin.authorizations.add(new Authorization(can_view_log));
    root.usermgr.permissiongroups.add(pgSysadmin);

    pgHallenwart.authorizations.add(new Authorization(can_access_own));
    pgHallenwart.authorizations.add(new Authorization(can_edit_club));
    pgHallenwart.authorizations.add(new Authorization(can_view_locations));
    pgHallenwart.authorizations.add(new Authorization(can_edit_locations));
    pgHallenwart.authorizations.add(new Authorization(can_view_courts));
    pgHallenwart.authorizations.add(new Authorization(can_edit_courts));
    pgHallenwart.authorizations.add(new Authorization(can_view_timeslots));
    pgHallenwart.authorizations.add(new Authorization(can_edit_timeslots));
    pgHallenwart.authorizations.add(new Authorization(can_add_timeslots));
    pgHallenwart.authorizations.add(new Authorization(can_delete_timeslots));
    pgHallenwart.authorizations.add(new Authorization(can_view_reservations));
    pgHallenwart.authorizations.add(new Authorization(can_add_reservations));
    pgHallenwart.authorizations.add(new Authorization(can_delete_reservations));
    pgHallenwart.authorizations.add(new Authorization(can_view_users));
    pgHallenwart.authorizations.add(new Authorization(can_edit_users));
    pgHallenwart.authorizations.add(new Authorization(can_add_users));
    pgHallenwart.authorizations.add(new Authorization(can_view_usergroups));
    pgHallenwart.authorizations.add(new Authorization(can_edit_usergroups));
    pgHallenwart.authorizations.add(new Authorization(can_add_usergroups));
    pgHallenwart.authorizations.add(new Authorization(can_view_reports));
    pgHallenwart.authorizations.add(new Authorization(can_view_sent_newsletters));
    pgHallenwart.authorizations.add(new Authorization(can_send_newsletters));
    pgHallenwart.authorizations.add(new Authorization(can_view_bookings));
    pgHallenwart.authorizations.add(new Authorization(can_add_bookings));
    pgHallenwart.authorizations.add(new Authorization(can_view_log));
    root.usermgr.permissiongroups.add(pgHallenwart);

    pgVorstand.authorizations.add(new Authorization(can_access_own));
    pgVorstand.authorizations.add(new Authorization(can_view_reservations));
    pgVorstand.authorizations.add(new Authorization(can_view_users));
    pgVorstand.authorizations.add(new Authorization(can_view_usergroups));
    pgVorstand.authorizations.add(new Authorization(can_view_reports));
    pgVorstand.authorizations.add(new Authorization(can_view_sent_newsletters));
    pgVorstand.authorizations.add(new Authorization(can_send_newsletters));
    pgVorstand.authorizations.add(new Authorization(can_view_bookings));
    pgVorstand.authorizations.add(new Authorization(can_view_log));
    root.usermgr.permissiongroups.add(pgVorstand);

    pgVerkaeufer.authorizations.add(new Authorization(can_access_own));
    pgVerkaeufer.authorizations.add(new Authorization(can_view_bookings));
    pgVerkaeufer.authorizations.add(new Authorization(can_add_bookings));
    root.usermgr.permissiongroups.add(pgVerkaeufer);
};

/**
 * Creates Sysadmin
 * @member Root
 */
Root.prototype.initSysadmin = function() {
    var city =  root.addresses.countries.get("AUT").cities.get("3363");
    if(!city) {
        throw "Hey, you need A-3363 Ulmerfeld in you database to run Tenez...";
    }

    var contact = new Contact("", "", city, "", "", "", "http://tenez.at");
	var userSysadmin = new User("tenezroot", "tenezroot", "Thomas", "Muster", "", "", false, true, contact, root.usermgr.permissiongroups.get("Systemadministrator"), false);
    
    root.sysadmins.add(userSysadmin);
}