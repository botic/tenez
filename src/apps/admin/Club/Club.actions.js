/**
 * Shows the main page from a club
 */
Club.prototype.main_action = function() {
    // gettext() is to display localized messages!
    res.data.title = gettext("Willkommen beim") + " " + this.name;

    if (!session.user) {
        // Registers a new form at the form handler
        // This also creates a new res.handlers.form with the new form
        tenez.FormHandler.registerNewForm();

        // Renders the sign in skin which also adds the fields to the form handler.
        res.data.body = this.renderSkinAsString("signinUser");
    } else {
        if (session.user.canAccess()) {
            var transactionlist = res.handlers.transactionlist = new jala.ListRenderer(this.getTransactions(15));
            var reservationlist = res.handlers.reservationlist = new jala.ListRenderer(this.getReservations(15));
            var loglist = res.handlers.loglist = new jala.ListRenderer(this.getCustomerLogs(25));

            transactionlist.setPageSize(15);
            reservationlist.setPageSize(15);
            loglist.setPageSize(25);

            res.data.body = this.renderSkinAsString("mainClub");
        } else {
            tenez.Logger.log({message: "Bad access by user " + session.user.username + " for club " + this.name});

            if (session.user.club) {
                res.redirect(session.user.club.href());
            } else {
                root.href();
            }
        }
    }

    // Renders the global main skin
    renderSkin("main");
};

/**
 * Signs a administrator in.
 */
Club.prototype.signin_action = function() {
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
                var toLogin = this.users.get(username.toLowerCase());

                if (toLogin && toLogin.active == true) {
                    if (toLogin.password.toLowerCase() == password.toLowerCase()) {
                        session.login(toLogin);
                        toLogin.lastlogin = new Date();

                        tenez.Logger.log({
                            type: "SIGNIN",
                            message: "Sign in of user: " + username,
                            message_de: "Benutzer im Admin angemeldet: " + username
                        });
                        // remove the old form from the form handler.
                        // this is important to save memory and improve performance!
                        tenez.FormHandler.remove(form);
                        res.redirect(this.href());
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
    res.redirect(this.href());
};

/**
 * Signs a logged administrator out 
 */
Club.prototype.signout_action = function() {

    //only logout if the user is logged in
    if(session.user){
        tenez.Logger.log({
            type: "SIGNOUT",
            message: "Sign out of user: " + session.user.username,
            message_de: "Benutzer im Admin abgemeldet: " + session.user.username
        });
        session.logout();
    }

    res.redirect(this.href());
};

/**
 * Creates a new Customer for the club.
 */
Club.prototype.createCustomer_action = function() {
	if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var username    = req.data.username;
            var title       = req.data.title;
            var firstname   = req.data.firstname;
            var lastname    = req.data.lastname;
            var isprepaid   = (req.data.isprepaid == "true" ? true : false);
            var company     = req.data.company;
            var iscompany   = (req.data.iscompany == "true" ? true : false);
            var street      = req.data.street;
            var street2     = req.data.street2;
            var phone       = req.data.phone;
            var fax         = req.data.fax;
            var email       = req.data.email;
            var url         = req.data.url;

            if (this.users.get(username)) {
                form.addMessage(gettext("Benutzer existiert bereits!"));
            } else {
                var city = null;
                if (req.data.zipcityvalue > 0) {
                    var country = root.addresses.countries.get(req.data.country);
                    if (!country) {
                        throw "Invalid call of createCustomer!";
                    }

                    city = country.cities.getById(req.data.zipcityvalue);
                    if (!city) {
                        throw "Invalid call of createCustomer!";
                    }
                }
                var contact = new Contact(street, street2, city, phone, fax, email, url);

                var pincode = tenez.Util.generatePin(5);
                var user = new User(username, pincode, firstname, lastname, title, company, iscompany, true, contact, null, isprepaid);

                if (req.data["usergroup_array"] && req.data["usergroup_array"].length > 0) {
                    for (var i = 0; i < req.data["usergroup_array"].length; i++) {
                        var group = this.usergroups.getById(req.data["usergroup_array"][i]);
                        if (group) {
                            user.addUserGroupMembership(group);
                        } else {
                            throw "Invalid usergroup: " + req.data["usergroup_array"][i];
                        }
                    }
                }

                if (req.data.permissiongroup && session.user.hasPermission("can_set_permissiongroup")) {
                    var pgroup = root.usermgr.permissiongroups.getById(req.data.permissiongroup);
                    if (pgroup != null) {
                        user.permissiongroup = pgroup;
                    }
                }

                this.users.add(user);
                tenez.Logger.log({
                    type: "CREATE_USER",
                    message: "Created new user: " + user.username,
                    message_de: "Neuen Benutzer angelegt: " + user.username + " (" + user.firstname + " " + user.lastname +")"
                });
                tenez.FormHandler.remove(form);
                res.redirect(user.href());
            }
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("createCustomer"));
	}

    // Registers a new form at the form handler
    // This also creates a new res.handlers.form with the new form
    tenez.FormHandler.registerNewForm();

    // gettext() is to display localized messages!
    res.data.title = gettext("Kunden anlegen");

    // Renders the createclub skin which also adds the fields to the form handler.
    res.data.body = this.renderSkinAsString("createCustomer");

    // Renders the global main skin
    renderSkin("main");
};

