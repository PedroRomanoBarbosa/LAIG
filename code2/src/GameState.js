
function GameState(str) {

	this.board = [];
	this.playerTurn;

	this.player1NumOfMoves;
	this.player2NumOfMoves;

	this.player1Pieces = [];
	this.player1HandPieces = [];

	this.player1HalfStones;
	this.player1SunStones;

	this.player2Pieces = [];
	this.player2HandPieces = [];

	this.player2HalfStones;
	this.player2SunStones;

	this.numberOfWindPiecesDiscarded;

	if(this.parseString(str) == false){
		console.error("Server reply error - server reply did not have the correct format")
	}
};

GameState.prototype.parseString = function(str){

	var holder = "";

	var i = 0;
	if(str[i] != "|"){
		return false;
	}
	i++;

	// parse board
	for(var u = 0; u < 9; u++){
		var line = [];
		holder = "";
		while(str[i] != "|"){

			if(str[i] == ","){
				line.push(holder);
				holder = "";
			}else
				holder += str[i];

			i++;
		}

		line.push(holder);

		this.board.push(line);

		i++;
	}

	// parse players turn
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.playerTurn = parseInt(holder);
	i++;

	// parse number of turns of player 1
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.player1NumOfMoves = parseInt(holder);
	i++;

	// parse number of turns of player 2
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.player2NumOfMoves = parseInt(holder);
	i++;

	// parse player 1 pieces
	holder = "";
	while(str[i] != "|"){

		if(str[i] == ","){
			this.player1Pieces.push(holder);
			holder = "";
		}else
			holder += str[i];

		i++;
	}
	this.player1Pieces.push(holder);
	i++;

	// parse player 1 hand pieces
	holder = "";
	while(str[i] != "|"){

		if(str[i] == ","){
			this.player1HandPieces.push(holder);
			holder = "";
		}else
			holder += str[i];

		i++;
	}
	this.player1HandPieces.push(holder);
	i++;

	// parse player 1 halfstones
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.player1HalfStones = parseInt(holder);
	i++;

	// parse player 1 sunstones
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.player1SunStones = parseInt(holder);
	i++;

	// parse player 2 pieces
	holder = "";
	while(str[i] != "|"){

		if(str[i] == ","){
			this.player2Pieces.push(holder);
			holder = "";
		}else
			holder += str[i];

		i++;
	}
	this.player2Pieces.push(holder);
	i++;

	// parse player 2 hand pieces
	holder = "";
	while(str[i] != "|"){

		if(str[i] == ","){
			this.player2HandPieces.push(holder);
			holder = "";
		}else
			holder += str[i];

		i++;
	}
	this.player2HandPieces.push(holder);
	i++;

	// parse player 2 halfstones
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.player2HalfStones = parseInt(holder);
	i++;

	// parse player 2 sunstones
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.player2SunStones = parseInt(holder);
	i++;

	// parse wind pieces discarded
	holder = "";
	while(str[i] != "|"){
		holder += str[i];

		i++;
	}

	this.numberOfWindPiecesDiscarded = parseInt(holder);
};

GameState.prototype.getRequestString = function(mode, player, handPieceIndex, line, col, dir){

	var str = "[" + mode + "," + player + "," + handPieceIndex + "," + line + "/" + col + "," + dir + ",";

	//--------- board ------------------

	var holder = "[";
	var line = "";
	for(var i=0; i<this.board.length; i++){

		if(line == ""){
			holder += line;
		}else{
			holder += line + ",";	
		}

		line = "";

		line = "[";
		line += this.board[i];
		line += "]";
	}

	holder += line + "]";
	str += holder + ",";

	//--------- player turn ------------------

	str += this.playerTurn + ",";

	//--------- player moves ------------------

	str += this.player1NumOfMoves + ",";
	str += this.player2NumOfMoves + ",";

	//--------- player 1 pieces ---------------

	str += "[";
	var holder = "";
	for(var i=0; i<this.player1Pieces.length; i++){

		if(holder != ""){
			str += ",";
		}

		holder = this.player1Pieces[i];
		str += holder;
	}
	str += "],";

	//--------- player 1 hand pieces ---------------

	str += "[";
	var holder = "";
	for(var i=0; i<this.player1HandPieces.length; i++){

		if(holder != ""){
			str += ",";
		}

		holder = this.player1HandPieces[i];
		str += holder;
	}
	str += "],";

	//--------- player 1 stones ---------------

	str += this.player1HalfStones + "," + this.player1SunStones + ",";

	//--------- player 2 pieces ---------------

	str += "[";
	var holder = "";
	for(var i=0; i<this.player2Pieces.length; i++){

		if(holder != ""){
			str += ",";
		}

		holder = this.player2Pieces[i];
		str += holder;
	}
	str += "],";

	//--------- player 2 hand pieces ---------------

	str += "[";
	var holder = "";
	for(var i=0; i<this.player2HandPieces.length; i++){

		if(holder != ""){
			str += ",";
		}

		holder = this.player2HandPieces[i];
		str += holder;
	}
	str += "],";

	//--------- player 2 stones ---------------

	str += this.player2HalfStones + "," + this.player2SunStones + ",";

	//-------- number of winds discarded -------

	str += this.numberOfWindPiecesDiscarded;

	str += "]";

	return str;
};