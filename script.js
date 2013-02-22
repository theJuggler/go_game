// Set up!
var a_canvas = document.getElementById("a");
var context = a_canvas.getContext("2d");

// Draw the face
var size = 8;
var piece_size = 40;
var turn = 0;
var colors = ["black", "white"];
var board;
var ps = 15;
var board_color = "#de6";
var score = [0,0];
new_Game();

$('#a').click(function (e) {
    var x = roundMultiple(e.pageX - this.offsetLeft,piece_size);
    var y = roundMultiple(e.pageY - this.offsetTop,piece_size);
	var i = x/40 -1;
	var j = y/40 -1;
	if( x > 0 && y > 0 && y < 400 && x < 400 && board[j][i] === -1){
    	
    	if (make_move(j,i) ===1){
    		draw_piece(x,y,colors[turn%2],ps);
    		turn = turn +1 ;
   		 }
    }
});

function make_move(j,i){
	board[j][i] = (turn % 2);
	var its_go = find_group(j,i,(turn % 2),true);
	if (its_go === 0){
		board[j][i] = -1;
		return 0;
	}else{
		return 1;
	}
};
function find_group(j,i,player,check_capture){
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
			if( jk >= 0 && ik >= 0 && jk <= size  && ik <= size ){
				if(board[jk][ik] === -1){
					liberty.push(p[k]);
				}
				else if (board[jk][ik] === player){ 
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
			if (find_group(capture[k2][0],capture[k2][1],(player+1)%2,false) === 0){
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
			eliminate_group(group);
			return 0;
		}else{
			return group;
		}
	}

};
function eliminate_group(group){
	for(var k3 = 0; k3 < group.length;k3++){
		board[group[k3][0]][group[k3][1]] = -1;
		erase_piece(group[k3][1]*40+40,group[k3][0]*40+40,board_color);
	}
};

function remove(a,n){
	var array = a.concat();
    for(var j=0; j<array.length; ++j) {
        if(n[0] === array[j][0] && n[1] ===array[j][1]) {
        	array.splice(j--, 1);
        }
    }
    return array;
};
function arrayUnique(array) {
    var a = array.concat();
    for(var i=0; i<a.length; ++i) {
        for(var j=i+1; j<a.length; ++j) {
            if(a[i][0] === a[j][0] && a[i][1] === a[j][1] )
                a.splice(j--, 1);
        }
    }
    return a;
};


function new_Game(){
	turn =0;
	new_board();
	draw_board(size,piece_size ,40,"#de6");
};
// sets up the board data structure
function new_board(){
	board = [];
	for (var i = 0;i < 9;i++){
		board[i] =[];
	    for (var j = 0;j < 9;j++){
	    	board[i][j] = -1;
	    }
	 }
}

function roundMultiple(num, multiple) {
	return(Math.round(num / multiple) * multiple);
};

function draw_piece(x,y,color,ps){
	context.fillStyle = color;
	context.beginPath();
	context.arc(x, y, ps, 0, 2*Math.PI);
	context.closePath();
	context.strokeStyle = "#000";
	context.stroke();
	context.fill();
};

function erase_piece(x,y,board_color){
	context.fillStyle = board_color;
	context.beginPath();
	context.arc(x, y, ps+1, 0, 2*Math.PI);
	context.closePath();
	context.strokeStyle = board_color;
	context.stroke();
	context.fill();

	context.beginPath();
	context.moveTo( x+ps+3, y);
	context.lineTo( x-ps-3, y);
	context.moveTo( x, y+ps+3);
	context.lineTo( x, y-ps-3);
	context.closePath();
	context.strokeStyle = "#111";
	context.stroke();
};

function draw_board( size, piece_size, start, board_color){
	var total_size = piece_size * size;
	context.fillStyle = board_color;
	context.beginPath();
	context.moveTo( 0, 0);
	context.lineTo(total_size+start*2, 0);
	context.lineTo(total_size+start*2,  total_size+start*2);
	context.lineTo(0,  total_size+start*2);
	context.lineTo(0,  0);
	context.closePath();
	context.fill();
	context.beginPath();
	context.moveTo(0, total_size+start*2);
	context.lineTo(0,total_size+start*2+piece_size);
	context.lineTo(total_size+start*2,total_size+start*2+piece_size);
	context.lineTo(total_size+start*2,total_size+start*2);
	context.closePath();
	context.fill();

	
	for (var xy = 0; xy <= size; xy += 1) {
		/* vertical lines */
		context.moveTo( xy*piece_size+start, start);
		context.lineTo(xy*piece_size+start, total_size+start);
		/* horizontal lines */
		context.moveTo(start,  xy*piece_size+start);
		context.lineTo(total_size+start,  xy*piece_size+start);
	}
	
	for (var y = 0; y <= size; y += 1) {

	}

	/* draw it! */
	context.strokeStyle = "#111";
	context.stroke();

};
