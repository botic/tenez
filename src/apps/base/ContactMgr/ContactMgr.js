/**
 * Searches for a zip code or city name in the given country.
 * @param code {String} Country code of the country to search in
 * @param query {String} Zip code or a part of the city's name
 * @return {HopObject} Collection of Cities which match the query.
 */
ContactMgr.prototype.citiesForCountry = function(code, query) {
    var country = this.countries.get(code);
    var search = "";

    if (query) {
        query = query.toLowerCase();
        // This is to improve the performance for Austrian cities.
        if (code == 'AUT' || code == 'GER') {
            if (isNaN(query)) {
                search = " AND LOWER(cit_name) LIKE '%" + query + "%'";
            } else {
                search = " AND cit_zip LIKE '" + query + "%'";
            }
        } else {
            search = " AND (LOWER(cit_name) LIKE '%" + query + "%' OR cit_zip LIKE '" + query + "%')";
        }
    }

    if (country) {
        return City.getCollection({
            order: "cit_zip",
            filter: "cit_country = " + country._id + search
        });
    } else {
        throw "Invalid country code!";
    }
};

/**
 * This is needed to get the override the default onRequest method.
 * The ContactMgr does not need any Session information etc.
 */
ContactMgr.prototype.onRequest = function() {};