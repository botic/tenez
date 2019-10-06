// Define the tenez namespace
if (!global.tenez) {
    global.tenez = {};
}

/**
 * @class Manages the generation of PDF-Reports
 * @type tenez.ReportBuilderImpl
 */
tenez.ReportBuilderImpl = function() {
    var config;
    var reportDir = app.properties["reportDir"];

    /**
     * Reloads the config XML <tt>reports.config</tt> from the <tt>reportDir</tt> defined in <tt>app.properties</tt>.
     */
    this.readConfig = function() {
        var configFile = new helma.File(reportDir + "/reports.config");
        
        if (configFile.exists()) {
            config = configFile.readAll().parseJSON();
            app.log("Initialized the report configuration.");
        } else {
            throw "Can not read config: " + configFile.getAbsolutePath();
        }
    }

    /**
     * Returns all available reports from the config for the specified Club.
     * @param clubObj {Club} the Club to look for
     * @return {Object} the config object for the given Club.
     */
    this.getReportsForClub = function(clubObj) {
        if (clubObj == null || clubObj._prototype != "Club") {
            return null;
        }

        return Object.clone(config[clubObj.alias]);
    }

    /**
     * Returns the permission's name which is required for the given Club/Report.
     * @param clubObj {Club} the Club to look for
     * @param alias {String} alias of the Report
     * @return {String} the permissions's name, e.g. <tt>can_view_users</tt>
     */
    this.getPermissionForReport = function(clubObj, alias) {
        if (clubObj == null || clubObj._prototype != "Club") {
            throw "Invalid call!";
        }

        if (config[clubObj.alias] && config[clubObj.alias][alias] && config[clubObj.alias][alias]["permission"]) {
            return config[clubObj.alias][alias]["permission"];
        } else {
            throw "Can't resolve permission for the given report!";
        }
    }

    /**
     * Renders a report as PDF and returns it as a byte array.
     * @param clubObj {Club} the Club to look for
     * @param reportName {String} alias for the Report to render
     * @return {Array} PDF as byte array. 
     */
    this.renderReport = function(clubObj, reportName) {
        if (clubObj == null || reportName == null || clubObj._prototype != "Club" || typeof(reportName) !== "string") {
            throw "Invalid call of renderReport!";
        }

        if (!config) {
            throw "Config not initialized!";
        }

        var report = config[clubObj.alias][reportName];

        if (!report.reportXml) {
            throw "ReportXml not set!";
        }

        var jasperDesign = Packages.net.sf.jasperreports.engine.JasperManager.loadXmlDesign(reportDir + report.reportXml);
        var jasperReport = Packages.net.sf.jasperreports.engine.JasperManager.compileReport(jasperDesign);

        var parameters = new java.util.HashMap();

        var logo = new helma.File(reportDir + "/tenez-logo.png");
        parameters.put("t_logofile", new java.lang.String(logo.getAbsolutePath()));
        parameters.put("t_clubid", java.lang.Integer(clubObj._id));

        if (report.params) {
            for (var pname in report.params) {
                parameters.put(pname, report.params[pname]);   
            }
        }

        var dbs = helma.Database("tenez").getConnection();
        var jasperPrint = Packages.net.sf.jasperreports.engine.JasperFillManager.fillReport(jasperReport, parameters, dbs);

        var boas = new java.io.ByteArrayOutputStream();
        Packages.net.sf.jasperreports.engine.JasperExportManager.exportReportToPdfStream(jasperPrint, boas);

        return boas.toByteArray();
    }
};


/**
 * Single instance of the ReportBuilderImpl.
 * @final
 * @type tenez.ReportBuilderImpl
 */
tenez.ReportBuilder = new tenez.ReportBuilderImpl();