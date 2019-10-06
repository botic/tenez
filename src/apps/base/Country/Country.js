/**
 * Creates a new country
 * @param code {String} ISO 3166-1 alpha-3 country code
 * @param name_de {String} country localized name
 */
Country.prototype.constructor = function(code, name_de) {
    if (code && name_de) {
        this.code = code;
        this.name_de = name_de;
    } else {
        throw "Invalid Country! Some parts are missing!";
    }
};