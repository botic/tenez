/**
 * Initializes parameter for the application monitor on start up
 */

var onStart = function() {
    app.data.stat = {
        'counter': 0,
        'requests': [0],
        'errors':   [0],
        'notfounds':[0],
        'memory':   [0],
        'cache':    [0],
        'session':  [0]
    };

    app.data.notfoundCount = 0;

    app.addCronJob("tenez.Logger.collectStats", "*", "*", "*", "*", "*", "0,15,30,45");
};

/**
 * Returns the current application
 */
var isFrontend = function() {
	return false;
}

var isBackend = function() {
	return true;	
}