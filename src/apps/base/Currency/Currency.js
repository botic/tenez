/**
 * Creates a Currency
 * @param name {String} Name of the currency
 * @param code {String} ISO-Code of the currency
 * @param eurvalue {Number} Value of the currency in euro
 */
Currency.prototype.constructor = function(name, code, eurvalue) {
    if (name && code != null && eurvalue != null) {
        this.name = name;
        this.code = code;
        this.eurvalue = eurvalue;
    } else {
        throw "Invalid Currency! Some parts are missing!";
    }
};

/**
 * Gets the symbol of this currency for the specified locale
 * @return {String} the symbol of this currency for the default locale
 */
Currency.prototype.getCurrencySymbol = function() {
    return java.util.Currency.getInstance(this.code).getSymbol();
};
