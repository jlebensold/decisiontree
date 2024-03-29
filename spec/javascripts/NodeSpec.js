describe("Node", function() {
	var tree,nodes,branches;
	beforeEach(function() {
	 tree = {
					branches:	[
						{
							txt: 	"Engage Vendor",
							key:	"engage"
						},
						{
							txt: 	"Present RFP to business",
							key:	"present-to-business"
						},
						{
							txt: 	"Business approval",
							key:	"bus-approval"
						},
						{
							txt:	"Business declines",
							key:	"bus-decline"
						}
					],
					nodes: [
						{
							type: "decision",
							inc: [],
							out: ["engage"]
						},
						{
							type: "decision",
							inc: ["engage"],
							out: ["present-to-business"]
						},
						{
							type:		"chance",
							inc:	["present-to-business"],
							out:	["bus-approval","bus-decline"]
						},
						{
							type:		"end",
							inc:	["bus-approval"],
							out: []
						},
						{
							type:		"end",
							inc:	["bus-decline"],
							out: []
						}
					]
				}		
	 	nodes = _.map(tree.nodes,function(k) { return new Node(k); },this);
		branches = _.map(tree.branches, function(k){ return new Branch(k); });
		$(".testbed").remove();
		$("body").append("<div style='background:#CFCFCF;width:900px;height:500px;' class='testbed'></div>");
	});

	it("should have a type", function() {
		var n = new Node(tree.nodes[0]);
		expect(n.get('type')).toEqual("decision");
	});
	it("should be able to hold branches",function() {
		var n = new Node(tree.nodes[0]);
		n.addBranch(tree.branches[0]);
		expect(n.get('branches').first().get('backnode')).toEqual(n);
		expect(n.get('branches').first().get('txt')).toEqual('Engage Vendor');

	});

	it("should be able to build node-branch-node structure", function() {		
		var n = new Node(tree.nodes[0]);
		n.addBranch(tree.branches[0]);  
		n.get('branches').first().set('node',new Node(tree.nodes[1]));
		expect(JSON.stringify(n.asJSON())).toEqual('{"branches":[{"node":{"branches":[],"type":"decision"},"txt":"Engage Vendor"}],"type":"decision"}');
	});

	it("should be able to build a tree and calculate tree depth",function() {
		nodes[0].addBranch(branches[0])
		nodes[0].get('branches').last().set('node',nodes[1]);
		
		nodes[1].addBranch(branches[1]);
		nodes[1].get('branches').last().set('node',nodes[2]);
		
		nodes[2].addBranch(branches[2]);
		nodes[2].get('branches').last().set('node',nodes[3]);

		nodes[2].addBranch(branches[3]);
		nodes[2].get('branches').last().set('node',nodes[4]);
		
		expect(nodes[0].treeDepth()).toEqual(4);
	});

	it("should enable tree construction from array keys",function() {
		expect(JSON.stringify(nodes[0].linkByKey(branches,nodes).asJSON())).toEqual('{"branches":[{"node":{"branches":[{"node":{"branches":[{"node":{"branches":[],"type":"end"},"txt":"Business approval"},{"node":{"branches":[],"type":"end"},"txt":"Business declines"}],"type":"chance"},"txt":"Present RFP to business"}],"type":"decision"},"txt":"Engage Vendor"}],"type":"decision"}');
		
	});
	
	it("each node be able to know its own depth", function() {
		var n = nodes[0].linkByKey(branches,nodes);
		n.get('branches').last().get('node').depth();

	});


	it("should return items by depth",function() {
		var n = nodes[0].linkByKey(branches,nodes);
		expect(n.depth()).toEqual(1);
		expect(n.get('branches').last().get('node').depth()).toEqual(2);
		expect(n.get('branches').last().get('node').get('branches').last().get('node').depth()).toEqual(3);
	});

	it("should allow searching branches by key", function() {

		var n = nodes[0].linkByKey(branches,nodes);
		expect(n.branchByKey("engage").get('txt')).toEqual('Engage Vendor');
		expect(n.branchByKey("bus-approval").get('txt')).toEqual('Business approval');
	});


	it("should draw in the correct column", function() {
		$(".testbed").append("<div style='position:relative;width:900px;height:500px;' id='cvs'><canvas style='position: absolute;left:0;top:0;' width='900' height='500'></canvas></div>");

		tree.branches.push({ txt: "foo", key: "bar"});
		tree.nodes.push({type:"end",out:[], inc: ["bar"]});
		tree.nodes[1].out =  ["present-to-business", "bar"];
		
		nodes = _.map(tree.nodes,function(k) { return new Node(k); },this);
		branches = _.map(tree.branches, function(k){ return new Branch(k); });

		var n = nodes[0].linkByKey(branches,nodes);

		var v = new GraphView({model:n,el:$("#cvs") });

		n.get('branches').first().get('node').addBranch({txt:"test",key:"baz"});
		n.branchByKey("baz").addNode({type:'end'});
		v.drawColumns();

	});
});
