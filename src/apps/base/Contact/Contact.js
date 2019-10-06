/**
 * Creates a new contact. To prevent invalid String values, all fields have to be empty, but never null!
 * @param street {String} First street line of address
 * @param street2 {String} Second street line of address
 * @param city {City} Reference to a city, this can be null!
 * @param phone {String} Phone number. No validation will happen.
 * @param fax {String} Fax number. No validation will happen.
 * @param email {String} E-Mail address of the Contact. No validation will happen.
 * @param url {String} Website of the contact. No validation will happen.
 */
Contact.prototype.constructor = function(street, street2, city, phone, fax, email, url) {
    if (street != null && street2 != null && phone != null && fax != null && email != null && url != null) {
        this.street = street;
        this.street2 = street2;
        this.city = city;
        this.phone  = phone;
        this.fax = fax;
        this.email = email;
        this.url = url;
    } else {
        throw "Invalid Contact! Some parts are missing!";
    }
};