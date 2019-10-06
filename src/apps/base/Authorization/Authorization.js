/**
 * Creates a new authorization
 * @param permission {Permission}
 */
Authorization.prototype.constructor = function(permission) {
    if (permission) {
        this.permission = permission;
    } else {
        throw "Permission missing!";    
    }
};