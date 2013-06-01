/* -----

	gameScreens
		
	------			*/


/*---------------------------------------------------------------------

	A title screen

  ---------------------------------------------------------------------	*/

	 // create a basic GUI Object
	 var myButton = me.GUI_Object.extend(
	  {	
	     init:function(x, y)
	    {
	       settings = {}
	       settings.image = "main_fish";
	       settings.spritewidth = 64;
	       settings.spriteheight = 64;
	       // parent constructor
	       this.parent(x, y, settings);
	    },
	 	
	    // output something in the console
	    // when the object is clicked
	    onClick:function()
	    {
	       console.log("clicked!");
	       // don't propagate the event
	 		return true;
	    }
	  });
	  

var TitleScreen = me.ScreenObject.extend(
{
	init : function()
	{
		this.parent(true);
		
		
		// title screen image
		this.title = null;
		
		this.font =  null;
		
		this.floating = true;

	
	},
	/* ---
		reset function
	   ----*/
	
	onResetEvent : function()
	{

		if (this.title == null)
		{
			// init stuff if not yet done
			this.title = me.loader.getImage("title");
			// font to display the menu items
			this.font = new me.BitmapFont("kromasky_16x16", 16, 2);
			this.font.set("left");
		}
  		me.game.add(new me.ImageLayer("sea-back1", 0,0, "sea-back1", 1, 0.25));
		me.game.add(new me.ImageLayer("sea-back2", 0,0, "sea-back2", 2, 0.35));
		me.game.add(new me.ImageLayer("sea-back3", 0,0, "sea-back3", 3, 0.45));
		
		// add the object at pos (10,10), z index 4
		//me.game.add((new myButton(10,10)),4);

		me.game.sort();
		

		// enable the keyboard
		me.input.bindKey(me.input.KEY.ENTER,	"enter", true);
	},
	
		
	/*---
		
		update function
		 ---*/
		
	update : function()
	{
		// enter pressed ?
		if (me.input.isKeyPressed('enter'))
		{
			me.state.change(me.state.READY);
		}
		// change the viewport pos to scroll the background :)
		me.game.viewport.pos.x+=1;
		
		return true;
	},

	
	/*---
	
		the manu drawing function
	  ---*/
	
	draw : function(context)
	{	
		context.drawImage(this.title,0,40);
		this.font.draw (context, "PRESS ENTER",     140, 395);
	},
	
	/*---
	
		the manu drawing function
	  ---*/
	
	onDestroyEvent : function()
	{
		me.input.unbindKey(me.input.KEY.ENTER);
    },

});

/*---------------------------------------------------------------------

	A level complete screen
	
  ---------------------------------------------------------------------	*/

GameOverScreen  = me.ScreenObject.extend(
{
	init : function()
	{
		this.parent(true); // next state
		
		this.font  =  null;
		
		this.background = null;
		
		this.saveScore = false;
	},

	
	/* ---
		reset function
	   ----*/
	
	onResetEvent : function(levelId)
	{
		
		if (this.font == null)
		{
			// font to display the menu items
			this.font4x = new me.BitmapFont("kromasky_16x16", 16);
			this.font4x.set("left",4);
			this.font2x = new me.BitmapFont("kromasky_16x16", 16);
			this.font2x.set("left",2);
		}
		
		this.scale = 4.0;
		this.saveScore = false;
		
		// create a new canvas 
		this.background = me.video.applyRGBFilter(me.video.getScreenCanvas(), "b&w");
		
		
		me.input.bindKey(me.input.KEY.ENTER, "enter");
		me.input.bindKey(me.input.KEY.ESC,	 "esc");
		
		// game over sound
		me.audio.play("gameover");
	},
	
		/*---
		
		update function
		 ---*/
		
	update : function()
	{
		
		if (this.scale > 1.0)
		{
			this.scale -= 0.1;
		}
		else
		{	
			/*
			if (!this.saveScore)
			{
				try 
				{
					//save our score
					tapjsHighScores.save(me.gamestat.getItemValue("hiscore"), "", "no");
				} 
				catch(e){};
				this.saveScore = true;
			}
			*/
			
			if (me.input.isKeyPressed('enter'))
			{
				me.state.change(me.state.PLAY);
			}
			else if (me.input.isKeyPressed('esc'))
			{
				me.state.change(me.state.MENU);
			}
		}
		return true;
	},
	
	
	/*---
	
		the manu drawing function
	  ---*/
	
	draw : function(context)
	{
		// draw the background
		context.drawImage(this.background.canvas, 0, 0);
		
		// save the current context
		context.save();
		// scale and keep centered
		if (this.scale != 1.0)
			me.video.scale(context, this.scale);
		
		this.font4x.draw (context, "GAME OVER!", 5, 220);
		// restore context
		context.restore();

		if (this.scale <= 1.0)
		{
			this.font2x.draw (context, "PRESS ENTER TO RETRY", 1, 300);
		}
	},
	
	/*---
	
		the manu drawing function
	  ---*/
	
	onDestroyEvent : function()
	{
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindKey(me.input.KEY.ESC);
	}

});


