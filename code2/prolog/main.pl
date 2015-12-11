%include all necessary files to the game
:- ['play.pl', 'input.pl', 'output.pl', 'tiles.pl', 'pieces.pl', 'board.pl', 'stones.pl', 'misc.pl'].

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