%all predicates used to display text to user

%----------------------------

%predicate used to clear the console from text
cls :- write('\e[2J').

%displays which player's turn is
showPlayer(1) :- write('>> Player number 1 turn'), nl.
showPlayer(2) :- write('>> Player number 2 turn'), nl.

%shows the list of pieces a specific player has in its hands
showHand([A/B|[]], N, N) :-
	write(N),
	write(': '),
	write(A),
	write('-'),
	write(B).
	
showHand([A/B|T], N, Y) :-
	write(N),
	write(': '),
	write(A),
	write('-'),
	write(B),
	write(' | '),
	M is N + 1,
	showHand(T, M, Y).

showPlayerHand(N, M, B) :-
	(
		N =:= 1 -> 
		(
			nl,
			write('Player Hand:'),
			nl,
			player1HandPieces(L),
			showHand(L, 1, M),
			showPassOption(M, B),
			nl
		);
			
		N =:= 2 ->
		(
			nl,
			write('Player Hand:'),
			nl,
			player2HandPieces(L),
			showHand(L, 1, M),
			showPassOption(M, B),
			nl
		)
	),
	!.

%displays the pass option when showing the payer's pieces
showPassOption(M, B) :-
	B =:= 1 ->
	(
		write(' | '),
		N is M + 1,
		write(N),
		write(': Pass Turn')
	);
	
	true.
	
%show the number of moves and stones a specific player has
showStones(N) :-
	(
		N =:= 1 -> 
		(
			nl,
			player1Moves(T),
			write('>> Number of turns available to play: '),
			write(T),
			nl,
			player1HalfStones(Y),
			write(' - Half Stones: '),
			write(Y),
			nl,
			player1SunStones(X),
			write(' - Sun stones: '),
			write(X),
			nl
		);
			
		N =:= 2 ->
		(
			nl,
			player2Moves(T),
			write('>> Number of turns available to play: '),
			write(T),
			nl,
			player2HalfStones(Y),
			write(' - HalfStones: '),
			write(Y),
			nl,
			player2SunStones(X),
			write(' - Sun stones: '),
			write(X),
			nl
		)
	),
	!.
	
%creates the format to display a specific list of elements
makeFormat([], [], F0, F) :- atom_concat(F0, '~n', F).
makeFormat([E|Es], L, F0, F) :-
    (   
		E = A/B ->
		(
			atom_concat(F0, '~t~a-~a~t~17+|', F1),
			L = [A,B|Ls]
		);
        (
			atom_concat(F0, '~t~a~t~17+|', F1),
			L = [E|Ls]
		)
    ),
    makeFormat(Es, Ls, F1, F).

%displays a list of lists formatted in a specific way depending on its elements
printLists([], _).
printLists([H|T], N) :-
	M is N + 1,
    makeFormat(H, H1, '~d-|', Format),
    format(Format, [M|H1]),
	format('  +--------------+----------------+----------------+----------------+----------------+----------------+----------------+----------------+----------------+~n', []),
    printLists(T, M).
	
%displays a grid of elements ( board of the game )
viewBoard(BL) :-
	nl,
	format('~`-t~160|~n',[]),
	nl,
	nl,
	format('  +--------------+----------------+----------------+----------------+----------------+----------------+----------------+----------------+----------------+~n', []),
	format('LC|~t~d~t~17+|~t~d~t~17+|~t~d~t~17+|~t~d~t~17+|~t~d~t~17+|~t~d~t~17+|~t~d~t~17+|~t~d~t~17+|~t~d~t~17+|~n',[1, 2, 3, 4, 5, 6, 7, 8, 9]),
	format('  +--------------+----------------+----------------+----------------+----------------+----------------+----------------+----------------+----------------+~n', []),
	printLists(BL, 0),
	nl,
	nl,
	!.
	
%displays the state of the final board and the player who won the game
finalState(N) :-
	cls,
	stateOfTheGame(BL, _),
	viewBoard(BL),
	write('~~~~~~~~~~~~~~       Player number '),
	write(N),
	write(' has won!       ~~~~~~~~~~~~~~'),
	nl,
	nl,
	format('~`-t~160|~n',[]).
	
%create atomic list to send server
listToAtom([], ' |').
listToAtom([FirstA/FirstB|[]], Atom) :-
	atom_concat(FirstA, '-', TempAtom),
	atom_concat(TempAtom, FirstB, TempAtomFin),
	atom_concat(TempAtomFin, '|', Atom).
listToAtom([FirstA/FirstB|Rest], Atom) :-
	listToAtom(Rest, TempAtom),
	atom_concat(',', TempAtom, TempAtomFin),
	atom_concat(FirstB, TempAtomFin, TempAtomFin2),
	atom_concat('-', TempAtomFin2, TempAtomFin3),
	atom_concat(FirstA, TempAtomFin3, Atom).
listToAtom([First|[]], Atom) :-
	atom_concat(First, '|', Atom).
listToAtom([First|Rest], Atom) :-
	listToAtom(Rest, TempAtom),
	atom_concat(',', TempAtom, TempAtomFin),
	atom_concat(First, TempAtomFin, Atom).

listOfListsToAtom([], '').
listOfListsToAtom([First|Rest], Atom) :-
	listOfListsToAtom(Rest, TempAtom),
	listToAtom(First, AnotherAtom),
	atom_concat(AnotherAtom,TempAtom, Atom).
	
%number to atomic value
numberToAtom(Num, Atom) :-
	number_codes(Num, Str),
	atom_codes(TempAtom, Str),
	atom_concat(TempAtom, '|', Atom).