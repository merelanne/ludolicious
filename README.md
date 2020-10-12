# Ludolicious
Project I made for Web&amp;Database Technology (CSE1500). I made the game Ludo, together with a teammate. This was all done in HTML, CSS, plain Javascript and a bit of jQuery.

# How to play
- Clone the project
- Run `npm start 3000` in the terminal (first install Nodejs if needed)
- Open your browser (Chrome advised) and go to http://localhost:3000/
- You should now see the splash screen.
- When four players have clicked "Start game", the red player (the first player that connected) will be able to roll the dice.

# Rules of Ludo
- A player must throw a six to put a pawn on the board.
- Each throw, the player decides which piece to move clockwise over the board. If no piece can move according to the number thrown, it's the next players turn.
- A throw of 6 gives another turn.
- If a piece lands on another piece of a different colour, that other piece is returned to its starting squares. The player of that color must now throw six again to play with the piece (from the beginning of the board).
- When a piece has walked all around the board, it goes in the the home column. A piece can only be moved onto the home squares by an exact throw.
- The first person to move all 4 pieces into the home triangle wins.

