/**
 * Shows the main page from tenez (backend).
 */
Root.prototype.main_action = function() {
    // gettext() is to display localized messages!
    res.data.title = gettext("Willkommen!");

    if (!session.user) {
        // Registers a new form at the form handler
        // This also creates a new res.handlers.form with the new form
        tenez.FormHandler.registerNewForm();

        // Renders the sign in skin which also adds the fields to the form handler.
        res.data.body = this.renderSkinAsString("signinUser");
    } else {
        if (!session.user.isSysAdmin()) {
            if (session.user.club) {
                res.redirect(session.user.club.href());
            } else {
                tenez.Logger.log({message: "Bad access by user " + session.user.username});
                session.logout();
                res.redirect(root.href());
            }
        } else {
            var clublist = res.handlers.clublist = new jala.ListRenderer(root.clubs);
            clublist.setPageSize(10);

            var sysadminlist = res.handlers.sysadminlist = new jala.ListRenderer(root.sysadmins);
            sysadminlist.setPageSize(5);

            res.data.body = this.renderSkinAsString("mainRoot");
        }
    }
    
    // Renders the global main skin
    renderSkin("main");
};
/**
 * Shows the appmonitor.
 */
Root.prototype.appmonitor_action = function() {
    res.handlers.runtime = tenez.Logger.getApplicationStats();
    res.handlers.avgstat = tenez.Logger.getAvgStats();

    res.data.title = gettext("Applikationsmonitor");
    res.data.body = this.renderSkinAsString("appmonitor", {appdata: tenez.Logger.getStatsAsJSON()});

    renderSkin("main");
};
/**
 * Signs an system administrator in.
 */
Root.prototype.signin_action = function() {
    // try to retrieve the form handler for the submitted form
    var form = tenez.FormHandler.retrieve();
    if (req.isPost() && form) {
        // check the validators and required fields
        // when evalute() detects errors, it will return false and push
        // all error messages into the internal message buffer.
        if (form.evaluate()) {
            var username = req.data.username;
            var password = req.data.password;

            if (username && password) {
                var toLogin = root.sysadmins.get(username);
                
                if (toLogin && toLogin.active == true) {
                    if (toLogin.password == password) {
                        session.login(toLogin);
                        toLogin.lastlogin = new Date();
                        tenez.Logger.log({
                            type: "SIGNIN",
                            message: "Signin of user: " + username,
                            message_de: "Benutzer im Admin angemeldet: " + username
                        });

                        // remove the old form from the form handler.
                        // this is important to save memory and improve performance!
                        tenez.FormHandler.remove(form);
                        res.redirect(root.href());
                    }
                } else {
                    if (toLogin && !toLogin.active) {
                        form.addMessage(gettext("Ihr Benutzer ist gesperrt."))
                    }
                }
            }
            // if we reach this point, we have to display an error message on the next page.
            form.addMessage(gettext("Benutzer konnte nicht angemeldet werden!"));
        }

        // allows us to retrieve this form after the redirect
        // this is really important, if not, the FormHandler will
        // loose the reference to the current form!
        form.keepAlive();
    }

    // redirect back to the front with the sign in form
    res.redirect(root.href());
};
/**
 * Creates a new club.
 */
Root.prototype.createClub_action = function() {
	if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
		if(form && form.evaluate()) {
			var invalidInput = false;
            var name = req.data.clubname;
            var alias = req.data.alias;
            var street = req.data.street   || "";
            var street2 = req.data.street2 || "";
            var phone = req.data.phone     || "";
            var fax = req.data.fax         || "";
            var email = req.data.email     || "";
            var url = req.data.url         || "";
            var cancelationperiod = req.data.cancelationperiod || 0;
            var reservationperiod = req.data.reservationperiod || 0;
            var showuserinfo = (req.data.showuserinfo == "true") || false;

            var otherclub = root.clubs.get(alias);
            if(otherclub) {
            	form.addMessage(gettext("Ein Verein mit diesem Alias existiert bereits."));
            	invalidInput = true;   
            }
            
            var city = null;
            if (req.data.zipcityvalue > 0) {
                var country = root.addresses.countries.get(req.data.country);
                if (!country) {
                    throw "Invalid call of createClub!";
                }

                var city = country.cities.getById(req.data.zipcityvalue);
                if (!city) {
                    throw "Invalid call of createClub!";
                }
            }

            var contact = new Contact(street, street2, city, phone, fax, email, url);
            var currency = root.currencies.get(req.data.currency);

            if (!currency) {
                throw "Invalid call! No currency set!";
            }

            var timezone = req.data.timezone;
            if (!timezone) {
                throw "Invalid call! No timezone set!";
            }
            
            if(!invalidInput) {
	            var club = new Club(name, alias, contact, currency, timezone, showuserinfo, cancelationperiod, reservationperiod, true);
	            root.clubs.add(club);
	            tenez.FormHandler.remove(form);
	            res.redirect(club.href());
            }
		}
		form.keepAlive();
	}

    // Registers a new form at the form handler
    // This also creates a new res.handlers.form with the new form
    tenez.FormHandler.registerNewForm();		
		
	// gettext() is to display localized messages!
	res.data.title = gettext("Verein anlegen");	

    // Renders the createclub skin which also adds the fields to the form handler.
	res.data.body = this.renderSkinAsString("createClub");
	
	// Renders the global main skin
	renderSkin("main");

};
/**
 * Creates a new system administrator.
 */
