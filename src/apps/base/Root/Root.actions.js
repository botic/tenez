/**
 * Shows users from a club.
 */
Root.prototype.getUsers_action = function() {
    var query   = req.data.q;
    var clubId  = req.data.clubId;
    var jsonp   = req.data.jsoncallback || "";

    app.log("Club: " + clubId);
    app.log("Query: " + query);

    if (session.user) {
        try {
            var club = Club.getById(clubId);
            if (!club) {
                throw "Invalid ClubId!";
            }

            if (session.user.club == club && session.user.hasPermission("can_view_users") || session.user.isSysAdmin()) {
                var switcher = "";
                if (query) {
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

                var userlist = club.filteredCustomerCollection(switcher, query, true);
                var result = [];

                var user;
                app.log(userlist.count() + " elements found.");
                for (var i = 0; i < userlist.count(); i++) {
                    user = userlist.get(i);                    
                    result.push({
                        'id':         user._id,
                        'username':   user.username,
                        'fullname':   user.fullname(),
                        'title':      user.title,
                        'firstname':  user.firstname,
                        'lastname':   user.lastname
                    });
                }
                res.write(jsonp + "("+result.toJSON()+")");
            } else {
                res.write("No privileges to access this list.");
            }
        } catch (e) {
            res.write(e);
        }
    } else {
        res.write("Invalid call. No active session on server!");
    }
};
/**
 * Shows account data from a user.
 */
Root.prototype.getAccountData_action = function() {
    var username = req.data.username;
    var clubId   = req.data.clubId;
    var jsonp    = req.data.jsoncallback || "";

    if (session.user) {
        var club = root.clubs.getById(clubId);
        if (session.user.club == club && session.user.hasPermission("can_view_users") || session.user.isSysAdmin()) {
        	var user = club.users.get(username);

            if (user) {
                var fullname = user.title + " " + user.firstname + " " + user.lastname;                    
                var result = {
                    'fullname':   fullname.replace(/[ ]{2,}/, " ").trim(),
                    'balance': user.getBalance(),
                    'discount': user.getDiscount()
                }
                res.write(jsonp + "("+result.toJSON()+")");
            } else {
                res.write("Invalid user!");
            }
        }
    } else {
        res.write("Invalid call. No active session on server!")   
    }
};


/**
 * Shows the error page if an action or object is not found.
 */
Root.prototype.notfound_action = function() {
    if (isBackend() && app.data.notfoundCount == null) {
        app.data.notfoundCount = 0;
    }

    if (isBackend()) {
        app.data.notfoundCount++;   
    }

    res.data.msg = gettext("Aktion oder Objekt nicht gefunden - Fehler 404");

    renderSkin("error");
};

/**
 * Shows the error page if an action or object is not found.
 */
Root.prototype.error_action = function() {
    res.data.msg = gettext("Aktion oder Objekt nicht gefunden - Fehler 500");

    renderSkin("error");
};