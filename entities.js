/* -----

	game object
		
	------			*/

	/****************
	*				*
	*	Main Fish   *
	*				*
	****************/
	var MainFish = me.ObjectEntity.extend( {	
		init:function (x, y, settings) {

			// define this here, since not defined in tiled
			settings.image = "main_fish";
			settings.spritewidth = 74;
			settings.spriteheight = 68;
			
			
			// call the constructor
			this.parent(x, y , settings);
			
			// set the walking & jumping speed
			this.setVelocity(0.3, 0.3);
			
			// set the walking & jumping speed
			this.setMaxVelocity(5, 5);
			
			// add friction
			this.setFriction(0.1,0.1);
			
			// no graviy
			this.gravity = 0;
			
			this.fishSize = 1.0;
			
			this.boxPos = new me.Vector2d(10,10);
			this.boxSize = new me.Vector2d(60,40);
			
			// adjust the bounding box
			this.updateColRect(this.boxPos.x,this.boxSize.x, 
							   this.boxPos.y,this.boxSize.y);
						
         
			// adjust the deadzone
			me.game.viewport.follow( this);
			
			// animation
			this.addAnimation ("swim",  [0,0,0,1,1,1]);
			
			// animation
			this.addAnimation ("eat",  [2,2,0]);
			
			this.isEating = false;
			
			// set default one
			this.setCurrentAnimation("swim");
		},
	
		
		/* -----

			update the player pos
			
		------			*/
		update : function () {

			if (!this.alive)
				return false;
				
			// remove one life point
			me.game.HUD.updateItemValue("life", -0.1);
			
			// game over ?
			if (me.game.HUD.getItemValue("life")==0){
					me.state.change(me.state.GAMEOVER);
			}
			
			// test keys
			if (me.input.isKeyPressed('left')) {
				this.vel.x -= this.accel.x;
				this.flipX(true);
			}
			else if (me.input.isKeyPressed('right')) {
				this.vel.x += this.accel.x;
				this.flipX(false);
			}

			if (me.input.isKeyPressed('up')) {
				this.vel.y -= this.accel.y;
			}
			else if (me.input.isKeyPressed('down')) {
				this.vel.y += this.accel.y;
			}
			
			if (me.input.isKeyPressed('fart')) {
				if (this.fishSize>1.0) {
					// only fart if we still have sthg!
					this.fart();
				}
			}
			
			if (me.input.isKeyPressed('eat')) {
				// set default one
				this.setCurrentAnimation("eat","swim");
			}
			
			// check & update player movement
			var env_res = this.updateMovement();
			
			if (this.pos.y + this.height > me.game.currentLevel.realheight) {
				// make sure we don't go offscreen
				this.pos.y = me.game.currentLevel.realheight - this.height;
			}

			
			// check for collision with other entities
			var res = me.game.collide(this);

			if (res) {
				// check if collision with a fish on the mouth side
				if ((res.obj.type=="fish") && this.isCurrentAnimation("eat")){
					if (((res.x>0) && (this.scale.x>0))||((res.x<0) && (this.scale.x<0))){
						this.isEating = true;
					}
				}
				// else check for collision with a jellyfish
				else if (res.obj.type=="jellyfish")
				{
					//ouch
					if (res.x!=0) {
						this.vel.x = res.x>0?-this.maxVel.x:this.maxVel.x;
					}
					else if (res.y!=0) {
						this.vel.y = res.y>0?-this.maxVel.y:this.maxVel.y;
					}
					me.audio.play("fizzle");
					// shake display
					me.game.viewport.shake(5,25);
					// remove some life point
					me.game.HUD.updateItemValue("life", -5);
					// flickery fish
					this.flicker(200);
					
					// game over ?
					if (me.game.HUD.getItemValue("life")==0){
						this.alive = false;
						me.game.viewport.fadeIn("#0099ff", 35, function(){me.state.change(me.state.GAMEOVER);});
					}
					else {
						// flash the screen
						me.game.viewport.fadeIn("#0099ff", 35);
					} 
					
					
				}
			}
			else {
				this.isEating = false;
			}
			
			// update animation
			if ((this.vel.x!=0||this.vel.y!=0) || this.isCurrentAnimation("eat") || this.isFlickering())	{
				// update objet animation
				this.parent(this);
			}
			return true;
		},
		
		// increase the fish size
		increaseSize: function()	{
			this.fishSize +=0.10;
			this.resize(this.fishSize);
			// resize the collision box
			this.resizeCollisionBox(Math.abs(this.scale.x));
		},
		
		// decrease the fish size
		decreaseSize: function()	{
			if (this.fishSize>1.0) {
				this.fishSize -=0.10;
				this.resize(this.fishSize);
				// resize the collision box
				this.resizeCollisionBox(Math.abs(this.scale.x));
			}
		},
		
		// resize the collision box
		resizeCollisionBox: function (scale) {
			// resize the collision box
			var newW = this.boxSize.x * scale;
			var newH = this.boxSize.y * scale;
			var wdelta = (newW - this.boxSize.x)>>1;
			var hdelta = (newH - this.boxSize.y)>>1;
			this.updateColRect(this.boxPos.x-wdelta, newW, this.boxPos.y-hdelta, newH);
		},
		
		// called when the player fart
		fart : function () {
			
			if (this.scale.x < 0) // looking left
				var fart = new FartObject(this.collisionBox.right  -32, this.collisionBox.bottom);
			else
				var fart = new FartObject(this.collisionBox.left, this.collisionBox.bottom);
			
			me.game.add(fart, this.z);
			me.game.sort();
			
			this.vel.y -= this.maxVel.y / 4;
			
			this.decreaseSize();
			me.audio.play("fart");
		},


			

	});
	
	
	/**
	 *	a skeleton for swimming stuff
	 **/
	var FishEntity = me.ObjectEntity.extend({
		init:function (x, y, settings) {
			// call the constructor
			this.parent(x, y , settings);
			
			// direction angle
			this.direction = Math.PI * 2 * Math.random();
			
			// x,y angle vector
			this.angle = new me.Vector2d(0,0);
			
			// init swimming variable and position
			this.initSwim();

		},
		
		/* -----

			init the swimming stuff
			
		------			*/
		initSwim: function () {
			
			// and set the value accordingly
			this.angle.set(Math.cos(this.direction), Math.sin(this.direction));
			
            // stop fish from swimming straight up or down
            if (this.direction > Math.PI * 4 / 3 && this.direction < Math.PI * 5 / 3 || this.direction > Math.PI * 1 / 3 && this.direction < Math.PI * 2 / 3) {
                this.direction = Math.PI * 1 / 3 * Math.random();
				this.angle.set(Math.cos(this.direction), Math.sin(this.direction));
            }

            // face the fish the right way if angle is between 6 o'clock and 12 o'clock
            if (this.direction > Math.PI / 2 && this.direction < Math.PI / 2 * 3) {
                this.flipX(true);
            }

		},
		
		/* -----

			update our swimmer
			
		------			*/
		update: function () {
		
			// Calculate next position of fish
			var nextX = this.pos.x + this.angle.x + this.vel.x * me.timer.tick;
			var nextY = this.pos.y + this.angle.y + this.vel.y * me.timer.tick;

			// If fish is going to move off right side of screen
			if (nextX + this.width > me.game.currentLevel.realwidth ) {
				// If angle is between 3 o'clock and 6 o'clock
				if ((this.direction >= 0 && this.direction < Math.PI / 2)) {
					this.direction = Math.PI - this.direction;
					this.angle.set(Math.cos(this.direction), Math.sin(this.direction)* Math.random());
				}
				// If angle is between 12 o'clock and 3 o'clock
				else if (this.direction > Math.PI / 2 * 3) {
					this.direction = this.direction - (this.direction - Math.PI / 2 * 3) * 2;
					this.angle.set(Math.cos(this.direction), Math.sin(this.direction)* Math.random());
				}
			}

			// If fish is going to move off left side of screen
			if (nextX < 0) {
				// If angle is between 6 o'clock and 9 o'clock
				if ((this.direction > Math.PI / 2 && this.direction < Math.PI)) {
					this.direction = Math.PI - this.direction;
					this.angle.set(Math.cos(this.direction), Math.sin(this.direction)* Math.random());
				}
				// If angle is between 9 o'clock and 12 o'clock
				else if (this.direction > Math.PI && this.direction < Math.PI / 2 * 3) {
					this.direction = this.direction + (Math.PI / 2 * 3 - this.direction) * 2;
					this.angle.set(Math.cos(this.direction), Math.sin(this.direction)* Math.random());
				}

			}

			// If fish is going to move off bottom side of screen
			if (nextY + this.height > me.game.currentLevel.realheight ) {
				// If angle is between 3 o'clock and 9 o'clock
				if ((this.direction > 0 && this.direction < Math.PI)) {
					this.direction = Math.PI * 2 - this.direction;
					this.angle.set(Math.cos(this.direction), Math.sin(this.direction)* Math.random());
				}
			}

			// If fish is going to move off top side of screen
			if (nextY < 0) {
				// If angle is between 9 o'clock and 3 o'clock
				if ((this.direction > Math.PI && this.direction < Math.PI * 2)) {
					this.direction = this.direction - (this.direction - Math.PI) * 2;
					this.angle.set(Math.cos(this.direction), Math.sin(this.direction)* Math.random());
				}
			}
			
			// update next position
			nextX = this.pos.x + this.angle.x + this.vel.x * me.timer.tick;
			nextY = this.pos.y + this.angle.y + this.vel.y * me.timer.tick;

			// flip it if necessary
			this.flipX((nextX < this.pos.x));

			// update our position
			this.pos.set(nextX, nextY);
			
			// call the parent function
			this.parent(this);
		
			// always return true
			return true;
		}

		
	
	});
	/****************
	*				*
	*	Small Fish  *
	*				*
	****************/
	var SmallFish = FishEntity.extend({	
		init:function (x, y, settings) {
			
			// define this here, since not defined in tiled
			settings.image = "small_fish";
			settings.spritewidth = 40;
			settings.spriteheight = 40;
			
			// call the constructor
			this.parent(x, y , settings);
			
			// set the walking & jumping speed
			this.setVelocity(3.0, 3.0);
			
			// set the walking & jumping speed
			this.setMaxVelocity(5, 5);
			
			// add friction
			//this.setFriction(0.1, 0.1);
			
			// no graviy
			this.gravity = 0;
			
			// default size of the fish
			this.fishSize = 1.0;
			
			// make it collidable
			this.collidable = true;
			this.type = "fish";
			
			// adjust the bounding box
			this.updateColRect(10,24, 10,24);
						
 			// animation
			this.addAnimation ("swim",  [0,0,0,1,1,1]);
						
			// set default one
			this.setCurrentAnimation("swim");
						
		},
		
		// on collision method
		onCollision: function(res, obj)	{
			if (obj.isEating) {
				this.collidable = false;
				me.audio.play("bite");
				me.game.HUD.updateItemValue("score", 250);
				// add one life point
				me.game.HUD.updateItemValue("life", 10);
				obj.increaseSize();
				me.game.remove(this);
			}
		}
	});
	
	
	/****************
	*				*
	*	Jelly Fish  *
	*				*
	****************/
	var JellyFish = me.ObjectEntity.extend({	
		init:function (x, y, settings) {
			
			// define this here, since not defined in tiled
			settings.image = "jelly_fish";
			settings.spritewidth = 29;
			settings.spriteheight = 30;
			
			
			// call the constructor
			this.parent(x, y , settings);
			
			// set the walking & jumping speed
			this.setVelocity(0.5, 0.5);
			
			// set the walking & jumping speed
			this.setMaxVelocity(5, 5);
			
			// add friction
			//this.setFriction(0.1, 0.1);
			
			// no graviy
			this.gravity = 0;
			
			// make it collidable
			this.collidable = true;
			this.type = "jellyfish";
			
			// adjust the bounding box
			this.updateColRect(5,19, 5,20);
						
 			// animation
			this.addAnimation ("swim",  [1,2,3,4,3,2]);
			this.addAnimation ("hurt",  [5,6,5,6]);
						
			// set default one
			this.setCurrentAnimation("swim");
			
			// some flag
			this.goUp = true;
						
		},
	
		
		/* -----

			update the player pos
			
		------			*/
		update : function () {
			
			if (this.alive) {
				if (this.goUp) {
					this.pos.y -= this.accel.y;
					if (this.pos.y < 0)
						this.goUp = false;
				}
				else {
					this.pos.y += this.accel.y;
					if (this.pos.y > 480)
						this.goUp = true;
				}
			}
			// not alive !
			else {
				this.pos.y -= this.accel.y;
				if (this.pos.y < 0)
					me.game.remove(this);
			}
			// update objet animation
			this.parent(this);
			
			return true;
		},
		
		// on collision method
		
		onCollision: function(res, obj)	{
			if (obj.type == "fart") {
				this.collidable = false;
				this.alive = false;
				this.flipY(true);
				this.flicker (60);
				this.setCurrentAnimation("hurt");
				// add some points to the score
				me.game.HUD.updateItemValue("score", 100);
				//me.game.remove(this);
			}
		}
		
	});
	
	
	
	/****************
	*				*
	*	Fart Objet  *
	*				*
	****************/
	var FartObject = me.ObjectEntity.extend({	
		init:function (x, y, settings) {
			
			var settings = {};
			// define this here, since not defined in tiled
			settings.image = "smoke";
			settings.spritewidth = 32;
			settings.spriteheight = 32;
			
			
			// call the constructor
			this.parent(x, y , settings);
			
			// set the walking & jumping speed
			this.setVelocity(0.3, 0.3);
			
			// set the walking & jumping speed
			this.setMaxVelocity(5, 5);
			
			// add friction
			this.setFriction(0.1, 0.1);
			
			// no graviy
			this.gravity = 0;
			
			// make it collidable
			//this.collidable = true;
			this.type = "fart";
			
			// adjust the bounding box
			this.updateColRect(5,25, 5,25);
			
			this.setCurrentAnimation("default", function(){me.game.remove(this)});
		},
	
		
		/* -----

			update the player pos
			
		------			*/
		update : function () {
			
			this.pos.y -= this.accel.y;
			if (this.pos.y < 0)
				me.game.remove(this);
			
			// check for collision with other entities
			me.game.collide(this);
		
			// update objet animation
			this.parent(this);
			
			return true;
		}
	});

   /**
	*	Fish Generator Objet
	*	
	*/
	var FishGeneratorObject = Object.extend({	
		init:function () {
		
			// to make sure the object is 
			// update on each frame
			this.visible = true;
			
			this.fps = 0;
			
			this.maxX = me.game.currentLevel.realwidth / 10;
			this.maxY = (me.game.currentLevel.realheight / 10) -1;
		},
	
		
		/* -----

			update the player pos
			
		------			*/
		update : function () {
			
			// every 2 second
			if ((this.fps++)%120==0){
				// add a fish
				var x = Number.prototype.random(0,1)== 0? - 32:me.game.currentLevel.realwidth+32;
				var y = Number.prototype.random(0,this.maxY) * 10;
				me.game.add(new SmallFish(x,y,{}),5);
				me.game.sort();
			}
			// every 4 second
			if (this.fps%240==0){
				// add a jellyfish
				var x = Number.prototype.random(0,this.maxX) * 10;
				var y = Number.prototype.random(0,1)== 0? - 32:me.game.currentLevel.realheight+32;
				me.game.add(new JellyFish(x,y,{}),5);
				me.game.sort();
				
				// avoid the counter to become infinite :)
				this.fps = 0;
			}
			
			return true;
		},
		
		draw : function(context) {
			// nothing to draw;
		},
		
	});

