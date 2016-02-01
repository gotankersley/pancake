'use strict';

//Constants
var BOX_SIZE = 10;
var BOX_CENTER = BOX_SIZE/2;
var IMG_SIZE = 1024;

//Global variables
var container;
var scene;
var camera;
var renderer;

var origin;
var boxSides;
var raycaster = new THREE.Raycaster();

//Camera controls
var mouse = new THREE.Vector2();
var mouseDown = new THREE.Vector2();
var looking = false;
var prevLon;
var prevLat;
var lon = 270;
var lat = 0;
var phi = 0;
var theta = 0;
	

init();
function init() {
		
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;		
	var VIEW_ANGLE = 75;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
	var NEAR = 0.1;
	var FAR = 200;	

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
	
	//Events	
	document.addEventListener( 'mousemove', onMouseMove, false );	
	document.addEventListener( 'mousedown', onMouseDown, false );	
	document.addEventListener( 'mouseup', onMouseUp, false );	
	
	//Stage
	setStage();
	render();
}


function setStage() {
	
	//Origin
	var originGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10, 1, false);
	var originMat = new THREE.MeshNormalMaterial();	
	origin = new THREE.Mesh(originGeo, originMat);
	scene.add(origin);
	
	//Box
	
	var PATH = 'img/p1/'; 
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
			map: THREE.ImageUtils.loadTexture( PATH + DIRS[i] + EXT ),		
		});
	
		var side = new THREE.Mesh( sideGeo, sideMaterial );
		side.position.copy(sidePositions[i]);
		var euler = new THREE.Euler(sideRotations[i].x, sideRotations[i].y, sideRotations[i].z, 'XYZ');		
		side.rotation.copy(euler);
		
		boxSides.push(side);
		scene.add(side);
	}
		
}

function onMouseMove( e ) {

	if (looking) {
		lon = ( mouseDown.x - e.clientX ) * 0.1 + prevLon;
		lat = ( e.clientY - mouseDown.y ) * 0.1 + prevLat;
	}
		

}

function onMouseDown( e ) {
	e.preventDefault();
	looking = true;
	mouseDown.x = e.clientX;
	mouseDown.y = e.clientY;
	
	prevLon = lon;
	prevLat = lat;
	
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;		

}

function onMouseUp( e ) {
	looking = false;
}

function render(time) {	
	
	if (looking) {
		// update the picking ray with the camera and mouse position	
		raycaster.setFromCamera( mouse, camera );	

		// calculate objects intersecting the picking ray
		var intersects = raycaster.intersectObjects( boxSides);	
		if ( intersects.length > 0 ) {
			var col = intersects[0].point;
			var p = new THREE.Vector2(col.z + BOX_CENTER, BOX_SIZE - (col.y + BOX_CENTER));
			
			p.x = (IMG_SIZE * p.x)/BOX_SIZE;
			p.y = (IMG_SIZE * p.y)/BOX_SIZE;
			//origin.position.copy(col);			
			console.log(p);
		}		

	}
	
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