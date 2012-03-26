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

window.GraphView = Backbone.View.extend({
	initialize: function() {
		_.bindAll(this,'render','columns','drawColumns','drawNode','drawBranches','canvasContext');
	},
	
	render: function() {

	},
	
	columns: function() {
		return this.model.treeDepth();
	},
	canvasContext: function() {
		return $(this.el).find('canvas').get(0).getContext('2d');
	},

	drawColumns: function() {
		var c = this.columns();
		var width = Math.floor($(this.el).width() / c);
		for(var i = 0; i < c; i++) {
			$(this.el).append("<div class='col_"+(i+1)+"' style='margin:3px;float:left;width:"+(width-8)+"px;height:500px;'></div>");
		}

		this.drawNode(this.model);
	},

	drawNode: function(node) {
		$(this.el).find(".col_"+node.depth()).append("<div id='"+node.cid+"' class='"+node.get('type')+"' style='background:#FFF;width:60px;height:60px;border:1px solid #333;'>"+node.get('type')+"</div>");
		this.drawBranches(node.get('branches'));
	},

	drawBranches: function(branches) {
		var ctx = this.canvasContext();


		branches.each(function(b) {
			this.drawNode(b.get('node'));

			ctx.lineWidth = 1;
			ctx.beginPath();
			var src = $("#"+b.get('backnode').cid).offset();
			var dst = $("#"+b.get('node').cid).offset();

			ctx.moveTo(src.left + 43,src.top -60 - 30);
			ctx.lineTo(dst.left,dst.top -60 - 30);
			ctx.stroke();
			
			
			var l =  (dst.left - src.left) * (b.get('backnode').depth()) - 120;
			ctx.fillText(b.get('txt'),l, (src.top + dst.top / 2)- 160);



		},this);
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
			return 1;
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
//				d++;
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

