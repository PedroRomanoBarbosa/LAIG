%all play predicates ( modes ) that can be played by the user

%----------------------------
%including libraries used
:- use_module(library(random)).
:- use_module(library(lists)).

%----------------------------
%dynamic predicates
:- dynamic player1Pieces/1.
:- dynamic player2Pieces/1.
:- dynamic player1HandPieces/1.
:- dynamic player2HandPieces/1.
:- dynamic player1HalfStones/1.
:- dynamic player2HalfStones/1.
:- dynamic player1SunStones/1.
:- dynamic player2SunStones/1.
:- dynamic player1Moves/1.
:- dynamic player2Moves/1.
:- dynamic numberOfWindPiecesDiscarded/1.

%----------------------------
%vars used in the game to save the player's state
player1Pieces([]).
player2Pieces([]).

player1HandPieces([]).
player2HandPieces([]).

player1HalfStones(0).
player2HalfStones(0).

player1SunStones(0).
player2SunStones(3).

player1Moves(1).
player2Moves(1).

numberOfWindPiecesDiscarded(0).

%----------------------------
%mode which an human player confronts another human player
playState(BL, PN, NBL, NPN) :-
	(
		isFirstPositionEmpty(BL) ->
		(
			repeat,
			viewBoard(BL),
			showPlayer(PN),
			showPlayerHand(PN, M, 0),
			readIndex(N, M),
			pickPieceFromHand(PN, N, PIECE),
			(
				isWindPiece(PIECE) ->
				(
					nl,
					write('> You can not play Wind pieces on the first play'),
					nl,
					fail
				);
				(
					replacePiece(PIECE, 5/5, BL, NBL),
					deletePieceFromHand(PN, N),
					addPieceToHand(PN),
					changePlayer(PN, NPN)
				)
			)
		);
		(
			repeat,
			viewBoard(BL),
			showPlayer(PN),
			stoneLogic(PN),
			showPlayerHand(PN, M, 1),
			NM is M + 1,
			readIndex(N, NM),
			(					
				N \== NM ->
				(
					pickPieceFromHand(PN, N, PIECE),
					(
						isWindPiece(PIECE) ->
						(
							nl,
							write('>> Specify the position of the Piece to move'),
							nl,
							readPosition(L/C),
							nl,
							(
								hasPiece(L/C, BL) ->
								(
									readWindMove(DIR),
									(
										validDir(L/C, DIR, BL) ->
										(
											movePieceWithWind(L/C, DIR, BL, NBL),
											deletePieceFromHand(PN, N),
											decMove(PN),
											useWindPiece
										);
										(
											nl,
											write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'), nl,
											write('| Not a valid position. Try again! |'), nl,
											write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'), nl,
											fail
										)
									)
								);
								(
									nl,
									write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'), nl,
									write('| There is no Piece in that position. Try again! |'), nl,
									write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'), nl,
									fail
								)
							)							
						);
						(
							readPosition(L/C),
							(
								( isAValidPlay(PIECE, L/C, BL), isEmptyTile(L/C, BL) ) ->
									(
										gainStones(L/C, BL, PN),
										tileToSunStone(L/C, BL, PN),
										replacePiece(PIECE, L/C, BL, NBL),
										deletePieceFromHand(PN, N),
										decMove(PN)
									);
									(
										nl,
										write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'), nl,
										write('| Not a valid position. Try again! |'), nl,
										write('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~'), nl,
										fail
									)
							)
						)
					)
				);
				(
					dontReplace(BL, NBL),
					decMove(PN)
				)
			),
			(
				hasFinishedTurn(PN) ->
				(
					changePlayer(PN, NPN),
					addMove(PN)
				);
				(
					notChangePlayer(PN, NPN)
				)
			),
			addPieceToHand(PN)
		)
	),
	!.
	
