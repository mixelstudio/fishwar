/* -----

	Game Main Class 
	
	------			*/

var jsApp	=
{
	
	/* ---
	
		Initialize the jsApp
		
		---		*/
	onload: function()
	{
		// debug stuff
		me.debug.renderHitBox = true;
		
		me.sys.useNativeAnimFrame = true;
		
		// init the video
		if (!me.video.init('jsapp', 640, 480))
		{
			alert("Go get yourself another browser!");
			return;
		}
					
		// initialize the "sound engine"
		me.audio.init("mp3,ogg");
		
		// set all ressources to be loaded
		me.loader.onload = this.loaded.bind(this);
		// set all ressources to be loaded		
		me.loader.preload(g_ressources);
		
		// load everything & display a loading screen
		me.state.change(me.state.LOADING);
		
		
	},
	
	
	/* ---
	
		callback when everything is loaded
		
		---										*/
	loaded: function ()
	{	
		// set the "Menu" Screen Object
		me.state.set(me.state.MENU, new TitleScreen());
		
		// set the "Instructions" Screen Object
		me.state.set(me.state.READY, new InstructionScreen());
	
		// set the "Play/Ingame" Screen Object
		me.state.set(me.state.PLAY, new PlayScreen());
			
		// set the "Game Over" Screen Object
		me.state.set(me.state.GAMEOVER, new GameOverScreen());
      
		// set a fade transition effect
		me.state.transition("fade","#ffffff", 200);
		
		// disable transition for the GAME OVER STATE
		me.state.setTransition(me.state.GAMEOVER, false);
		
		// add our player entity in the entity pool
		me.entityPool.add("MainFish", MainFish);
		me.entityPool.add("SmallFish", SmallFish);
		me.entityPool.add("JellyFish", JellyFish);
		
	
		// create a gamestat (to have persistent hiscore during the game )
		me.gamestat.add("hiscore",	this.readHiScore());
		
		// define a function that display pause
		me.state.onPause = function ()
		{
			// get the current context
			var context = me.video.getSystemContext();
			
			// create a black & white copy of the background
			var background = me.video.applyRGBFilter(me.video.getScreenCanvas(), "b&w");
			
			// draw the background
			context.drawImage(background.canvas, 0, 0);

			
			//draw a black transparent square
			context.fillStyle = "rgba(0, 0, 0, 0.8)";
			context.fillRect(0, (me.video.getHeight()/2) - 30, me.video.getWidth(), 60);
         
			// create a font (scale 3x)
			var font = new me.BitmapFont("kromasky_16x16", 16, 3);
			font.set("left");
			// get the text size
			var measure = font.measureText("P A U S E");
			// a draw "pause" ! 
			font.draw (context, "P A U S E", 
					   (me.video.getWidth()/2) - (measure.width/2) , 
					   (me.video.getHeight()/2) - (measure.height/2));

		};
		
		// go to the main menu
		me.state.change(me.state.MENU);
		
		// fizzle
		me.audio.play("fizzle");
		
	},
	
	/* 
	   write the hiscore in localstorage
	 */
	writeHiScore : function (val)
	{
		if (me.sys.localStorage)
		{
			try 
			{	
				lval = this.readHiScore();
				if (val > lval)
				{ 
					//saves to the database, "key", "value"
					localStorage.setItem("mefw_hiscore", val); 
				}
			} 
			catch (e){/*sthg went wrong*/}
		}
	},
	
	/* 
	   read the hiscore from localstorage
	 */
	readHiScore : function ()
	{
		if (me.sys.localStorage)
		{
			try 
			{	
				//get the database value
				return (localStorage.getItem("mefw_hiscore") || 0); 
			} 
			catch (e){/*sthg went wrong*/}
		}
		return 0;
	}
	
	
}; // jsApp

/* game initialization */
var PlayScreen = me.ScreenObject.extend(
{

	// we just defined what to be done on reset
	// no need to do somehting else
	onResetEvent: function()
	{	
		// load our level
		me.levelDirector.loadLevel("level-1");
		
		// add our Fish Generator !
		me.game.add(new FishGeneratorObject(),10);
		
		// add a default HUD to the game mngr
		me.game.addHUD(0, 0, 640, 80);
		
		// add HUD Item
		me.game.HUD.addItem("hiscore", new HUDHiScoreObject	(10, 10, me.gamestat.getItemValue("hiscore")));
		me.game.HUD.addItem("life",	 new HUDLifebject	(190, 12, 100));
		me.game.HUD.addItem("score", new HUDScoreObject	(510, 10, 0));
		
		// enable the keyboard
		me.input.bindKey(me.input.KEY.LEFT,		"left");
		me.input.bindKey(me.input.KEY.RIGHT,	"right");
		me.input.bindKey(me.input.KEY.UP,		"up");
		me.input.bindKey(me.input.KEY.DOWN,		"down");
		
		me.input.bindKey(me.input.KEY.F,		"fart", true);
		me.input.bindKey(me.input.KEY.E,		"eat", true);
		
		// start the main soundtrack
		me.audio.playTrack("electricFish");

	},
	
	/*---
	
		the manu drawing function
	  ---*/
	
	onDestroyEvent : function()
	{
		// stop the alarm
		me.audio.stop("alarm");
		
		// save the hiscore
		jsApp.writeHiScore(me.gamestat.getItemValue("hiscore"));
		
		// disable the HUD
		me.game.disableHUD();
		
		// unbind all binded keys
		me.input.unbindKey(me.input.KEY.LEFT);
		me.input.unbindKey(me.input.KEY.RIGHT);
		me.input.unbindKey(me.input.KEY.UP);
		me.input.unbindKey(me.input.KEY.DOWN);
		me.input.unbindKey(me.input.KEY.E);
		me.input.unbindKey(me.input.KEY.F);
		
		// stop the main sound track
		me.audio.stopTrack();
	}
	
});


//bootstrap :)
window.onReady(function() 
{
	jsApp.onload();
});
