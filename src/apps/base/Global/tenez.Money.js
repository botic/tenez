// Define the tenez namespace
if (!global.tenez) {
    global.tenez = {};
}


tenez.MoneyImpl = function() {
    return this;
};

/**
 * Returns a formatted string
 * @param {Number} amount
 * @return {String} Returns the formatted amount
 * @author Dominik Gruber
 */
tenez.MoneyImpl.prototype.format = function(amount) {

	// Get Club
	var club = getClubInPath();
    
    // Get Currency
	var currency = null;
    if(club) {
    	currency = java.util.Currency.getInstance(club.currency.code);
    }
    
    // NumberFormat
    var nf = new java.text.DecimalFormat();
    if(currency) {
    	nf.setCurrency(currency);
    }
    	
	return nf.getCurrencyInstance().format(amount);	
};

/**
 * Returns the currency code of the country where the club is located
 * @author Dominik Gruber
 * @return {String} Code of the currency
 */
tenez.MoneyImpl.prototype.getCode = function() {

	// Get Club
	var club = getClubInPath();
    
    // Return Code
    if(club) {
    	return club.currency.code;
    }
    
    return "";
};

/**
 * Returns the currency symbol of the country where the club is located
 * @return {String} Symbol of the currency
 */
tenez.MoneyImpl.prototype.getSymbol = function() {

	// Get Club
	var club = getClubInPath();

    // Return Code
    if(club) {
    	return club.currency.getCurrencySymbol();
    }

    return "";
};

tenez.Money = new tenez.MoneyImpl();
