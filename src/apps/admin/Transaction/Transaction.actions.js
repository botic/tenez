/**
 * Overview of the transactions
 */
Transaction.prototype.main_action = function() {
    res.data.title = gettext("Buchung");
    res.data.body  = this.renderSkinAsString("mainTransaction");

    // Renders the global main skin
    renderSkin("main");
};