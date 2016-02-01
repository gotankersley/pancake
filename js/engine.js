'use strict';

//Constants
var BOX_SIZE = 10;
var BOX_CENTER = BOX_SIZE/2;
var IMG_SIZE = 1024;
var SCENES_PATH = './scenes/0/';

//Global variables
var container;
var scene;
var camera;
var renderer;

var origin;
var boxSides;
var raycaster = new THREE.Raycaster();
var ID_TO_DIR = {};

//Camera controls
var mouse = new THREE.Vector2();
var mouseDown = new THREE.Vector2();
var looking = false;
var prevLon;
var prevLat;
var lon = 0;//270;
var lat = 0;
var phi = 0;
var theta = 0;
	
//Class Engine
function Engine() {
		
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;		
	var VIEW_ANGLE = 75;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
	var NEAR = 0.1;
	var FAR = 200;	

	//Engine properties
	this.callbacks = {};
	this.curScene = 0;
	
	
	//Camera
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	camera.target = new THREE.Vector3( 0, 0, 0 );	
	scene = new THREE.Scene;
	scene.add(camera);	
	camera.position.set(0, 0, 0);
	
	//Renderer
	renderer = new THREE.WebGLRenderer( {antialias:true} );		
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);		
	container = document.createElement( 'container' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );	
	renderer.domElement.oncontextmenu = function (e) {
		e.preventDefault();
	};	
	
	//Events	
	document.addEventListener( 'mousemove', onMouseMove, false );	
	document.addEventListener( 'mousedown', onMouseDown, false );	
	document.addEventListener( 'mouseup', onMouseUp, false );	
	
	//Stage
	setStage();
	render();
}

Engine.prototype.addEvents = function(eventName, callback) {
	this.callbacks[eventName].push(callback);
}

function setStage() {
	
	//Origin
	//var originGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10, 1, false);
	//var originMat = new THREE.MeshNormalMaterial();	
	//origin = new THREE.Mesh(originGeo, originMat);
	//scene.add(origin);
	
	//Box
		
	var DIRS  = ['f', 'l', 'b', 'r', 'd', 'u'];
	var EXT = '.jpg';
	
	var sideGeo = new THREE.PlaneGeometry( BOX_SIZE, BOX_SIZE, BOX_SIZE);
	var sidePositions = [
		new THREE.Vector3(0, 0, -BOX_CENTER),
		new THREE.Vector3(-BOX_CENTER, 0, 0),
		new THREE.Vector3(0, 0, BOX_CENTER),
		new THREE.Vector3(BOX_CENTER, 0, -0),		
		new THREE.Vector3(0, -BOX_CENTER, 0),
		new THREE.Vector3(0, BOX_CENTER, 0),
	];
	var sideRotations = [
		new THREE.Vector3(0, 0, 0),
		new THREE.Vector3(0, Math.PI/2, 0),
		new THREE.Vector3(0, -Math.PI, 0),
		new THREE.Vector3(0, -Math.PI/2, 0),		
		new THREE.Vector3(-Math.PI/2, 0, 0),
		new THREE.Vector3(Math.PI/2, 0, Math.PI),
	];
	
	boxSides = [];
	for (var i = 0; i < 6; i++) { //Six faces on a cube...
		var sideMaterial = new THREE.MeshBasicMaterial({		
			map: THREE.ImageUtils.loadTexture( SCENES_PATH + DIRS[i] + EXT ),		
		});
	
		var side = new THREE.Mesh( sideGeo, sideMaterial );
		side.position.copy(sidePositions[i]);
		var euler = new THREE.Euler(sideRotations[i].x, sideRotations[i].y, sideRotations[i].z, 'XYZ');		
		side.rotation.copy(euler);
		ID_TO_DIR[side.id] = DIRS[i];		
		boxSides.push(side);
		scene.add(side);
	}
		
}

