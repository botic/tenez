/**
 * Renders the User's full name including the title
 * @param param {Object} you can define the delimiter between the title, firstname and lastname with <tt>param.delim</tt>. Default is space.
 * @return {String} full name with the delimiter.
 */
User.prototype.fullname_macro = function(param) {
    var delim = param.delim || " ";

    var fullname;
    if(this.iscompany) {
    	fullname = this.company;
    } else {
    	fullname = this.fullname(delim);
    }
    
    if(fullname.match(/^ {0,}$/) != null) {
    	fullname = this.username;
    }

    return fullname;
};

/**
 * Checks if the User is member of the SysAdmin-PermissionGroup.
 * @return {Boolean} <tt>true</tt> if the User is a SysAdmin, otherwise <tt>false</tt>.
 */
User.prototype.isSysAdmin_macro = function() {
    return this.isSysAdmin();
};

/**
 * Returns if the User object is the current User
 * @return {Boolean} <tt>true</tt> if the User Object is the current User, otherwise <tt>false</tt>.
 */
User.prototype.isCurrentUser_macro = function(param) {
	
	if(session.user && session.user._id == this._id) {
		return true;
	}
	
	return false;
};

/**
 * Returns the current balance of the User's account.
 */
User.prototype.balance_macro = function(param) {
    if (param.start) {
        if (param.end) {
            return this.getBalance(new Date(param.start), new Date(param.end));
        } else {
            return this.getBalance(new Date(param.start));
        }
    }
    return this.getBalance();
};

/**
 * Returns the current credits of the User's account.
 */
User.prototype.credits_macro = function(param) {
    if (param.start) {
        if (param.end) {
            return this.getBalance(new Date(param.start), new Date(param.end), 1);
        } else {
            return this.getBalance(new Date(param.start), null, 1);
        }
    }
    return this.getBalance(null, null, 1);
};

/**
 * Returns the current debits of the User's account.
 */
User.prototype.debits_macro = function(param) {
    if (param.start) {
        if (param.end) {
            return this.getBalance(new Date(param.start), new Date(param.end), -1);
        } else {
            return this.getBalance(new Date(param.start), null, -1);
        }
    }
    return this.getBalance(null, null, -1);
};