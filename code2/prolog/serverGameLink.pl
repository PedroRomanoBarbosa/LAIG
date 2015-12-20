%include all necessary files to the game
:- ['play.pl', 'input.pl', 'output.pl', 'tiles.pl', 'pieces.pl', 'board.pl', 'stones.pl', 'misc.pl'].

%----------------------------
%init the game pieces
initGame :-
	reloadData,
	dividePieces,
	fillPlayerHand(1),
	fillPlayerHand(2).
	
%reply string of the game state
% |boardx9|playerTurn|player1moves|player2moves|player1pieces|player1handpieces|player1halfstones|player1sunstones|numberOfWindPiecesDiscarded|
getGameState(Result) :-
	stateOfTheGame(BoardLists, Player),
	listOfListsToAtom(BoardLists, BoardAtom),
	numberToAtom(Player, PlayerAtom),
	player1Moves(P1M),
	numberToAtom(P1M, P1MA),
	player2Moves(P2M),
	numberToAtom(P2M, P2MA),
	player1Pieces(P1Pieces),
	listToAtom(P1Pieces, P1PiecesAtom),
	player1HandPieces(P1HandPieces),
	listToAtom(P1HandPieces, P1HandPiecesAtom),
	player1HalfStones(P1HS),
	numberToAtom(P1HS, P1HSA),
	player1SunStones(P1SunS),
	numberToAtom(P1SunS, P1SunSA),
	player2Pieces(P2Pieces),
	listToAtom(P2Pieces, P2PiecesAtom),
	player2HandPieces(P2HandPieces),
	listToAtom(P2HandPieces, P2HandPiecesAtom),
	player2HalfStones(P2HS),
	numberToAtom(P2HS, P2HSA),
	player2SunStones(P2SunS),
	numberToAtom(P2SunS, P2SunSA),
	numberOfWindPiecesDiscarded(WindNum),
	numberToAtom(WindNum, WindNumA),
	atom_concat('|', BoardAtom, A1),
	atom_concat(A1, PlayerAtom, A2),
	atom_concat(A2, P1MA, A3),
	atom_concat(A3, P2MA, A4),
	atom_concat(A4, P1PiecesAtom, A5),
	atom_concat(A5, P1HandPiecesAtom, A6),
	atom_concat(A6, P1HSA, A7),
	atom_concat(A7, P1SunSA, A8),
	atom_concat(A8, P2PiecesAtom, A9),
	atom_concat(A9, P2HandPiecesAtom, A10),
	atom_concat(A10, P2HSA, A11),
	atom_concat(A11, P2SunSA, A12),
	atom_concat(A12, WindNumA, Result).
	
%impose new game state
%structure of parameter list
% mode,pieceindex,pos,dir,board,playerturn,player1nmoves,player2nmoves,player1pieces,player1handpieces,player1hfs,player1ss,numwindiscarded
imposeGameState(List, Mode, IndexOfPiece, Position, Direction) :-
	nth1(1, List, Mode),
	nth1(2, List, IndexOfPiece),
	nth1(3, List, Position),
	nth1(4, List, Direction),
	nth1(5, List, Board),
	nth1(6, List, PlayerTurn),
	nth1(7, List, Player1NumOfMoves),
	nth1(8, List, Player2NumOfMoves),
	nth1(9, List, Player1Pieces),
	nth1(10, List, Player1HandPieces),
	nth1(11, List, Player1NumHalfStones),
	nth1(12, List, Player1NumSunStones),
	nth1(13, List, Player2Pieces),
	nth1(14, List, Player2HandPieces),
	nth1(15, List, Player2NumHalfStones),
	nth1(16, List, Player2NumSunStones),
	nth1(17, List, WindPiecesDiscarded),
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
	assert(player1Pieces(Player1Pieces)),
	assert(player2Pieces(Player2Pieces)),
	assert(player1HandPieces(Player1HandPieces)),
	assert(player2HandPieces(Player2HandPieces)),
	assert(player1HalfStones(Player1NumHalfStones)),
	assert(player2HalfStones(Player2NumHalfStones)),
	assert(player1SunStones(Player1NumSunStones)),
	assert(player2SunStones(Player2NumSunStones)),
	assert(player1Moves(Player1NumOfMoves)),
	assert(player2Moves(Player2NumOfMoves)),
	assert(numberOfWindPiecesDiscarded(WindPiecesDiscarded)),
	assert(stateOfTheGame(Board, PlayerTurn)).
	
