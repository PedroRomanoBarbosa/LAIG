%all functions that read input from the user

%----------------------------
%read which of the game mode will be initiated
readMode(N) :-
	cls,
	nl,
	write('~~~~~~~~~~'),
	nl,
	write('| LATICE |'),
	nl,
	write('~~~~~~~~~~'),
	nl,
	nl,
	write('>> Choose your game mode :'),
	nl,
	write('> 1 - P vs P | 2 - P vs PC Easy | 3 - P vs PC Hard | 4 - PC Hard vs PC Hard'),
	nl,
	readInt('# Option: ', N, 1, 4),
	!.

%read a coordinate from the user
readPosition(L/C) :- 
	readInt('# Line number of the position: ', L, 1, 9),
	readInt('# Column number of the position: ', C, 1, 9),
	!.

%read a value below a certain max value
readIndex(N, MAX) :- readInt('# Index of the piece to play: ', N, 1, MAX), !.

%read the option the player want to do about the stones
readStones(N) :- 
	nl,
	write('>> Choose what to do: '),
	nl,
	write('> 1 - Continue playing | 2 - Turn Halfstones into Sunstone | 3 - Gain a turn from a Sunstone | 4 - Gain a Wind Tile from 3 Sunstones'),
	nl,
	readInt('# Option: ', N, 1, 4),
	!.

%read the direction the player want to move a piece
readWindMove(N) :-
	write('>> Move the Piece to which direction: '),
	nl,
	write('> 1 - Up | 2 - Right | 3 - Down | 4 - Left'),
	nl,
	readInt('# Option: ', N, 1, 4),
	!.

%read a value from the user, that value must be integer
readInt(PROMPT, N, MIN, MAX) :-
	nl,
	repeat,
	write(PROMPT),
	readNum(N),
	N >= MIN, N =< MAX.
	
%read an integer number from the user
readNum(N) :-
	get_code(CH),
	once(readDigit(CH, [H|T])),
	name(N, [H|T]),
	integer(N),
	!.

%read a digit from the user
readDigit(10, []). %value for the return keys
readDigit(13, []). %value for the return key
readDigit(CH, [CH|T]) :-
	get_code(NCH),
	readDigit(NCH, T).