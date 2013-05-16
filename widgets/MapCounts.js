dojo.provide("widgets.MapCounts");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.cache");

dojo.declare("widgets.MapCounts", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/MapCounts.html"),
    "properties": {}
});
