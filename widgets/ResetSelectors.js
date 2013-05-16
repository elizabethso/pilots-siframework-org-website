dojo.provide("widgets.ResetSelectors");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.cache");

dojo.declare("widgets.ResetSelectors", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/ResetSelectors.html"),
    "properties": {}
});