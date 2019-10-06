/**
 * Edits a usergroup
 */
UserGroup.prototype.edit_action = function() {
  if (req.isPost()) {
        var form = tenez.FormHandler.retrieve();
        if (req.data.discount) {
           req.data.discount = req.data.discount.replace(",", ".");
        }
        if(form && form.evaluate()) {
            this.name        = req.data.name;
            this.description = req.data.description;
            this.discount    = parseFloat(req.data.discount) / 100;

            tenez.FormHandler.remove(form);

            tenez.Logger.log({
                type: "EDIT_USERGROUP",
                message: "Edit of user group: " + this.name,
                message_de: "Kundengruppe bearbeitet: " + this.name
            });

            res.redirect(this.club.href("listUserGroups"));
		}
		if (form) {
            form.keepAlive();
        }
        res.redirect(this.href("edit"));
    }

    tenez.FormHandler.registerNewForm();

	res.data.title = gettext("Kundengruppe bearbeiten");
    res.data.body = this.renderSkinAsString("editUserGroup");
    renderSkin("main");
};

/**
 * Lists all customers from a usergroup.
 */
UserGroup.prototype.listCustomers_action = function() {

	var userlist = res.handlers.userlist = new jala.ListRenderer(this.getUsers());
    userlist.setPageSize(10);
    res.data.body = this.renderSkinAsString("listCustomers");

    res.data.title = gettext("Kunden") + " - " + this.name;
    renderSkin("main");
};
