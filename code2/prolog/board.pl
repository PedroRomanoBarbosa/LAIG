%all predicates used to alter the board of the game

%----------------------------
%declaration of a dynamic game board
:- dynamic stateOfTheGame/2.

%----------------------------
%board of the game

%stateOfTheGame(board of the game - list, player to make a move - int)				
stateOfTheGame([[sunTile, free, free, free, sunTile, free, free, free, sunTile],
				[free, sunTile, free, free, free, free, free, sunTile, free],
				[free, free, sunTile, free, free, free, sunTile, free, free],
				[free, free, free, free, free, free, free, free, free],
				[sunTile, free, free, free, moonTile, free, free, free, sunTile],
				[free, free, free, free, free, free, free, free, free],
				[free, free, sunTile, free, free, free, sunTile, free, free],
				[free, sunTile, free, free, free, free, free, sunTile, free],
				[sunTile, free, free, free, sunTile, free, free, free, sunTile]], 1).
				
initialBoard([[sunTile, free, free, free, sunTile, free, free, free, sunTile],
			  [free, sunTile, free, free, free, free, free, sunTile, free],
			  [free, free, sunTile, free, free, free, sunTile, free, free],
			  [free, free, free, free, free, free, free, free, free],
			  [sunTile, free, free, free, free, free, free, free, sunTile],
			  [free, free, free, free, free, free, free, free, free],
			  [free, free, sunTile, free, free, free, sunTile, free, free],
			  [free, sunTile, free, free, free, free, free, sunTile, free],
			  [sunTile, free, free, free, sunTile, free, free, free, sunTile]]).
			  
%----------------------------
%adds a stone to a payer in case the player activated a special position in the game boar ( sunTile position )
tileToSunStone(L/C, BL, PN) :-
	PN =:= 1 ->
	(
		isSunTile(L/C, BL) ->
		(
			retract(player1SunStones(N)),
			M is N + 1,
			assert(player1SunStones(M))
		);
		(
			true
		)
	);
	
	PN =:= 2 ->
	(
		isSunTile(L/C, BL) ->
		(
			retract(player2SunStones(N)),
			M is N + 1,
			assert(player2SunStones(M))
		);
		(
			true
		)
	).
	
%----------------------------
%checks if a position is adjacent to another piece	
hasAdjacentPieceUp(L/C, BL) :-
	M is L - 1,
	hasPiece(M/C, BL).
	
hasAdjacentPieceDown(L/C, BL) :-
	M is L + 1,
	hasPiece(M/C, BL).
	
hasAdjacentPieceLeft(L/C, BL) :-
	M is C - 1,
	hasPiece(L/M, BL).
	
hasAdjacentPieceRight(L/C, BL) :-
	M is C + 1,
	hasPiece(L/M, BL).
	
hasAdjacentPiece(L/C, BL) :-
	L =:= 1 ->
	(
		C =:= 1 ->
		(
			hasAdjacentPieceDown(L/C, BL);
			hasAdjacentPieceRight(L/C, BL)
		);
		
		C =:= 9 ->
		(
			hasAdjacentPieceLeft(L/C, BL);
			hasAdjacentPieceDown(L/C, BL)
		);
		(
			hasAdjacentPieceLeft(L/C, BL);
			hasAdjacentPieceDown(L/C, BL);
			hasAdjacentPieceRight(L/C, BL)
		)
	);
		
	L =:= 9 ->
	(
		C =:= 1 ->
		(
			hasAdjacentPieceUp(L/C, BL);
			hasAdjacentPieceRight(L/C, BL)
		);
		
		C =:= 9 ->
		(
			hasAdjacentPieceLeft(L/C, BL);
			hasAdjacentPieceUp(L/C, BL)
		);
		(
			hasAdjacentPieceLeft(L/C, BL);
			hasAdjacentPieceUp(L/C, BL);
			hasAdjacentPieceRight(L/C, BL)
		)
	);
		
	C =:= 1 ->
	(
		hasAdjacentPieceUp(L/C, BL);
		hasAdjacentPieceRight(L/C, BL);
		hasAdjacentPieceDown(L/C, BL)
	);
		
	C =:= 9 ->
	(
		hasAdjacentPieceDown(L/C, BL);
		hasAdjacentPieceLeft(L/C, BL);
		hasAdjacentPieceUp(L/C, BL)
	);
	(
		hasAdjacentPieceUp(L/C, BL);
		hasAdjacentPieceRight(L/C, BL);
		hasAdjacentPieceDown(L/C, BL);
		hasAdjacentPieceLeft(L/C, BL)
	).
	
