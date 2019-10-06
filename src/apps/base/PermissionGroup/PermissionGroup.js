/**
 * Creates a new permission group
 * @param name {String} Name of the permission group
 */
PermissionGroup.prototype.constructor = function(name) {
    if (name) {
        this.name = name;
    } else {
        throw "Invalid PermissionGroup! Some parts are missing!";
    }
};