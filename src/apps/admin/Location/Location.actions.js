/**
 * Renders the timetable for all courts of the location
 * @author Dominik Gruber
 */
Location.prototype.main_action = function() {
    // Set searchdate to today
	var today = new java.util.Date();
	var cal = new java.util.GregorianCalendar();
	cal.setTime(today);	// Set Time to 0:00 (very long-winded, thx to Java)
	cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
	cal.set(java.util.Calendar.MINUTE, 0);
	cal.set(java.util.Calendar.SECOND, 0);
	today = cal.getTime();
	var day = cal.getTime();

	// If form submitted -> set searchdate to submitted date
	if(req.data.day) {
		var form_day = req.data.day;
		if(form_day.match(/^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})$/)) {
			var df = new java.text.SimpleDateFormat("dd.MM.yyyy");
			day = df.parse(form_day);
			cal.setTime(day);
		}
	}

	req.data.day = day;
	res.data.day = cal.getTime();
	res.data.day_diff = Math.ceil((day.getTime() - today.getTime()) / 1000 / 60 / 60 / 24);   // Difference in days (for DatePicker)

	// Show Main Skin
	res.data.title = this.name;
	res.data.body = this.renderSkinAsString("overview");
	renderSkin("main");
};

/**
 * Edits a location from the club
 */
Location.prototype.edit_action = function() {
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var name        = req.data.name;
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
                    throw "Invalid call of edit of Location!";
                }

                city = country.cities.getById(req.data.zipcityvalue);
                if (!city) {
                    throw "Invalid call of edit of Location!";
                }
            }

            this.name           = name;
            this.description    = description;

            this.contact.street     = street;
            this.contact.street2    = street2;
            this.contact.city       = city;
            this.contact.phone      = phone;
            this.contact.fax        = fax;
            this.contact.email      = email;
            this.contact.url        = url;

            tenez.Logger.log({
                type: "EDIT_LOCATION",
                message: "Edit of location: " + this.alias,
                message_de: "Standort bearbeitet: " + this.name + " (" + this.alias + ")"
            });
            tenez.FormHandler.remove(form);
            res.redirect(this.club.href("listLocations"));
        }
        if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("edit"));
    }

    tenez.FormHandler.registerNewForm();

    res.data.title = gettext("Standort bearbeiten");
    res.data.body = this.renderSkinAsString("editLocation");
    renderSkin("main");
};

/**
 * Shows a list with all courts of the location
 * @author Dominik Gruber
 */
Location.prototype.listCourts_action = function() {
    var courtlist = res.handlers.courtlist = new jala.ListRenderer(Court.getCollection({
        filter: "cou_location = '" + this._id + "' and cou_active = true"
    }));
    courtlist.setPageSize(this.courts.count() + 1);

    var deactivatedCourts = Court.getCollection({
        filter: "cou_location = '" + this._id + "' and cou_active = false"
    });
    var deactivatedcourtlist = res.handlers.deactivatedcourtlist = new jala.ListRenderer(deactivatedCourts);
    deactivatedcourtlist.setPageSize(deactivatedCourts.count() + 1);

    res.data.body = this.renderSkinAsString("listCourts");
    res.data.title = gettext("Plätze") +  " - " + this.name;
    renderSkin("main");
};

/**
 * Adds a court to the location
 */
Location.prototype.createCourt_action = function() {
    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var name        = req.data.name;
            var alias        = req.data.alias;
            var description = req.data.description;

            var court = new Court(name, this.courts.getAccessName(alias), description, this.courts.count(), true);
            this.courts.add(court);

            tenez.Logger.log({
                type: "CREATE_COURT",
                message: "Created new court: " + court.alias,
                message_de: "Platz zum Standort " + this.name + " hinzugefügt: " + name + " (" + court.alias + ")"
            });
            tenez.FormHandler.remove(form);
            res.redirect(this.href());
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("createCourt"));
    }

    tenez.FormHandler.registerNewForm();

	res.data.title = gettext("Platz hinzufügen") +  " - " + this.name;
    res.data.body = this.renderSkinAsString("createCourt");
    renderSkin("main");
};
/**
 * Saves the court order.
 */
Location.prototype.saveCourtOrder_action = function() {
    if (req.isPost()) {
        var items = req.params['item_array'];
        if (items.length == this.courts.count()) {
            for (var i = 0; i < items.length; i++) {
                var court = this.courts.getById(items[i]);
                if (court) {
                    if (court.active) {
                        court.sortorder = i;
                    } else {
                        court.sortorder = 1000 + i;
                    }
                } else {
                    res.abort();
                }
            }
        }
    }
};
/**
 * Deactivates the location and saves it as deactivated
 */
Location.prototype.deactivate_action = function() {
    if (this.active == false) {
        res.redirect(this.club.href("listLocations"));
    }

    if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if(form && form.evaluate()) {
            var active = false;
            for (var i = 0; i < this.courts.count() && !active; i++) {
                active = active || this.courts.get(i).active;
            }

            if(active) {
                form.addMessage(gettext("Standort kann nicht deaktiviert werden! Zuerst müssen alle seine Plätze deaktiviert werden."));
            } else {
                this.active = false;
                tenez.FormHandler.remove(form);
                res.redirect(this.club.href("listLocations"));
            }

            form.keepAlive();
            res.redirect(this.href("deactivate"));
        }
    }

    tenez.FormHandler.registerNewForm();
    res.data.title = gettext("Standort deaktivieren");
	res.data.body = this.renderSkinAsString("deactivate");
	renderSkin("main");
};
/**
 * Activates a deactivated location
 */
Location.prototype.activate_action = function() {
    if (this.active == false) {
        this.active = true;
        res.redirect(this.club.href("listLocations"));
    }
}