function onMouseMove( e ) {

	if (looking) {
		lon = ( mouseDown.x - e.clientX ) * 0.1 + prevLon;
		lat = ( e.clientY - mouseDown.y ) * 0.1 + prevLat;
	}
	mouse.x = (e.clientX  / window.innerWidth ) * 2 - 1;	
	mouse.y = - (e.clientY / window.innerHeight ) * 2 + 1;	
	picking(mouse, false);	

}

function picking(mouse, click) {
	// update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );	

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( boxSides);	
	if ( intersects.length > 0 ) {
		
		var col = intersects[0];
		var point3d = col.point; //Point in 3D space
		var dir = ID_TO_DIR[col.object.id];
		var point2d = new THREE.Vector2();
		switch(dir) {
			case 'f':
				point2d.x = point3d.x + BOX_CENTER;
				point2d.y = BOX_SIZE - (point3d.y + BOX_CENTER);
				break;
			case 'l':
				point2d.x = BOX_SIZE - (point3d.z + BOX_CENTER);
				point2d.y = BOX_SIZE - (point3d.y + BOX_CENTER);
				break;
			case 'b':
				point2d.x = BOX_SIZE - (point3d.x + BOX_CENTER);
				point2d.y = BOX_SIZE - (point3d.y + BOX_CENTER);
				break;
			case 'r':
				point2d.x = point3d.z + BOX_CENTER;
				point2d.y = BOX_SIZE - (point3d.y + BOX_CENTER);
				break;
			case 'd':
				point2d.x = point3d.x + BOX_CENTER;
				point2d.y = point3d.z + BOX_CENTER;
				break;
			case 'u':
				point2d.x = BOX_SIZE - (point3d.x + BOX_CENTER);
				point2d.y = point3d.z + BOX_CENTER;
				break;
		}
		
			
		//cross multiply to get in the range of [0-1023]
		var point = [
			(IMG_SIZE * point2d.x)/BOX_SIZE, //x
			(IMG_SIZE * point2d.y)/BOX_SIZE  //y
		];
		
		var regions = nav[0];	
		var found = false;
		for (var r = 0; r < regions.length; r++) {
			var region = regions[r];
			if (inside(point, region.coords)) {
				//this.curRegion = region;
				renderer.domElement.style.cursor = 'pointer';
				//this.curCursor = region.cursor;
				//console.log(region.cursor);
				found = true;
				if (click) {
					SCENES_PATH = 'scenes/6/';
					scene.remove(boxSides);
					setStage();
				}
				break;
			}
		}
		if (!found) renderer.domElement.style.cursor = 'default';
		//console.log(dir, point);
	}		
}

function onMouseDown( e ) {
	e.preventDefault();
	looking = true;
	mouseDown.x = e.clientX;
	mouseDown.y = e.clientY;
	
	prevLon = lon;
	prevLat = lat;
	
	mouse.x = (e.clientX  / window.innerWidth ) * 2 - 1;	
	mouse.y = - (e.clientY / window.innerHeight ) * 2 + 1;	
	picking(mouse, true);
}

function onMouseUp( e ) {
	looking = false;
}

//Collision detection
function inside (point, vs) { //https://github.com/substack/point-in-polygon
    // ray-casting algorithm based on
    // http://www.ecse.rpi.edu/Homepages/wrf/Research/Short_Notes/pnpoly.html
    
    var x = point[0], y = point[1];
    
    var inside = false;
    for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
        var xi = vs[i][0], yi = vs[i][1];
        var xj = vs[j][0], yj = vs[j][1];
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    
    return inside;
};

function render(time) {	
	
	
	
	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = THREE.Math.degToRad( 90 - lat );
	theta = THREE.Math.degToRad( lon );
	
	camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.y = 500 * Math.cos( phi );
	camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

	camera.lookAt( camera.target );
		
	
	renderer.render( scene, camera );
	requestAnimationFrame( render );	
}
//End class Engine

var engine = new Engine();