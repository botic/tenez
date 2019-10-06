/**
 * This default macro handler enables deep macro invocation.
 * @param name {String} the name of the property to access.
 */
HopObject.prototype.getMacroHandler = function(name) {
    if (this[name]) {
        return this[name];
    }
};