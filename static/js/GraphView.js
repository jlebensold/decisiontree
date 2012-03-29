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
			if (b.get('node') == null)
		{
			console.log(b,"undefined node");
			return;
		}
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
