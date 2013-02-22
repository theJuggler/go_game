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
var group_by_member={};
var liberty_by_member={}
var board_color = "#de6";
new_Game();

$('#a').click(function (e) {
    var x = roundMultiple(e.pageX - this.offsetLeft,piece_size);
    var y = roundMultiple(e.pageY - this.offsetTop,piece_size);
	var i = x/40 -1;
	var j = y/40 -1;
	if( x > 0 && y > 0 && y < 400 && x < 400 && board[j][i] === -1){
    	
    	make_move(j,i);
    	draw_piece(x,y,colors[turn%2],ps);
    }
});

function make_move(j,i){
	var its_go = find_group(j,i);
	if (its_go === 1){
		board[j][i] = (turn % 2);
		turn = turn +1 ;
	}
};
function find_group(j,i){
	var grouped = [];
	var liberty =[];
	var p = [[j-1,i],[j+1,i],[j,i-1],[j,i+1]];
	for(var k = 0 ; k < 4 ; k ++){
		var jk = p[k][0];
		var ik = p[k][1];
		if( jk >= 0 && ik >= 0 && jk <= size  && ik <= size ){
				
				if(board[jk][ik] === -1){
					liberty.push(p[k]);
				}else{
					liberty_by_member[p[k]] = remove( liberty_by_member[p[k]], [j,i] );
					if (board[jk][ik] === (turn%2)){ 
						grouped.push( p[k] );
					}
					else if (liberty_by_member[p[k]].length === 0){
						eliminate_group(pk[k]);
					}
				}

		}
	}
	// take liberty
	for(var k2 = 0; k2 < grouped.length;k2++){
		liberty = liberty.concat(liberty_by_member[grouped[k2]]);
	}
	liberty = arrayUnique(liberty);
	// adding back liberty
	//having no liberty is not allowed 
	if (liberty.length === 0){
		for(var k = 0 ; k < 4 ; k ++){
			var jk = p[k][0];
			var ik = p[k][1];
			if( jk >= 0 && ik >= 0 && jk <= size  && ik <= size ){
				liberty_by_member[p[k]].push( [j,i] ) ;
			}
		}
		return 0;
	}

	//join groups 
	var temp = [[j,i]];
	for(var k2 = 0; k2 < grouped.length;k2++){
		var temp2 = group_by_member[grouped[k2]];
		temp = temp.concat(temp2);

	}
	temp = arrayUnique(temp);
	group_by_member[[j,i]] = temp;
	liberty_by_member[[j,i]] = liberty;
	for(var k2 = 0; k2 < grouped.length;k2++){
		group_by_member[grouped[k2]] = temp;
		liberty_by_member[grouped[k2]] = liberty;
	}
	return 1;
};
function eliminate_group(index_g){
	var temp = group_by_member[index_g];
	for(var k3 = 0; k3 < temp.length;k3++){
		 eliminate_element(temp[k3]);
	}
};
function eliminate_element(index_e){
	delete group_by_member[index_e];
	delete liberty_by_member[index_e];
	var i =index_e[1];
	var j =index_e[0];
	var p = [[j-1,i],[j+1,i],[j,i-1],[j,i+1]];
	for(var k = 0 ; k < 4 ; k ++){
		var jk = p[k][0];
		var ik = p[k][1];
		if( jk >= 0 && ik >= 0 && jk <= size  && ik <= size ){
			if (board[jk][ik] === (turn+1)%2){
				liberty_by_member[p[k]].push( [j,i] );
			}
		}
	}
	erase_piece(i*40+40,j*40+40,board_color);
};
function remove(a,n){
	var array = a.concat();
    for(var j=0; j<array.length; ++j) {
        if(n[0] === array[j][0] && n[1] ===array[j][1]) {
        	array.splice(j--, 1);
        	break;
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
	draw_piece(context,x,y,board_color,ps+1);
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
