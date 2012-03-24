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
			break;
		}

			

//		},this);
		console.log(nested_tree);	
	}

});
window.Branch = Backbone.Model.extend({
	defaults: function() {
		return {
		backnode: null,
		node: null,
		txt: "",
		key: ""
		};
	},
	
	initialize: function() {

	},

	asJSON:	function() {
		return {
			node: (this.get('node') != null) ? this.get('node').asJSON() : null,
			txt:	this.get('txt')
		};
	}
});
window.BranchCollection = Backbone.Collection.extend({
	model: Branch
});
window.Node = Backbone.Model.extend({
	defaults: function() {
		return {
			branches: null, 
			type: "",
			inc: [],
			out: []
		}
	},
	initialize: function() {
		this.set('branches',new BranchCollection);
	},
	
	addBranch: function(b) {
		if (!(b instanceof Branch))
			b = new Branch({backnode: this,txt:b.txt,key:b.key});
		this.get('branches').add(b);
	},

	asJSON: function() {
		var json = {branches: []};
		this.get('branches').each(function(k){
			json.branches.push(k.asJSON());
		},this);
		json.type = this.get('type');
		return json;
	},

	depth: function() {
		var depths = _.map(this.get('branches').models,function(k){
			return (k.get('node') != null) ? 1 + k.get('node').depth() : 1;
		},this);
		if (depths.length == 0)
			return 0;
		return _.max(depths); 
	}

});

