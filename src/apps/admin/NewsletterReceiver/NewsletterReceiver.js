/**
 * Creates a new NewsletterReceiver object
 * @param user {User} The user, who receives the Newsletter
 */
NewsletterReceiver.prototype.constructor = function(user) {
    if (user != null) {
    	this.user = user;
    } else {
        throw "Invalid NewsletterReceiver! User is missing!";
    }
};