%counts the number of adjacent pieces a specific position have
numberOfAdjacentPiecesUp(L/C, BL, N, X) :-
	hasAdjacentPieceUp(L/C, BL) -> X is ( N + 1 );
	X is N.
	
numberOfAdjacentPiecesDown(L/C, BL, N, X) :-
	hasAdjacentPieceDown(L/C, BL) -> X is ( N + 1 );
	X is N.
	
numberOfAdjacentPiecesRight(L/C, BL, N, X) :-
	hasAdjacentPieceRight(L/C, BL) -> X is ( N + 1 );
	X is N.
	
numberOfAdjacentPiecesLeft(L/C, BL, N, X) :-
	hasAdjacentPieceLeft(L/C, BL) -> X is ( N + 1 );
	X is N.

numberOfAdjacentPieces(L/C, BL, N) :-
	(
		L =:= 1 ->
		(
			C =:= 1 ->
			(
				numberOfAdjacentPiecesDown(L/C, BL, 0, Y),
				numberOfAdjacentPiecesRight(L/C, BL, Y, R),
				N = R
			);
			
			C =:= 9 ->
			(
				numberOfAdjacentPiecesLeft(L/C, BL, 0, X),
				numberOfAdjacentPiecesDown(L/C, BL, X, R),
				N = R
			);
			(
				numberOfAdjacentPiecesLeft(L/C, BL, 0, X),
				numberOfAdjacentPiecesDown(L/C, BL, X, Y),
				numberOfAdjacentPiecesRight(L/C, BL, Y, R),
				N = R
			)
		);
			
		L =:= 9 ->
		(
			C =:= 1 ->
			(
				numberOfAdjacentPiecesUp(L/C, BL, 0, Y),
				numberOfAdjacentPiecesRight(L/C, BL, Y, R),
				N = R
			);
			
			C =:= 9 ->
			(
				numberOfAdjacentPiecesLeft(L/C, BL, 0, X),
				numberOfAdjacentPiecesUp(L/C, BL, X, R),
				N = R
			);
			(
				numberOfAdjacentPiecesLeft(L/C, BL, 0, X),
				numberOfAdjacentPiecesUp(L/C, BL, X, Y),
				numberOfAdjacentPiecesRight(L/C, BL, Y, R),
				N = R
			)
		);
			
		C =:= 1 ->
		(
			numberOfAdjacentPiecesUp(L/C, BL, 0, X),
			numberOfAdjacentPiecesRight(L/C, BL, X, Y),
			numberOfAdjacentPiecesDown(L/C, BL, Y, R),
			N = R
		);
			
		C =:= 9 ->
		(
			numberOfAdjacentPiecesDown(L/C, BL, 0, X),
			numberOfAdjacentPiecesLeft(L/C, BL, X, Y),
			numberOfAdjacentPiecesUp(L/C, BL, Y, R),
			N = R
		);
		(
			numberOfAdjacentPiecesUp(L/C, BL, 0, X),
			numberOfAdjacentPiecesRight(L/C, BL, X, Y),
			numberOfAdjacentPiecesDown(L/C, BL, Y, W),
			numberOfAdjacentPiecesLeft(L/C, BL, W, R),
			N = R
		)
	).
	
