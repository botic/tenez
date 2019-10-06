// Define the tenez namespace
if (!global.tenez) {
    global.tenez = {};
}

/**
 * @class Manages dynamic form handling an validation.
 * @type tenez.FormHandlerImpl
 */
tenez.FormHandlerImpl = function() {
    var forms = {};

    /**
     * @class Stores all form values, validators and messages for it.
     * @type tenez.FormHandlerImpl.Form
     */
    var Form = function() {
        var count = 0;
        for (var fc in forms) {
            count++;
        }
        
        var id = tenez.Util.generatePin(15);
        var fields = {};
        var currentMessages = [];
        var oldForm;
        var lastAccess = new Date();

        /**
         * Returns the ID of the form.
         * @return {String} ID-String of the Form. 
         */
        this.getId = function() {
            lastAccess = new Date();
            return id;
        };

        /**
         * @ignore
         */
        this.toString = function() {
            return "[FormHandler.Form #" + id + "]";
        };

        /**
         * Timeout of an old form in minutes. If a Form is older than the timeout
         * it will be deleted on the next access of the FormHandler. You can set the
         * timeout in minutes via <tt>tenez.formhandler.timeout</tt> in the <tt>app.properties</tt>.
         * Default is 5 minutes. 
         */
        var timeout = app.properties["tenez.formhandler.timeout"] || 5;

        /**
         * Checks if the form is older than the maximum age which is defined by: <tt>(now - timeout) = oldest</tt>
         * @return {Boolean} true, if it's too old; false if not.
         */
        this.isDirty = function() {
            var diff = Math.floor(new Date().getTime() - lastAccess.getTime()) / 60000;
            if (diff > timeout) {
                return true;
            }
            return false;
        };

        /**
         * This macro initalizes the form and renders the hidden input field
         * with the ID-String of the form. To display the old values (e.g. after a invalid input)
         * you have to set the <tt>old</tt> parameter to the ID of the previous form. A call of the <tt>init_macro</tt>
         * with a <tt>old</tt> parameter will also empty the <tt>res.data.messages</tt> field!
         * 
         * @param old the ID of the previous form, which has the input & validators from the last submit.
         */
        this.init_macro = function(param) {
            if (param.old) {
                if (forms[param.old]) {
                    oldForm = forms[param.old];
                    delete forms[param.old];
                    res.data.message = "";
                }
            }
            return html.hiddenAsString({
                name:  "__formhandlerId__",
                value: this.getId()
            });
        };

        /**
         * This macro adds a field to the form which will be evaluated later.
         * @param {String} message text to display if the validator fails.
         * @param {String} missing text to display if the field is required, but missing.
         * @param {String} validator name of the validator. Examples: <tt>email</tt>, <tt>url</tt>, <tt>pin</tt>, <tt>alias</tt>
         * @param {Boolean} required marks the field as required
         */
        this.add_macro = function(param) {
            if (!param.name) {
                throw "Invalid macro call. Name is missing.";
            }

            this.add(param.name, param.message, param.missing, param.validator, param.required);

            return;
        };

        /**
         * Adds a field to the form which will be evaluated later.
         * @param {String} name the name of the field.
         * @param {String} message text to display if the validator fails.
         * @param {String} missing text to display if the field is required, but missing.
         * @param {String} validator name of the validator. Examples: <tt>email</tt>, <tt>url</tt>, <tt>pin</tt>, <tt>alias</tt>
         * @param {Boolean} required marks the field as required
         */
        this.add = function(name, message, missing, validator, required) {
            if (!name) {
                throw "Invalid call. Name is missing.";
            }

            lastAccess = new Date();

            fields[name] = {};
            fields[name]["message"]      = message   || null;
            fields[name]["missing"]      = missing   || null;
            fields[name]["required"]     = required  || false;
            fields[name]["validator"]    = validator || null;

            return;
        };

        /**
         * Checks the form for required fields, validates the input and pushed the error messages to the message stack.
         * @return {Boolean} <tt>true</tt> if the form input was okay, <tt>false</tt> if it has errors
         */
        this.evaluate = function() {
            lastAccess = new Date();
            var validInput = true;
            for (var name in fields) {
                var field = fields[name];
                var value = field["value"] = req.data[name];

                if (field["required"] && (field["required"] == "true" || field["required"] == true)) {
                    if (!req.data[name] || req.data[name].trim() == "") {
                        validInput = false;
                        currentMessages.push(field["missing"] || field["message"] || "Required field missing: " + name);
                    }
                }

                if (field["validator"] && req.data[name] && req.data[name].trim() != "") {
                    var validator = tenez.FormHandler.VALIDATORS[field["validator"]];
                    if (validator) {
                        if (!validator(value)) {
                            validInput = false;
                            currentMessages.push(field["message"] || "Invalid input: " + name);
                        }
                    } else {
                        throw "Invalid validator: " + field["validator"];
                    }
                }
            }

            return validInput;
        };

        /**
         * Returns the current error message stack. Every single message will be surrounded
         * by a <tt>&lt;p&gt;</tt> element.  
         */
        this.getMessages = function() {
            lastAccess = new Date();
            res.push();
            for (var i = 0; i < currentMessages.length; i++) {
                html.openTag("p", {"class": "formmessage"});
                res.write(currentMessages[i]);
                html.closeTag("p");
            }
            currentMessages = [];
            return res.pop();
        };

        /**
         * Returns a clone of the current message stack
         * @return {Array} a clone of the current message stack
         */
        this.getMessageStack = function() {
            lastAccess = new Date();
            return currentMessages.clone();
        }

        /**
         * Sets <tt>res.message</tt> to the form's id. This is needed to access the old form after a redirect.
         */
        this.keepAlive = function() {
            lastAccess = new Date();
            res.message = id;
        };

        /**
         * Adds a custom error message to the message stack. This could be useful to add additional messages after
         * an invalid input, which is not detected by the form's validators.
         * @param {String} msg the message to add to the stack
         */
        this.addMessage = function(msg) {
            lastAccess = new Date();
            if (msg) {
                currentMessages.push(msg);
            } else {
                throw "Invalid arguments! Message is missing.";
            }
        }

        /**
         * Displays the messages from the previous (old) form.
         */
        this.messages_macro = function() {
            if (oldForm) {
                return oldForm.getMessages();
            }
        };

        /**
         * Returns the value of a given input field from the current form.
         * @param name field to access
         * @return {String} value of the field
         */
        this.getValue = function(name) {
            lastAccess = new Date();
            if (fields[name]) {
                return fields[name]["value"];
            }
        }

        /**
         * Returns the value of a given input field from the old form. This is useful for displaying
         * the input from the previous form after an invalid input.
         * @param {Object} <tt>param.name</tt>: field in the old form to access;
         *                 <tt>param.initWith</tt> for a default value if field not set;
         *                 <tt>param.toPercent</tt> normalize the initWith-value as percent value between 0 and 100
         * @return {String} value of the old form's field
         */
        this.oldValue_macro = function(param) {
            if (param.name) {
                if (oldForm) {
                    return oldForm.getValue(param.name);
                } else if (param.initWith != null) {
                    if (param.toPercent) {
                        return param.initWith * 100;
                    } else {
                        return param.initWith;
                    }
                }
            }
        };
    };

    /**
     * Returns the form after a submit by looking for the <tt>__formhandlerId__</tt> field, which
     * is added by calling the <tt>init</tt> macro in the former request. Note: retrieving a
     * form will also drop dirty forms which have timed out.
     *
     * @return {tenez.FormHandlerImpl.Form} the form to handle, null if no form could be found.
     */
    this.retrieve = function() {
        this.cleanup();
        
        if (req.data["__formhandlerId__"]) {
            return forms[req.data["__formhandlerId__"]];
        }
        return null;
    };

    /**
     * Removes a form from the FormHandler.
     * @param {tenez.FormHandlerImpl.Form} form to remove 
     */
    this.remove = function(form) {
        delete forms[form.getId()];        
    }

    /**
     * Creates a new form and adds it to the FormHandler.
     * @return {String} id of the new form
     */
    this.registerNewForm = function() {
        this.cleanup();

        var form = new Form();
        var id = form.getId();
        forms[id] = form;
        res.handlers.form = form;

        return id;
    };

    /**
     * Looks for the form with the given ID.
     * @param {String} id ID of the form the retrieve.
     */
    this.getForm = function(id) {
        this.cleanup();
        
        return forms[id];
    };

    /**
     * Looks for dirty forms, which timed out, and removes them form the FormHandler.
     * Note: It's much better to delete a form manually after you do not need it anymore!
     */
    this.cleanup = function() {
        for (var formId in forms) {
            if (forms[formId].isDirty()) {
                this.remove(forms[formId]); 
            }
        }
    };
};

