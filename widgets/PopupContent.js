dojo.provide("widgets.PopupContent");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.cache");

dojo.declare("widgets.PopupContent", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/PopupContent.html"),
    "properties": {}
});
