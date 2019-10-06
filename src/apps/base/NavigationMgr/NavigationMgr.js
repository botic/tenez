/**
 * Renders a navigation item HTML. It will be wrapped into a <tt>&lt;li&gt;</tt> element.
 * @param url the URL to link to
 * @param text the text of the link
 */
NavigationMgr.prototype.renderLink = function(url, text) {
    res.push();

    html.openTag("li");
    html.link({"href": url}, encode(text));
    html.closeTag("li");

    return res.pop();
};