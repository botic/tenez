/**
 * Creates a new UserGroup.
 * @param name {String} name of the UserGroup
 * @param description {String} a short description
 * @param discount {Number} discount in percent, has to be between 0.0 and 1.0
 */
UserGroup.prototype.constructor = function(name, description, discount) {
    if (discount && (discount > 1 || discount < 0)) {
        throw "Invalid discount! " + discount + " is not in [0,1]";        
    }

    if (name) {
        this.name = name;
        this.description = description || "";
        this.discount = discount.toFixed(4) || 0;
    } else {
        throw "Invalid UserGroup! Name is missing!";
    }
};

/**
 * Returns the users of the usergroup
 */
UserGroup.prototype.getUsers = function() {
	
	var users = new Array();

	for(var i=0; i < this.club.users.count(); i++) {
		var user = this.club.users.get(i);
		if(user.isMemberOfUsergroup(this)) {
			users.push(user);
		}
	}
	
	return users;
}