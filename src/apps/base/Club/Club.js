/**
 * Creates a new club.
 * @param name {String} Name of the club.
 * @param alias {String} Alias of the club.
 * @param contact {Contact} Contact of the club
 * @param currency {Currency} Currency of the country where the club is located 
 * @param timezone {String} Timezone where the club is located, default is "Europe/Vienna"
 * @param showuserinfo {Boolean} Visibility of the user info - true if the user info should be visible
 * @param cancelationperiod {Number} Minutes! How long can a user cancel his booking before the it's time.
 * @param reservationperiod {Number} Minutes! How long can a user reserve a new booking before the it's time.
 * @param active {Boolean} Membership state - true if the user is active.
 */
Club.prototype.constructor = function(name, alias, contact, currency, timezone, showuserinfo, cancelationperiod, reservationperiod, active) {
    if (name && alias && currency != null && timezone != null && showuserinfo != null && active != null) {
    	this.name = name;
        this.alias = alias;
        this.contact = contact;
        this.currency = currency;
        this.timezone  = timezone;
        this.showuserinfo = showuserinfo;
        this.cancelationperiod = cancelationperiod || 0;
        this.reservationperiod = reservationperiod || 0;
        this.active = active;
    } else {
        throw "Invalid Club! Some parts are missing!";
    }
};

/**
 * Returns a filtered collection of all Users of the Club.
 * @param field {String} Valid fields to search are: <ul>
 *                                          <li>company</li>
 *                                          <li>firstname</li>
 *                                          <li>lastname</li>
 *                                          <li>username</li>
 *                                          <li>street (searches in field street and street2)</li>
 *                                          <li>zip</li>
 *                                          <li>city</li>
 *                                          <li>phone</li><li>fax</li><li>email</li><li>url</li>
 *                                          </ul>
 * @param query {String} the term to search.
 * @param onlyActive {Boolean} only return active Customers
 * @return filtered customer collection
 */
Club.prototype.filteredCustomerCollection = function(field, query, onlyActive) {
    var filter = "usr_club = " + this._id + " AND t_contact.con_id = usr_contact";

    if(onlyActive === true) {
        filter += " AND usr_active = true";
    }

    var additionalTables = "t_contact";

    query = query.replace(/['"]/g, "");
    switch (field) {
        case "company":         filter +=   " AND (lower(usr_company)  LIKE '%" + query + "%' )";
                                break;

        case "firstname":       filter +=   " AND (lower(usr_firstname)  LIKE '%" + query + "%' )";
                                break;

        case "lastname":        filter +=   " AND (lower(usr_lastname)  LIKE '%" + query + "%' )";
                                break;

        case "username":        filter +=   " AND (lower(usr_username)  LIKE '%" + query + "%' )";
                                break;

        case "street":          filter +=   " AND (lower(t_contact.con_street)  LIKE '%" + query + "%' OR lower(t_contact.con_street2)  LIKE '%" + query + "%')";
                                break;

        case "zip":             additionalTables += ",t_city";
                                filter +=   " AND t_contact.con_city = t_city.cit_id AND lower(t_city.cit_zip)  = '" + query + "'";
                                break;

        case "city":            additionalTables += ",t_city";
                                filter +=   " AND t_contact.con_city = t_city.cit_id AND lower(t_city.cit_name)  LIKE '" + query + "%'";
                                break;

        case "phone":           filter +=   " AND t_contact.con_phone  LIKE '%" + query + "%'";
                                break;

        case "fax":             filter +=   " AND t_contact.con_fax  LIKE '%" + query + "%'";
                                break;

        case "email":           filter +=   " AND t_contact.con_email  LIKE '%" + query + "%'";
                                break;

        case "url":             filter +=   " AND t_contact.con_url  LIKE '%" + query + "%'";
                                break;

        default:    filter +=   " AND (" +
                                "lower(usr_username)  LIKE '%" + query + "%' OR " +
                                "lower(usr_firstname) LIKE '%" + query + "%' OR " +
                                "lower(usr_lastname)  LIKE '%" + query + "%'" +
                                ")";
    }

    return User.getCollection({
        "order": "usr_username ASC",
        "filter": filter,
        "filter.additionalTables": additionalTables
    });
};

/**
 * Collects all Reservations of this Club.
 * @param limit {Number} maximal count of reservations
 * @return {HopObject} a collection of all reservations connected to this Club.
 */
Club.prototype.getReservations = function(limit) {
    return Reservation.getCollection({
        limit: limit || 15,
        filter: "res_user IN (SELECT usr_id FROM t_user WHERE usr_club = '" + this._id + "')",
        order: 'res_date DESC'
    });
};

/**
 * Collects all Transactions of this Club.
 * @param limit {Number} maximal count of Transactions
 * @return {HopObject} a collection of all Transactions connected to this Club.
 */
Club.prototype.getTransactions = function(limit) {
    return Transaction.getCollection({
        limit: limit || 15,
        filter: "tra_user IN (SELECT usr_id FROM t_user WHERE usr_club = '" + this._id + "')",
        order: 'tra_date DESC'
    });
};

/**
 * Collects all User activity in the frontend for this Club.
 * @param limit {Number} maximal count of Log entries
 * @return {HopObject} a collection of Logs with the frontend-app
 */
Club.prototype.getCustomerLogs = function(limit) {
    return Log.getCollection({
        limit: limit || 15,
        filter: "log_accesspoint = 'tenez-frontend' and log_club = '"+ this._id + "' and ( " +
                "lower(log_value) LIKE '%type%:%signin%' or lower(log_value) LIKE '%type%:%edit_user%')",
        order: 'log_id DESC'
    });
};


