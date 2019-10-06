/**
 * Creates a new newsletter object
 * @param subject {String} Subject of the newsletter
 * @param body {String} Message/Text of the newsletter
 * @param user {User} User who is sending the newsletter
 * @param club {Club} Club which the sender belongs to
 * @param date {Date} Sending date of the newsletter
 */
Newsletter.prototype.constructor = function(subject, body, user, club, date) {
    if (subject && body && user && club) {
    	this.date = date;
    	this.subject = subject;
        this.body = body;
        this.user = user;
        this.club = club;
        
    } else {
       throw "Invalid Newsletter! Some parts are missing!";
    }
};
