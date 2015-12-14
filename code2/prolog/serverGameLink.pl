%include all necessary files to the game
:- ['play.pl', 'input.pl', 'output.pl', 'tiles.pl', 'pieces.pl', 'board.pl', 'stones.pl', 'misc.pl'].

%----------------------------
%init the game pieces
initGame :-
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