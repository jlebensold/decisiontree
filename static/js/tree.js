window.AppView = Backbone.View.extend({
	events: {

	},
	initialize: function() {
		_.bindAll(this,'render');
		this.render();
	},
	render: function() {
    $(this.el).html("<canvas></canvas><h2>foo</h2>");
	
		var nested_tree = this.model.nodes;
		
		while(nested_tree.length != 1) {
			// first node:
			var topnode = _.find(nested_tree,function(k) { return k.inc.length == 0; });
			_.each(topnode.out,function(k) {
								
			},this);

			break;
		}

			

//		},this);
		console.log(nested_tree);	
	}

});

window.Node = Backbone.Model.extend({


});
