/**
 * Getter for the JSON value. This will be called by accessing log.value
 */
Log.prototype.__defineGetter__("value", function() {
    return (this.privatevalue ? this.privatevalue.parseJSON() : null );
});

/**
 * Setter for the JSON value. This will be called by setting log.value
 */
Log.prototype.__defineSetter__("value", function(val) {
   this.privatevalue = val.toJSON();
});