Root.prototype.createSysadmin_action = function() {
	if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
		if(form && form.evaluate()) {
            var username    = req.data.username;
            var password1   = req.data.password1;
            var password2   = req.data.password2;
            var title       = req.data.title;
            var firstname   = req.data.firstname;
            var lastname    = req.data.lastname;
            var company     = req.data.company;
            var iscompany   = (req.data.iscompany == "true" ? true : false);
            var street      = req.data.street;
            var street2     = req.data.street2;
            var phone       = req.data.phone;
            var fax         = req.data.fax;
            var email       = req.data.email;
            var url         = req.data.url;

            var city = null;
            if (req.data.zipcityvalue > 0) {
                var country = root.addresses.countries.get(req.data.country);
                if (!country) {
                    throw "Invalid call of createSysadmin!";
                }

                var city    = country.cities.getById(req.data.zipcityvalue);
                if (!city) {
                    throw "Invalid call of createSysadmin!";
                }
            }
            var contact = new Contact(street, street2, city, phone, fax, email, url);

            if (password1 != "") {
                if (password1 == password2) {
                    if (root.sysadmins.get(username) != null) {
                        form.addMessage(gettext("Benutzername existiert bereits!"));
                    } else {
                        if (password1.length < 5) {
                            form.addMessage(gettext("Passwort für einen Systemadministrator muss min. 5 Zeichen lang sein!"));
                        } else {
                            var user = new User(username, password1, firstname, lastname, title, company, iscompany, true, contact, root.getSysAdminPermissionGroup(), false);

                            root.sysadmins.add(user);

                            tenez.Logger.log({
                                type: "CREATE_SYSADMIN",
                                message: "Create Sysadmin: " + username,
                                message_de: "Systemadministrator hinzgefügt: " + username
                            });
                            tenez.FormHandler.remove(form);
                            res.redirect(user.href());
                        }
                    }
                } else {
                    form.addMessage(gettext("Die Passwörter stimmen nicht überein!"));
                }
            } else {
            	form.addMessage(gettext("Bitte geben Sie ein Passwort an."));
            }

		}
		form.keepAlive();
        res.redirect(root.href("createSysadmin"));
	}

    // Registers a new form at the form handler
    // This also creates a new res.handlers.form with the new form
    tenez.FormHandler.registerNewForm();

	// gettext() is to display localized messages!
	res.data.title = gettext("Systemadministrator anlegen");

    // Renders the createclub skin which also adds the fields to the form handler.
	res.data.body = this.renderSkinAsString("createSysadmin");

	// Renders the global main skin
	renderSkin("main");

};
/**
 * Signs an system administrator out.
 */
Root.prototype.signout_action = function() {
    
    //only logout if the user is logged in
    if(session.user){
        tenez.Logger.log({
            type: "SIGNOUT",
            message: "Sign out of user: " + session.user.username,
            message_de: "Benutzer im Admin abgemeldet: " + session.user.username
        });
        session.logout();
    }
    
    res.redirect(root.href());
};

/**
 * Shows the system administrator log.
 */
Root.prototype.listLogs_action = function() {
    var filter = [], urlParams = [];
    var filterString = "";
    

    if(req.data.filter_user){
        urlParams.push("filter_user=1");
        filter.push("(lower(log_value) LIKE '%type%:%create_user%') OR (lower(log_value) LIKE '%type%:%edit_user%') OR (lower(log_value) LIKE '%type%:%delete_user%')" +
        		" OR (lower(log_value) LIKE '%type%:%create_usergroup%') OR (lower(log_value) LIKE '%type%:%edit_usergroup%') OR (lower(log_value) LIKE '%type%:%delete_usergroup%')");
    }

    if(req.data.filter_login){
        urlParams.push("filter_login=4");
        filter.push("(lower(log_value) LIKE '%type%:%signin%') OR (lower(log_value) LIKE '%type%:%signout%')");
    }

    if(req.data.filter_booking){
        urlParams.push("filter_booking=3");
        filter.push("(lower(log_value) LIKE '%type%:%add_credit%') OR (lower(log_value) LIKE '%type%:%add_debit%')" +
        		" OR (lower(log_value) LIKE '%type%:%add_reservation%') OR (lower(log_value) LIKE '%type%:%delete_reservation%')");
    }

    if(req.data.filter_club){
        urlParams.push("filter_club=2");
        filter.push("(lower(log_value) LIKE '%type%:%create_club%') OR (lower(log_value) LIKE '%type%:%edit_club%') OR (lower(log_value) LIKE '%type%:%delete_club%')" +
        		" OR (lower(log_value) LIKE '%type%:%create_location%') OR (lower(log_value) LIKE '%type%:%edit_location%') OR (lower(log_value) LIKE '%type%:%delete_location%')" +
        		" OR (lower(log_value) LIKE '%type%:%create_court%') OR (lower(log_value) LIKE '%type%:%edit_court%') OR (lower(log_value) LIKE '%type%:%delete_court%')" +
        		" OR (lower(log_value) LIKE '%type%:%create_timeslot%') OR (lower(log_value) LIKE '%type%:%edit_timeslot%') OR (lower(log_value) LIKE '%type%:%delete_timeslot%')");
    }

    if (filter.length > 0) {
        filterString = filter.join(" AND ");
    }
    
    if(!req.data.filter_booking && !req.data.filter_club && !req.data.filter_user && !req.data.filter_login) {
        filterString = "1=2";
    }

    var loglist = res.handlers.loglist = new jala.ListRenderer(this.filteredLogsCollection(filterString));
    loglist.setPageSize(10);
    loglist.setUrlParameters(urlParams.join("&"));
        
    res.data.body = this.renderSkinAsString("listLogs", {'isPost': req.isPost()});
    res.data.title = gettext("Log ansehen"); 

    renderSkin("main");
};
/**
 * Shows the error page if the browser is not supported.
 */
Root.prototype.browsersupport_action = function() {
    res.data.body  = renderSkinAsString("main#browsersupport");
    res.data.title = gettext("Browser wird nicht unterstützt"); 

    renderSkin("main");
};