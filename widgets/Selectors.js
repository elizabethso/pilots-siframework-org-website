dojo.provide("widgets.Selectors");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.cache");

dojo.declare("widgets.Selectors", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/Selectors.html"),
    "properties": {}
});