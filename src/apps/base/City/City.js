/**
 * Creates a new city
 * @param zip {String} Zip code of the city
 * @param name {String} Name of the city
 */
City.prototype.constructor = function(zip, name) {
    if (zip && name) {
        this.zip = zip;
        this.name = name;
    } else {
        throw "Invalid City! Some parts are missing!";
    }
};