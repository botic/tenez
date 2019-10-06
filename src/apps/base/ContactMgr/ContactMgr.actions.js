/**
 * Returns a JSON-encoded array of cities for the given country. This is used to display the
 * jQuery autocompleter for cities.
 * @param country {String} ISO-Code for the country to search in for cities
 * @param q {String} Query-String, which can be a ZIP or a city name 
 */
ContactMgr.prototype.getCities_action = function() {
    var country = req.data.country;
    var query = req.data.q;
    var jsonp = req.data.jsoncallback || "";

    if (country && country.length == 3) {
        try {
            var cities;
            if (query) {
                if (query.length >= 1) {
                    cities = this.citiesForCountry(country, query);
                } else {
                    res.write("Invalid query! Too short, minimum is 1 character. " + query);
                }
            } else {
                cities = this.citiesForCountry(country);
            }
            var result = [];
            var city;
            cities.forEach(function(i) {
                city = cities.get(i);
                result.push({
                    'id':    city._id,
                    'zip':   city.zip,
                    'name':  city.name
                });
            });
            res.write(jsonp + "("+result.toJSON()+")");
        } catch (e) {
            res.write(e);
        }
    } else {
        res.write("Country code invalid! " + country);
    }
};
/**
 * Gets a city with the id
 */
ContactMgr.prototype.getCityById_action = function() {
    var id = req.data.id;
    var jsonp = req.data.jsoncallback || "";
    if (id && !isNaN(id)) {
        var city = City.getById(parseInt(id));
        if (city) {
            var toReturn = {
                'id':   city._id,
                'zip':  city.zip,
                'name': city.name,
                'country': city.country.name_de,
                'countryCode': city.country.code
            };
            res.write(jsonp + "(" + toReturn.toJSON() + ")");
        } else {
            res.write("Invalid City.");
        }
    } else {
        res.write("Invalid call with id! " + id);
    }
};