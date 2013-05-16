dojo.provide("widgets.MapMarker");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");

dojo.declare("widgets.MapMarker", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/MapMarker.html"),
    "properties": {}
});