/**
 * Edits the club and saves the new data.
 */
Club.prototype.edit_action = function() {
	if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
		if(form && form.evaluate()) {
            var name = req.data.clubname;
            var street = req.data.street   || "";
            var street2 = req.data.street2 || "";
            var phone = req.data.phone     || "";
            var fax = req.data.fax         || "";
            var email = req.data.email     || "";
            var url = req.data.url         || "";
            var cancelationperiod = req.data.cancelationperiod || 1440;
            var reservationperiod = req.data.reservationperiod || 1440;
            var showuserinfo = (req.data.showuserinfo == "true") || false;

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

            this.contact.street = street;
            this.contact.street2 = street2;
            this.contact.city = city;
            this.contact.phone = phone;
            this.contact.fax = fax;
            this.contact.email = email;
            this.contact.url = url;

            var timezone = req.data.timezone;
            if (!timezone) {
                throw "Invalid call! No timezone set!";
            }

            this.name = name;
            this.timezone = timezone;
            this.showuserinfo = showuserinfo;
            this.cancelationperiod = cancelationperiod;
            this.reservationperiod = reservationperiod;

            tenez.FormHandler.remove(form);
            tenez.Logger.log({
                type: "EDIT_CLUB",
                message: "Edited club: " + this.alias,
                message_de: "Club bearbeitet: " + this.name + " (" + this.alias + ")"
            });
            res.redirect(this.href());
		}
		if (form) {
            form.keepAlive();
        }
	}

    // Registers a new form at the form handler
    // This also creates a new res.handlers.form with the new form
    tenez.FormHandler.registerNewForm();

	// gettext() is to display localized messages!
	res.data.title = gettext("Verein bearbeiten");

    // Renders the createclub skin which also adds the fields to the form handler.
	res.data.body = this.renderSkinAsString("editClub");

	// Renders the global main skin
	renderSkin("main");

};

/**
 * Sends a newsletter (email) to selected users (all or a usergroup)
 * and saves it in the archive.
 */
