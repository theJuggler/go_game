var a_canvas = document.getElementById("a");
var context = a_canvas.getContext("2d");

var game_v = new Game_Visuals();
var game0 = new Game_Logic();
var al = new Player();
game0.new_Game();


$('#a').click(function (e) {
    var x_raw = e.pageX - this.offsetLeft;
    var x = roundMultiple(x_raw,game_v.piece_size);
    var y_raw = e.pageY - this.offsetTop;
    var y = roundMultiple(y_raw	,game_v.piece_size);
	var i = x/40 -1;
	var j = y/40 -1;
	if( x > 0 && y > 0 && y < game_v.game_size && x < game_v.game_size && game0.board[j][i] === -1 &&game0.playing){
    	
    	if (game0.make_move(j,i) ===1){
    		game_v.draw_piece(x,y,game0.colors[game0.turn%2]);
    		game0.turn += 1 ;
    		if(game0.ai){
    			var ji2 = al.next_move();
    			while( game0.make_move(ji2[0],ji2[1]) !== 1){
    				ji2 = al.next_move();
    			} 
    			game_v.draw_piece( (ji2[1]+1)*40, (ji2[0]+1)*40, game0.colors[game0.turn%2]);
    			game0.turn += 1 ;
    		}
   		 }
    }else if( x_raw > 0 && y_raw > game_v.game_size && y_raw < game_v.game_size+28 && x < game_v.game_size ){
    	
    	if (x_raw < 120){
    		game0.new_Game();

   		 }else if (x_raw < 170){
   		 	//pass
   		 	game0.turn +=1;
   		 	game0.pass();

   		 }
    }
});

function Player(){
	this.next_move= function(){
		var jp = 2;
		var ip = 2;
		while (game0.board[jp][ip] !== -1){
			jp = Math.floor((Math.random()*(game0.size+1) ));
			ip = Math.floor((Math.random()*(game0.size+1) ));
		}
		return [jp,ip];
	};
};

function Game_Logic(){
	this.colors = ["black", "white"];
	this.size = 8;
	this.new_Game =function (){
		this.ai=true;
		this.playing = true;
		this.turn =0;
		this.new_board();
		this.score = [0,0];
		game_v.draw_board();
		this.pass_count = 0;
	};
	this.pass =function(){
		this.pass_count += 1;
		if(this.ai){
			this.pass_count +=1;
		}
		if (this.pass_count === 2){
			this.game_over()
		}
	}
	this.game_over =function(){
		this.playing = false;
		//var i = influence(); // score is based on area controled
		var score_b=this.score[0];//+i[0];
		var score_w=this.score[1];//+i[1];
		if (score_b > score_w){
			game_v.win_message("Black Wins");
		}else if (score_b < score_w){
			game_v.win_message("White Wins");
		}else{
			game_v.win_message("Tie");
		}
		
	}
	// sets up the board data structure
	this.new_board = function (){
		this.board = [];
		for (var i = 0;i < 9;i++){
			this.board[i] =[];
		    for (var j = 0;j < 9;j++){
		    	this.board[i][j] = -1;
		    }
		 }
	}
	this.make_move = function (j,i){
		this.board[j][i] = (this.turn % 2);
		var its_go = this.find_group(j,i,(this.turn % 2),true);
		if (its_go === 0){
			this.board[j][i] = -1;
			return 0;
		}else{
			return 1;
		}
	};
	this.find_group = function(j,i,player,check_capture){
		var group = [[j,i]];
		var group_check ={};
		group_check[[j,i]] = 0;
		var liberty =[];
		var capture=[];
		for(var k0 = 0; k0 < group.length; k0 +=1){
			var j0 = group[k0][0];
			var i0 = group[k0][1];
			var p = [[j0-1,i0],[j0+1,i0],[j0,i0-1],[j0,i0+1]];

			for(var k = 0 ; k < 4 ; k ++){
				var jk = p[k][0];
				var ik = p[k][1];
				if( jk >= 0 && ik >= 0 && jk <= this.size  && ik <= this.size ){
					if(this.board[jk][ik] === -1){
						liberty.push(p[k]);
					}
					else if (this.board[jk][ik] === player){ 
						if (group_check[p[k]] !== 0){
							group.push( p[k] );
							group_check[p[k]]  = 0;
						}
					}
					else if (k0 === 0 ){ //only need to check for captures around new point
						capture.push( p[k] );
					}

				}
			}
		}
		if ( check_capture === true){
			var capture_count =0;
			for(var k2 =0; k2 < capture.length; k2++){
				if (this.find_group(capture[k2][0],capture[k2][1],(player+1)%2,false) === 0){
					capture_count += 1;
				}
			}
			if( capture_count > 0){
				return group;
			}else if ( liberty.length === 0 ){
				return 0;
			}else{
				return group;
			}
		}else{
			if( liberty.length === 0){
				this.eliminate_group(group);
				return 0;
			}else{
				return group;
			}
		}

	};
	this.eliminate_group = function(group){
		for(var k3 = 0; k3 < group.length;k3++){
			this.board[group[k3][0]][group[k3][1]] = -1;
			game_v.erase_piece(group[k3][1]*40+40,group[k3][0]*40+40);
			this.score[this.turn%2] += 1;
		}
	};

};

