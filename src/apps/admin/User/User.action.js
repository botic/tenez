/**
 * Displays details for the User/Customer.
 */
User.prototype.main_action = function() {
    res.data.title = this.username;

    if (this.isSysAdmin()) {
        res.data.body = this.renderSkinAsString("mainUser#sysadmin");
    } else {
        res.data.body = this.renderSkinAsString("mainUser");
    }

    renderSkin("main");
}
/**
 * Edits a user.
 */
User.prototype.edit_action = function() {
    if (!this.active) {
        res.redirect(this.href());
    }

    if(req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var username    = req.data.username.toLowerCase();
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

            var invalidInput = false;
            if (this.isSysAdmin()) {
                if (root.sysadmins.get(username) && this.username != username) {
                    form.addMessage(gettext("Der Benutzername " + username + " ist bereits vergeben!"));
                    invalidInput = true;
                }

                if (req.data.password1 && req.data.password2 && req.data.password1 != "") {
                    if (req.data.password1.length < 5) {
                        form.addMessage(gettext("Passwort für einen Systemadministrator muss min. 5 Zeichen lang sein!"));
                        invalidInput = true;
                    } else {
                        if (req.data.password1 == req.data.password2) {
                            this.password = req.data.password1;
                        } else {
                            form.addMessage(gettext("Passwörter stimmen nicht überein!"));
                            invalidInput = true;
                        }
                    }
                }
            } else {
                this.isprepaid = (req.data.isprepaid == "true" ? true : false);
                
                if (this.club.users.get(username) && this.username != username) {
                    form.addMessage(gettext("Der Benutzername " + username + " ist bereits vergeben!"));
                    invalidInput = true;
                } else {
                    this.removeAllUserGroupMemberships();
                    if (req.data["usergroup_array"] && req.data["usergroup_array"].length > 0) {
                        for (var i = 0; i < req.data["usergroup_array"].length; i++) {
                            var group = this.club.usergroups.getById(req.data["usergroup_array"][i]);
                            if (group) {
                                this.addUserGroupMembership(group);
                            } else {
                                throw "Invalid usergroup: " + req.data["usergroup_array"][i];
                            }
                        }
                    }

                    if (req.data["permissiongroup"]) {
                        if (req.data["permissiongroup"] > 0) {
                            var permissionGroup = root.usermgr.permissiongroups.getById(req.data["permissiongroup"]);
                            if (permissionGroup && permissionGroup != root.getSysAdminPermissionGroup()) {
                                this.permissiongroup = permissionGroup;
                            }
                        } else {
                            this.permissiongroup = null;
                        }
                    }
                }
            }

            if (!invalidInput) {
                var city = null;
                if (req.data.zipcityvalue > 0 && req.data.city != "") {
                    var country = root.addresses.countries.get(req.data.country);
                    if (!country) {
                        throw "Invalid call of User.edit!";
                    }

                    city = country.cities.getById(req.data.zipcityvalue);
                    if (!city) {
                        throw "Invalid call of User.edit!";
                    }
                }

                this.username   = username;
                this.firstname  = firstname;
                this.lastname   = lastname;
                this.title      = title;
                this.company    = company;
                this.iscompany  = iscompany;

                this.contact.street = street;
                this.contact.street2 = street2;
                this.contact.city = city;
                this.contact.phone = phone;
                this.contact.fax = fax;
                this.contact.email = email;
                this.contact.url = url;

                tenez.Logger.log({
                    type: "EDIT_USER",
                    message: "Edit of user: " + this.username,
                    message_de: "Benutzer bearbeitet: " + this.username + " (" + this.firstname + " " + this.lastname + ")"
                });
                
                tenez.FormHandler.remove(form);
                res.redirect(this.href());
            }
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("edit"));
    }

    // Registers a new form at the form handler
    // This also creates a new res.handlers.form with the new form
    tenez.FormHandler.registerNewForm();


    if (this.isSysAdmin()) {
        // gettext() is to display localized messages!
        res.data.title = gettext("Systemadministrator bearbeiten");
        // Renders the createclub skin which also adds the fields to the form handler.
        res.data.body = this.renderSkinAsString("editUser#sysadmin");
    } else {
        // gettext() is to display localized messages!
        res.data.title = gettext("Kunden bearbeiten");
        // Renders the createclub skin which also adds the fields to the form handler.
        res.data.body = this.renderSkinAsString("editUser");
    }

    // Renders the global main skin
    renderSkin("main");
};
/**
 * Creates a booking
 */
