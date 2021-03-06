'use strict';


var Pancake = (function() { //Poor man's namespace (module pattern)


	//Constants
	var BOX_SIZE = 10;
	var BOX_CENTER = BOX_SIZE/2;
	var IMG_SIZE = 1024;
	var SCENES_PATH = './scenes/lo/';
	var DEBUG = false;
	var ID_TO_DIR = {};
	var FOV_MAX = 75;
	var FOV_MIN = 55;
	var BUTTON_RIGHT = 3; 
	
	var CURSORS_PATH = './cursors/';
	var CURSORS_TO_LOAD = ['forward.png'];
	var CURSORS_ALIASES = ['f'];
	
	var CURSOR_CENTERS_X = {f:15};
	var CURSOR_CENTERS_Y = {f:0};
	
	//Module variables
	var container;
	var canvas;
	var ctx;
	var scene;
	var camera;
	var renderer;
	
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
	
	//Properties
	var curScene = 1;
	var cursors = {};
	var sceneHeight = 1;
		
	//Class Engine
	function Engine() {
			
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
		canvas = renderer.domElement;
		ctx = canvas.getContext('2d');
		canvas.oncontextmenu = function (e) {
			e.preventDefault();
		};	
		
		//Events	
		document.addEventListener( 'mousemove', onMouseMove, false );	
		document.addEventListener( 'mousedown', onMouseDown, false );	
		document.addEventListener( 'mouseup', onMouseUp, false );	
		document.addEventListener( 'mousewheel', onMouseWheel, false );
		document.addEventListener( 'MozMousePixelScroll', onMouseWheel, false);
		document.addEventListener( 'keydown', onKeyDown, false);
		window.addEventListener( 'resize', onWindowResize, false );
		
		//Cursors
		//loadCursors(function() {
			//Stage		
			setStage();
			render();
		//});
	}

	//Public functions
	Engine.prototype.addEvents = function(eventName, callback) {
		callbacks[eventName].push(callback);
	}

	//Private
	function setStage() {
			
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
				map: THREE.ImageUtils.loadTexture( SCENES_PATH + curScene + '/' + DIRS[i] + EXT ),		
			});
		
			var side = new THREE.Mesh( sideGeo, sideMaterial );
			side.position.copy(sidePositions[i]);
			var euler = new THREE.Euler(sideRotations[i].x, sideRotations[i].y, sideRotations[i].z, 'XYZ');		
			side.rotation.copy(euler);
			ID_TO_DIR[side.id] = DIRS[i]; //Store object's id for easy converting of id to box side	
			boxSides.push(side);
			scene.add(side);
		}
			
	}

	function loadCursors(onComplete, i) {	//Recursive loading loop
		if (typeof(i) == 'undefined') i = 0;		
		var cursorAlias = CURSORS_ALIASES[i];
		var cursor = new Image();  
		cursor.onload = function() {			
			if (i >= CURSORS_TO_LOAD.length - 1) onComplete();
			else self.loadCursors(onComplete, i+1);
		}	
		cursor.src = CURSORS_PATH + '/' + CURSORS_TO_LOAD[i];
			
		cursors[cursorAlias] = cursor;
	}
	
	function getCollisions(mouse) {
		// update the picking ray with the camera and mouse position	
		raycaster.setFromCamera( mouse, camera );	

		// calculate objects intersecting the picking ray
		return raycaster.intersectObjects( boxSides);	
	}
	
	function collisionPointToTexturePoint(col) { //Convert point in 3D space to texture x,y for hit testing
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
		return [
			(IMG_SIZE * point2d.x)/BOX_SIZE, //x
			(IMG_SIZE * point2d.y)/BOX_SIZE  //y
		];
	}
	
	function getActiveRegion(mouse) {
		var collisions = getCollisions(mouse);
		if ( collisions.length > 0 ) {
			
			var col = collisions[0];
			var point2d = collisionPointToTexturePoint(col);
			var dir = ID_TO_DIR[col.object.id];		
			var sceneKey = curScene + '-' + dir;
			if (typeof(hotspots[sceneKey]) != 'undefined') {
				var regions = hotspots[sceneKey];	
				
				for (var r = 0; r < regions.length; r++) {
					var region = regions[r];
					if (inside(point2d, region.coords)) {
						//if (DEBUG) console.log(dir, point2d);
						return region;										
					}
				}
			}			
			
		}
		return null;
	}

	function onMouseMove( e ) {

		if (looking) {
			lon = ( mouseDown.x - e.clientX ) * 0.1 + prevLon;
			lat = ( e.clientY - mouseDown.y ) * 0.1 + prevLat;
		}		
		mouse.x = (e.clientX  / window.innerWidth ) * 2 - 1;	
		mouse.y = - (e.clientY / window.innerHeight ) * 2 + 1;
		
		var region = getActiveRegion(mouse);
		if (region) {
			if (region.cursor == 'f') canvas.style.cursor = 'pointer';
			else if (region.cursor == 'm') canvas.style.cursor = 'zoom-in';
		}
		else canvas.style.cursor = 'default';		

	}
	
	function onMouseDown( e ) {
		e.preventDefault();				
		
		if (e.which == BUTTON_RIGHT) { //Hotspot / navigation 			
			mouse.x = (e.clientX  / window.innerWidth ) * 2 - 1;	
			mouse.y = - (e.clientY / window.innerHeight ) * 2 + 1;	
			var region = getActiveRegion(mouse);
			
			if (region) onNavigationEvent(region);
				
		}
		else { //Camera looking
			//if (DEBUG) console.log(lon, lat);
			looking = true;
			mouseDown.x = e.clientX;
			mouseDown.y = e.clientY;
		
			prevLon = lon; //Store previous so we can get the drag delta
			prevLat = lat;
		}
		
	}

	function onMouseUp( e ) {
		looking = false;
	}

	function onMouseWheel( e ) {
		
		if ( e.wheelDeltaY ) camera.fov -= e.wheelDeltaY * 0.05; // WebKit
		else if ( e.wheelDelta ) camera.fov -= e.wheelDelta * 0.05;  // Opera / Explorer 9
		else if ( e.detail ) camera.fov += e.detail * 1.0; // Firefox

		camera.fov = Math.max(FOV_MIN, camera.fov);
		camera.fov = Math.min(FOV_MAX, camera.fov);
		camera.updateProjectionMatrix();

	}
	
	function onKeyDown( e ) {		
		var oldScenesPath = SCENES_PATH;
		var HEIGHTS = ['dark', 'lo', 'med', 'hi'];		
		if (e.keyCode == 38) { //Up		
			sceneHeight++;
			if (sceneHeight + 1 >= HEIGHTS.length) sceneHeight = HEIGHTS.length - 1;
		}
		if (e.keyCode == 40) { //Down
			sceneHeight--;
			if (sceneHeight < 0) sceneHeight = 0;
		}
		SCENES_PATH = './scenes/' + HEIGHTS[sceneHeight] + '/';
		console.log(oldScenesPath, SCENES_PATH, sceneHeight);
		if (oldScenesPath != SCENES_PATH) {
			scene.remove(boxSides[0]);
			scene.remove(boxSides[1]);
			scene.remove(boxSides[2]);
			scene.remove(boxSides[3]);
			scene.remove(boxSides[4]);
			scene.remove(boxSides[5]);			
			setStage();
		}
	}

	function onWindowResize() {

		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();

		renderer.setSize( window.innerWidth, window.innerHeight );

	}
	
	function onNavigationEvent(region) {		
		scene.remove(boxSides[0]);
		scene.remove(boxSides[1]);
		scene.remove(boxSides[2]);
		scene.remove(boxSides[3]);
		scene.remove(boxSides[4]);
		scene.remove(boxSides[5]);
		curScene = region.target;
		setStage();
	}
	
	function render(time) {	
		

		lat = Math.max( - 85, Math.min( 85, lat ) );
		phi = THREE.Math.degToRad( 90 - lat );
		theta = THREE.Math.degToRad( lon );
		
		camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
		camera.target.y = 500 * Math.cos( phi );
		camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

		camera.lookAt( camera.target );					
		renderer.render( scene, camera );
		
		//Cursor overlay
		//var cursor = cursors['f'];
		//ctx.drawImage(cursor, 0, 0);//mouse.x - CURSOR_CENTERS_X[c], mouse.y - CURSOR_CENTERS_Y[c], cursor.width, cursor.height);
		requestAnimationFrame( render );	
	}
	//End class Engine

	//Exports
	return {Engine:Engine};

})(); //End Pancake namespace
var pan = new Pancake.Engine();