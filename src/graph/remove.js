// graph manipulators for .FOLD file github.com/edemaine/fold
// MIT open source license, Robby Kraft

import {
	clone
} from "../fold_format/object";

import {
	make_edges_faces,
	get_boundary_face
} from "./make";

import {
	vertices_count,
	edges_count,
	faces_count
} from "./query";

/**
 * this removes all edges except for "B", boundary creases.
 * rebuilds the face, and 
 * todo: removes a collinear vertex and merges the 2 boundary edges
 */
export const remove_non_boundary_edges = function(graph) {
	let remove_indices = graph.edges_assignment
		.map(a => !(a === "b" || a === "B"))
		.map((a,i) => a ? i : undefined)
		.filter(a => a !== undefined)
	let edge_map = remove_edges(graph, remove_indices);
	let face = get_boundary_face(graph);
	graph.faces_edges = [face.edges];
	graph.faces_vertices = [face.vertices];
	remove_isolated_vertices(graph);
}

export const remove_isolated_vertices = function(graph) {
	let isolated = graph.vertices_coords.map(_ => true);
	graph.edges_vertices.forEach(edge => edge.forEach(v => isolated[v] = false));
	let vertices = isolated.map((el,i) => el ? i : undefined)
		.filter(el => el !== undefined);
	if (vertices.length === 0) { return []; }
	return remove_vertices(graph, vertices);
}

export const remove_duplicate_edges = function(graph) {
	const equivalent = function(a, b) {
		return (a[0] === b[0] && a[1] === b[1]) ||
					 (a[0] === b[1] && a[1] === b[0]);
	}

	let edges_equivalent = Array
		.from(Array(graph.edges_vertices.length)).map(_ => []);
	for (var i = 0; i < graph.edges_vertices.length-1; i++) {
		for (var j = i+1; j < graph.edges_vertices.length; j++) {
			edges_equivalent[i][j] = equivalent(
				graph.edges_vertices[i],
				graph.edges_vertices[j]
			);
		}
	}

	let edges_map = graph.edges_vertices.map(vc => undefined)

	edges_equivalent.forEach((row,i) => row.forEach((eq,j) => {
		if (eq){
			edges_map[j] = edges_map[i] === undefined ? i : edges_map[i];
		}
	}));
	let edges_remove = edges_map.map(m => m !== undefined);
	edges_map.forEach((map,i) => {
		if(map === undefined) { edges_map[i] = i; }
	});

	let edges_remove_indices = edges_remove
		.map((rm,i) => rm ? i : undefined)
		.filter(i => i !== undefined);

	remove_edges(graph, edges_remove_indices);
}

/** Removes vertices, updates all relevant array indices
 *
 * @param {vertices} an array of vertex indices
 * @example remove_vertices(fold_file, [2,6,11,15]);
 */
export function remove_vertices(graph, vertices){
	// length of index_map is length of the original vertices_coords
	let s = 0, removes = Array( vertices_count(graph) ).fill(false);
	vertices.forEach(v => removes[v] = true);
	let index_map = removes.map(remove => remove ? --s : s);

	if(vertices.length === 0){ return index_map; }

	// update every component that points to vertices_coords
	// these arrays do not change their size, only their contents
	if(graph.faces_vertices != null){
		graph.faces_vertices = graph.faces_vertices
			.map(entry => entry.map(v => v + index_map[v]));
	}
	if(graph.edges_vertices != null){
		graph.edges_vertices = graph.edges_vertices
			.map(entry => entry.map(v => v + index_map[v]));
	}
	if(graph.vertices_vertices != null){
		graph.vertices_vertices = graph.vertices_vertices
			.map(entry => entry.map(v => v + index_map[v]));
	}

	// update every array with a 1:1 relationship to vertices_ arrays
	// these arrays change their size, their contents are untouched
	if(graph.vertices_faces != null){
		graph.vertices_faces = graph.vertices_faces
			.filter((v,i) => !removes[i])
	}
	if(graph.vertices_vertices != null){
		graph.vertices_vertices = graph.vertices_vertices
			.filter((v,i) => !removes[i])
	}
	if(graph.vertices_coords != null){
		graph.vertices_coords = graph.vertices_coords
			.filter((v,i) => !removes[i])
	}

	return index_map;
	// todo: do the same with frames in file_frames where inherit=true
}

export const remove_edge_and_rebuild = function(graph, edge) {
	if ("edges_faces" in graph === false || graph.edges_faces[edge] == null) {
		console.warn("remove_edge_and_rebuild needs edges_faces to be built");
		return;
	}
	// todo
}

/* This returns a 
 * in some cases face arrays might not be defined
 *
 * @returns {number} number of faces
 */
