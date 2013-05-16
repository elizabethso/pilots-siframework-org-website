dojo.provide("widgets.SelectorsContainer");

dojo.require("dijit._Widget");
dojo.require("dijit._Templated");
dojo.require("dojo.cache");

dojo.declare("widgets.SelectorsContainer", [ dijit._Widget, dijit._Templated ], {
    "templateString": dojo.cache("widgets",
                                 "templates/SelectorsContainer.html"),
    "properties": {}
});