Club.prototype.createNewsletter_action = function() {
	if (req.isPost()) {
    //FIXME: timezone anpassen
        var form = tenez.FormHandler.retrieve();

        if(form && form.evaluate()) {
            var subject = req.data.header;
            var body = req.data.textarea;
            var date = new Date();
            var receiverArray = [];
            var validInput = true;

            if (!this.contact.email.isEmail()) {
                validInput = false;
                form.addMessage("Bitte zuerst beim Club eine E-Mail-Adresse hinterlegen!");
            }

            //send to all members
            if (req.data.allmembers == "true") {
                this.newsletters.add(newsletterNew);
                for (var i = 0; i < this.users.count(); i++) {
                    user = this.users.get(i);

                    if ((user.contact != null) && (user.contact.email != "")) {
                        receiverArray.push(user);
                    }
                }
            } else {
                if (req.data["usergroup_array"] && req.data["usergroup_array"].length > 0) {
                    //else, get the group(s) and members of this group
                    var userIngroupFilter = [];

                    for (var i = 0; i < req.data["usergroup_array"].length; i++) {
                        var group = this.usergroups.getById(req.data["usergroup_array"][i]);
                        if (group) {
                            for (var u = 0; u < this.users.count(); u++) {
                                user = this.users.get(u);

                                if(user.isMemberOfUsergroup(group) && user.contact != null && user.contact.email != "") {
                                    //if a user is member of >1 groups
                                    if(userIngroupFilter.indexOf(user.username)== -1) {
                                        userIngroupFilter.push(user.username);
                                        receiverArray.push(user);
                                    }
                                }
                            }
                        } else {
                            throw "Invalid usergroup: " + req.data["usergroup_array"][i];
                        }
                    }
                } else {
                    form.addMessage("Kein Empfänger ausgewählt!");
                    validInput = false;
                }
            }

            if (validInput) {
                var newsletterNew = new Newsletter(subject, body, session.user, this, date);
                this.newsletters.add(newsletterNew);

                for (var i = 0; i < receiverArray.length; i++){
                    var receiverUser = receiverArray[i];
                    newsletterNew.receivers.add(new NewsletterReceiver(receiverUser));

                    var mail = new helma.Mail();
                    mail.setFrom(this.contact.email, this.name);
                    mail.setSubject(req.data.header);
                    mail.addText(req.data.textarea);
                    mail.setTo(receiverUser.contact.email, receiverUser.fullname());
                    if (app.properties["debugMode"] == "true" || app.properties["debugMode"] == true) {
                        var directory = new helma.File(app.properties["debugDir"]);
                        if (directory.isDirectory()) {
                            app.log("Write e-mail into " + directory.getAbsolutePath() + " to user: " + receiverUser.contact.email);
                            mail.writeToFile(directory);
                        } else {
                            // write into temp dir of the operation system
                            app.log("Write mail into /tmp to user: " + receiverUser.contact.email);
                            mail.writeToFile();
                        }
                    } else {
                        mail.send();
                    }
                }

                tenez.FormHandler.remove(form);
                res.redirect(this.href("listNewsletters"));
            }
        }
		if (form) {
			form.keepAlive();
		}

		res.redirect(this.href("createNewsletter"));
	}
	
	
	// Registers a new form at the form handler
    // This also creates a new res.handlers.form with the new form
    tenez.FormHandler.registerNewForm();

	// gettext() is to display localized messages!
	res.data.title = gettext("Newsletter versenden");

    // Renders the createclub skin which also adds the fields to the form handler.
	res.data.body = this.renderSkinAsString("createNewsletter");

	// Renders the global main skin
	renderSkin("main");
};

/**
 * Lists all sent newsletters.
 */
Club.prototype.listNewsletters_action = function() {
	var newsletterlist = res.handlers.newsletterlist = new jala.ListRenderer(this.newsletters);
	newsletterlist.setPageSize(4);
	 
	// gettext() is to display localized messages!
	res.data.title = gettext("Newsletter");
	res.data.body = this.renderSkinAsString("listNewsletters");
	
	// Renders the global main skin
	renderSkin("main");
};

/**
 * Lists all user groups from the club.
 */
Club.prototype.listUsergroups_action = function() {
	
    // Renders the listUersgroups skin if the user has the permission to.
	if(session.user && session.user.hasPermission("can_view_usergroups")) {
	res.data.body = this.renderSkinAsString("listUsergroups");
	}
	// Renders the global main skin
	renderSkin("main");
};

