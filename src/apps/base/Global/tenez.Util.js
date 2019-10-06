// Define the tenez namespace
if (!global.tenez) {
    /**
     * @name tenez
     * @namespace
     */
    global.tenez = {};
}

/**
 * @class tenez.UtilImpl provides several useful functions like generating a random pin code.
 * @type tenez.UtilImpl
 */
tenez.UtilImpl = function() {
    var r = java.security.SecureRandom.getInstance("SHA1PRNG");

    /**
     * Generates a random pin code.
     * @author Manuel Mayrhofer
     * @param digits {Number} digits length of the pin to generate
     * @return {String} Returns the generated pin
     * @member tenez.UtilImpl
     */
    this.generatePin = function(digits){
            var length = digits || 5;
            var pinchars = ['1','2','3','4','5','6','7','8','9',
                            'A','B','C','D','E','F','G','H','J',
                            'K','L','M','N','P','Q','R','S','T',
                            'U','V','W','X','Y','Z'];

            var pin = "";
            var index = 0;

            for (var i=0; i < length; i++){
                index = java.lang.Math.abs(r.nextInt(pinchars.length));
                pin = pin + pinchars[index];
            }

            return pin;
    };

    /**
     * This function tries to remove all non-ASCII-128 characters and replace it with it's ASCII-128 equivalent character.
     * This conversion only works with lower case strings!
     * @param str the input string to sanitize
     * @return {String} the sanitized String; unknow characters will be removed.
     */
    this.sanitizeCharacters = function(str) {
        return str.replace(/[ääăâàáãåæ]/g, "a").replace(/[ćčç]/g, "c").replace(/[ęěèéëêë]/g, "e")
                .replace(/[ìíîïî]/g, "i").replace(/[ðòőóôõö]/g, "o").replace(/[ññň]/g, "n")
                .replace(/[ùúûüü]/g, "u").replace(/[ýÿ]/g, "y").replace(/[ř]/g, "r").replace(/[ţț]/g, "t")
                .replace(/[ß]/g, "ss").replace(/[şșŝ]/g, "s").replace(/[^A-Za-z0-9\_\.\-]/g, "");
    };
};

/**
 * Default instance of UtilImpl. To improve performance we create only one
 * instance of tenez.UtilImpl at start up and access it with tenez.Util
 * 
 * @type tenez.UtilImpl
 * @see tenez.UtilImpl
 * @final
 */
tenez.Util = new tenez.UtilImpl();

