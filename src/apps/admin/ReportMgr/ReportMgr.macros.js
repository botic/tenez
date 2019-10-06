/**
 * Counts all reservations for a club
 * @return {Number} Number of the reservations
 */
ReportMgr.prototype.totalReservationCount_macro = function() {
    var club = this._parent;

    var db = new helma.Database("tenez");
    var query = "select count(*) as total from t_reservation where res_user in (select usr_id from t_user where usr_club = '" + club._id + "');";

    var result = db.query(query);
    if (result[0] && result[0]["total"] != null) {
        return result[0]["total"];
    } else {
        throw "SQL not working in totalReservationCount";   
    }
};

/**
 * Sums all gross values of the club-transactions
 * @return {Number} Sum of all reservation values (without discount) of the club
 */
ReportMgr.prototype.totalEarnings_macro = function() {
    var club = this._parent;

    var db = new helma.Database("tenez");
    var query = "select sum(tra_grossvalue) as total from t_transaction where tra_user in (select usr_id from t_user where usr_club = '" + club._id + "') and tra_grossvalue > 0;";

    var result = db.query(query);
    if (result[0] && result[0]["total"] != null) {
        return result[0]["total"];
    } else {
        throw "SQL not working in totalReservationCount";
    }
};