/**
 * Checks the permissions for the given action.
 * @return {Boolean} true if the user can access the ressource, false if not.
 */
User.prototype.checkAccess = function() {
    if (session.user) {
        if (session.user.canAccess()) {
            switch(req.action) {
                case "main":            return session.user.hasPermission("can_access_own");
                case "edit":            return session.user.hasPermission("can_edit_users");
                case "accounting":      return session.user.hasPermission("can_view_bookings");
                case "createBooking":   return session.user.hasPermission("can_add_bookings");
                case "activate":        return session.user.hasPermission("can_edit_users");
                case "deactivate":      return session.user.hasPermission("can_delete_users");
            }
        }
        tenez.Logger.log({message: "Bad access by user " + session.user.username + " for user " + this.username});
    }
    return false;
};

/**
 * Get the date of the first transaction
 * @return {Date} date of the first transaction
 */
User.prototype.getFirstTransactionDay = function() {
    var tx = this.transactions.get(this.transactions.count() - 1);
    if(tx) {
        return tx.date;
    } else {
        return new Date(2010, 0, 1);
    }
};

/**
 * Returns a filtered collection of all transactions of the user
 * @param start {java.util.date} starting date of the transactions
 * @param end {java.util.date} ending date of the transactions
 * @return Filtered collection of all money transactions of the user
 */
User.prototype.filteredTransactionCollection = function(start, end) {
    if (start && end) {
        return Transaction.getCollection({
                    "order": "tra_date DESC",
                    "filter": "tra_user = " + this._id +
                              " AND tra_date >= '" + tenez.Date.getDBString(start) + "'" +
                              " AND tra_date <= '" + tenez.Date.getDBString(end) + "'"
                });
    } else {
        throw "Invalid call! Parameter start or end missing!";
    }
};

/**
 * Checks if the user can access the requested resource
 * @return {Boolean} Returns true if the user can access
 * @author Manuel Mayrhofer
 */
User.prototype.canAccess = function(){
    if (!this.active) {
        return false;
    }

    if(path.length >= 2 && path[2]._prototype === "Club") {
        //if the user belongs to a club, he can only access the own one
        if(this.club) {
            if(this.hasPermission("can_access_own") && path[2] == this.club) {
                return true;
            }
        } else {
           //if the user doesn't belong to a club,
           //he needs systemadministrator permissions to access
           if(this.hasPermission("can_access_all")) {
               return true;
           }
        }
        return false;
    } else {
        return this.isSysAdmin();
    }
};