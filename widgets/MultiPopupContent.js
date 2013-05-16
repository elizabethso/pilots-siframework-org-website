dojo.provide("widgets.MultiPopupContent");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.cache");

dojo.declare("widgets.MultiPopupContent", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/MultiPopupContent.html"),
    "properties": {}
});
