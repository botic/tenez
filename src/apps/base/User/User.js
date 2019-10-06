/**
 * Creates a new user
 * @param username {String} User name of the user
 * @param password {String} Password of the user
 * @param firstname {String} First name of the user
 * @param lastname {String} Last name of the user
 * @param title {String} Title of the user
 * @param company {String} Company of the user
 * @param isCompany {Boolean} True if the user/customer is a company
 * @param active {Boolean} State of the user. True if the user is active.
 * @param contact {Contact} Contact of the user
 * @param permissiongroup {PermissionGroup} Permission group to which the user belongs to
 * @param isprepaid {Boolean} If true bookings are only accepted with a positive credit balance
 */
User.prototype.constructor = function(username, password, firstname, lastname, title, company, isCompany, active, contact, permissiongroup, isprepaid) {
    if (username && password && firstname != null && lastname != null && title != null && company != null && isCompany != null && active != null) {
        this.createtime = new Date();
        this.username = username.toLowerCase();
        this.password = password;
        this.firstname = firstname;
        this.lastname  = lastname;
        this.title = title;
        this.company = company;
        this.iscompany = isCompany;
        this.active = active;
        this.contact = contact || null;
        this.isprepaid = (isprepaid != null ? isprepaid : true);
        this.permissiongroup = permissiongroup || null;
    } else {
        throw "Invalid User! Only contact and permissiongroups are optional!";
    }
};

/**
 * Checks if the user has the requested permission
 * @param permissionname 
 * @return Returns true if the user has the permission
 * @author Manuel Mayrhofer
 */
User.prototype.hasPermission = function(name){
    if (!this.active) {
        return false;
    }

    //User belongs to a permissiongroup
    if(this.permissiongroup){
        var auth;
        for(var i=0; i < this.permissiongroup.authorizations.count(); i++){
            auth = this.permissiongroup.authorizations.get(i);
            
            //if the user has the requested permission
            if(auth.permission.name == name){
                return true;
            }
        }
    }
        
    return false;
};

/**
 * Checks if the user is a sysadmin
 * @return {Boolean} true if it is a sysadmin, false if not
 */
User.prototype.isSysAdmin = function() {
    if (!this.active) {
        return false;
    }
    
    if (this.permissiongroup != null && this.club == null) {
        return this.permissiongroup == root.getSysAdminPermissionGroup();
    }

    return false;
};

/**
 * Returns the Discount of the User
 * @return [0.0, 1.0] (0.0 = no discount, 0.2 = 20% discount, 1.0 = full discount)
 * @author Dominik Gruber
 */
User.prototype.getDiscount = function(name){
	
	var discount = 0.0;
	
	var membership, usergroup;
    for (var i = 0; i < this.usergroupmemberships.count(); i++) {
        membership = this.usergroupmemberships.get(i);
        usergroup = membership.usergroup;

        if(usergroup.discount > discount) {
			discount = usergroup.discount;
		}
    }
	
	return parseFloat(discount);
};

/**
 * Adds the User to a UserGroup
 * @param group {UserGroup} the UserGroup to add for the user
 */
User.prototype.addUserGroupMembership = function(group) {
    if (group._prototype === "UserGroup") {
        if (this.isMemberOfUsergroup(group)) {
            throw "User already in group " + group.name;
        }

        var membership = new UserGroupMember();
        membership.usergroup = group;
        membership.user = this;
        this.usergroupmemberships.add(membership);
    } else {
        throw "Invalid UserGroup. Object is typeof " + typeof(group);
    }
}

/**
 * Checks if the User is already in the given UserGroup.
 * @param group {UserGroup} the UserGroup to check
 * @return {Boolean} true, if he is member in the UserGroup, false if not or if not active.
 */
User.prototype.isMemberOfUsergroup = function(group) {
    if (!this.active) {
        return false;
    }

    if (group._prototype === "UserGroup") {
        for (var i = 0; i < this.usergroupmemberships.count(); i++) {
            membership = this.usergroupmemberships.get(i);
            if (membership.usergroup == group) {
                return true;
            }
        }
        
        return false;
    } else {
        throw "Invalid call of isMemberOfUsergroup!";
    }
};

/**
 * Removes the User from a UserGroup
 * @param group {UserGroup} the UserGroup to add for the user
 */
User.prototype.removeUserGroupMembership = function(group) {
    if (group._prototype === "UserGroup") {
        var membership;
        var toRemove = [];
        for (var i = 0; i < this.usergroupmemberships.count(); i++) {
            membership = this.usergroupmemberships.get(i);
            if (membership.usergroup == group) {
                toRemove.push(membership);
            }
        }
        for (var i = 0; i < toRemove.length; i++) {
            this.usergroupmemberships.removeChild(toRemove[i]);
            toRemove[i].remove();
        }
    } else {
        throw "Invalid UserGroup. Object is typeof " + typeof(group);
    }
};

/**
 * Removes all UserGroups from the User.
 */
User.prototype.removeAllUserGroupMemberships = function() {
    var toRemove = [];
    for (var i = 0; i < this.usergroupmemberships.count(); i++) {
        toRemove.push(this.usergroupmemberships.get(i));
    }
    for (var i = 0; i < toRemove.length; i++) {
        this.usergroupmemberships.removeChild(toRemove[i]);
        toRemove[i].remove();
    }
};

/**
 * Returns the currenct balance of the User's account.
 * @param start {Date} date to start with the transactions
 * @param end {Date} date to end with the transactions
 * @param filter {Number} filters positive (1) or negative (-1) transactions
 */
User.prototype.getBalance = function(start, end, filter) {
    var db = new helma.Database("tenez");

    var query = "select sum(tra_grossvalue) as balance from t_transaction where tra_user = " + this._id;

    if (start != null) {
        query += " AND tra_date >= '" + start.format("yyyy-MM-dd HH:mm:ss") + "'";
    }

    if (end != null) {
        query += " AND tra_date <= '" + end.format("yyyy-MM-dd HH:mm:ss") + "'";        
    }

    if (filter) {
        if (filter > 0) {
            query += " AND tra_grossvalue > 0";
        } else if (filter < 0) {
            query += " AND tra_grossvalue < 0";
        } else {
            throw "Invalid filter value. Only -1 and 1 are allowed!";
        }
    }

    var result = db.query(query + ";");
    if (result[0] && result[0]["balance"]) {
        return result[0]["balance"];
    }

    return 0;
};

/**
 * Returns the full name of a user
 * @param delim {String} Delimiter symbol 
 * @return {String} Full name of a user
 */
User.prototype.fullname = function(delim) {
    var cdelim = delim || " ";
    return (this.title + cdelim + this.firstname + cdelim + this.lastname).replace(/[ ]{2,}/, " ").trim();
}