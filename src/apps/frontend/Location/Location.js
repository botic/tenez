/**
 * Checks if the Location is active at the moment.
 * @return {Boolean} Returns true if the location is active
 */
Location.prototype.checkAccess = function() {
    return this.active;
};