/**
 * Shows all available reports from a club.
 */
ReportMgr.prototype.main_action = function() {
    tenez.ReportBuilder.readConfig();

    res.push();
    this.renderSkin("mainReport#header");

    var reports = tenez.ReportBuilder.getReportsForClub(this._parent);
    for(var alias in reports) {
        if (reports[alias]["permission"] != null && session.user.hasPermission(reports[alias]["permission"])) {
            this.renderSkin("mainReport#item", {
                "href":         this.href("renderReport")+"?name="+alias,
                "name":         reports[alias]["name"],
                "description":  reports[alias]["description"]
            });
        }
    }

    this.renderSkin("mainReport#footer");
    res.data.body = res.pop();
    res.data.title = gettext("Verfügbare Berichte"); 
	renderSkin("main");
};
/**
 * Saves the available report as pdf
 */
ReportMgr.prototype.renderReport_action = function() {
    var alias = req.data.name;

    if (alias) {
        if (session.user.hasPermission(tenez.ReportBuilder.getPermissionForReport(this._parent, alias))) {
            res.contentType='application/pdf; charset=utf-8';
            res.addHeader('Content-Disposition', 'attachment; filename="' + alias + '_' + tenez.Date.getReportString(new Date()) + '.pdf"');
            res.writeBinary(tenez.ReportBuilder.renderReport(this._parent, alias));
        } else {
            res.redirect(this.href());    
        }
    } else {
        res.redirect(this.href());
    }
};

/**
 * Renders the userlist Report.
 */
ReportMgr.prototype.customers_action = function() {
    // Note: the ReportMgr is mounted at the Club, so his
    //       _parent is the corresponding Club object.
    var club = this._parent;

    // Create a filtered collection
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

    var collection = club.filteredCustomerCollection(switcher, query);
    // The loop with the current object to render as param object
    res.push();
    var counter = collection.count();
    for(var i = 0; i < counter; i++) {
        res.write(collection.get(i)._id + ", ");
	}
    res.write("-99999");
    var userIds = res.pop();

    var sqlQuery = "select abs(sum(tra_price)) as sales, usr_username, usr_id from t_transaction " +
                   "inner join t_user on t_user.usr_id = tra_user where t_user.usr_club = '" + club._id + "' " +
                   "and tra_reservation notnull and usr_id in (" + userIds+ ") group by t_user.usr_id, t_user.usr_username " +
                   "order by sales DESC LIMIT 20;";

    var db = new helma.Database("tenez");
    var result = db.query(sqlQuery);
    var sales = [[],[]], saleslegend = [];

    for (var i = 0; i < result.length; i++) {
        sales[0].push(result[i]["sales"]);
        sales[1].push(result[i]["usr_username"]);
        saleslegend.push(User.getById(result[i]["usr_id"]).fullname() + " – " + formatDecimal(result[i]["sales"]) + " " + club.currency.code);
    }

    sqlQuery = "select count(*) as rescount, usr_username, usr_id from t_transaction " +
                   "inner join t_user on t_user.usr_id = tra_user where t_user.usr_club = '" + club._id + "' " +
                   "and tra_reservation notnull and usr_id in (" + userIds + ") group by t_user.usr_id, t_user.usr_username " +
                   "order by rescount DESC LIMIT 20;";

    result = db.query(sqlQuery);
    var rescount = [[],[]], rescountlegend = [];

    for (var i = 0; i < result.length; i++) {
        rescount[0].push(result[i]["rescount"]);
        rescount[1].push(result[i]["usr_username"]);
        rescountlegend.push(User.getById(result[i]["usr_id"]).fullname() + " – " + formatDecimal(result[i]["rescount"]) + " " + gettext("Reservierungen"));
    }

    res.data.title = gettext("Kundenauswertung");
    res.data.body = this.renderSkinAsString("customers", {
        'name': club.name,
        'sales': sales.toJSON(), 'saleslegend': saleslegend.toJSON(),
        'rescount': rescount.toJSON(), 'rescountlegend': rescountlegend.toJSON()
    });
	renderSkin("main");
};