/**
 * Imports users from a csv-file if the file is correct.
 */
Club.prototype.importUsers_action = function() {
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        var list = req.data.userlist;
        var file = list.getInputStream();
        //It can also be an excel file because windows saves csv files automaticaly as excel files
        try {	
        	
        	if(form && file != null) {
                var reader = new java.io.BufferedReader(new java.io.InputStreamReader(file, "utf-8"));
                //Check if the csv format is right! just == or String.equals with the hole readLine doesn't work
                //because there are some unexpected chars in front of each userdata!
                var columnnames = reader.readLine().split(";");
                var truecolumnnames = new Array('username','title','firstname','lastname','company','iscompany','street','street2','country','city','phone','fax','email','url','isprepaid');
                var errormsg = "Die Syntax der CSV-Datei ist ungültig.";
                if(columnnames.length == 15) {    
                	for(var i = 0; i < columnnames.length; i++) {
                		if(!columnnames[i].endsWith(truecolumnnames[i])) {
                			throw errormsg;
                		}
                	}
                } else {
                	throw errormsg;
                }
                
                var line;
                //count rows to use them for better error and warning messages
                var rows = 2;
                var brokenlines = 0;
                var userarray = new Array();
                //read each line and save as a Customer
                while((line = reader.readLine()) != null) {
                	var dataobj;
                    //check if there exists 15 data for each customerline
                    if((dataobj = line.split(";")).length == 15) {
                        //save each customer data to a variable named as the specified data
                        var username = dataobj[0];
                        var title = dataobj[1];
                        var firstname = dataobj[2];
                        var lastname = dataobj[3];
                        var company = dataobj[4];
                        var iscompany = (dataobj[5] == "true" ? true : false);
                        var street = dataobj[6];
                        var street2 = dataobj[7];
                        var country = dataobj[8];
                        var zipcity = dataobj[9];
                        var phone = dataobj[10];
                        var fax = dataobj[11];
                        var email = dataobj[12];
                        var url = dataobj[13];
                        var isprepaid = (dataobj[14] == "true" ? true : false);

                        if(username == "") {
                            throw "Kein Benutzername in Zeile "+rows+". Dieser wird verpflichtend benötigt.";
                        }
                        //validate all data from the CSV Input!
                        //validate username
                        var validator = tenez.FormHandler.VALIDATORS['username'];
                        if (!validator(username)) {
                            throw "Ungültiger Benutzername in Zeile "+rows;
                        }

                        //validate phone if exists
                        if(phone != "") {
                            var validator = tenez.FormHandler.VALIDATORS['phone'];
                            if (!validator(phone)) {
                                throw "Ungültige Telefonnummer in Zeile "+rows;
                            }
                        }

                        //validate fax if exists
                        if(fax != "") {
                            var validator = tenez.FormHandler.VALIDATORS['phone'];
                            if (!validator(fax)) {
                                throw "Ungültige Faxnummer in Zeile "+rows;
                            }
                        }

                        //validate email if exists
                        if(email != "") {
                            var validator = tenez.FormHandler.VALIDATORS['email'];
                            if (!validator(email)) {
                                throw "Ungültige E-Mail Adresse in Zeile "+rows;
                            }
                        }

                        //validate url if exists
                        if(email != "") {
                            var validator = tenez.FormHandler.VALIDATORS['url'];
                            if (!validator(url)) {
                                throw "Ungültige Webseite in Zeile "+rows;
                            }
                        }

                        //check if username already exists and get the city and country object and create a new contact
                        if (this.users.get(username)) {
                        	throw "Der Kunde mit dem Benutzernamen \"" + username + "\" existiert bereits";
                        } else {
                            var city = null;
                            if (zipcity > 0) {
                                var country = root.addresses.countries.get(country);
                                if (!country) {
                                    throw "Ungültiger Ländercode in Zeile "+rows;
                                }

                                city = country.cities.get(zipcity);
                                if (!city) {
                                    throw "Ungültige PLZ in Zeile "+rows;
                                }
                            }
                            //if there exist some value then an exception has to be thrown.
                            else if(zipcity != "" || country != "") {
                                throw "Ungültige Stadt/Land Kombination in Zeile "+rows;
                            }

                            var contact = new Contact(street, street2, city, phone, fax, email, url);

                            var pincode = tenez.Util.generatePin(5);

                            var user = new User(username, pincode, firstname, lastname, title, company, iscompany, true, contact, null, isprepaid);
                            //push user in an array, if there are no exception then all users in the array will be persist at the end.
                            userarray.push(user);
                        }
                    }
                    //count lines with less then 15 columns! This lines are broken.
                    else {
                        //if there is just an extra linebreak dont count it as failure
                        if(!(dataobj.length <= 1)) {
                            brokenlines++;
                        }
                        else {
                            rows--;
                        }
                    }
                    rows++;
                }
                if(brokenlines > 0) {
                    rows = rows-1;
                    throw "Fehler: "+brokenlines+" von "+rows+" Zeilen waren ungültig! Bitte überprüfen Sie die CSV-Datei.";
                }
                //Now save all Users into the database
                for(var i = 0; i < userarray.length; i++) {
                    this.users.add(userarray[i]);
                }
                tenez.FormHandler.remove(form);
            }
            }
            catch(e) {
                form.addMessage(gettext("Der Import wurde nicht durchgeführt:") + " " + gettext(e));
            }
            finally {
                file.close();
            }

        if (form) {
            form.keepAlive();
        }

        res.redirect(this.href("importUsers"));
    }

    tenez.FormHandler.registerNewForm();
    res.data.title = gettext("Kundenliste importieren");
    res.data.body = this.renderSkinAsString("importUserlist");
	renderSkin("main");
};