%game predicate
playMode(Mode, IndexOfPiece, Position, Direction, Result) :-
	
	Mode =:= 0 ->
	(
		retract(stateOfTheGame(Board, PlayerTurn)),
		(
			isFirstPositionEmpty(Board) ->
			(
				pickPieceFromHand(PlayerTurn, IndexOfPiece, Piece),
				(
					isWindPiece(Piece) ->
					(
						assert(stateOfTheGame(Board, PlayerTurn)),
						Result = 'bad'
					);
					(
						replacePiece(Piece, 5/5, Board, NewBoard),
						deletePieceFromHand(PlayerTurn, IndexOfPiece),
						addPieceToHand(PlayerTurn),
						changePlayer(PlayerTurn, NewPlayerTurn),
						assert(stateOfTheGame(NewBoard, NewPlayerTurn)),
						Result = 'good'
					)
				)
			);
			(
				assert(stateOfTheGame(Board, PlayerTurn)),
				Result = 'bad'
			)
		)
	);
	
	Mode =:= 1 ->
	(
		retract(stateOfTheGame(Board, PlayerTurn)),
		pickPieceFromHand(PlayerTurn, IndexOfPiece, Piece),
		(
			(isAValidPlay(Piece, Position, Board), isFreeTile(Position, Board)) ->
			(
				nl,nl,write('22222'),
				gainStones(Position, Board, PlayerTurn),
				tileToSunStone(Position, Board, PlayerTurn),
				nl,nl,write('333333'),
				replacePiece(Piece, Position, Board, NewBoard),
				deletePieceFromHand(PlayerTurn, IndexOfPiece),
				nl,nl,write('5555'),
				decMove(PlayerTurn),
				(
					hasFinishedTurn(PlayerTurn) ->
					(
						changePlayer(PlayerTurn, NewPlayerTurn),
						nl,nl,write('6666'),
						addMove(PlayerTurn)
					);
					(
						notChangePlayer(PlayerTurn, NewPlayerTurn),
						nl,nl,write('77777')
					)
				),
				nl,nl,write('8888'),
				addPieceToHand(PlayerTurn),
				nl,nl,write('9999'),
				assert(stateOfTheGame(NewBoard, NewPlayerTurn)),
				Result = 'good'
			);
			(
				assert(stateOfTheGame(Board, PlayerTurn)),
				Result = 'bad'
			)
		)
	);
	(
		true
	).

%----------------------------
%main of the game
main :-
	readMode(N),
	cls,
	(
		N =:= 1 -> mainPvsP;
		
		N =:= 2 -> mainPvsPCEasy;
		
		N =:= 3 -> mainPvsPCHard;
		
		N =:= 4 -> mainPCHardvsPCHard;
		
		true
	),
	reloadData.

%----------------------------
%main of player vs player
mainPvsP :-
	dividePieces,
	player1Pieces(L),
	fillPlayerHand(1),
	fillPlayerHand(2),
	repeat,
	cls,
	retract(stateOfTheGame(L, PN)),
	playState(L, PN, NL, NPN),
	assert(stateOfTheGame(NL, NPN)),
	finished,
	finalState(PN).
	
%main of the player vs easy pc
mainPvsPCEasy :-
	dividePieces,
	fillPlayerHand(1),
	fillPlayerHand(2),
	repeat,
	cls,
	retract(stateOfTheGame(L, PN)),
	(
		PN =:= 1 ->
		(
			playState(L, PN, NL, NPN)
		);
		
		PN =:= 2 ->
		(
			playStatePCEasy(L, PN, NL, NPN)
		)
	),
	assert(stateOfTheGame(NL, NPN)),
	finished,
	finalState(PN).
	
%main of the player vs hard pc
mainPvsPCHard :-
	dividePieces,
	fillPlayerHand(1),
	fillPlayerHand(2),
	repeat,
	cls,
	retract(stateOfTheGame(L, PN)),
	(
		PN =:= 1 ->
		(
			playState(L, PN, NL, NPN)
		);
		
		PN =:= 2 ->
		(
			playStatePCHard(L, PN, NL, NPN)
		)
	),
	assert(stateOfTheGame(NL, NPN)),
	finished,
	finalState(PN).
	
mainPCHardvsPCHard :-
	dividePieces,
	fillPlayerHand(1),
	fillPlayerHand(2),
	repeat,
	cls,
	retract(stateOfTheGame(L, PN)),
	playStatePCHard(L, PN, NL, NPN),
	assert(stateOfTheGame(NL, NPN)),
	finished,
	finalState(PN).