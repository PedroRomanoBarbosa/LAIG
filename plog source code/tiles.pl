%all predicates used to create tiles ( positions )

%----------------------------
%tiles of the game
freeTile(free).
sunTile(sunTile).
moonTile(moonTile).

%----------------------------
%tile functions

%checks if tile is a freeTile
isFreeTile(L/C, BL) :-
	freeTile(N),
	checkPosition(L/C, BL, N).

%checks if tile is a sunTile
isSunTile(L/C, BL) :-
	sunTile(N),
	checkPosition(L/C, BL, N).
	
%checks if tile is a moonTile
isMoonTile(L/C, BL) :-
	moonTile(N),
	checkPosition(L/C, BL, N).

%checks if a tile is empty
isEmptyTile(L/C, BL) :-
	isFreeTile(L/C, BL);
	isSunTile(L/C, BL);
	isMoonTile(L/C, BL).
	
%checks if the first position of the board is empty
isFirstPositionEmpty(BL) :-
	moonTile(N),
	checkPosition(5/5, BL, N).
	
%checks if a tile is not empty
hasPiece(L/C, BL) :- \+ isEmptyTile(L/C, BL).