/**
 * Exports all users as a csv-file.
 */
Club.prototype.exportUsers_action = function() {
    if(req.isGet()) {
	
	if (session.user && session.user.hasPermission("can_view_users")) {

        res.contentType='text/csv; charset=utf-8';
        res.addHeader('Content-Disposition', 'attachment; filename="Kundenliste.csv"');
        	
        res.writeln('username;title;firstname;lastname;company;iscompany;street;street2;country;city;phone;fax;email;url;isprepaid');         	
        
        var userlist = this.filteredCustomerCollection(req.data["switcher"], req.data["query"]);
        for(var i = 0; i < userlist.count(); i++) {        	
        	var user = userlist.get(i);
        	
        	var username = user.username;
        	var title = user.title;
        	var firstname = user.firstname;
        	var lastname = user.lastname;
        	var company = user.company;
        	var iscompany = user.iscompany;
        	var street = user.contact.street;
        	var street2 = user.contact.street2;
        		
        	//city object can be null
        	if(user.contact.city != null) {
        		var country = user.contact.city.country.code;
        		var city = user.contact.city.zip;
        	}
        	else {
        		var country = "";
        		var city = "";
        	}
        		
        	var phone = user.contact.phone;
        	var fax = user.contact.fax;
        	var email = user.contact.email;
        	var url = user.contact.url;
        	var isprepaid = user.isprepaid;
        	res.writeln(username+';'+title+';'+firstname+';'+lastname+';'+company+';'+iscompany+';'+street+';'+street2+';'+country+';'+city+';'+phone+';'+fax+';'+email+';'+url+';'+isprepaid);
        	}

    	}
    }
};

/**
 * Creates a new location for the club.
 */
