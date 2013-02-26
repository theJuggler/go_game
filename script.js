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
    		game0.playing =false;
    		if(game0.ai){
    			//var ji2 = al.next_move();
    			var ji2 = al.mct(); 
    			if (ji2 === -1 || game0.make_move(ji2[0],ji2[1]) !== 1){
    				game0.pass();
    			}else{
    				game_v.draw_piece( (ji2[1]+1)*40, (ji2[0]+1)*40, game0.colors[game0.turn%2]);
    			}
    			game0.turn +=1;
    			game0.playing = true;
    		}
   		 }
    }else if( x_raw > 0 && y_raw > game_v.game_size && y_raw < game_v.game_size+28 && x < game_v.game_size ){
    	
    	if (x_raw < 120){
    		game0.new_Game();

   		 }else if (x_raw < 170){
   		 	//pass
   		 	game0.turn +=1;
   		 	game0.pass();

   		 }else if (x_raw < 7*game_v.piece_size){
   		 	game0.stones= (game0.stones+1)%10;
   		 	game_v.redraw_stones(game0.stones);
   		 	if (game0.turn === 0 || game0.turn === 1)
   		 		game0.new_Game();
   		 }
    }
});

function Player(){
	this.next_move= function(){
		var move_list = this.valid_moves(game0.board);
		if (move_list.length > 0){
			var index = Math.floor((Math.random()*(move_list.length) ));
			return move_list[index];
		}
		return -1;
	};

	this.mct= function(){
	
		var breath =1;
		//some configuration of these 2 should make for
		// the right balance of speed and a reasonable move
		var depth =20; 
		var sims= 30;

		var moves =[];
		var move_list = this.valid_moves(game0.board);
		var player = game0.turn%2;
		var next_player = (player+1)%2;
		var best_move =0;
		var best = $.extend(true, [], game0.score);
		while ( moves.length !== move_list.length){
			var index = Math.floor((Math.random()*(move_list.length) ));
			if( moves.indexOf(index) === -1){
				moves.push(index);
				var ji = move_list[index];
				var board_n = $.extend(true, [], game0.board);
				board_n[ji[0]][ji[1]] =player;
				var result = this.simulate_move(ji[0],ji[1],player,board_n,true,$.extend(true, [], game0.score));
				if( result !== -1){ //if not suicide
					var average=[0,0]
					for(var num = 0; num < sims ; num ++){
						var result2 = this.mct_child(result[0],result[1],next_player,depth-1,breath,r(move_list,index));
						average[0] += result2[0];
						average[1] += result2[1];
					}
					average[0] = average[0]/sims;
					average[1] = average[1]/sims;

					if (average[player] > best[player]){
						best = $.extend(true, [], average);
						best_move = $.extend(true, [], ji);
					}
				}
			}
		}
		

		if (best_move === 0) return  -1;
		return best_move;
	};

	this.valid_moves =function(aboard){
		var move_list=[];
		for(var j0 = 0 ; j0 < aboard.length ; j0 ++){
			for(var i0 = 0 ; i0 < aboard.length ; i0 ++){
				if(aboard[j0][i0] === -1){
					move_list.push([j0,i0]);
				}
			}
		}
		return move_list;
	};
	this.truer_score = function(score,aboard){
		var n = 99;
		while(true){
			var n2 = 0;
			for (var i = 0;i < 9;i++){
			    for (var j = 0;j < 9;j++){
			    	if( aboard[i][j] === -1){
			    		var neighbors = [0,0];
			    		if( i > 0){
			    			if( aboard[i-1][j] !== -1)
			    				neighbors[ aboard[i-1][j] ] +=1;
			    		}
			    		if( i < 8){
			    			if( aboard[i+1][j] !== -1)
			    				neighbors[ aboard[i+1][j] ] +=1;
			    		}
			    		if( j > 0){
			    			if( aboard[i][j-1] !== -1)
			    				neighbors[ aboard[i][j-1] ] +=1;
			    		}
			    		if( j < 8){
			    			if( aboard[i][j+1] !== -1)
			    				neighbors[ aboard[i][j+1] ] +=1;
			    		}

			    		if(neighbors[0] > neighbors[1]){
			    			aboard[i][j] = 0;
			    		}else if(neighbors[0] < neighbors[1]){
			    			aboard[i][j] = 1;
			    		}else{
			    			n2 += 1;
			    		}
			    	}
			    }
			 }
			 if (n2 === n)
			 	break;
			 n =n2;
		}
		for(var j0 = 0 ; j0 < aboard.length ; j0 ++){
			for(var i0 = 0 ; i0 < aboard.length ; i0 ++){
				if(aboard[j0][i0] !== -1){
					score[aboard[j0][i0]] +=1;
				}
			}
		}
		return score;
	};

	r=function(cc,i){
		return cc.slice(0,i).concat(cc.slice(i+1,cc.length))
	}
	// returns score
	this.mct_child = function(aboard,score,player,depth,breath,move_list){
		//console.log(move_list.join("]["));
		if( depth === 0 || move_list.length === 0){
			return this.truer_score(score,aboard) ;
		}
		var moves =[];
		var next_player = (player+1)%2;
		var best_move =0;
		var best_score =score;
		while (moves.length < breath && moves.length !== move_list.length){
			var index = Math.floor((Math.random()*(move_list.length) ));
			if( moves.indexOf(index) === -1){
				moves.push(index);

				var ji = move_list[index];
				var board_n = $.extend(true, [], aboard);
				board_n[ji[0]][ji[1]] =player;
				var result = this.simulate_move(ji[0],ji[1],player,board_n,true,$.extend(true,[], score));
				if( result !== -1){ //if not suicide
					result = this.mct_child(result[0],result[1],next_player,depth-1,breath,r(move_list,index))
					if (result[player] > best_score[player]){
						best_score = result;
						best_move = ji;	
					}
				}

			}
		}
		return best_score;
	};

	// returns aboard and score if move is not suicide else -1
	this.simulate_move = function(j0, i0, player, aboard, check_capture, score){ 
		function neighbors(j,i){
			var n = [];
			if(j > 0){
				n.push([j-1,i]);
			}
			if( i > 0 ){
				n.push([j,i-1]);
			}
			if( j < 8){
				n.push([j+1,i]);
			}
			if (i < 8){
				n.push([j,i+1]);
			}
			return n;
		};
		var group = [[j0,i0]];
		var group_check ={};
		group_check[[j0,i0]] = 0;
		var liberty =[];
		var capture=[];

		for(var k0 = 0; k0 < group.length; k0 +=1){
			var p = neighbors(group[k0][0], group[k0][1]);

			for(var k = 0 ; k < p.length ; k ++){

				var jk = p[k][0];
				var ik = p[k][1];

				if(aboard[jk][ik] === -1){
					liberty.push(p[k]);
				}
				else if (aboard[jk][ik] === player){ 
					if (group_check[p[k]] !== 0){
						group.push( p[k] );
						group_check[p[k]]  = 0;
					}
				}
				else if (k0 === 0 && check_capture === true){ 
				//only need to check for captures around new point
					capture.push( p[k] );
				}
			}
		}
		var other_player = (player+1)%2;
		if ( check_capture === true){
			var capture_count =0;
			for(var k2 =0; k2 < capture.length; k2++){
				var result =this.simulate_move(capture[k2][0],capture[k2][1],other_player,aboard,false,score);
				if (result[0] === -1){
					capture_count += 1;
					aboard = result[1];
					score = result[2];
				}
			}
			if( capture_count > 0 || liberty.length > 0){
				return [aboard,score];
			}else {
				return -1;
			}
		}else{
			if( liberty.length === 0){
				for (var n = 0; n < group.length; n++){
					aboard[group[n][0] ] [group[n][1]] == -1;
					score[other_player] += 1;
				}
				return [-1,aboard,score];
			}else{
				return[aboard,score];
			}
		}

	}
};

