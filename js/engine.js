'use strict';

//Global variables
var container;
var scene;
var camera;
var renderer;
var controls;
var origin;
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();

init();
function init() {
	scene = new THREE.Scene;
		
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;		
	var VIEW_ANGLE = 75;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
	var NEAR = 0.1;
	var FAR = 200;	

	//Camera
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);	
	scene.add(camera);	
	camera.position.set(0, 0, 0);
	
	//Renderer
	renderer = new THREE.WebGLRenderer( {antialias:true} );		
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);		
	container = document.createElement( 'container' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );
	controls = new THREE.OrbitControls( camera, renderer.domElement );	
	controls.center = new THREE.Vector3(0, 0, 0);
	
	//Events
	window.addEventListener( 'mousemove', onMouseMove, false );		
	
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
	var BOX_SIZE = 10;
	var BOX_CENTER = BOX_SIZE/2;
	
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
	
	var boxSides = [];
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

function onMouseMove( event ) {

	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;		

}

function render(time) {	
	controls.update();
	
	// update the picking ray with the camera and mouse position	
	raycaster.setFromCamera( mouse, camera );	

	// calculate objects intersecting the picking ray
	var intersects = raycaster.intersectObjects( scene.children );	
	//console.log(intersects);
	
	renderer.render( scene, camera );
	requestAnimationFrame( render );	
}