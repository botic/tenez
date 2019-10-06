/**
 * Renders a dropdown for all existing countries.
 * @param param attributes for the select box. For more information look at helma.Html.dropDownAsString(param)
 */
ContactMgr.prototype.countryDropdown_macro = function(param) {
    var options = [];
    var country;
    for (var i = 0; i < this.countries.count(); i++) {
        country = this.countries.get(i);
        options.push({
            'value': country.code,
            'display': country.name_de
        });
    }

    // FIXME (PN) if a club is in the path, look for his location and use this as default option!
    return html.dropDownAsString(param, options, "AUT");
};

ContactMgr.prototype.renderCityInput_macro = function(param) {
    return this.renderSkinAsString("cityInput", param);    
};