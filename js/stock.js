'use strict';

//Global variables
var container;
var scene;
var camera;
var renderer;
var controls;
var origin;

init();
function init() {
	scene = new THREE.Scene;
		
	var SCREEN_WIDTH = window.innerWidth;
	var SCREEN_HEIGHT = window.innerHeight;		
	var VIEW_ANGLE = 90;
	var ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;
	var NEAR = 0.1;
	var FAR = 200;	

	//Camera
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);	
	scene.add(camera);	
	camera.position.set(0, 0, 5);
	
	//Renderer
	renderer = new THREE.WebGLRenderer( {antialias:true} );		
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);		
	container = document.createElement( 'container' );
	document.body.appendChild( container );
	container.appendChild( renderer.domElement );
	controls = new THREE.OrbitControls( camera, renderer.domElement );	
	controls.center = new THREE.Vector3(0, 0, 0);
	
	//Lighting
	var light = new THREE.PointLight(0xffffff);
	light.position.set(0,10,0);
	//scene.add(light);
	
	//var hemi = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.3);
	//hemi.position.set(0, 10, 0);
	//scene.add(hemi);
	
	//Origin
	var originGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 10, 1, false);
	var originMat = new THREE.MeshNormalMaterial();	
	origin = new THREE.Mesh(originGeo, originMat);
	scene.add(origin);
	
	//Box
	var BOX_SIZE = 10;
	var BOX_CENTER = BOX_SIZE/2;
	
	var PATH = 'img/p1/'; 
	var DIRs  = ['l', 'r', 'u', 'd', 'f', 'b'];
	var EXT = '.jpg';
	
	var sideGeo = new THREE.PlaneGeometry( BOX_SIZE, BOX_SIZE, BOX_SIZE);
	var sidePositions = [
		new THREE.Vector3(0, 0, -BOX_CENTER),
		new THREE.Vector3(-BOX_CENTER, 0, 0),
		new THREE.Vector3(BOX_CENTER, 0, -0),
		new THREE.Vector3(0, 0, -BOX_CENTER),
		new THREE.Vector3(0, 0, -BOX_CENTER),
		new THREE.Vector3(0, 0, -BOX_CENTER),
	];
	var sideRotations = [
		plane3.rotation.y = -Math.PI/2,
		plane3.rotation.y = -Math.PI/2,
		plane3.rotation.y = -Math.PI/2,
		plane3.rotation.y = -Math.PI/2,
		plane3.rotation.y = -Math.PI/2,
		plane3.rotation.y = -Math.PI/2,
	];
	//var boxMaterials = [];
	var boxSides = [];
	for (var i = 0; i < 6; i++) { //Six faces on a cube...
		var sideMaterial = new THREE.MeshBasicMaterial({		
			map: THREE.ImageUtils.loadTexture( PATH + DIRS[i] + EXT ),		
		});
		//boxMaterials.push(material);
		var side = new THREE.Mesh( sideGeo, sideMaterial );
		plane3.rotation.y = -Math.PI/2;
		scene.add(side);
	}
	
	
	render();
}

function render(time) {	
	requestAnimationFrame( render );
	controls.update(); 		
		
	renderer.render( scene, camera );
	
}