Club.prototype.createLocation_action = function() {
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var name        = req.data.name;
            var alias        = req.data.alias;
            var description = req.data.description;
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
                    throw "Invalid call of createLocation!";
                }

                city = country.cities.getById(req.data.zipcityvalue);
                if (!city) {
                    throw "Invalid call of createLocation!";
                }
            }

            var contact  = new Contact(street, street2, city, phone, fax, email, url);
            var location = new Location(name, this.locations.getAccessName(alias), description, contact, this.locations.count(), true);
            this.locations.add(location);

            tenez.Logger.log({
                type: "CREATE_LOCATION",
                message: "Created location: " + alias,
                message_de: "Neuen Standort hinzugefügt: " + name + " (" + location.alias + ")"
            });
            tenez.FormHandler.remove(form);
            res.redirect(location.href());
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("createLocation"));
    }

    tenez.FormHandler.registerNewForm();

	res.data.title = gettext("Standort hinzufügen");
    res.data.body = this.renderSkinAsString("createLocation");
    renderSkin("main");
};

/**
 * Lists all customers from the club.
 */
Club.prototype.listCustomers_action = function() {
    var switcher, query = "";
    if (req.queryParams["customerquery"]) {
        query = req.queryParams["customerquery"];

        var index = query.indexOf(":");
        if (index > 0) {
            switcher = query.substring(0, index).toLowerCase();
            query    = query.substring(index + 1); 
        }

        query = encodeForm(query.toLowerCase());

        switch (switcher) {
            case gettext("firma"):          switcher = "company"; break;
            case gettext("vorname"):        switcher = "firstname"; break;
            case gettext("nachname"):
            case gettext("familienname"):   switcher = "lastname"; break;
            case gettext("benutzer"):
            case gettext("benutzername"):   switcher = "username"; break;
            case gettext("strasse"):
            case gettext("straße"):         switcher = "street"; break;
            case gettext("plz"):
            case gettext("postleitzahl"):   switcher = "zip"; break;
            case gettext("ort"):
            case gettext("wohnort"):        switcher = "city"; break;
            case gettext("telefon"):        switcher = "phone"; break;
            case gettext("fax"):            switcher = "fax"; break;
            case gettext("email"):
            case gettext("mail"):           switcher = "email"; break;
            case gettext("url"):
            case gettext("webseite"):       switcher = "url"; break;
        }

    }

    var userlist = res.handlers.userlist = new jala.ListRenderer(this.filteredCustomerCollection(switcher, query));
    if (req.queryParams["customerquery"]) {
        userlist.setUrlParameters("customerquery="+req.queryParams["customerquery"]);
    }
    userlist.setPageSize(10);
    res.data.body = this.renderSkinAsString("listCustomers", {filter: {'query': query, 'switcher': switcher}});

    res.data.title = gettext("Kundenverwaltung");
    renderSkin("main");
};

/**
 * Creates a new user group for the club .
 */
Club.prototype.createUserGroup_action = function() {
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if (req.data.discount) {
           req.data.discount = req.data.discount.replace(",", ".");                
        }

        if(form && form.evaluate()) {
            var name        = req.data.name;
            var description = req.data.description;
            var discount    = parseFloat(req.data.discount) / 100;

            var ugp = new UserGroup(name, description, discount)
            this.usergroups.add(ugp);

            tenez.FormHandler.remove(form);

            tenez.Logger.log({
                type: "CREATE_USERGROUP",
                message: "Created user group: " + name,
                message_de: "Neue Kundengruppe: " + name
            });
            res.redirect(this.href("listUserGroups"));
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("createUserGroup"));
    }

    tenez.FormHandler.registerNewForm();

	res.data.title = gettext("Kundengruppe hinzufügen");
    res.data.body = this.renderSkinAsString("createUserGroup");
    renderSkin("main");
};

/**
 * Lists all user groups from the club.
 */
Club.prototype.listUserGroups_action = function() {
    var usergrouplist = res.handlers.usergrouplist = new jala.ListRenderer(this.usergroups);
    usergrouplist.setPageSize(10);
    res.data.body = this.renderSkinAsString("listUserGroups");

    res.data.title = gettext("Kundengruppen");
    renderSkin("main");
};