/**
 * Renders the UserGroup Report.
 */
ReportMgr.prototype.usergroups_action = function() {
    var club = this._parent;

    if (club.usergroups.count() >= 2) {
        var db = new helma.Database("tenez");
        var query = "select count(*) as usercount, ugp_name, ugp_discount from t_usergroup_member " +
                    "inner join t_usergroup on t_usergroup.ugp_id = t_usergroup_member.ugm_usergroup " +
                    "where ugp_club = '" + club._id + "' group by ugp_name, ugp_discount order by ugp_discount ASC;";

        var result = db.query(query);
        var appdata = [[],[]], legend = [];

        for (var i = 0; i < result.length; i++) {
            appdata[0].push(result[i]["usercount"]);
            appdata[1].push((result[i]["ugp_discount"] * 100).toFixed(2));
            legend.push(formatDecimal(result[i]["usercount"]) + "x " + result[i]["ugp_name"] + " – " + gettext("Rabatt") + ": " + (result[i]["ugp_discount"] * 100).toFixed(2) + " %");
        }

        // Membership counting
        query = "select count(memcount) as memberscount, memcount from " +
                "(select count(ugm_usergroup) as memcount, ugm_user from t_usergroup_member " +
                "inner join t_usergroup on t_usergroup.ugp_id = t_usergroup_member.ugm_usergroup " +
                "where ugp_club = '" + club._id + "' group by ugm_user) as sub group by memcount;"

        result = db.query(query);
        var memcount = [[],[]], memlegend = [];

        for (var i = 0; i < result.length; i++) {
            memcount[0].push(result[i]["memberscount"]);
            memcount[1].push(result[i]["memcount"]);
            memlegend.push(formatDecimal(result[i]["memberscount"]) + " " + gettext("Kunden mit") + " " + result[i]["memcount"] + " " + gettext("Kundengruppen"));
        }

        // Pop the current response buffer into res.data.body
        res.data.body = this.renderSkinAsString("usergroups", {'appdata': appdata.toJSON(), 'legend': legend.toJSON(),
            'memcount': memcount.toJSON(), 'memlegend': memlegend.toJSON()});
    } else {
        res.data.body = this.renderSkinAsString("usergroups#empty");
    }
    res.data.title = gettext("Kundengruppen");
	renderSkin("main");
};

/**
 * Renders the UserGroup Report.
 */
ReportMgr.prototype.reservations_action = function() {
    var club = this._parent;

    if (club) {
        var endDate = new Date();
        endDate.setDate(endDate.getDate() + 1);

        var param = {
            "minDay": new Date(2010, 0, 1),
            "maxDay": new Date(),
            "start": new Date(2010, 0, 1).format("yyyy/MM/dd"),
            "end": endDate.format("yyyy/MM/dd")
        };

        var whereClause = "";
        if (req.data.from && req.data.to) {
            var from = param.from = req.data.from;
            var to   = param.to = req.data.to;

            endDate = tenez.Date.getDateFromString(to);
            endDate.setDate(endDate.getDate() + 1);
            whereClause = " AND res_timestart >= '" + tenez.Date.getDBString(tenez.Date.getDateFromString(from)) + "' AND res_timestart <= '" + tenez.Date.getDBString(endDate)+"'";

            if (tenez.Date.getDateFromString(from) != null && tenez.Date.getDateFromString(to) != null) {
                param.start = tenez.Date.getDateFromString(from).format("yyyy/MM/dd");
                endDate = tenez.Date.getDateFromString(to);
                endDate.setDate(endDate.getDate() + 1);
                param.end   = endDate.format("yyyy/MM/dd");
            }
        }

        var bookings = [
                         0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, /* Mo */
                         0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, /* Di */
                         0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, /* Mi */
                         0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, /* Do */
                         0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, /* Fr */
                         0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0, /* Sa */
                         0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0  /* So */
                       ];
        var sales = bookings.clone();
        
        var query = "select count(*) as counter, sum(abs(tra_price)) as sales, EXTRACT(hour from res_timestart) as hour, EXTRACT(dow from res_timestart) as dayofweek " +
                    "from t_reservation join t_transaction on res_transaction = tra_id where res_timeslot in (" +
                    "select distinct tsl_id from t_timeslot join t_court on tsl_court = cou_id join t_location on cou_location = loc_id join t_club on clb_id = loc_club " +
                    "where clb_id = '" + club._id + "') " + whereClause + " group by EXTRACT(dow from res_timestart), EXTRACT(hour from res_timestart) order by dayofweek, hour;"

        var db = new helma.Database("tenez");
        var result = db.query(query);

        for (var i = 0; i < result.length; i++) {
            var dayofweek = result[i]["dayofweek"];
            var hour = result[i]["hour"];

            bookings[(dayofweek * 24) + hour] = result[i]["counter"];
            sales[(dayofweek * 24) + hour] = result[i]["sales"];
        }

        param.name = club.name;
        param.sales = sales.toJSON();
        param.bookings = bookings.toJSON();

        res.data.body = this.renderSkinAsString("reservations", param);
    } else {
        res.data.body = this.renderSkinAsString("reservations#empty");
    }
    res.data.title = gettext("Reservierungen");
	renderSkin("main");
};