export const remove_edges = function(graph, edges) {
	// length of index_map is length of the original edges_vertices
	let s = 0, removes = Array( edges_count(graph) ).fill(false);
	edges.forEach(e => removes[e] = true);
	let index_map = removes.map(remove => remove ? --s : s);
	if (edges.length === 0){
		console.log("catch in remove_edges", index_map);
		return index_map;
	}

	// update every component that points to edges_vertices
	// these arrays do not change their size, only their contents
	// if(graph.faces_edges != null){
	// 	graph.faces_edges = graph.faces_edges
	// 		.map(entry => entry.map(v => v + index_map[v]));
	// }
	// todo: test this below, when confirmed, remove the portion above
	Object.keys(graph)
		.filter(key => key.includes("_edges"))
		.forEach(key => graph[key] = graph[key]
			.map(entry => entry.map(v => v + index_map[v]))
		);

	// update every array with a 1:1 relationship to edges_ arrays
	// keys like "edges_vertices", "edges_faces" and anything else "edges_..."
	// these arrays change their size, their contents are untouched
	Object.keys(graph)
		.filter(key => key.includes("edges_"))
		.forEach(key => graph[key] = graph[key].filter((e,i) => !removes[i]));

	// if additional special cases enter the spec, take care of them here
	if (graph.edgeOrders != null) {
		// index 2 is orientation. not an edge index.
		graph.edgeOrders = graph.edgeOrders.map(entry =>
			entry.map((v,i) => (i === 2) ? v : v + index_map[v])
		);
	}

	return index_map;
	// todo: do the same with frames in file_frames where inherit=true
}


/**
 * Removes faces, updates all relevant array indices
 * @param {faces} an array of face indices
 * @example remove_edges(fold_file, [1,9,11,13]);
 */
export function remove_faces(graph, faces) {
	// length of index_map is length of the original faces_vertices
	let s = 0, removes = Array( faces_count(graph) ).fill(false);
	faces.forEach(e => removes[e] = true);
	let index_map = removes.map(remove => remove ? --s : s);

	if (faces.length === 0) { return index_map; }

	// update every component that points to faces_ arrays
	// these arrays do not change their size, only their contents
	if (graph.vertices_faces != null) {
		graph.vertices_faces = graph.vertices_faces
			.map(entry => entry.map(v => v + index_map[v]));
	}
	if (graph.edges_faces != null) {
		graph.edges_faces = graph.edges_faces
			.map(entry => entry.map(v => v + index_map[v]));
	}
	if (graph.faceOrders != null) {
		graph.faceOrders = graph.faceOrders
			.map(entry => entry.map((v,i) => {
				if(i === 2) return v;  // exception. orientation. not index.
				return v + index_map[v];
			}));
	}
	// update every array with a 1:1 relationship to faces_
	// keys like "faces_vertices", "faces_edges" and anything else "faces_..."
	// these arrays change their size, their contents are untouched
	Object.keys(graph)
		.filter(key => key.includes("faces_"))
		.forEach(key => graph[key] = graph[key].filter((e,i) => !removes[i]));

	return index_map;
	// todo: do the same with frames in file_frames where inherit=true
}



// unused, but can be a generalized function one day
function remove_from_array(array, match_function){
	let remove = array.map((a,i) => match_function(a,i));
	let s = 0, shift = remove.map(rem => rem ? --s : s);
	array = array.filter(e => match_function(e));
	return shift;
}

/** replace all instances of the vertex old_index with new_index
 * does not modify array sizes, only contents of arrays
 */
/**
 * subscript should be a component, "vertices" will search "faces_vertices"...
 */
export const reindex_subscript = function(graph, subscript, old_index, new_index){
	Object.keys(graph)
		.filter(key => key.includes("_" + subscript))
		.forEach(key =>
			graph[key].forEach((array, outerI) =>
				array.forEach((component, innerI) => {
					if(component === old_index){
						graph[key][outerI][innerI] = new_index;
					}
				})
			)
		);
	return graph;
}

/** This filters out all non-operational edges
 * removes: "F": flat "U": unassigned
 * retains: "B": border/boundary, "M": mountain, "V": valley
 */
export const remove_marks = function(fold) {
	let removeTypes = ["f", "F", "u", "U"];
	let removeEdges = fold.edges_assignment
		.map((a,i) => ({a:a, i:i}))
		.filter(obj => removeTypes.indexOf(obj.a) !== -1)
		.map(obj => obj.i)
	remove_edges(fold, removeEdges);
	clean(fold);
}


/**
 * Replace all instances of removed vertices with "vertex".
 * @param vertex number index of vertex to remain
 * @param [removed] array of indices to be replaced
 */
export const merge_vertices = function(graph, vertex, removed) {
	

}
