Transaction.prototype.isDebit_macro = function() {
    if (this.grossvalue < 0) {
        return true;
    } else {
        return false;
    }
};