/*\
title: $:/om/modules/widgets/action-navigate-skipparent.js
type: application/javascript
module-type: widget

Modified version of action widget to navigate to a tiddler. Skips the first navigate widget found in the enclosing widget tree, and dispatches the message from its parent widget.

\*/
(function(){

/*jslint node: true, browser: true */
/*global $tw: false */
"use strict";

var Widget = require("$:/core/modules/widgets/widget.js").widget;

var NavigateSkipparentWidget = function(parseTreeNode,options) {
	this.initialise(parseTreeNode,options);
};

/*
Inherit from the base widget class
*/
NavigateSkipparentWidget.prototype = new Widget();

/*
Render this widget into the DOM
*/
NavigateSkipparentWidget.prototype.render = function(parent,nextSibling) {
	this.computeAttributes();
	this.execute();
};

/*
Compute the internal state of the widget
*/
NavigateSkipparentWidget.prototype.execute = function() {
	this.actionTo = this.getAttribute("$to");
	this.actionScroll = this.getAttribute("$scroll");
};

/*
Refresh the widget by ensuring our attributes are up to date
*/
NavigateSkipparentWidget.prototype.refresh = function(changedTiddlers) {
	var changedAttributes = this.computeAttributes();
	if(changedAttributes["$to"] || changedAttributes["$scroll"]) {
		this.refreshSelf();
		return true;
	}
	return this.refreshChildren(changedTiddlers);
};

/*
Invoke the action associated with this widget
*/
NavigateSkipparentWidget.prototype.invokeAction = function(triggeringWidget,event) {
	var bounds = triggeringWidget && triggeringWidget.getBoundingClientRect && triggeringWidget.getBoundingClientRect(),
		suppressNavigation = event.metaKey || event.ctrlKey || (event.button === 1);
	if(this.actionScroll === "yes") {
		suppressNavigation = false;
	} else if(this.actionScroll === "no") {
		suppressNavigation = true;
	}
    // Find the parent of the first navigate widget
    var parent = this.parentWidget;
    while (parent.parseTreeNode.type != "navigator") {
      parent = parent.parentWidget;
    }
    var navigatorParent = parent.parentWidget;
    // Dispatch message from first navigator widget's parent
	navigatorParent.dispatchEvent({
		type: "tm-navigate",
		navigateTo: this.actionTo === undefined ? this.getVariable("currentTiddler") : this.actionTo,
		navigateFromTitle: this.getVariable("storyTiddler"),
		navigateFromNode: triggeringWidget,
		navigateFromClientRect: bounds && { top: bounds.top, left: bounds.left, width: bounds.width, right: bounds.right, bottom: bounds.bottom, height: bounds.height
		},
		navigateSuppressNavigation: suppressNavigation
	});
	return true; // Action was invoked
};

exports["action-navigate-skipparent"] = NavigateSkipparentWidget;

})();