%checks if a piece can be played in a certain position depending if its an empty position or not
validPlayPosition(PIECE, L/C, BL) :-
	isEmptyTile(L/C, BL);
	(
		checkPosition(L/C, BL, N),
		validPieces(PIECE, N)
	).
	
validPlayUp(PIECE, L/C, BL) :-
	M is L - 1,
	validPlayPosition(PIECE, M/C, BL).
	
validPlayDown(PIECE, L/C, BL) :-
	M is L + 1,
	validPlayPosition(PIECE, M/C, BL).
	
validPlayLeft(PIECE, L/C, BL) :-
	M is C - 1,
	validPlayPosition(PIECE, L/M, BL).
	
validPlayRight(PIECE, L/C, BL) :-
	M is C + 1,
	validPlayPosition(PIECE, L/M, BL).
	
%verifies if a piece can be played in a certain position depending on its form and colour
isAValidPlay(PIECE, L/C, BL) :-
	hasAdjacentPiece(L/C, BL),
	(
		L =:= 1 ->
		(
			C =:= 1 ->
			(
				validPlayDown(PIECE, L/C, BL),
				validPlayRight(PIECE, L/C, BL)
			);
			
			C =:= 9 ->
			(
				validPlayLeft(PIECE, L/C, BL),
				validPlayDown(PIECE, L/C, BL)
			);
			(
				validPlayLeft(PIECE, L/C, BL),
				validPlayDown(PIECE, L/C, BL),
				validPlayRight(PIECE, L/C, BL)
			)
		);
			
		L =:= 9 ->
		(
			C =:= 1 ->
			(
				validPlayUp(PIECE, L/C, BL),
				validPlayRight(PIECE, L/C, BL)
			);
			
			C =:= 9 ->
			(
				validPlayLeft(PIECE, L/C, BL),
				validPlayUp(PIECE, L/C, BL)
			);
			(
				validPlayLeft(PIECE, L/C, BL),
				validPlayUp(PIECE, L/C, BL),
				validPlayRight(PIECE, L/C, BL)
			)
		);
			
		C =:= 1 ->
		(
			validPlayUp(PIECE, L/C, BL),
			validPlayRight(PIECE, L/C, BL),
			validPlayDown(PIECE, L/C, BL)
		);
			
		C =:= 9 ->
		(
			validPlayDown(PIECE, L/C, BL),
			validPlayLeft(PIECE, L/C, BL),
			validPlayUp(PIECE, L/C, BL)
		);
		(
			validPlayUp(PIECE, L/C, BL),
			validPlayRight(PIECE, L/C, BL),
			validPlayDown(PIECE, L/C, BL),
			validPlayLeft(PIECE, L/C, BL)
		)
	).
	
validDirUp(L/C, BL) :-
	M is L - 1,
	isEmptyTile(M/C, BL).
	
validDirRight(L/C, BL) :-
	M is C + 1,
	isEmptyTile(L/M, BL).
	
validDirDown(L/C, BL) :-
	M is L + 1,
	isEmptyTile(M/C, BL).
	
validDirLeft(L/C, BL) :-
	M is C - 1,
	isEmptyTile(L/M, BL).
	