User.prototype.createBooking_action = function() {
    // Registers a new form at the form handler
    if (this.isSysAdmin()) {
        throw "Invalid call - sysadmins are not members of a club.";
    }

    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if (req.data.discount && req.data.grossvalue && req.data.price) {
           req.data.grossvalue  = req.data.grossvalue.replace(",", ".");
           req.data.discount    = req.data.discount.replace(",", ".");
           req.data.price       = req.data.price.replace(",", ".");
        }
        if(form && form.evaluate()) {
            var action        = req.data.action;
            var grossvalue    = parseFloat(req.data.grossvalue);
            var discount      = parseFloat(req.data.discount) / 100;
            var price         = parseFloat(req.data.price);

            var netto = (grossvalue - (grossvalue * discount)).toFixed(2);

            var validInput = true;

            if (netto != price) {
                form.addMessage(gettext("Ungültiger Nettopreis wurde angezeigt!"));
                validInput = false;
            }

            if (grossvalue < 0) {
                if (discount != 0) {
                    form.addMessage(gettext("Kein Rabatt bei Abbuchungen möglich!"));
                    validInput = false;
                } else if (grossvalue != price) {
                    form.addMessage(gettext("Bei Abbuchungen müssen Netto- und Bruttobetrag übereinstimmen!"));
                    validInput = false;
                }
            } else if (grossvalue == 0) {
                form.addMessage(gettext("Kein Betrag angegeben!"));
                validInput = false;
            }

            if (validInput) {
                var tx = new Transaction(action, grossvalue, discount);
                this.transactions.add(tx);

                if (grossvalue > 0) {
                    tenez.Logger.log({
                        type: "ADD_CREDIT",
                        message: "Added credit for user: " + this.firstname + " " + this.lastname + " (" + this.username  + ")  Credit: " + grossvalue,
                        message_de: "Guthaben aufgebucht für Kundenkonto " + this.firstname + " " + this.lastname + " (" + this.username  + ") - Betrag: " + grossvalue
                    });
                } else {
                    tenez.Logger.log({
                        type: "ADD_DEBIT",
                        message: "Added debit for user: " + this.firstname + " " + this.lastname + " (" + this.username  + ") Debit: " + grossvalue,
                        message_de: "Abbuchung auf Kundenkonto von " + this.firstname + " " + this.lastname + " (" + this.username  + ") - Betrag: " + grossvalue
                    });
                }
                tenez.FormHandler.remove(form);
                res.redirect(tx.href());
            }
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("createBooking"));
    }

    tenez.FormHandler.registerNewForm();
    res.data.title = gettext("Buchung durchführen");
    res.data.body  = this.renderSkinAsString("createBooking");

    // Renders the global main skin
    renderSkin("main");
};
/**
 * Overview of the transactions.
 */
User.prototype.accounting_action = function() {
    var endDate = new Date();
    endDate.setDate(endDate.getDate() + 1);
    var param = {
        "minDay": this.getFirstTransactionDay(),
        "maxDay": new Date(),
        "start": this.getFirstTransactionDay().format("yyyy/MM/dd"),
        "end": endDate.format("yyyy/MM/dd")
    };

    var isQuery = false;
    if (req.data.from && req.data.to) {
        var from = param.from = req.data.from;
        var to   = param.to = req.data.to;

        if (tenez.Date.getDateFromString(from) != null && tenez.Date.getDateFromString(to) != null) {
            param.start = tenez.Date.getDateFromString(from).format("yyyy/MM/dd");
            endDate = tenez.Date.getDateFromString(to);
            endDate.setDate(endDate.getDate() + 1);
            param.end   = endDate.format("yyyy/MM/dd");
            isQuery = true;
        }
    }

    var txlist;
    if (isQuery) {
        txlist = res.handlers.txlist = new jala.ListRenderer(this.filteredTransactionCollection(tenez.Date.getDateFromString(from), endDate));
        txlist.setUrlParameters("from="+req.queryParams["from"]+"&to="+req.queryParams["to"]);
    } else {
        txlist = res.handlers.txlist = new jala.ListRenderer(this.transactions);
    }
    txlist.setPageSize(20);  

    res.data.title = this.username + " - " + gettext("Kontoübersicht");
    res.data.body  = this.renderSkinAsString("accounting", param);

    // Renders the global main skin
    renderSkin("main");
};
/**
 * Deactivates a user.
 */
User.prototype.deactivate_action = function() {
    if(req.isPost()){
        var form = tenez.FormHandler.retrieve();
        var validInput = true;
        var isAdmin = false;
        
        if(this.isSysAdmin()) {
           isAdmin = true;
        } 
        
        if(form){
            if(this.getBalance() == 0.0) {
                this.removeAllUserGroupMemberships();
                this.active = false;
            } else {
                form.addMessage(gettext("Der Benutzer kann nur inaktiv gesetzt werden wenn kein Guthaben vorhanden ist!"));
                validInput = false;
            }
            
            if(validInput){
                tenez.FormHandler.remove(form);
                
                tenez.Logger.log({
                    type: "DEACTIVATE_USER",
                    message: "Deactivated user: " + this.name,
                    message_de: "Benutzer " + this.name + " wurde inaktiv gesetzt."
                });
                
                if(isAdmin == false) {
                    res.redirect(this.club.href("listCustomers"));
                } else {
                    res.redirect(root.href());
                }
            }
            
            form.keepAlive();
            res.redirect(this.href("deactivate"));
         }  
    }
        
    tenez.FormHandler.registerNewForm();
    
    res.data.title = gettext("Kunden inaktiv setzen");
    res.data.body = this.renderSkinAsString("deactivateUser");
    
    renderSkin("main");

};

/**
 * Activates a user.
 */
User.prototype.activate_action = function() {
    if(req.isPost()){
        var form = tenez.FormHandler.retrieve();
        var validInput = true;
        var isAdmin = false;

        if(this.isSysAdmin()) {
           isAdmin = true;
        }

        if(form){
            if(this.getBalance() == 0.0 && this.active == false) {
                this.active = true;
            } else {
                form.addMessage(gettext("Der Benutzer kann nur aktiv gesetzt werden wenn er inaktiv ist!"));
                validInput = false;
            }

            if(validInput){
                tenez.FormHandler.remove(form);

                tenez.Logger.log({
                    type: "ACTIVATE_USER",
                    message: "Activated user: " + this.name,
                    message_de: "Benutzer " + this.name + " wurde aktiv gesetzt."
                });

                if(isAdmin == false) {
                    res.redirect(this.club.href("listCustomers"));
                } else {
                    res.redirect(root.href());
                }
            }

            form.keepAlive();
            res.redirect(this.href("activate"));
         }
    }

    tenez.FormHandler.registerNewForm();

    res.data.title = gettext("Kunden aktiv setzen");
    res.data.body = this.renderSkinAsString("activateUser");

    renderSkin("main");
};