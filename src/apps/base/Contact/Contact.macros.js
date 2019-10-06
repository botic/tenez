/**
 * Returns the id of the city, if it's defined for the Contact. This macro is
 * used to render the City-Autocompleter with jQuery.
 */
Contact.prototype.getCityId_macro = function() {
    return (this.city ? this.city._id : "");
};

/**
 * Returns the name of the city, if there is a city object defined for the Contact. 
 * This macro is used to render the Userlist.
 */
Contact.prototype.getCityAsString_macro = function() {	
	if(this.city != null) {
	return this.city.name;
	}
	else {
	return "";	
	}
};

/**
 * Returns the name of the country, if there is a city object defined for the Contact. 
 * This macro is used to render the Userlist.
 */
Contact.prototype.getCountryAsString_macro = function() {
	if(this.city != null){
		return this.city.country.name_de;
	}
	else {
		return "";
	}
};

/**
 * Checks if the Contact has an E-Mail.
 * @return {Boolean} <tt>true</tt>, if the Contact has an E-Mail
 */
Contact.prototype.hasEmail_macro = function() {
    return this.email.isEmail();  
};