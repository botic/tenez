/**
 * Renders a list of all active locations
 * @return {String} Returns a list of all active locations
 */
Club.prototype.renderLocations_macro = function() {
    res.push();
    for (var i = 0; i < this.locations.count(); i++) {
        if (this.locations.get(i).active) {
            html.openTag("li");
            html.link({
                'href': this.locations.get(i).href()
            }, encode(this.locations.get(i).name));
            html.closeTag("li");
        }
    }
    
    return res.pop();
};