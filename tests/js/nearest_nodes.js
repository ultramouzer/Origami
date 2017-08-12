
var nearNodeSketch = new PaperCreasePattern(new PlanarGraph(), "canvas-nearest-nodes");
nearNodeSketch.zoomToFit(0.0);

nearNodeSketch.edgeLayer = new paper.Layer();
nearNodeSketch.edgeLayer.activate();
nearNodeSketch.edgeLayer.removeChildren();

nearNodeSketch.reset = function(){
	var NUM_NODES = 300;
	var aspect = nearNodeSketch.canvas.width / nearNodeSketch.canvas.height;
	nearNodeSketch.cp.clear();
	for(var i = 0; i < NUM_NODES; i++){
		nearNodeSketch.cp.newPlanarNode(Math.random() * aspect, Math.random());
	}
	nearNodeSketch.initialize();
	nearNodeSketch.nodeLayer.visible = true;
	console.log(nearNodeSketch.nodeLayer.children[0]);
	for(var i = 0; i < nearNodeSketch.nodeLayer.children.length; i++){
		nearNodeSketch.nodeLayer.children[i].radius = 0.004;
		// nearNodeSketch.nodeLayer.children[i].fillColor = { hue:220, saturation:0.6, brightness: 1.0 };
		nearNodeSketch.nodeLayer.children[i].fillColor = { gray:0.0 };
	}
}
nearNodeSketch.reset();

nearNodeSketch.onFrame = function(event) { }
nearNodeSketch.onResize = function(event) { }
nearNodeSketch.onMouseDown = function(event){
	nearNodeSketch.edgeLayer.activate();
	nearNodeSketch.edgeLayer.removeChildren();
	nearNodeSketch.reset();
}
nearNodeSketch.onMouseUp = function(event){ }
nearNodeSketch.onMouseMove = function(event) {
	var nodes = nearNodeSketch.cp.getNearestNodes( event.point.x, event.point.y, 40 );

	nearNodeSketch.edgeLayer.activate();
	nearNodeSketch.edgeLayer.removeChildren();

	if(nodes != undefined && nodes.length > 0){
		for(var i = nodes.length-1; i >= 0 ; i--){
			new paper.Path({
				segments: [ nodes[i], event.point ],
				strokeColor: {gray:0.0, alpha:1.0 - i/nodes.length},
				strokeWidth: 0.003,
				closed: false
			});
		}
	}
}



// function nearest_nodes_sketch(){
// 	var canvas = document.getElementById('canvas-nearest-nodes');
// 	var scope = new paper.PaperScope();
// 	// setup paper scope with canvas
// 	scope.setup(canvas);
// 	zoomView(scope, canvas.width, canvas.height, 0.0);


// 	var cp = new PlanarGraph();
// 	var paperCP = new PaperCreasePattern(scope, cp);

// 	var NUM_NODES = 500;

// 	var edgeLayer = new paper.Layer();
// 	edgeLayer.activate();
// 	edgeLayer.removeChildren();

// 	function resetCP(){
// 		var aspect = canvas.width / canvas.height;
// 		cp.clear();
// 		for(var i = 0; i < NUM_NODES; i++){
// 			cp.newPlanarNode(Math.random() * aspect, Math.random());
// 		}
// 		paperCP.initialize();
// 		paperCP.nodeLayer.visible = true;
// 		console.log(paperCP.nodeLayer.children[0]);
// 		for(var i = 0; i < paperCP.nodeLayer.children.length; i++){
// 			paperCP.nodeLayer.children[i].radius = 0.004;
// 		}
// 	}
// 	resetCP();

// 	scope.view.onFrame = function(event){ }
// 	scope.view.onResize = function(event){
// 		paper = scope;
// 		resetCP();
// 		zoomView(scope, canvas.width, canvas.height, 0.0);
// 	}
// 	scope.view.onMouseMove = function(event){ 
// 		paper = scope;
// 		var nodes = cp.getNearestNodes( event.point.x, event.point.y, 50 );

// 		edgeLayer.activate();
// 		edgeLayer.removeChildren();

// 		if(nodes != undefined && nodes.length > 0){
// 			for(var i = nodes.length-1; i >= 0 ; i--){
// 				new paper.Path({
// 					segments: [ nodes[i], event.point ],
// 					strokeColor: {gray:0.0, alpha:1.0 - i/nodes.length},
// 					strokeWidth: 0.003,
// 					closed: false
// 				});
// 			}
// 		}
// 	}

// 	scope.view.onMouseDown = function(event){
// 		paper = scope;
// 		edgeLayer.activate();
// 		edgeLayer.removeChildren();
// 		resetCP();
// 	}

// }  nearest_nodes_sketch();