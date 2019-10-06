/**
 * Edits a user and saves the new data
 */
User.prototype.edit_action = function() {
    if (!session.user) {
        res.redirect(getClubInPath().href());
    } else {
        if (req.isPost()) {
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

                if (lastname.length < 2 || firstname.length < 2) {
                    form.addMessage(gettext("Ungültiger Vor- oder Nachname angegeben! Ihr Name muss mindestens 2 Zeichen aufweisen."));
                } else {
                    var city = null;
                    if (req.data.zipcityvalue > 0) {
                        var country = root.addresses.countries.get(req.data.country);
                        if (!country) {
                            throw "Invalid call of edit!";
                        }

                        city = country.cities.getById(req.data.zipcityvalue);
                        if (!city) {
                            throw "Invalid call of edit!";
                        }
                    }

                    this.contact.street = street;
                    this.contact.street2 = street2;
                    this.contact.city = city;
                    this.contact.phone = phone;
                    this.contact.fax = fax;
                    this.contact.email = email;
                    this.contact.url = url;

                    this.title      = title;
                    this.firstname  = firstname;
                    this.lastname   = lastname;
                    this.company    = company;
                    this.iscompany  = iscompany;

                    tenez.Logger.log({
                        type: "EDIT_USER",
                        message: "User: " + this.username,
                        message_de: "Benutzer im Frontend bearbeitet: " + this.username + " (" + this.firstname + " " + this.lastname +")"
                    });

                    tenez.FormHandler.remove(form);
                    res.redirect(this.href("edit"));
                }
            }

            if (form) {
                form.keepAlive();
            }
            res.redirect(this.href("edit"));
        }
    }

    tenez.FormHandler.registerNewForm();

	res.data.title = this.username + gettext(" Kundendaten");
	res.data.body = this.renderSkinAsString("edit");
	renderSkin("main");
};

/**
 * Renders the User overview with last bookings, transactions and other details.
 */
User.prototype.main_action = function() {

    var txlist = res.handlers.txlist = new jala.ListRenderer(this.transactions);

    res.data.title = this.username;
	res.data.body = this.renderSkinAsString("mainUser");
	renderSkin("main");
};