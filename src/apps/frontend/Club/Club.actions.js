/**
 * Redirects to the first location of the Club.
 */
Club.prototype.main_action = function() {
    if (this.locations.count() > 0) {
        res.redirect(this.locations.get(0).href());
    } else {
        renderSkin("main");
    }
};
/**
 * Signs a user in (frontend).
 */
Club.prototype.signin_action = function() {
    if (session.user) {
        res.redirect(this.href());
    }

    // Destination URL
    var desturl = this.href();
    if(session.data.login_desturl) {
    	desturl = session.data.login_desturl;
    	session.data.login_desturl = null;
    } else if (req.data.desturl) {
    	desturl = req.data.desturl;
    }
    res.data.desturl = desturl;

    // Process Form
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if (!form) {
            res.redirect(this.href());
        }

        if (!desturl.startsWith(this.href())) {
            throw "Invalid redirect.";
        }

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
                            message_de: "Benutzer im Frontend angemeldet: " + username
                        });
                        // remove the old form from the form handler.
                        // this is important to save memory and improve performance!
                        tenez.FormHandler.remove(form);
                        res.redirect(desturl);
                    }
                } else {
                    if (!toLogin) {
                        form.addMessage(gettext("Benutzer konnte nicht angemeldet werden!"));                                                
                    } else if (!toLogin.active) {
                        form.addMessage(gettext("Ihr Benutzer ist gesperrt."));
                    }
                }
            }
        }

        form.keepAlive();
        res.redirect(this.href("signin"));
    }

    tenez.FormHandler.registerNewForm();

    res.data.title = gettext("Anmelden");
    res.data.body = this.renderSkinAsString("signin");

    renderSkin("main");
};
/**
 * Signs a user out.
 */
Club.prototype.signout_action = function() {

    //only logout if the user is logged in
    if(session.user){
        tenez.Logger.log({
            type: "SIGNOUT",
            message: "Sign out of user: " + session.user.username,
            message_de: "Benutzer im Frontend abgemeldet: " + session.user.username
        });
        session.logout();
    }

    res.redirect(this.href());
};
/**
 * Shows the support page.
 */
Club.prototype.support_action = function() {
    res.data.title = gettext("Hilfe &amp; Support");
    res.data.body = renderSkinAsString("support");

    renderSkin("main");
};
/**
 * Register and creates a user.
 */
Club.prototype.register_action = function() {
    if (req.isPost() && !session.user) {
        var form = tenez.FormHandler.retrieve();
        if (!form) {
            res.redirect(this.href());
        }

        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
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

            var validInput = true;
            if (lastname.length < 2 || firstname.length < 2) {
                form.addMessage(gettext("UngÃ¼ltiger Vor- oder Nachname angegeben! Ihr Name muss mindestens 2 Zeichen aufweisen."));
                validInput = false;
            }

            var username = this.users.getAccessName(tenez.Util.sanitizeCharacters((firstname.charAt(0) + lastname).toLowerCase()));
            if (!tenez.FormHandler.VALIDATORS["username"](username) && validInput) {
                form.addMessage(gettext("Ihr Benutzer '" + username + "' kann nicht angelegt werden. Er enthÃ¤lt ungÃ¼ltige Zeichen!"));
            } else {
                var city = null;
                if (req.data.zipcityvalue > 0) {
                    var country = root.addresses.countries.get(req.data.country);
                    if (!country) {
                        throw "Invalid call of register!";
                    }

                    city = country.cities.getById(req.data.zipcityvalue);
                    if (!city) {
                        throw "Invalid call of register!";
                    }
                }
                var contact = new Contact(street, street2, city, phone, fax, email, url);

                var pincode = tenez.Util.generatePin(5);
                var user = new User(username, pincode, firstname, lastname, title, company, iscompany, true, contact, null, true);

                this.users.add(user);

                tenez.Logger.log({
                    type: "CREATE_USER",
                    message: "Created new user: " + user.username,
                    message_de: "Neuen Benutzer registriert: " + user.username + " (" + user.firstname + " " + user.lastname +")"
                });

                session.login(user);

                tenez.FormHandler.remove(form);
                res.redirect(user.href());
            }
		}

        if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("register"));
    }

    tenez.FormHandler.registerNewForm();
    res.data.title = gettext("Registrieren");
    res.data.body = this.renderSkinAsString("registerCustomer");

    renderSkin("main");
};
/**
 * Resets the password and sends a e-mail to the user
 */