/**
 * Single instance of the FormHandlerImpl.
 * @final
 * @type tenez.FormHandlerImpl
 */
tenez.FormHandler = new tenez.FormHandlerImpl();

/**
 * Validators, which return <tt>true</tt> if the input was valid and <tt>false</tt> if not.
 */
tenez.FormHandler.VALIDATORS = {
    "email": function(string) {
        return Packages.org.apache.commons.validator.EmailValidator.getInstance().isValid(string);
    },
    "url": function(string) {
        return Packages.org.apache.commons.validator.UrlValidator().isValid(string);
    },
    "username": function(string) {
        return /^[A-Za-z0-9\_\.\-]+$/.test(string);
   },
    "pin": function(string) {
         return /^[A-Za-z0-9]+$/.test(string);
    },
    "alias": function(string) {
         return /^[a-z0-9\-\_\.]+$/.test(string);
    },
    "phone": function(string) {
    	return /^[0-9\+\/\-\–\ \(\)( x| ext)]+$/.test(string);
    },
    "integer": function(string) {
    	return /^[0-9]+$/.test(string);
    },
    "percent": function(string) {
        if (isNaN(string) || (string.length > 5 && string != "100.00")) {
            return false;
        }
        if (string.charAt(0) == '0' || string.charAt(1) == '.') {
            if (string.length > 4) {
                return false;
            }
        }
        var value = parseFloat(string);
        return (value >= 0 && value <= 100);
    },
    "money": function(string) {
    	return /^[0-9]+([.,][0-9]{1,2})?$/.test(string);
    },
    "nmoney": function(string) {
    	return /^(-)?[0-9]+([.,][0-9]{1,2})?$/.test(string);
    },
    "date": function(string) {
    	var days_of_month = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    	var re = string.match(/^([0-9]{1,2})\.([0-9]{1,2})\.([0-9]{4})$/);
    	if(re) {
    		var d = parseInt(re[1], 10);
    		var m = parseInt(re[2], 10);
    		var y = parseInt(re[3], 10);
    		
    		// Leap Year
    		if(m == 2 && y % 4 == 0) {
    			days_of_month[1]++;
    		}
    		
    		if(m >= 1 && m <= 12 && d >= 1 && d <= days_of_month[m-1]) {
    			return true;
    		}
    	}
    	return false;
    },
    "time": function(string) {
    	var re = string.match(/^([0-9]{1,2}):([0-9]{2})$/);
    	if(re) {
    		var h = parseInt(re[1], 10);
    		var m = parseInt(re[2], 10);
    		if(h >= 0 && h <= 23 && m >= 0 && m <= 59) {
    			return true;
    		}    	
    	}
		return false;    
	}
};
