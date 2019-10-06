/**
 * Creates a new permission
 * @param name {String} Name of the permission e.g. can_view_javadoc 
 */
Permission.prototype.constructor = function(name) {
    this.name = name;
};