Club.prototype.resetPassword_action = function() {
    tenez.FormHandler.registerNewForm();
    
    if (req.isPost() && !session.user) {
        var form = tenez.FormHandler.retrieve();
        var usersToSend = [];

        if(form && form.evaluate()) {
            var username = req.data.username;
            var email = req.data.email;

            if(!username && !email) {
            	form.addMessage(gettext("Bitte geben Sie Benutzername oder E-Mail Adresse an."));
            } else {
            	// Check for Username
            	if (username) {
	                var user = this.users.get(username);
	                if (user != null) {
	                    if (user.contact.email && tenez.FormHandler.VALIDATORS["email"](user.contact.email)) {
	                        user.password = tenez.Util.generatePin(5);
	                        usersToSend.push(user);
	                        res.data.body = this.renderSkinAsString("resetPassword#success");
	                    } else {
	                        form.addMessage(gettext("Keine E-Mail-Adresse fÃ¼r den Benutzer hinterlegt! Bitte wenden Sie sich an den Hallenwart."));
	                    }
	                } else {
	                    form.addMessage(gettext("Benutzername oder E-Mail-Adresse unbekannt!"));
	                }   
	            // Check for E-Mail
	            } else {
	                var userToCheck;
	                for (var i = 0; i < this.users.count(); i++) {
	                    userToCheck = this.users.get(i);
	                    if (userToCheck.contact.email.toLowerCase() == email.toLowerCase()) {
	                        userToCheck.password = tenez.Util.generatePin(5);
	                        usersToSend.push(userToCheck);
	                    } 
	                }
	                if(usersToSend.length == 0) {
	                	form.addMessage(gettext("E-Mail-Adresse ist unbekannt! Bitte wenden Sie sich an den Hallenwart."));
	                }
	            }
        	}

            for(var u = 0; u < usersToSend.length; u++) {
                var user = usersToSend[u];
                var mail = new helma.Mail();
                mail.setFrom("noreply@tenez.at", "Tenez.at für " + this.name);
                mail.setSubject(gettext("Ihr Passwort wurde zurückgesetzt"));
                mail.addText(this.renderSkinAsString("resetPassword#mailtext", {'password': user.password}));
                mail.setTo(user.contact.email, user.fullname());
                if (app.properties["debugMode"] == "true" || app.properties["debugMode"] == true) {
                    var directory = new helma.File(app.properties["debugDir"]);
                    if (directory.isDirectory()) {
                        app.log("Write e-mail into " + directory.getAbsolutePath() + " to user: " + user.contact.email);
                        mail.writeToFile(directory);
                    } else {
                        // write into temp dir of the operation system
                        app.log("Write mail into /tmp to user: " + user.contact.email);
                        mail.writeToFile();
                    }
                } else {
                    app.log("Send mail to " + user.contact.email);
                    mail.send();
                }

                tenez.Logger.log({
                    type: "PASSWORD_RESET",
                    message: "Reseted password for user: " + user.username,
                    message_de: "Kunde hat Passwort zurückgesetzt: " + user.username
                });
            }
        }
        
        if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("resetPassword") + (usersToSend.length > 0 ? "?success=true" : ""));
    }

    if (req.params["success"] && req.params["success"] == "true") {
        res.data.body = this.renderSkinAsString("resetPassword#success");
    } else {
        res.data.body = this.renderSkinAsString("resetPassword");
    }

    res.data.title = gettext("Passwort zurücksetzen");
    renderSkin("main");
};
/**
 * Sends an e-mail to the support
 */
Club.prototype.contact_action = function() {
    tenez.FormHandler.registerNewForm();
    
    if (req.isPost() && !session.user) {
        var form = tenez.FormHandler.retrieve();
        var success = false;
        
        if(form && form.evaluate()) {
            var name = req.data.name;
            var email = req.data.email;
            var subject = req.data.subject;
            var text = req.data.text;
            
            if(!name || !email || !subject || !text) {
                form.addMessage(gettext("Bitte geben Sie Name, E-Mail, Betreff und Nachricht an."));
            } else {
                if(tenez.FormHandler.VALIDATORS["email"](email)){
                    var mail = new helma.Mail();
                    mail.setFrom(email, name);
                    mail.setSubject(subject);
                    mail.addText(text);
                    mail.setTo("support@tenez.at", "Tenez.at");
                    if (app.properties["debugMode"] == "true" || app.properties["debugMode"] == true) {
                        var directory = new helma.File(app.properties["debugDir"]);
                        if (directory.isDirectory()) {
                            app.log("Write e-mail into " + directory.getAbsolutePath() + " from user: " + email);
                            mail.writeToFile(directory);
                        } else {
                            // write into temp dir of the operation system
                            app.log("Write mail into /tmp from user: " + email);
                            mail.writeToFile();
                        }
                    } else {
                        app.log("Receive mail from " + email);
                        mail.send();
                    }
                
                    success = true;
                } else {
                    form.addMessage(gettext("Bitte geben Sie eine korrekte E-Mail Adresse an."));
                }
            }
        }
        
        if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("contact")+ (success ? "?success=true" : ""));
    }
    
    if (req.params["success"] && req.params["success"] == "true") {
        res.data.body = this.renderSkinAsString("contact#success");
    } else {
        res.data.body = this.renderSkinAsString("contact");
    }
        
    res.data.title = gettext("Club kontaktieren");
    renderSkin("main");
};