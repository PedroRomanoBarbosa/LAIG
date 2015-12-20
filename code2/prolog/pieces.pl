%all pieces declarations and predicates that can be used in the game

%----------------------------
%pieces of the game
%forms of the pieces
form(bird).
form(turtle).
form(feather).
form(dolphin).
form(lizard).
form(flower).

%colours of the pieces
colour(cyan).
colour(green).
colour(purple).
colour(blue).
colour(yellow).
colour(red).

%associates all forms and colours of the existing pieces
piece(X/Y) :-
	form(X),
	colour(Y).
	
%----------------------------
%comparing pieces functions

%compares if two pieces have the same colour
sameColour(X1/C, X2/C) :-
	piece(X1/C),
	piece(X2/C),
	form(X1),
	form(X2),
	colour(C).
	
%compares if two pieces have the same form
sameForm(F/X1, F/X2) :-
	piece(F/X1),
	piece(F/X2),
	colour(X1),
	colour(X2),
	form(F).
	
%checks if a piece is a special piece ( wind piece )
isWindPiece(PIECE) :-
	PIECE == wind/piece;
	PIECE == wind-piece.
	
%checks if two pieces have the same colour or the same form
validPieces(X, Y) :-
	sameColour(X, Y);
	sameForm(X, Y).
	
%----------------------------
%create players list of pieces

%creates a list with all the associations between forms and colours
createAllPiecesList(L) :-
	findall(A/B, piece(A/B), L1),
	findall(A/B, piece(A/B), L2),
	append(L1, [wind/piece, wind/piece, wind/piece, wind/piece, wind/piece, wind/piece,
				wind/piece, wind/piece, wind/piece, wind/piece, wind/piece, wind/piece], LT),
	append(LT, L2, L).
	
%creates two list from a list randomly
dividePiecesListRand([], [], []).
dividePiecesListRand(L, [N1|LP1], [N2|LP2]) :-
	random_member(N1, L),
	deleteFirst(N1, L, L1),
	random_member(N2, L1),
	deleteFirst(N2, L1, L2),
	dividePiecesListRand(L2, LP1, LP2).
	
%asserts the divisionof the pieces to payers
dividePieces :-
	retract(player1Pieces(_)),
	retract(player2Pieces(_)),
	createAllPiecesList(L),
	dividePiecesListRand(L, L1, L2),
	assert(player1Pieces(L1)),
	assert(player2Pieces(L2)).
	
%deletes first occurrence of an element in a list
deleteFirst(_, [], []).
deleteFirst(N, [N|T], T) :- !.
deleteFirst(N, [H|T], [H|R]) :-
	deleteFirst(N, T, R).