%all auxiliary predicates used in the game

%----------------------------

%predicate used to not end the player's turn
notChangePlayer(PN, PN).

%change the player's turn
changePlayer(PN, NPN) :-
	PN =:= 1 -> NPN is 2;
	PN =:= 2 -> NPN is 1.

%add an extra turn to a specific player
addMove(PN) :-
	(
		PN =:= 1 ->
		(
			retract(player1Moves(X)),
			Y is X + 1,
			assert(player1Moves(Y))
		);
		
		PN =:= 2 ->
		(
			retract(player2Moves(X)),
			Y is X + 1,
			assert(player2Moves(Y))
		)
	),
	!.
	
%decreases a turn to a specific player
decMove(PN) :-
	(
		PN =:= 1 ->
		(
			retract(player1Moves(X)),
			Y is X - 1,
			assert(player1Moves(Y))
		);
		
		PN =:= 2 ->
		(
			retract(player2Moves(X)),
			Y is X - 1,
			assert(player2Moves(Y))
		)
	),
	!.
	
%register the play of a wind piece
useWindPiece :-
	retract(numberOfWindPiecesDiscarded(X)),
	Y is X + 1,
	assert(numberOfWindPiecesDiscarded(Y)).

%adds a wind piece to a specific player's hand and decreases the number of the wind pieces discarded
addWindPieceToHand(N) :-
	N =:= 1 -> 
	(
		retract(numberOfWindPiecesDiscarded(X)),
		retract(player1HandPieces(HL)),
		M is X - 1,
		append(HL, [wind/piece], NH),
		assert(numberOfWindPiecesDiscarded(M)),
		assert(player1HandPieces(NH))
	);
		
	N =:= 2 ->
	(
		retract(numberOfWindPiecesDiscarded(X)),
		retract(player2HandPieces(HL)),
		M is X - 1,
		append(HL, [wind/piece], NH),
		assert(numberOfWindPiecesDiscarded(M)),
		assert(player2HandPieces(NH))
	).

%transfers a random piece from a specific player's pool of pieces to its hande
addPieceToHand(N) :-		
	N =:= 1 -> 
	(
		retract(player1HandPieces(HL)),
		retract(player1Pieces(AL)),
		addPieceToHand(HL, AL, NH, NA),
		assert(player1HandPieces(NH)),
		assert(player1Pieces(NA))
	);
		
	N =:= 2 ->
	(
		retract(player2HandPieces(HL)),
		retract(player2Pieces(AL)),
		addPieceToHand(HL, AL, NH, NA),
		assert(player2HandPieces(NH)),
		assert(player2Pieces(NA))
	).
		
addPieceToHand(L, [], L, []).
addPieceToHand(HL, AL, [N|HL], NA) :-
	random_member(N, AL),
	deleteFirst(N, AL, NA).
	
%initiates a player hand with 5 random pieces
fillPlayerHand(N) :-
	addPieceToHand(N),
	addPieceToHand(N),
	addPieceToHand(N),
	addPieceToHand(N),
	addPieceToHand(N).
	
%searches the n'th piece in a player's hand
pickPieceFromHand(N, INDEX, PIECE) :-
	(
		N =:= 1 -> 
		(
			player1HandPieces(L),
			nth1(INDEX, L, PIECE)
		);
			
		N =:= 2 ->
		(
			player2HandPieces(L),
			nth1(INDEX, L, PIECE)
		)
	),
	!.
	
%deletes a piece from a player's hand
deletePieceFromHand(N, INDEX) :-
	N =:= 1 -> 
	(
		retract(player1HandPieces(L)),
		nth1(INDEX, L, PIECE),
		deleteFirst(PIECE, L, FL),
		assert(player1HandPieces(FL))
	);
		
	N =:= 2 ->
	(
		retract(player2HandPieces(L)),
		nth1(INDEX, L, PIECE),
		deleteFirst(PIECE, L, FL),
		assert(player2HandPieces(FL))
	).
	
%checks if a specific player does not have extra turns to play
hasFinishedTurn(PN) :-
	(
		PN =:= 1 ->
		(
			player1Moves(X),
			X is 0
		);
		
		PN =:= 2 ->
		(
			player2Moves(X),
			X is 0
		)
	),
	!.
	
%----------------------------
%counts the number of sunTile positions in a list
countSunTilePositionsList([], _, N, N).
countSunTilePositionsList([H|T], BL, IN, N) :-
	(
		isSunTile(H, BL) ->
		(
			X is IN + 1
		);
		(
			X is IN
		)
	),
	countSunTilePositionsList(T, BL, X, N).

%create a list with all the number of sunTile positions by lines of a grid
countSunTilePositions([], [], _).
countSunTilePositions([H|T], FL, BL) :-
	(
		H == wind/piece ->
		(
			FL = [0|B],
			countSunTilePositions(T, B, BL)
		);
		(
			countSunTilePositionsList(H, BL, 0, N),
			FL = [N|B],
			countSunTilePositions(T, B, BL)
		)
	).

%searches for the first position in a list that is a sunTile position
findSunPositions([], _, INDEX) :- INDEX is 0.
findSunPositions([H|T], N, INDEX) :-
	M is N + 1,
	(
		H =:= 0 ->
		(
			findSunPositions(T, M, INDEX)
		);
		(
			INDEX is M
		)
	).
	
%searches for the first sunTile position a list of lists
findPositionInList([H|T], BL, N, INDEX) :-
	M is N + 1,
	(
		isSunTile(H, BL) ->
		(
			INDEX is M
		);
		(
			findPositionInList(T, BL, M, INDEX)
		)
	).
	
%----------------------------
%checks if the game is over
finished :- 
	(player1Pieces([]), player1HandPieces([]));
	(player2Pieces([]), player2HandPieces([])).
	
%----------------------------
%reasserts original vars
reloadData :-
	retract(player1Pieces(_)),
	retract(player2Pieces(_)),
	retract(player1HandPieces(_)),
	retract(player2HandPieces(_)),
	retract(player1HalfStones(_)),
	retract(player2HalfStones(_)),
	retract(player1SunStones(_)),
	retract(player2SunStones(_)),
	retract(player1Moves(_)),
	retract(player2Moves(_)),
	retract(numberOfWindPiecesDiscarded(_)),
	retract(stateOfTheGame(_, _)),
	assert(player1Pieces([])),
	assert(player2Pieces([])),
	assert(player1HandPieces([])),
	assert(player2HandPieces([])),
	assert(player1HalfStones(0)),
	assert(player2HalfStones(0)),
	assert(player1SunStones(0)),
	assert(player2SunStones(0)),
	assert(player1Moves(1)),
	assert(player2Moves(1)),
	assert(numberOfWindPiecesDiscarded(0)),
	assert(stateOfTheGame([	[free, free, free, free, sunTile, free, free, free, sunTile],
							[free, sunTile, free, free, free, free, free, sunTile, free],
							[free, free, sunTile, free, free, free, sunTile, free, free],
							[free, free, free, free, free, free, free, free, free],
							[sunTile, free, free, free, moonTile, free, free, free, sunTile],
							[free, free, free, free, free, free, free, free, free],
							[free, free, sunTile, free, free, free, sunTile, free, free],
							[free, sunTile, free, free, free, free, free, sunTile, free],
							[sunTile, free, free, free, sunTile, free, free, free, sunTile]], 1)).