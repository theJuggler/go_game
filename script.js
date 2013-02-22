// Set up!
var a_canvas = document.getElementById("a");
var context = a_canvas.getContext("2d");

// Draw the face
var size = 8;
var piece_size = 40;
var turn = 0
var colors = ["black", "white"]
ps = 15;

draw_board(size,piece_size ,40,"#fff");

$('#a').click(function (e) {
    var x = e.pageX - this.offsetLeft;
    var y = e.pageY - this.offsetTop;
	x = roundMultiple(x,piece_size);
	y = roundMultiple(y,piece_size);
	if( x > 0 && y > 0){

    	draw_piece(x,y,colors[turn],ps);
    	turn = (turn +1 )% 2;
    }
});

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
	draw_piece(context,x,y,board_color)
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

	/* vertical lines */
	for (var x = 0; x <= size; x += 1) {
		context.moveTo( x*piece_size+start, start);
		context.lineTo(x*piece_size+start, total_size+start);
	}
	/* horizontal lines */
	for (var y = 0; y <= size; y += 1) {
	   context.moveTo(start,  y*piece_size+start);
	   context.lineTo(total_size+start,  y*piece_size+start);
	}

	/* draw it! */
	context.strokeStyle = "#111";
	context.stroke();

};
