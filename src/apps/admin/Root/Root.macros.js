/**
 * Render a HTML-dropdown with all current currencies
 * @param param.selected {String} ISO 4217 code of the currency to preselect
 * @return {String} Returns the currency drop-down field
 */
Root.prototype.currencyDropdown_macro = function(param) {
    var selected = "EUR";

    if (param.selected) {
        selected = param.selected;
        delete param.selected;
    }

    var options = [];
    var currency;
    for (var i = 0; i < this.currencies.count(); i++) {
        currency = this.currencies.get(i);
        options.push({
            'value': currency.code,
            'display': currency.name
        });
    }

    // FIXME (PN) if a club is in the path, look for his location an use this as default option!
    return html.dropDownAsString(param, options, selected);
}