function roundMultiple(num, multiple) {
	return(Math.round(num / multiple) * multiple);
};


function Game_Visuals(){
	this.size = 8;
	this.piece_size = 40;
	this.ps = 15;
	this.board_color = "#de6";
	this.start = 40;
	this.grid_size = this.piece_size * this.size;
	this.game_size = this.grid_size+ this.start*2;


	this.draw_piece = function(x,y,color){
		context.fillStyle = color;
		context.beginPath();
		context.arc(x, y, this.ps, 0, 2*Math.PI);
		context.closePath();
		context.strokeStyle = "#000";
		context.stroke();
		context.fill();
	};

	this.erase_piece = function (x,y){
		context.fillStyle = this.board_color;
		context.beginPath();
		context.arc(x, y, this.ps+1, 0, 2*Math.PI);
		context.closePath();
		context.strokeStyle = this.board_color;
		context.stroke();
		context.fill();

		context.beginPath();
		context.moveTo( x+this.ps+3, y);
		context.lineTo( x-this.ps-3, y);
		context.moveTo( x, y+this.ps+3);
		context.lineTo( x, y-this.ps-3);
		context.closePath();
		context.strokeStyle = "black";
		context.stroke();
	};
	this.win_message = function(message){
		context.font = "21px Garamond";
		context.fillStyle = 'black';
		context.fillText(message,170+this.ps,this.game_size +this.piece_size/2);
	};
	this.draw_board = function(){
		context.fillStyle = this.board_color;
		context.beginPath();
		context.moveTo( 0, 0);
		context.lineTo(this.game_size, 0);
		context.lineTo(this.game_size,  this.game_size);
		context.lineTo(0,  this.game_size);
		context.lineTo(0,  0);
		context.closePath();
		context.fill();

		context.beginPath();
		context.moveTo(0, this.game_size);
		context.lineTo(0,this.game_size+28);
		context.lineTo(this.game_size,this.game_size+28);
		context.lineTo(this.game_size,this.game_size);
		context.closePath();
		context.fill();
		context.font = "21px Garamond";
		context.fillStyle = 'black';
		context.fillText("New Game    Pass",this.ps,this.game_size +this.piece_size/2);
		context.moveTo(120,this.game_size);
		context.lineTo(120,this.game_size+28);
		context.moveTo(170,this.game_size);
		context.lineTo(170,this.game_size+28);

		
		for (var xy = 0; xy <= this.size; xy += 1) {
			/* vertical lines */
			context.moveTo( xy*this.piece_size+this.start, this.start);
			context.lineTo(xy*this.piece_size+this.start, this.grid_size+this.start);
			/* horizontal lines */
			context.moveTo(this.start,  xy*this.piece_size+this.start);
			context.lineTo(this.grid_size+this.start,  xy*this.piece_size+this.start);
		}

		context.strokeStyle = "black";
		context.stroke();
	};

};