validDir(L/C, DIR, BL) :-
	L =:= 1 ->
	(
		C =:= 1 ->
		(
			DIR =:= 2 ->
			(
				validDirRight(L/C, BL)
			);
			
			DIR =:= 3 ->
			(
				validDirDown(L/C, BL)
			)
		);
		
		C =:= 9 ->
		(
			DIR =:= 3 ->
			(
				validDirDown(L/C, BL)
			);
			
			DIR =:= 4 ->
			(
				validDirLeft(L/C, BL)
			)
		);
		(
			DIR =:= 2 ->
			(
				validDirRight(L/C, BL)
			);
			
			DIR =:= 3 ->
			(
				validDirDown(L/C, BL)
			);
			
			DIR =:= 4 ->
			(
				validDirLeft(L/C, BL)
			)
		)
	);
		
	L =:= 9 ->
	(
		C =:= 1 ->
		(
			DIR =:= 1 ->
			(
				validDirUp(L/C, BL)
			);
			
			DIR =:= 2 ->
			(
				validDirRight(L/C, BL)
			)
		);
		
		C =:= 9 ->
		(
			DIR =:= 1 ->
			(
				validDirUp(L/C, BL)
			);
			
			DIR =:= 4 ->
			(
				validDirLeft(L/C, BL)
			)
		);
		(
			DIR =:= 1 ->
			(
				validDirUp(L/C, BL)
			);
			
			DIR =:= 2 ->
			(
				validDirRight(L/C, BL)
			);
			
			DIR =:= 4 ->
			(
				validDirLeft(L/C, BL)
			)
		)
	);
		
	C =:= 1 ->
	(
		DIR =:= 1 ->
		(
			validDirUp(L/C, BL)
		);
		
		DIR =:= 2 ->
		(
			validDirRight(L/C, BL)
		);
		
		DIR =:= 3 ->
		(
			validDirDown(L/C, BL)
		)
	);
		
	C =:= 9 ->
	(
		DIR =:= 1 ->
		(
			validDirUp(L/C, BL)
		);
		
		DIR =:= 3 ->
		(
			validDirDown(L/C, BL)
		);
		
		DIR =:= 4 ->
		(
			validDirLeft(L/C, BL)
		)
	);
	(
		DIR =:= 1 ->
		(
			validDirUp(L/C, BL)
		);
		
		DIR =:= 2 ->
		(
			validDirRight(L/C, BL)
		);
		
		DIR =:= 3 ->
		(
			validDirDown(L/C, BL)
		);
		
		DIR =:= 4 ->
		(
			validDirLeft(L/C, BL)
		)
	).
	
%----------------------------
%creates a list with all the playable positions in a line of the board
getValidPositionsLines(_, _/10, _, []).
getValidPositionsLines(PIECE, L/C, BL, LIST) :-
	M is C + 1,
	(
		isAValidPlay(PIECE, L/C, BL) ->
		(
			LIST = [L/C|T],
			getValidPositionsLines(PIECE, L/M, BL, T)
		);
		(
			getValidPositionsLines(PIECE, L/M, BL, LIST)
		)
	).
	
%creates a list with all the playable position in the game board, line by line
getValidPositionsBoard(_, 10/_, _, []).
getValidPositionsBoard(PIECE, L/C, BL, LIST) :-
	getValidPositionsLines(PIECE, L/1, BL, L1),
	M is L + 1,
	getValidPositionsBoard(PIECE, M/C, BL, L2),
	append(L1, L2, LIST).
	
%creates a list of valid plays depending on a list of pieces
getValidPositionLists([], _, []).
getValidPositionLists([H|T], BL, LIST) :-
	(
		H == wind/piece -> 
			LIST = [wind/piece|FT];
			LIST = [FH|FT]
	),
	getValidPositionsBoard(H, 1/1, BL, FH),
	getValidPositionLists(T, BL, FT).
	
%verifies if there is at least a valid position that can be played with a piece
hasValidOptionOnList([]) :- fail.
hasValidOptionOnList([H|T]) :-
	H == [] ->
		hasValidOptionOnList(T);
		true.
			
%----------------------------
%randomly picks a position from a list of positions
randomPosition(LISTPOS, POS) :-
	length(LISTPOS, X),
	M is X + 1,
	random(1, M, Y),
	nth1(Y, LISTPOS, POS).
	
%creates a list of positions not empty of a line in the game board
getPositionsPlayedByLine(_/10, _, []).
getPositionsPlayedByLine(L/C, BL, LIST) :-
	M is C + 1,
	(
		hasPiece(L/C, BL) ->
		(
			LIST = [L/C|LT],
			getPositionsPlayedByLine(L/M, BL, LT)
		);
		(
			getPositionsPlayedByLine(L/M, BL, LIST)
		)
	).
	
