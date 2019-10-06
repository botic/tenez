/**
 * Renders a drop-down to select a period
 * @param param {Number} Time period to preselect
 * @return {String} Returns the time period drop-down field
 */
var periodDropdown_macro = function(param) {
    var options = [
        { 'value': 0, 'display': gettext("Keine Sperrfrist") },
        { 'value': 10, 'display': gettext("10 Minuten") },
        { 'value': 20, 'display': gettext("20 Minuten") },
        { 'value': 30, 'display': gettext("30 Minuten") },
        { 'value': 40, 'display': gettext("40 Minuten") },
        { 'value': 50, 'display': gettext("50 Minuten") },
        { 'value': 60, 'display': gettext("1 Stunde") },
        { 'value': 120, 'display': gettext("2 Stunden") },
        { 'value': 180, 'display': gettext("3 Stunden") },
        { 'value': 240, 'display': gettext("4 Stunden") },
        { 'value': 300, 'display': gettext("5 Stunden") },
        { 'value': 360, 'display': gettext("6 Stunden") },
        { 'value': 420, 'display': gettext("7 Stunden") },
        { 'value': 480, 'display': gettext("8 Stunden") },
        { 'value': 540, 'display': gettext("9 Stunden") },
        { 'value': 600, 'display': gettext("10 Stunden") },
        { 'value': 660, 'display': gettext("11 Stunden") },
        { 'value': 720, 'display': gettext("12 Stunden") },
        { 'value': 780, 'display': gettext("13 Stunden") },

        { 'value': 840, 'display': gettext("14 Stunden") },
        { 'value': 900, 'display': gettext("15 Stunden") },
        { 'value': 960, 'display': gettext("16 Stunden") },
        { 'value': 1020, 'display': gettext("17 Stunden") },
        { 'value': 1080, 'display': gettext("18 Stunden") },
        { 'value': 1140, 'display': gettext("19 Stunden") },
        { 'value': 1200, 'display': gettext("20 Stunden") },
        { 'value': 1260, 'display': gettext("21 Stunden") },
        { 'value': 1320, 'display': gettext("22 Stunden") },
        { 'value': 1380, 'display': gettext("23 Stunden") },

        { 'value': 1440, 'display': gettext("1 Tag") },
        { 'value': 2160, 'display': gettext("1,5 Tage") },
        { 'value': 2880, 'display': gettext("2 Tage") },
        { 'value': 3600, 'display': gettext("2,5 Tage") },
        { 'value': 5040, 'display': gettext("3 Tage") },
        { 'value': 6480, 'display': gettext("4 Tage") },
        { 'value': 7920, 'display': gettext("5 Tage") },
        { 'value': 9360, 'display': gettext("6 Tage") },
        { 'value': 20800, 'display': gettext("1 Woche") }
    ];
    var selected = param.selected || 1440;
    delete param.selected;

    // FIXME (PN) if a club is in the path, look for his location an use this as default option!
    return html.dropDownAsString(param, options, selected);
};

/**
 * Renders a drop-down to select a time zone
 * @param param {String} Time zone to preselect
 * @return {String} Returns the time zone drop-down field 
 */
var timezoneDropdown_macro = function(param) {
    var selected = "Europe/Vienna";
    if (param.selected) {
        selected = param.selected;
        delete param.selected;
    }

    var options = [];
    var tmz = java.util.TimeZone.getAvailableIDs();
    tmz.sort();
    for (var i = 0; i < tmz.length; i++) {
        if (tmz[i].indexOf("/") > 3 && tmz[i].indexOf("SystemV") < 0) {
            options.push({
               value: tmz[i],
               display: tmz[i]
            });
        }
    }


    // FIXME (PN) if a club is in the path, look for his location an use this as default option!
    return html.dropDownAsString(param, options, selected);
};

/**
 * Returns <tt>true</tt>, if the Club has at least one Location, <tt>false</tt> if not.
 */
var clubHasLocations_macro = function() {
    var club = getClubInPath();
    if(club && club.locations.count() > 0) {
        return true;
    }
    return false;
};