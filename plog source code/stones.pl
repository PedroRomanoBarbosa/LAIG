%all predicates to simulate the stone logic in the game

%----------------------------
%checks if a player activated a special move to gain extra stones
gainStones(L/C, BL, PN) :-
	numberOfAdjacentPieces(L/C, BL, N),
	(
		PN =:= 1 ->
		(
			N =:= 2 ->
			(
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				write('| You just made a double |'),
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				retract(player1HalfStones(X)),
				Y is X + 1,
				assert(player1HalfStones(Y))
			);
			
			N =:= 3 ->
			(
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				write('| You just made a trefoil |'),
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				retract(player1SunStones(X)),
				Y is X + 1,
				assert(player1SunStones(Y))
			);
			
			N =:= 4 ->
			(
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				write('| You just made a Latice |'),
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				retract(player1SunStones(X)),
				Y is X + 2,
				assert(player1SunStones(Y))
			);
			
			true
		);
		
		PN =:= 2 ->
		(
			N =:= 2 ->
			(
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				write('| You just made a double |'),
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				retract(player2HalfStones(X)),
				Y is X + 1,
				assert(player2HalfStones(Y))
			);
			
			N =:= 3 ->
			(
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				write('| You just made a trefoil |'),
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				retract(player2SunStones(X)),
				Y is X + 1,
				assert(player2SunStones(Y))
			);
			
			N =:= 4 ->
			(
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				write('| You just made a Latice |'),
				nl,
				write('~~~~~~~~~~~~~~~~~~~~~~~~~~'),
				nl,
				retract(player2SunStones(X)),
				Y is X + 2,
				assert(player2SunStones(Y))
			);
			
			true
		)
	).
	
%checks if the computer activated a special move to gain extra stones
gainStonesPC(L/C, BL, PN) :-
	numberOfAdjacentPieces(L/C, BL, N),
	(
		PN =:= 1 ->
		(
			N =:= 2 ->
			(
				retract(player1HalfStones(X)),
				Y is X + 1,
				assert(player1HalfStones(Y))
			);
			
			N =:= 3 ->
			(
				retract(player1SunStones(X)),
				Y is X + 1,
				assert(player1SunStones(Y))
			);
			
			N =:= 4 ->
			(
				retract(player1SunStones(X)),
				Y is X + 2,
				assert(player1SunStones(Y))
			);
			
			true
		);
		
		PN =:= 2 ->
		(
			N =:= 2 ->
			(
				retract(player2HalfStones(X)),
				Y is X + 1,
				assert(player2HalfStones(Y))
			);
			
			N =:= 3 ->
			(
				retract(player2SunStones(X)),
				Y is X + 1,
				assert(player2SunStones(Y))
			);
			
			N =:= 4 ->
			(
				retract(player2SunStones(X)),
				Y is X + 2,
				assert(player2SunStones(Y))
			);
			
			true
		)
	).
	
%converts the halfStones of a specific player to sunStones
halfToSunStones(PN) :-
	PN =:= 1 ->
	(
		player1HalfStones(X),
		(
			X >= 2 ->
			(
				retract(player1HalfStones(HN)),
				retract(player1SunStones(SN)),
				NHN is HN - 2,
				NSN is SN + 1,
				assert(player1HalfStones(NHN)),
				assert(player1SunStones(NSN)),
				write('> HalfStones were converted to SunStone'),
				nl
			);
			(
				write('> Not enough HalfStones to convert'),
				nl,
				fail
			)
		)
	);
	
	PN =:= 2 ->
	(
		player2HalfStones(X),
		(
			X >= 2 ->
			(
				retract(player2HalfStones(HN)),
				retract(player2SunStones(SN)),
				NHN is HN - 2,
				NSN is SN + 1,
				assert(player2HalfStones(NHN)),
				assert(player2SunStones(NSN)),
				write('> HalfStones were converted to SunStone'),
				nl
			);
			(
				write('> Not enough HalfStones to convert'),
				nl,
				fail
			)
		)
	).
	