/*---------------------------------------------------------------------

	A credit screen

  ---------------------------------------------------------------------	*/

InstructionScreen = me.ScreenObject.extend(
{
	init : function()
	{
		this.parent(true); // next state
		this.font  = null;
		this.titlefont  = null;
		
		this.floating = true;
	},
	
		
	
	/* ---
		reset function
	   ----*/
	
	onResetEvent : function()
	{
		if (this.title == null)
		{
			// font to display the menu items
			this.titlefont = new me.BitmapFont("kromasky_16x16", 16, 2);
			this.titlefont.set("left");

			// font to display the menu items
			this.font = new me.BitmapFont("kromasky_16x16", 16, 1.5);
			this.font.set("left");
		}
		
		// add the parallax background
		me.game.add(new me.ImageLayer("sea-back1", 0,0, "sea-back1", 1, 0.25));
		me.game.add(new me.ImageLayer("sea-back2", 0,0, "sea-back2", 2, 0.35));
		me.game.add(new me.ImageLayer("sea-back3", 0,0, "sea-back3", 3, 0.45));
		
		// enable the keyboard
		me.input.bindKey(me.input.KEY.ENTER,	"enter", true);
		me.input.bindKey(me.input.KEY.ESC,		"esc");
		
	},
	
	
	/*---
		
		update function
		 ---*/
		
	update : function()
	{
	
		// enter pressed ?
		if (me.input.isKeyPressed('enter'))
		{
			// switch back to menu
			me.state.change(me.state.PLAY);
		}
		else if (me.input.isKeyPressed('esc'))
		{
			me.state.change(me.state.MENU);
		}
		
		// change the viewport pos to scroll the background :)
		me.game.viewport.pos.x+=0.5;
		
		return true;
	},

	/*---
	
		the manu drawing function
	  ---*/
	
	draw : function(context)
	{
		this.titlefont.draw (context, "INSTRUCTIONS :", 100 , 10);
		this.titlefont.draw (context, "--------------", 100 , 32);
		
		this.titlefont.draw (context, "KEYS :",			100 , 100);
		this.font.draw (context, "* ARROWS TO MOVE ",	100,  148);
		this.font.draw (context, "* PRESS E TO EAT ",	100,  196);
		this.font.draw (context, "* PRESS F TO FART",	100,  244);
		
		this.titlefont.draw (context, "GOAL :",			100 , 300);
		this.font.draw (context, "EAT AS MUCH AS YOU",	100,  348);
		this.font.draw (context, "CAN, AVOID THE JELLY",100,  396);
		this.font.draw (context, "FISH * * *",			100,  440);

	},
	
	/*---
	
		the drawing function
	  ---*/
	
	onDestroyEvent : function()
	{
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindKey(me.input.KEY.ESC);
	},

	

});