/*
select count(*) as counter, sum(abs(tra_price)) as sales, extract(week from res_timestart) as week from t_reservation join t_transaction on tra_reservation = res_id where extract(year from res_timestart) = 2012 group by (extract(week from res_timestart)) ORDER BY extract(week from res_timestart)  ASC;

 */
/**
 * Renders the UserGroup Report.
 */
ReportMgr.prototype.sales_action = function() {
    var club = this._parent;

    if (club) {
        var year = new Date().getFullYear();
        if(req.data.year && !isNaN(req.data.year) && parseInt(req.data.year, 10) >= 2010 && parseInt(req.data.year, 10) <= year) {
            year = parseInt(req.data.year, 10);
        }

        var c = java.util.Calendar.getInstance();  
        c.set(year, 0, 1);
        var weekcount = c.getMaximum(java.util.Calendar.WEEK_OF_YEAR);

        var bookings = [], sales = [];

        var query = "select count(*) as counter, sum(abs(tra_price)) as sales, extract(week from res_timestart) as week from t_reservation join t_transaction on tra_reservation = res_id " +
                    "where res_user in (select usr_id from t_user where usr_club = ' " + club._id + "') and extract(year from res_timestart) = " + year + " group by (extract(week from res_timestart)) ORDER BY extract(week from res_timestart) ASC;";

        var db = new helma.Database("tenez");
        var result = db.query(query);

        var totalBookings = totalSales = 0;
        for (var i = 0; i < weekcount; i++) {
            bookings[i] = sales[i] = 0;
        }

        for (var i = 0; i < result.length; i++) {
            var week = result[i]["week"];
            bookings[week - 1] = Math.floor(result[i]["counter"]);
            totalBookings += Math.floor(result[i]["counter"]);

            sales[week - 1]    = Math.floor(result[i]["sales"]);
            totalSales += Math.floor(result[i]["sales"]);
        }

        var options = [];
        var currentYear = new Date().getFullYear()
        for (var y = 2010; y <= currentYear; y++) {
            options[2010 - y] = [this.href("sales") + "?year="+y, y];
        }

        var param = {};
        param.name = club.name;
        param.sales = sales.toJSON();
        param.bookings = bookings.toJSON();
        param.avgSales = Math.floor(totalSales / weekcount);
        param.avgBookings = Math.floor(totalBookings / weekcount);
        param.weekcount = weekcount;
        param.currency = club.currency.name;
        param.years = html.dropDownAsString({id: 'reportYearselect'}, options, this.href("sales") + "?year="+year);

        res.data.body = this.renderSkinAsString("sales", param);
    }

    res.data.title = gettext("Umsatzauswertung");
	renderSkin("main");
};