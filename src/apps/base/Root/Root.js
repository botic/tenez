/**
 * Get the Permissionsgroup of the Sys-Admin
 * @return {PermissionGroup} Returns the permission group of the sys-admin
 */
Root.prototype.getSysAdminPermissionGroup = function() {
    var group = root.usermgr.permissiongroups.get("Systemadministrator");
    if (!group) {
        throw "ERROR! SYSADMIN-GROUP IS MISSING!";
    } else {
        return group;
    }
};