%mode which an human player confronts the computer in easy mode
playStatePCEasy(BL, PN, NBL, NPN) :-
	(
		(
			PN =:= 1 ->
			(
				player1HandPieces(L),
				length(L, M)
			);
			
			PN =:= 2 ->
			(
				player2HandPieces(L),
				length(L, M)
			)
		),
		getValidPositionLists(L, BL, LIST),
		(
			hasValidOptionOnList(LIST) ->
			(
				MMAX is M + 1,
				repeat,
				random(1, MMAX, X),
				nth1(X, L, PIECE),
				nth1(X, LIST, LISTPOS),
				(
					LISTPOS == [] ->
					(
						fail
					);
					(
						isWindPiece(PIECE) ->
						(
							getAllPositionsPlayed(BL, PLAYEDPOS),
							repeat,
							randomPosition(PLAYEDPOS, POS),
							numberOfAdjacentPieces(POS, BL, N),
							(
								N =:= 4 ->
								(
									fail
								);
								(
									DIRS = [1, 2, 3, 4],
									repeat,
									randomPosition(DIRS, DIR),
									(
										validDir(POS, DIR, BL) ->
										(
											movePieceWithWind(POS, DIR, BL, NBL),
											deletePieceFromHand(PN, X),
											useWindPiece
										);
										(
											fail
										)
									)
								)
							)
						);
						(
							randomPosition(LISTPOS, POS),
							gainStonesPC(POS, BL, PN),
							tileToSunStone(POS, BL, PN),
							replacePiece(PIECE, POS, BL, NBL),
							deletePieceFromHand(PN, X)
						)
					)
				)
			);
			(
				dontReplace(BL, NBL)
			)
		),
		changePlayer(PN, NPN),
		addPieceToHand(PN)
	),
	!.
	
%mode which an human player confronts the computer in hard mode	
playStatePCHard(BL, PN, NBL, NPN) :-
	(
		isFirstPositionEmpty(BL) ->
		(
			(
				PN =:= 1 ->
				(
					player1HandPieces(L)
				);
				
				PN =:= 2 ->
				(
					player2HandPieces(L)
				)
			),
			repeat,
			random(1, 6, W),
			nth1(W, L, PIECE),
			(
				isWindPiece(PIECE) ->
				(
					fail
				);
				(
					replacePiece(PIECE, 5/5, BL, NBL),
					deletePieceFromHand(PN, INDEX),
					addPieceToHand(PN),
					changePlayer(PN, NPN)
				)
			)
		);
		(
			repeat,
			stoneLogicPC(PN),
			(
				PN =:= 1 ->
				(
					player1HandPieces(L),
					length(L, M)
				);
				
				PN =:= 2 ->
				(
					player2HandPieces(L),
					length(L, M)
				)
			),
			getValidPositionLists(L, BL, LIST),
			countSunTilePositions(LIST, FL, BL),
			findSunPositions(FL, 0, INDEX),
			(
				INDEX =:= 0 ->
				(
					(
						hasValidOptionOnList(LIST) ->
						(
							MMAX is M + 1,
							repeat,
							random(1, MMAX, X),
							nth1(X, L, PIECE),
							nth1(X, LIST, LISTPOS),
							(
								LISTPOS == [] ->
								(
									fail
								);
								(
									isWindPiece(PIECE) ->
									(
										getAllPositionsPlayed(BL, PLAYEDPOS),
										repeat,
										randomPosition(PLAYEDPOS, POS),
										numberOfAdjacentPieces(POS, BL, NA),
										(
											isNotStuck(POS, NA) ->
											(
												DIRS = [1, 2, 3, 4],
												repeat,
												randomPosition(DIRS, DIR),
												(
													validDir(POS, DIR, BL) ->
													(	
														movePieceWithWind(POS, DIR, BL, NBL),
														deletePieceFromHand(PN, X),
														decMove(PN),
														useWindPiece
													);
													(
														fail
													)
												)
											);
											(
												fail
											)
										)
									);
									(
										randomPosition(LISTPOS, POS),
										gainStonesPC(POS, BL, PN),
										tileToSunStone(POS, BL, PN),
										replacePiece(PIECE, POS, BL, NBL),
										deletePieceFromHand(PN, X),
										decMove(PN)
									)
								)
							)
						);
						(
							dontReplace(BL, NBL),
							decMove(PN)
						)
					)
				);
				(
					nth1(INDEX, LIST, PL),
					findPositionInList(PL, BL, 0, I),
					nth1(I, PL, SPOS),
					gainStonesPC(SPOS, BL, PN),
					tileToSunStone(SPOS, BL, PN),
					nth1(INDEX, L, PIECE),
					replacePiece(PIECE, SPOS, BL, NBL),
					deletePieceFromHand(PN, INDEX),
					decMove(PN)
				)
			),
			(
				hasFinishedTurn(PN) ->
				(
					changePlayer(PN, NPN),
					addMove(PN)
				);
				(
					notChangePlayer(PN, NPN)
				)
			),
			addPieceToHand(PN)
		)
	),
	!.