%converts all sunStones of a specific player to gain extra turns
sunStonesToMoves(PN) :-
	PN =:= 1 ->
	(
		player1SunStones(X),
		(
			X >= 1 ->
			(
				addMove(PN),
				retract(player1SunStones(SN)),
				NSN is SN - 1,
				assert(player1SunStones(NSN)),
				write('> SunStone was converted to an extra move'),
				nl
			);
			(
				write('> Not enough SunStones to convert'),
				nl,
				fail
			)
		)
	);
	
	PN =:= 2 ->
	(
		player2SunStones(X),
		(
			X >= 1 ->
			(
				addMove(PN),
				retract(player2SunStones(SN)),
				NSN is SN - 1,
				assert(player2SunStones(NSN)),
				write('> SunStone was converted to an extra move'),
				nl
			);
			(
				write('> Not enough SunStones to convert'),
				nl,
				fail
			)
		)
	).
	
%converts the sunStones of a specific player into a special piece that can be used in game ( wind piece )
sunStonesToWindTile(PN) :-
	PN =:= 1 ->
	(
		player1SunStones(X),
		numberOfWindPiecesDiscarded(Y),
		(
			Y >= 1 ->
			(
				X >= 3 ->
				(
					retract(player1SunStones(SN)),
					NSN is SN - 3,
					assert(player1SunStones(NSN)),
					addWindPieceToHand(PN),
					write('> SunStones were converted to a WindTile'),
					nl
				);
				(
					write('> Not enough SunStones to convert'),
					nl,
					fail
				)
			);
			(
				write('> No Wind pieces were discarded yet'),
				nl,
				fail
			)
		)
	);
	
	PN =:= 2 ->
	(
		player2SunStones(X),
		numberOfWindPiecesDiscarded(Y),
		(
			Y >= 1 ->
			(
				X >= 3 ->
				(
					retract(player2SunStones(SN)),
					NSN is SN - 3,
					assert(player2SunStones(NSN)),
					addWindPieceToHand(PN),
					write('> SunStones were converted to a WindTile'),
					nl
				);
				(
					write('> Not enough SunStones to convert'),
					nl,
					fail
				)
			);
			(
				write('> No Wind pieces were discarded yet'),
				nl,
				fail
			)
		)
	).
	
%chooses the process the player want to apply to the stones
stoneLogic(PN) :-
	repeat,
	showStones(PN),
	readStones(N),
	(
		N =:= 1 -> true;
		
		N =:= 2 ->
		(
			nl,
			halfToSunStones(PN),
			fail
		);
		
		N =:= 3 ->
		(
			nl,
			sunStonesToMoves(PN),
			fail
		);
		
		N =:= 4 ->
		(
			nl,
			sunStonesToWindTile(PN),
			fail
		)
	),
	showStones(PN),
	!.
	
%converts all stones the computer player has to extra turns
stoneLogicPC(PN) :-
	(
		PN =:= 1 ->
		(
			player1HalfStones(X),
			(
				X >= 2 ->
				(
					retract(player1HalfStones(HN)),
					NHN is HN - 2,
					assert(player1HalfStones(NHN)),
					addMove(1),
					fail
				);
				
				true
			),
			player1SunStones(Y),
			(
				Y >= 1 ->
				(
					retract(player1SunStones(SN)),
					NSN is SN - 1,
					assert(player1SunStones(NSN)),
					addMove(1),
					fail
				);
				
				true
			)
		);
		
		PN =:= 2 ->
		(
			player2HalfStones(X),
			(
				X >= 2 ->
				(
					retract(player2HalfStones(HN)),
					NHN is HN - 2,
					assert(player2HalfStones(NHN)),
					addMove(2),
					fail
				);
				
				true
			),
			player2SunStones(Y),
			(
				Y >= 1 ->
				(
					retract(player2SunStones(SN)),
					NSN is SN - 1,
					assert(player2SunStones(NSN)),
					addMove(2),
					fail
				);
				
				true
			)
		)
	),
	!.