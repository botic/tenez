/**
 * Returns the current customer count.
 */
Club.prototype.customerCount_macro = function() {
    return this.users.count();
};

/**
 * Returns the current UserGroup count
 */
Club.prototype.userGroupCount_macro = function() {
    return this.usergroups.count();
};