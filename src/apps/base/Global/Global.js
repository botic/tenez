// Add Helma core libraries
app.addRepository('modules/core/Array.js');
app.addRepository('modules/core/Date.js');
app.addRepository('modules/core/Number.js');
app.addRepository('modules/core/Object.js');
app.addRepository("modules/core/HopObject.js");
app.addRepository('modules/core/String.js');
app.addRepository('modules/core/Global.js');
app.addRepository('modules/core/Filters.js');
app.addRepository('modules/core/JSON.js');

app.addRepository("modules/jala/code/HopObject.js");
app.addRepository("modules/jala/code/I18n.js");
app.addRepository("modules/jala/code/ListRenderer.js");

app.addRepository('modules/helma/Database.js');
app.addRepository('modules/helma/Html.js');
app.addRepository('modules/helma/Mail.js');

var html = new helma.Html();

/**
 * Renders An ErrorSkin Which Shows A Message
 * 
 * @param msg {String} Error Message
 * @author Dominik Gruber
 * @member Global
 */
var renderErrorSkin = function(msg) {
	
	res.data.msg = msg || "Error";
	
	renderSkin("error");
};

/**
 * Looks for a valid Club in the path
 * @return {Club} the club in the current path or null, if no Club can be resolved
 */
var getClubInPath = function() {
    if(path.length >= 2) {
        if(path[2] != null && path[2]._prototype === "Club") {
            return path[2];
        }
    }
    return null;
};

/**
 * Transforms a one digit number into a two digit number
 * @param num {Number}
 * @return {String} Returns eg '08' if given value is '8'
 */
var twoDigits = function(num) {
	if(num < 10) {
		num = "0" + num;
	}
	return num;
};

/**
 * Formats the decimal
 * @param fval decimal to format
 * @return Returns the formatted decimal
 */
var formatDecimal = function(fval) {
    if (isNaN(fval)) {
        return "";
    }

    var df = new java.text.DecimalFormat();
    return df.format(parseFloat(fval));
};

/**
 * Returns the current app
 */
var isFrontend = function() {
	return null;
}

var isBackend = function() {
	return null;	
}