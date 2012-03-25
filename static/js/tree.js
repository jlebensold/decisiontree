window.AppView = Backbone.View.extend({
	events: {

	},
	initialize: function() {
		_.bindAll(this,'render');
		this.render();
	},
	render: function() {
    $(this.el).html("<canvas></canvas><h2>foo</h2>");
	
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
	},

	linkByKey: function(branches, nodes) {
		_.each(nodes,function(n) {
			var r = _.find(n.get('inc'),function(branchIn) {
				return branchIn == this.get('key');
			},this);
			if (r != undefined) {
				n.set('backbranch',this);
				this.set('node',n);
				this.get('node').linkByKey(branches,nodes);
			}
		},this);
		return this;
	}
});
window.BranchCollection = Backbone.Collection.extend({
	model: Branch
});
window.Node = Backbone.Model.extend({
	defaults: function() {
		return {
			branches: null,
			backbranch: null, 
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
		else
			b.set('backnode',this);

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

	treeDepth: function() {
		var depths = _.map(this.get('branches').models,function(k){
			return (k.get('node') != null) ? 1 + k.get('node').treeDepth() : 1;
		},this);
		if (depths.length == 0)
			return 0;
		return _.max(depths); 
	},

	linkByKey: function(branches,nodes) {
		_.each(this.get('out'),function(o) {
		
			var key = _.find(branches,function(b) { 
				return b.get('key') == o;
			});
			this.addBranch(key);
			this.get('branches').last().linkByKey(branches,nodes);
		
		},this);
		return this;
	},

	depth: function() { 
		var d 	= 1,
				bb 	= this.get('backbranch');


		while(bb != null) {			
			d++;
			if (bb.get('backnode')) {
				d++;
				if(bb.get('backnode').get('backbranch')){
					bb = bb.get('backnode').get('backbranch')
				}
				else {
					break;
				}
			}
		}
		return d;
	}

});

