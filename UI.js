/* -----

	HUD object
		
	------			*/

	// a HUD Score Object
	var HUDScoreObject = me.HUD_Item.extend(
	{	
		init:function(x, y)
		{
			this.parent(x, y);
			// create a font
			this.font = new me.BitmapFont("kromasky_16x16", 16, 1.5);
			this.font.set("left");
		},
		
		// update the item value
		update : function(value) {
			this.parent(value);
			if (this.value>me.gamestat.getItemValue("hiscore")) {
				me.gamestat.setValue("hiscore", this.value);
			}
			return true;
			
		},

		
		draw : function (context, x, y)
		{
			this.font.draw (context, "SCORE", this.pos.x+x, this.pos.y+y);
			this.font.draw (context, this.value, this.pos.x+x, this.pos.y+y+32);
		}
	});
	
	// a HUD Score Object
	var HUDHiScoreObject = me.HUD_Item.extend(
	{	
		init:function(x, y, val)
		{
			this.parent(x, y, val);
			// create a font
			this.font = new me.BitmapFont("kromasky_16x16", 16, 1.5);
			this.font.set("left");
		},
		
		draw : function (context, x, y)
		{
			this.font.draw (context, "HISCORE", this.pos.x+x, this.pos.y+y);
			this.font.draw (context, me.gamestat.getItemValue("hiscore"), this.pos.x+x, this.pos.y+y+32);
		}
	});



	// a HUD Score Object
	var HUDLifebject = me.HUD_Item.extend(
	{	
		init:function(x, y, val)
		{
			this.parent(x, y, val);
			this.maxhp = val;
			
			// manage the alarm
			this.alarm = false;
		},
		
		// update the item value
		update : function(value) {
			this.set((this.value + value).clamp(0, this.maxhp));
			return true;
		},

		
		draw : function (context, x, y)
		{
			
			var hp = Math.round((this.value / this.maxhp ) * 300);
			// draw the progress bar
			context.strokeStyle = "rgba(255,255,255, 0.9)";
			context.strokeRect(this.pos.x+x, this.pos.y+y, 300, 20);
			if (hp>150) {
				// green
				context.fillStyle = "rgba(0,200,0, 0.9)";
				if (this.alarm)
				{
					me.audio.stop("alarm");
					this.alarm = false;
				}
			}
			else if (hp>75) {
				// orange
				context.fillStyle = "rgba(255,165,0, 0.9)";
				if (this.alarm)
				{
					me.audio.stop("alarm");
					this.alarm = false;
				}
			}
			else {
				// red
				context.fillStyle = "rgba(255,69,0, 0.9)";
				if (!this.alarm) 
				{
					me.audio.play("alarm", true);
					this.alarm = true;
				}
			}
			
			context.fillRect(this.pos.x+x+1, this.pos.y+y + 1, hp-1, 18);
		}
	});