%creates a list of positions not empty in all game board
getPositionsPlayedByBoard(10/_, _, []).
getPositionsPlayedByBoard(L/_, BL, LIST) :-
	M is L + 1,
	getPositionsPlayedByLine(L/1, BL, H),
	(
		H == [] ->
		(
			getPositionsPlayedByBoard(M/1, BL, LIST)
		);
		(
			getPositionsPlayedByBoard(M/1, BL, T),
			append(H, T, LIST)
		)
	).
	
%creates a list of empty positions of a game board
getAllPositionsPlayed(BL, LIST) :- getPositionsPlayedByBoard(1/1, BL, LIST).

%----------------------------
%gets a specific element from a table depending on its position
checkPosition(L/C, ML, N) :-
	nth1(L, ML, TL),
	nth1(C, TL, N).
	
%replace an element in a specific list
replaceElementInList(ELEM, INDEX, IL, FL) :-
	M is INDEX - 1,
	replaceElementInListAux(ELEM, M, IL, FL).
	
replaceElementInListAux(ELEM, 0, [_|T], [ELEM|T]).
replaceElementInListAux(ELEM, INDEX, [H|T], [H|FT]) :-
	M is INDEX - 1,
	replaceElementInListAux(ELEM, M, T, FT).
	
%replace an element in a list of lists
replacePiece(ELEM, L/C, BL, NL) :-
	nth1(L, BL, TL),
	replaceElementInList(ELEM, C, TL, MTL),
	replaceElementInList(MTL, L, BL, NL).

%do not change any element of a list of lists
dontReplace([], _).
dontReplace([H|T], [H|NT]) :- dontReplace(T, NT), !.

%moves a piece of the game board depending on which direction and the validity of that move
movePieceWithWind(L/C, DIR, BL, NBL) :-
	checkPosition(L/C, BL, PIECE),
	initialBoard(IL),
	checkPosition(L/C, IL, OLDTILE),
	replacePiece(OLDTILE, L/C, BL, TL),
	(
		DIR =:= 1 ->
		(
			M is L - 1,
			replacePiece(PIECE, M/C, TL, NBL)
		);
		
		DIR =:= 2 ->
		(
			M is C + 1,
			replacePiece(PIECE, L/M, TL, NBL)
		);
		
		DIR =:= 3 ->
		(
			M is L + 1,
			replacePiece(PIECE, M/C, TL, NBL)
		);
		
		DIR =:= 4 ->
		(
			M is C - 1,
			replacePiece(PIECE, L/M, TL, NBL)
		)
	),
	!.
	
%verifies if the position is not surrounded with pieces
isNotStuck(L/C, N) :-
	(
		L =:= 1 ->
		(
			C =:= 1 ->
			(
				N =:= 0 -> true;
				N =:= 1 -> true;
				fail
			);
			
			C =:= 9 ->
			(
				N =:= 0 -> true;
				N =:= 1 -> true;
				fail
			);
			(
				N =:= 0 -> true;
				N =:= 1 -> true;
				N =:= 2 -> true;
				fail
			)
		);
		
		L =:= 9 ->
		(
			C =:= 1 ->
			(
				N =:= 0 -> true;
				N =:= 1 -> true;
				fail
			);
			
			C =:= 9 ->
			(
				N =:= 0 -> true;
				N =:= 1 -> true;
				fail
			);
			(
				N =:= 0 -> true;
				N =:= 1 -> true;
				N =:= 2 -> true;
				fail
			)
		);
		
		C =:= 1 ->
		(
			N =:= 0 -> true;
			N =:= 1 -> true;
			N =:= 2 -> true;
			fail
		);
		
		C =:= 9 ->
		(
			N =:= 0 -> true;
			N =:= 1 -> true;
			N =:= 2 -> true;
			fail
		);
		
		(
			N =:= 0 -> true;
			N =:= 1 -> true;
			N =:= 2 -> true;
			N =:= 3 -> true;
			fail
		)
	),
	!.