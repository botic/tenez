// Define the tenez namespace
if (!global.tenez) {
    global.tenez = {};
}

/**
 * @class tenez.LoggerImpl handles all the logging stuff which should be done by the application.
 * @type tenez.LoggerImpl
 */
tenez.LoggerImpl = function() {
    /**
     * Writes an object into the database for logging. The value will be transformed into
     * a JSON encoded object. The log record contains implicit fields IP (via http_remotehost),
     * date (creation time), user (session.user or null), the application name and the called action.
     * @param {Object} value Object to log
     */
    this.log = function(value) {
        if (value == null || "object" !== typeof value) {
            throw "Invalid value";
        }

        var log = new Log();
        log.ip   = req.data.http_remotehost || "unknown";
        log.date = new Date();
        log.user = session.user;
        log.club = getClubInPath()
        log.accesspoint = isBackend() ? "tenez-admin" : "tenez-frontend";
        log.action = path[path.length - 1]._prototype + "." + req.action;
        log.value = value;
        root.logs.add(log);
        return log;
    }

    if (app.data.stat == null) {
        app.data.stat = {
            'counter': 0,
            'requests': [0],
            'errors':   [0],
            'notfounds': [0],
            'memory':   [0],
            'cache':    [0],
            'session':  [0]
        };
    }

    
    var rt = java.lang.Runtime.getRuntime();
    this.collectStats = function() {
        app.log("Collecting new stats.");
        this.cleanupStatsLog();

        var stat = app.data.stat;
        stat.requests.push(app.getRequestCount());
        stat.notfounds.push(app.data.notfoundCount);
        stat.errors.push(app.getErrorCount());
        stat.memory.push(((rt.totalMemory() - rt.freeMemory()) / rt.totalMemory()));
        stat.cache.push(app.getCacheusage());
        stat.session.push(app.countSessions());
        stat.counter++;
    };

    this.cleanupStatsLog = function() {
        var stat = app.data.stat;
        if (stat.counter >= 384) {
            stat.requests.shift();
            stat.notfounds.shift();
            stat.errors.shift();
            stat.memory.shift();
            stat.cache.shift();
            stat.session.shift();
            stat.counter--;
            app.log("Shift on stat-queue");
        }
    };
    
    this.getStatsAsJSON = function() {
        return app.data.stat.toJSON();
    };

    this.getAvgStats = function() {
        var stat = app.data.stat;
        var avgStat = {
            'requests': 0,
            'errors':   0,
            'notfounds': 0,
            'memory':   0,
            'cache':    0,
            'session':  0
        };

        var size = 0;
        for (var i = 0; i <= 15 && i < stat.requests.length; i++) {
            avgStat.requests  += stat.requests[i];
            avgStat.notfounds += stat.notfounds[i];
            avgStat.errors   += stat.errors[i];
            avgStat.memory   += stat.memory[i];
            avgStat.cache    += stat.cache[i];
            avgStat.session  += stat.session[i];
            size++;
        }

        avgStat.requests  = Math.floor(avgStat.requests / size);
        avgStat.notfounds = Math.floor(avgStat.notfounds / size);
        avgStat.errors    = Math.floor(avgStat.errors   / size);
        avgStat.memory    = (avgStat.memory   / size * 100).toFixed(2);
        avgStat.cache     = Math.floor(avgStat.cache    / size);
        avgStat.session   = Math.floor(avgStat.session  / size) + 1;
        
        return avgStat;
    }
};

/**
 * Returns some stats about the running application server.
 */
tenez.LoggerImpl.prototype.getApplicationStats = function() {
    var rt = java.lang.Runtime.getRuntime();
    return {
        'sessions':     app.countSessions(),
        'cacheUsage':   app.getCacheusage(),
        'cacheSize':    app.properties["cachesize"] || app.getCacheusage(),
        'errorCount':   app.getErrorCount(),
        'notfoundCount':app.data.notfoundCount,
        'freeThreads':  app.getFreeThreads(),
        'maxThreads':   app.getMaxThreads(),
        'requestCount': app.getRequestCount(),
        'upSince':      app.getUpSince(),
        'cpuCount':     rt.availableProcessors(),
        'usedMemory':   ((rt.totalMemory() - rt.freeMemory()) / 1000000).toFixed(2),
        'freeMemory':   (rt.freeMemory() / 1000000).toFixed(2),
        'maxMemory':    (rt.maxMemory() / 1000000).toFixed(2),
        'totalMemory':  (rt.totalMemory() / 1000000).toFixed(2),
        'memoryUsage':  ((rt.totalMemory() - rt.freeMemory()) / rt.totalMemory() * 100).toFixed(2).replace(".", ",")
    };
};

/**
 * Default instance of LoggerImpl. To improve performance we create only one
 * instance of tenez.LoggerImpl at start up and access it with tenez.Logger
 *
 * @type tenez.LoggerImpl
 * @final
 * @see tenez.LoggerImpl
 */
tenez.Logger = new tenez.LoggerImpl();
