/**
 * Renders the canonical URL of the static directory. This is defined in
 * the apps.properties file, where the application's mounting is done.
 * 
 * @param {String} path to append to the mountpoint
 * @member Global
 */
var staticUrl_macro = function(param) {
    return app.getAppsProperties()["staticMountpoint"] + "/" + (param.path || "");
};

var signout_macro = function(param) {
    if (session.user && param.skin) {
        return session.user.renderSkinAsString(param.skin);
    }
};

/**
 * Gets a boolean input and returns one of the two params
 * 
 * @param true {String} String which will be returned if input is true
 * @param false {String} String which will be returned if input is false
 * @author Philipp Naderer
 * @member Global
 */
var boolean_filter = function(str, param) {
	if (str == true) {
		return param["true"];
	} else if (str == false) {
        return param["false"];
    }
    return "";
};

/**
 * Returns if the given value is equals to the filter input
 * 
 * @param value {Object} Object which the input will be compared to
 * @author Dominik Gruber
 */
var equals_filter = function(value, param) {
    if (param.ignoreCase) {
        return value.toLowerCase() == param.value.toLowerCase();
    }
	return (value == param.value);
}

/**
 * Checks if the current loggin
 * 
 * @param permission {String}
 * @param userHasToBeLoggedIn {Boolean} Default: True
 * @param clubLayer {Boolean} Indicates if action needs to be associated to a club - Default: True
 * @returns Boolean
 * @author Dominik Gruber
 * @member Global
 */
var checkPermission_macro = function(param) {
	
	var permission = param.permission || false;
	
	var userHasToBeLoggedIn = true;
	if(param.userHasToBeLoggedIn === "false") {
		userHasToBeLoggedIn = false;
	}
	
	var clubLayer = true;
	if(param.clubLayer === "false") {
		clubLayer = false;
	}
	
	// Permission Check
	if( (userHasToBeLoggedIn && !session.user) ||
		(permission && session.user && !session.user.hasPermission(permission)) ||
		(clubLayer && path.length < 2) ||
		(clubLayer && path.length >= 2 && path[2]._prototype !== "Club") 
	  ) {
        return false;
	}

	return true;
};

/**
 * Creates a <tt>&lt;a&gt;</tt> around with the given input as <tt>href</tt>.
 * @param href {String} input of the filter to link
 * @param param {Object} <tt>param.text</tt> will be rendered as text of the link, additional parameters will be passed through to <tt>helma.Html.linkAsString()</tt>.
 */
var link_filter = function(href, param) {
    if (typeof(href) != "string") {
        return;
    }
    
    var text = param.text || href;

    if (param.text) {
        delete param.text;
    }

    param.href = href;

    return html.linkAsString(param, text);
};

/**
 * Checks if the given object is not null and calls it's <tt>href()</tt> function.
 * @param obj
 * @param param {Object} <tt>param.action</tt> - use this as parameter for the <tt>href()</tt> call.
 */
var href_filter = function(obj, param) {
    if (obj) {
        return obj.href(param.action || "");
    }
}

/**
 * Returns the Club object if there is a Club in the path.
 */
var currentClub_macro = function() {
    return getClubInPath();
};

/**
 * Returns the currency code of the current club
 */
var currencyCode_macro = function(param) {
    return tenez.Money.getCode();
};

/**
 * Returns the currency symbol of the current club
 */
var currencySymbol_macro = function(param) {
    return tenez.Money.getSymbol();
};

/**
 * Writes out a query parameter.
 * @param param {Object} <tt>param.name</tt> - the name of the query param
 */
var queryParams_macro = function(param) {
    if (param.name && req.queryParams[param.name]) {
        return req.queryParams[param.name];
    }
};

/**
 * Multiplies the given float value by 100
 * @param fval {Float} to format
 */
var toPercent_filter = function(fval, param) {
    return (fval * 100).toFixed(2);
};

/**
 * Multiplies the given number with -1
 * @param number to format
 */
var multNegOne_filter = function(number, param) {
	return parseFloat(number) * -1;
}

/**
 * Formats the given float value as money - eg "123,20"
 * @param fval {Float} to format
 */
var formatMoney_filter = function(fval, param) {
    if (isNaN(fval)) {
        return "NaN";
    }

    var df = new java.text.DecimalFormat();
    df.setMinimumFractionDigits(2);
    return df.format(parseFloat(fval));
};

/**
 * Formats the given date to 'dd.mm.yyyy'
 * @param date {Date} The Date
 * @return
 */
var formatDate_filter = function(date, param) {
	if(!date) {
		return "";
	}
	
    return twoDigits(date.getDate()) + "." + twoDigits(date.getMonth() + 1) + "." + date.getFullYear();
};

/**
 * Formats the given date to 'hh:mm'
 * @param date {Date} The Date
 * @param param {Object} <tt>action</tt> - if val = "set2359to2400" then "24:00" is returned instead of "23:59"
 * @return
 */
var formatTime_filter = function(date, param) {	
	if(!date) {
		return "";
	}
	
	var time = twoDigits(date.getHours()) + ":" + twoDigits(date.getMinutes());

	if(param && param.action && param.action == "set2359to2400" && time == "23:59") {
		time = "24:00";
	}
	
	return time;
};

/**
 * Returns the weekday of the given date as string
 * @param date {Date} The Date
 */
var formatWeekday_filter = function(date) {
	return tenez.Date.getWeekdayString(date);
}

/**
 * Returns given text if daymask is true on the given day - else ''
 * @param daymask
 * @param param {Object} <tt>day</tt> - day (1 - Mo ... 7 - Su), <tt>text</tt> ... return value
 * @return
 */
var formatDaymaskForDay_filter = function(daymask, param) {
	
	if(daymask && param.day && daymask.substr(param.day-1, 1) == "1") {
		return param.text || "X";
	}
	
	return "";
};

/**
 * Adds one day to a date
 * @param date {Date} The Date
 */
var plusOneDay_filter = function(date, param) {
	return tenez.Date.addDaysToDate(date, 1);
}

/**
 * Subtracts one day from a date
 * @param date {Date} The Date
 */
var minusOneDay_filter = function(date, param) {
	return tenez.Date.addDaysToDate(date, -1);
}

/**
 * Renders the specified parameter, if it's name matches the input string.
 */
var switch_filter = function(thecase, param) {
    if (param[thecase]) {
        return param[thecase];
    } else if(param["default"]) {
        return param["default"];
    }
    return "";
};

/**
 * Looks if there is a given query params.
 * @param param {Object} <tt>param.name</tt> the name of the query parameter
 * @return {String} the value of the param
 */
var queryParam_macro = function(param) {
    return (param.name ? req.params[param.name] : false)
};

/**
 * Checks if the input is null or not.
 * @param val the input for the filter.
 * @return {Boolean} <tt>true</tt>, if input is null; <tt>false</tt>, if not.
 */
var isNull_filter = function(val) {
    return val == null;
};

var formatDecimal_filter = function(fval, param) {
    return formatDecimal(fval);
};

var isBigger_macro = function(param) {
    if (param.than && param.value) {
        return (param.than < parseInt(param.value, 10));
    }
};

/**
 * Returns the current Date.
 */
function nowDate_macro() {
    return new Date();
}

/**
 * Appends <tt>param.str</tt> to the input.
 * @param input {String} the input.
 * @param param {Object} <tt>param.str</tt> - the String to append.
 */
function append_filter(input, param, str) {
    return input + (param.str || str || "");
}