/**
 * Lists all locations from the club.
 */
Club.prototype.listLocations_action = function() {
    var locationlist = res.handlers.locationlist = new jala.ListRenderer(Location.getCollection({
        filter: "loc_club = '" + this._id + "' and loc_active = true"
    }));
    locationlist.setPageSize(this.locations.count() + 1);

    var deactivatedLocations = Location.getCollection({
        filter: "loc_club = '" + this._id + "' and loc_active = false"
    });
    var deactivatedlocationlist = res.handlers.deactivatedlocationlist = new jala.ListRenderer(deactivatedLocations);
    deactivatedlocationlist.setPageSize(deactivatedLocations.count() + 1);

    res.data.body = this.renderSkinAsString("listLocations");
    res.data.title = gettext("Standortverwaltung");
    renderSkin("main");
};

/**
 * Lists the club-log.
 */
Club.prototype.listLogs_action = function() {
    var filter = [], urlParams = [];
    var filterString = "";
    
    filter.push("log_club = '" + this._id + "'")
    
    if(req.data.filter_user){
        urlParams.push("filter_user=1");
        filter.push("(lower(log_value) LIKE '%type%:%create_user%') OR (lower(log_value) LIKE '%type%:%edit_user%') OR (lower(log_value) LIKE '%type%:%delete_user%')" +
                " OR (lower(log_value) LIKE '%type%:%create_usergroup%') OR (lower(log_value) LIKE '%type%:%edit_usergroup%') OR (lower(log_value) LIKE '%type%:%delete_usergroup%')");
    }

    if(req.data.filter_booking){
        urlParams.push("filter_booking=2");
        filter.push("(lower(log_value) LIKE '%type%:%add_credit%') OR (lower(log_value) LIKE '%type%:%add_debit%')" +
                " OR (lower(log_value) LIKE '%type%:%add_reservation%') OR (lower(log_value) LIKE '%type%:%delete_reservation%')");
     }

    if(req.data.filter_club){
        urlParams.push("filter_club=3");
        filter.push("(lower(log_value) LIKE '%type%:%create_club%') OR (lower(log_value) LIKE '%type%:%edit_club%') OR (lower(log_value) LIKE '%type%:%delete_club%')" +
                " OR (lower(log_value) LIKE '%type%:%create_location%') OR (lower(log_value) LIKE '%type%:%edit_location%') OR (lower(log_value) LIKE '%type%:%delete_location%')" +
                " OR (lower(log_value) LIKE '%type%:%create_court%') OR (lower(log_value) LIKE '%type%:%edit_court%') OR (lower(log_value) LIKE '%type%:%delete_court%')" +
                " OR (lower(log_value) LIKE '%type%:%create_timeslot%') OR (lower(log_value) LIKE '%type%:%edit_timeslot%') OR (lower(log_value) LIKE '%type%:%delete_timeslot%')");
     }

    if (filter.length > 0) {
        filterString = filter.join(" AND ");
    }

    if(!req.data.filter_booking && !req.data.filter_club && !req.data.filter_user) {
        filterString = "1=2";
    }
    
    var loglist = res.handlers.loglist = new jala.ListRenderer(root.filteredLogsCollection(filterString));
    loglist.setPageSize(20); 
    loglist.setUrlParameters(urlParams.join("&"));
        
    res.data.body = this.renderSkinAsString("listLogs", {'isPost': req.isPost()});
    res.data.title = gettext("Log ansehen"); 

    renderSkin("main");
};

/**
 * Saves the location order.
 */
Club.prototype.saveLocationOrder_action = function() {
    if (req.isPost()) {
        var items = req.params['item_array'];
        if (items.length == this.locations.count()) {
            for (var i = 0; i < items.length; i++) {
                var location = this.locations.getById(items[i]);
                if (location) {
                    location.sortorder = i;
                } else {
                    res.abort();
                }
            }
        }
    }
};

