/* author:	fruight<fruight@gmail.com>
 * 
 * AI-game inspired by AntMe
*/
(function(){
	console.log('startSetup');
	console.time('main');
	//init
	document.body.style.margin = '0px';
	document.body.style.overflow = 'hidden';
	var w = window.innerWidth;
	var h = window.innerHeight;
	var c = document.getElementById('AntYou');
	var C = c.getContext('2d');
	c.width = w;
	c.height = h;
	c.style.width = '100%';
	c.style.height = '100%';
	var sys = {
		t0:new Date().getTime()
		,now:0
		,dt:0
		,frame:0
		,tick:0
		,fps:0
		,tps:0
		,drw:0
	}
	var config = {
		fps:40
		,fpt:1
		,tps:40
		,maxPopulation:500
	}

	//settings
	var roles = [
		{size:15, speed:2, shape:'ant:F', ai:{
		 	idle:function(){
				me.log.push(sys.frame+': idle()');//TODO dont log repeatedly and log falling asleep
				me.stack.push(function(){me.ai.idle();});
				me.stack.push(function(){ai.go(100);});
				me.stack.push(function(){ai.turn(Math.random()*Math.PI-Math.PI/2);});
			}
		}}
		];

	//global ai functions
	var get = {
		angleTo:function(x,y){
			var t=Math.atan((me.y-y)/(x-me.x))-me.heading+(x<me.x?Math.PI:0);
			return t>Math.PI?t-2*Math.PI:(t<-Math.PI?t+2*Math.PI:t);
		}
		,distanceTo:function(x,y){
			return Math.sqrt(Math.pow(x-me.x,2)+Math.pow(y-me.y,2));
		}
	};
	var ai = {//TODO make a global default actor that supersedes all custom roles to simplify namespace
		go:function(d){
			me.log.push(sys.frame+': go('+d+')');
			if(d<=me.speed){
				me.x += d*Math.cos(me.heading);
				me.y -= d*Math.sin(me.heading);
			}else{
				me.x += me.speed*Math.cos(me.heading);
				me.y -= me.speed*Math.sin(me.heading);
				me.stack.push(function(){ai.go(d-me.speed);});
			}
		}
		,goTo:function(x,y){
			me.log.push(sys.frame+': goTo('+x+','+y+')');
			if(me.x===x && me.y===y){
			}else{
				me.stack.push(function(){ai.slideTo(x,y);});
				me.stack.push(function(){ai.go(Math.sqrt(Math.pow(x-me.x,2)+Math.pow(y-me.y,2)));});
				me.stack.push(function(){ai.turnTo(x,y);});
			}
		}
		,slide:function(a,d){//THINK call it 'strafing' instead?
			me.log.push(sys.frame+': slide('+a+','+d+')');
			var speed = me.speed/5;
			if(d<=speed){
				me.x += d*Math.cos(me.heading+a);
				me.y -= d*Math.sin(me.heading+a);
			}else{
				me.x += speed*Math.cos(me.heading+a);
				me.y -= speed*Math.sin(me.heading+a);
				me.stack.push(function(){ai.slide(a,d-speed);});
			}
		}
		,slideTo:function(x,y){
				me.stack.push(function(){ai.slide(get.angleTo(x,y),get.distanceTo(x,y));});
		}
		,turn:function(a){
			me.log.push(sys.frame+': turn('+a+')');
			var t=me.speed*Math.PI/90;
			if(Math.abs(a)<=t){
				me.heading += a;
			}else if(a>0){
				me.heading += t;
				me.stack.push(function(){ai.turn(a-t);});
			}else{
				me.heading -= t;
				me.stack.push(function(){ai.turn(a+t);});
			}
		}
		,turnTo:function(x,y){
			me.log.push(sys.frame+': turnTo('+x+','+y+')');
			me.stack.push(function(){ai.turn(get.angleTo(x,y));});
		}
		,sleep:function(t){
			if(t<=1){me.log.push(sys.frame+': wakeup');}
			else if(t===undefined){me.stack.push(function(){ai.sleep();});}
			else{me.stack.push(function(){ai.sleep(t-1);});}
		}
	}

	//setup
	var actors = [];
	var me = undefined;
	for(var i=0;i<config.maxPopulation;i++){
		actors[i] = {};
		actors[i].i       = i;
		actors[i].x       = Math.random()*w;
		actors[i].y       = Math.random()*h;
		actors[i].heading = Math.random()*2*Math.PI;
		actors[i].role    = Math.floor(Math.random()*roles.length);
		actors[i].size    = roles[actors[i].role].size;
		actors[i].speed   = roles[actors[i].role].speed;
		actors[i].shape   = roles[actors[i].role].shape;
		actors[i].ai      = roles[actors[i].role].ai;
		actors[i].stack   = [function(){me.ai.idle();}];
		actors[i].log     = [sys.frame+': init'];
	}

	//main loop
	(loop = function(){
		//console.time('loop');//DEBUG
		//console.count('loop');//DEBUG
		window.setTimeout(loop, 1000/config.tps);
		sys.dt = new Date().getTime()-sys.t0-sys.now;
		sys.now += sys.dt ;
		sys.tick++;
		for(var i=0;i<actors.length;i++){
			//calculate actions
			me=actors[i];
			actors[i].stack.pop()();
			while(actors[i].log.length>=2000){actors[i].log.shift();}//limit logsize
			//wrap the canvas
			if(actors[i].x < 0){actors[i].x = w;}else
			if(actors[i].x > w){actors[i].x = 0;}
			if(actors[i].y < 0){actors[i].y = h;}else
			if(actors[i].y > h){actors[i].y = 0;}
			//keep heading in valid range
			while(actors[i].heading >= 2*Math.PI){actors[i].heading -= 2*Math.PI;}
			while(actors[i].heading <= 0){actors[i].heading += 2*Math.PI;}
		}
		sys.drw+=config.fpt;
		if(sys.drw>=1){sys.drw=0;draw();}
		//draw all actors
		//console.timeEnd('loop');//DEBUG
	})();

	//drawing function
	function draw(){
		sys.frame++;
		C.clearRect(0, 0, w, h);
		//C.beginPath();for(var i=100;i<w;i+=100){C.moveTo(i,0);C.lineTo(i,h);}for(var i=100;i<h;i+=100){C.moveTo(0,i);C.lineTo(w,i);}C.stroke();//DEBUG grid
		//C.beginPath();C.moveTo(w/2,h/2-10);C.lineTo(w/2,h/2+10);C.moveTo(w/2-10,h/2);C.lineTo(w/2+10,h/2);C.stroke();//DEBUG center
		for(var i=0;i<actors.length;i++){
			var s = Math.sin(actors[i].heading);
			var c = Math.cos(actors[i].heading);
			var r = actors[i].size/2;
			var x = actors[i].x;
			var y = actors[i].y;
			if(actors[i].shape===undefined){actors[i].shape='round';}
			var shape   = actors[i].shape.indexOf(':')===-1?actors[i].shape:actors[i].shape.substring(0,actors[i].shape.indexOf(':'));
			var options = actors[i].shape.indexOf(':')===-1?'':actors[i].shape.substring(actors[i].shape.indexOf(':')+1);
			C.beginPath();
			if(shape==='round'){
				C.arc(x, y, r, 0, 2*Math.PI, true);
			}else if(shape==='square'){
				C.moveTo(x + c * r - s * r, y - s * r - c * r);
				C.lineTo(x - s * r - c * r, y - c * r + s * r);
				C.lineTo(x - c * r + s * r, y + s * r + c * r);
				C.lineTo(x + s * r + c * r, y + c * r - s * r);
				C.lineTo(x + c * r - s * r, y - s * r - c * r);
			}else if(shape==='diamond'){
				C.moveTo(x + c * r, y - s * r);
				C.lineTo(x - s * r, y - c * r);
				C.lineTo(x - c * r, y + s * r);
				C.lineTo(x + s * r, y + c * r);
				C.lineTo(x + c * r, y - s * r);
			}else if(shape==='tri'){
				C.moveTo(x + c * r, y - s * r);
				C.lineTo(x - s * r - c * r, y - c * r + s * r);
				C.lineTo(x - c * r + s * r, y + s * r + c * r);
				C.lineTo(x + c * r, y - s * r);
			}else if(shape==='arrow'){
				C.moveTo(x + c * r, y - s * r);
				C.lineTo(x - s * r - c * r, y - c * r + s * r);
				C.lineTo(x, y);
				C.lineTo(x - c * r + s * r, y + s * r + c * r);
				C.lineTo(x + c * r, y - s * r);
			}else if(shape==='ant'){ //TODO add legs and antennae
				C.arc(x + c*r/2, y - s*r/2, r/3, 0, 2*Math.PI, true);
				C.moveTo(x + r/4, y);
				C.arc(x, y, r/4, 0, 2*Math.PI, true);
				C.moveTo(x - c*r/2+r/3, y + s*r/2);
				C.arc(x - c*r/2, y + s*r/2, r/3, 0, 2*Math.PI, true);
				C.moveTo(x - s*r, y - c*r);
				C.lineTo(x + s*r, y + c*r);
				C.moveTo(x - s*r - c*r/2, y - c*r + s*r/2);
				C.lineTo(x + s*r + c*r/2, y + c*r - s*r/2);
				C.moveTo(x - s*r + c*r/2, y - c*r - s*r/2);
				C.lineTo(x + s*r - c*r/2, y + c*r + s*r/2);
			}else{ //warn for unknown shapes and fall back to round
				console.warn('unknown shape: "'+actors[i].shape+'", falling back to "round:'+options+'"');//TODO avoid multiple warnings for same error, give info
				actors[i].shape = 'round:'+options;
			}
			//C.moveTo(actor.x, actor.y);C.lineTo(actor.x-actor.speed*10*c, actor.y+actor.speed*10*s);//DEBUG add a trail to show speed and heading
			//draw filled or hollow
			if(options.match('F')){C.fill();}
			C.stroke();
		}
		C.clearRect(0,0,260,10);
		C.fillText('time:'+(sys.now/1000)+' s | frame:'+sys.frame+' | tick:'+sys.tick+' | fps:'+(Math.round(sys.fps=(sys.fps*49+100000/sys.dt)/50)/100),2,9);//FIXME fix fps and add tps
	}

	//end
	console.timeEnd('main');
	console.log('endSetup');
})();
