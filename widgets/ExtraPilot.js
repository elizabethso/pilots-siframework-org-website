dojo.provide("widgets.ExtraPilot");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.cache");

dojo.declare("widgets.ExtraPilot", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/ExtraPilot.html"),
    "properties": {}
});
