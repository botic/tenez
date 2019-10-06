/**
 * Creates a new location
 * @param name {String} Name of the location
 * @param alias {String} Alias of the location
 * @param description {String} Description of the location
 * @param contact {Contact} Contact of the location
 * @param sortorder {Number} Number for the sort sequence in the frontend
 * @param active {Boolean} State of the location. True if the location is in use.
 */
Location.prototype.constructor = function(name, alias, description, contact, sortorder, active) {
    if (name && alias && sortorder != null && active != null) {
        this.name = name;
        this.alias = alias;
        this.description = description;
        this.contact = contact;
        this.sortorder = sortorder;
        this.active = active;
    } else {
        throw "Invalid Court! Some parts are missing!";
    }
};