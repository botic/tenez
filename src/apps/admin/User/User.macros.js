/**
 * Renders the UserGroup checkbox for the current User.
 * @param param.name {String} Option name of the Checkbox
 * @return {String} Returns HTML-checkboxes for the usergroups
 */
User.prototype.userGroupCheckbox_macro = function(param) {
    res.push();

    var ugp, options;
    for (var i = 0; i < this.club.usergroups.count(); i++) {
        ugp = this.club.usergroups.get(i);
        options = {
            "name": param.name,
            "class": "checkboxInput " + (param["class"] || ""),
            "value": ugp._id,
            "id": "usergroup_" + ugp._id
        };

        if (this.isMemberOfUsergroup(ugp)) {
            options["checked"] = "checked";
        }

        if (param.disabled) {
            options["disabled"] = "disabled";
        }

        html.openTag("div", {"class": "checkboxLine"});
        html.checkBox(options);
        html.openTag("label", {"for": "usergroup_" + ugp._id, "class": "forinput"});
        res.write(encode(ugp.name));
        html.closeTag("label");
        html.closeTag("div");
    }

    return res.pop();
};

/**
 * Renders a HTML-dropdown to select the permission group of a user
 * @param param.skin {String} Name of the skin
 * @return {String} Returns the result of the rendered skin with the drop-down 
 */
User.prototype.permissionGroupDropdown_macro = function(param) {
    if (!session.user || !session.user.hasPermission("can_set_permissiongroup")) {
        return;
    }

    if (!param.skin) {
        throw "Invalid macro call: no skin defined!";
    }

    var options = [{value: -1, display: gettext("Keine Berechtigungsgruppe")}];
    for (var i = 0; i < root.usermgr.permissiongroups.count(); i++) {
        var pgp = root.usermgr.permissiongroups.get(i);
        if (pgp != root.getSysAdminPermissionGroup()) {
            options.push({
                value: pgp._id,
                display: encode(pgp.name)
            });
        }
    }

    var selected = (this.permissiongroup != null ? this.permissiongroup._id : -1);
    
    return this.renderSkinAsString(param.skin, {dropdown: html.dropDownAsString({name: "permissiongroup", id: "permissiongroup"}, options, selected)});
};

/**
 * Macro which returns the signout url. The url depends on if the user belongs to a club or not.
 * @return {String} Url to signout
 */
User.prototype.signoutUrl_macro = function() {
    if (session.user) {
        if (session.user.club) {
            return session.user.club.href("signout");
        } else {
            return root.href("signout");            
        }
    }
};

/**
 * Macro which returns the User's password. This macro also checks if the current logged in User is
 * allowed to see the password.
 * @return {String} Password of the user
 */
User.prototype.password_macro = function()  {
    if (session.user && session.user.canAccess()) {
        return this.password;
    } else {
        throw "Invalid access! User is not allowed to see the password of " + this.username;
    }
};

/**
 * Checks if the User has a special permission
 * @param param {Object} <tt>param.name</tt> should contain the permission's name
 * @return {Boolean} Returns true if the user has the permission
 */
User.prototype.hasPermission_macro = function(param) {
    if (param.name) {
        return this.hasPermission(param.name);
    }
    
    return false;
};