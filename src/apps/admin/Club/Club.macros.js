/**
 * Renders the user group check-boxes and check the box with the given id
 * @param param {Number} ID of the selected user group
 * @return {String} Returns the check-boxes for the user group selection
 */
Club.prototype.userGroupCheckbox_macro = function(param) {
    res.push();

    var selected = -1;
    if (param.selected) {
        selected = param.selected;
        delete param.selected;
    }

    var ugp, options;
    for (var i = 0; i < this.usergroups.count(); i++) {
        ugp = this.usergroups.get(i);
        options = {
            "name": param.name,
            "class": "checkboxInput " + (param["class"] || ""),
            "value": ugp._id,
            "id": "usergroup_" + ugp._id
        };

        if (selected == ugp._id) {
            options["checked"] = "checked";
        }

        html.openTag("div", {"class": "checkboxLine"});
        html.checkBox(options);
        html.openTag("label", {"for": "usergroup_" + ugp._id, "class": "forinput"});
        res.write(ugp.name);
        html.closeTag("label");
        html.closeTag("div");
    }
    
    return res.pop();
};

Club.prototype.permissionGroupDropdown_macro = function(param) {
    if (!session.user || !session.user.hasPermission("can_set_permissiongroup")) {
        return;
    }

    var options = [{value: -1, display: gettext("Keine Berechtigungsgruppe")}];
    for (var i = 0; i < root.usermgr.permissiongroups.count(); i++) {
        var pgp = root.usermgr.permissiongroups.get(i);
        if (pgp != root.getSysAdminPermissionGroup()) {
            options.push({
                value: pgp._id,
                display: pgp.name
            });
        }
    }

    var selected = -1;
    if (param.selected && !isNaN(param.selected)) {
        selected = param.selected;
    }

    return html.dropDownAsString({name: "permissiongroup", id: "permissiongroup"}, options, selected);
};

/**
 * Renders a drop-down with every user and his email
 * @return {String} Return a HTML-dropdown
 */
Club.prototype.memberlist_macro = function(param) {
	
    var options = [];
    var usrs;
    for (var i = 0; i < this.users.count(); i++) {
        user = this.users.get(i);
       
        if ((user.contact != null) && (user.contact.email != "")){
        	
        		selected = user.contact.email
        		options.push({
        		
        		'value': user.contact.email,
        		'display': user.username
        	});
        		
        }
                
    }
    
    return html.dropDownAsString(param, options, selected);
     
};
/**
 * Renders a list of the receivers from a given newsletter
 * @param param.newsletter {Number} Newsletter ID
 * @return {String} List of all receivers
 */
Club.prototype.newsletterArchive_macro = function(param) {
	res.push();
	var newsId = param.newsletter;
		
	var newsletter = this.newsletters.get(newsId);
	if (newsletter != null) {
        for (var j = 0; j < newsletter.receivers.count(); j++){
            res.write(encode(newsletter.receivers.get(j).user.username) + "; ");
        }
    }
	
	return res.pop();
};


