/**
 * Renders the given skin
 * @param param {Object} <tt>param.skin</tt> contains the name of the skin to render, <tt>param.param</tt> the parameter object.
 */
HopObject.prototype.renderSkin_macro = function(param) {
    if (param.skin) {
        if (param.param) {
            return this.renderSkinAsString(param.skin, param.param);
        } else {
            return this.renderSkinAsString(param.skin);
        }
    }
};