function Game_Logic(){
	this.colors = ["black", "white"];
	this.size = 8;
	this.stones = 0;
	this.new_Game =function (){
		this.ai=true;
		this.playing = true;
		this.turn =0;
		this.new_board();
		this.score = [0,0];
		game_v.draw_board(this.stones);
		this.pass_count = 0;
		var sl =[[2,2],[2,6],[6,2],[6,6],[2,4],[4,2],[6,4],[4,6],[4,4]]; //stonelocations
		if (this.stones > 0 ){
			for(var n =0 ; n < this.stones ; n++){

				game_v.draw_piece( (sl[n][1]+1)*40, (sl[n][0]+1)*40, this.colors[0]);
				this.board[ sl[n][0] ][ sl[n][1] ]=0;
			}
			this.turn =1;
		}
	};
	this.pass =function(){
		this.pass_count += 1;
		if (this.ai || this.pass_count === 2){
			this.game_over();
		}
	};
	this.game_over =function(){
		this.playing = false;
		this.fill_territory();
		for(var j0 = 0 ; j0 < this.board.length ; j0 ++){
			for(var i0 = 0 ; i0 < this.board.length ; i0 ++){
				if(this.board[j0][i0] !== -1){
					this.score[this.board[j0][i0]] +=1;
				}
			}
		}
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
		
	};
	// expands groups as estimate of territy
	// does not calclate if a group is dead
	this.fill_territory = function (){
		var n = 99;
		while(true){
			var n2 = 0;
			for (var i = 0;i < 9;i++){
			    for (var j = 0;j < 9;j++){
			    	if( this.board[i][j] === -1){
			    		var neighbors = [0,0];
			    		if( i > 0){
			    			if( this.board[i-1][j] !== -1)
			    				neighbors[ this.board[i-1][j] ] +=1;
			    		}
			    		if( i < 8){
			    			if( this.board[i+1][j] !== -1)
			    				neighbors[ this.board[i+1][j] ] +=1;
			    		}
			    		if( j > 0){
			    			if( this.board[i][j-1] !== -1)
			    				neighbors[ this.board[i][j-1] ] +=1;
			    		}
			    		if( j < 8){
			    			if( this.board[i][j+1] !== -1)
			    				neighbors[ this.board[i][j+1] ] +=1;
			    		}

			    		if(neighbors[0] > neighbors[1]){
			    			this.board[i][j] = 0;
			    			game_v.draw_piece( (j+1)*40, (i+1)*40, this.colors[0]);
			    		}else if(neighbors[0] < neighbors[1]){
			    			this.board[i][j] = 1;
			    			game_v.draw_piece( (j+1)*40, (i+1)*40, this.colors[1]);
			    		}else{
			    			n2 += 1;
			    		}
			    	}
			    }
			 }
			 if (n2 === n)
			 	break;
			 n =n2;
		}

	};
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
			this.pass_count = 0; 
			return 1;
		}
	};
	this.find_group = function(j,i,player,check_capture){
		function neighbors(j,i){
			var n = [];
			if(j > 0){
				n.push([j-1,i]);
			}
			if( i > 0 ){
				n.push([j,i-1]);
			}
			if( j < 8){
				n.push([j+1,i]);
			}
			if (i < 8){
				n.push([j,i+1]);
			}
			return n;
		};
		var group = [[j,i]];
		var group_check ={};
		group_check[[j,i]] = 0;
		var liberty =[];
		var capture=[];
		for(var k0 = 0; k0 < group.length; k0 +=1){
			var p = neighbors(group[k0][0],group[k0][1]);

			for(var k = 0 ; k < p.length ; k ++){
				var jk = p[k][0];
				var ik = p[k][1];
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

function roundMultiple(num, multiple) {return(Math.round(num / multiple) * multiple);};


function Game_Visuals(){
	this.size = 8;
	this.piece_size = 40;
	this.ps = 15;
	this.board_color = "#de6";
	this.start = this.piece_size;
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
		context.moveTo( max(this.start,x-this.ps-3), y);
		context.lineTo( min(this.grid_size+this.start,x+this.ps+3), y);
		context.moveTo( x, min( this.grid_size+this.start,y+this.ps+3) );
		context.lineTo( x, max(this.start,y-this.ps-3) );
		context.closePath();
		context.strokeStyle = "black";
		context.stroke();
	};
	this.win_message = function(message){
		context.font = "21px Garamond";
		context.fillStyle = 'black';
		context.fillText(message,280+this.ps,this.game_size +this.piece_size/2);
	};
	this.redraw_stones=function(n){
		context.beginPath();
		context.rect(172,this.game_size+2,7*this.piece_size - 175 ,25);
		context.fillStyle = this.board_color;
		context.fill();
		context.closePath();
		context.font = "21px Garamond";
		context.fillStyle = 'black';
		context.fillText(n.toString() +" Stones",185,this.game_size +this.piece_size/2);
	}
	this.draw_board = function(n){
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
		context.moveTo(7*this.piece_size, this.game_size);
		context.lineTo(7*this.piece_size, this.game_size+28);
		context.fillText(n.toString() +" Stones",185,this.game_size +this.piece_size/2);

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

function max(x,y){return (x>y)?x:y;}
function min(x,y){return (x<y)?x:y;}