// // the page where the game is played

// import React from 'react';
// import GameHeader from '../Components/Game/';
// import GameOver from '../Components/Game/GameOver';
// import Timer from '../Components/Game/Timer';
// import CoreGame from '../Components/Game/CoreGame';
// import PowerupButton from '../Components/Game/Powerups/PowerupButton';
// import { fetchWords, postScore } from '../Util/ApiCalls';
// import '../../Styles/Game.css';
// import { Powerup } from '../Components/Game/Powerups/Powerup';

// const timeLost = 0;

// function GamePage({
//   initialLoad = true,
//   initialState = false,
//   data = [],
//   numRounds = data.length ? data.length : 10,
// }) {
//   let user = 'Guest';
//   let userId = '';

//   const cookiePairs = document.cookie.split(';');

//   // Iterate through the cookie pairs to find the 'user' and 'userID' values
//   for (const pair of cookiePairs) {
//     const [key, value] = pair.trim().split('=');
//     if (key === 'user') {
//       user = value;
//     } else if (key === 'userid') {
//       userId = value;
//     }
//   }

//   const [loading, setLoading] = React.useState(initialLoad);

//   const [gameData, setGameData] = React.useState(data);

//   const [gameStatus, updateGameStatus] = React.useState({
//     round: 1,
//     score: 0,
//     currWord: data.length ? data[0] : null,
//     gameEnd: initialState,
//     roundTime: null,
//     wordGuessed: false,
//   });

//   const [roundStatus, updateRoundStatus] = React.useState({
//     incorrectLettersGuessed: 0,
//   });

//   const [inventory, updateInventory] = React.useState(initializeInventory());

//   const [activePowerup, updateActivePowerup] = React.useState('none');

//   function initializeInventory() {
//     return [new Powerup('Add Time', 5, false), new Powerup('Reveal Letter', 1, false)];
//   }

//   React.useEffect(() => {
//     if (gameStatus.gameEnd == true) {
//       // submit score
//       if (user !== 'Guest') {
//         console.log(`final score: ${gameStatus.score}`);
//         postScore(userId, gameStatus.score);
//       }
//     } else {
//       fetchWords(numRounds)
//         .then((data) => {
//           setGameData(data);
//           updateGameStatus((prev) => ({
//             ...prev,
//             currWord: data[0],
//             roundTime: 10 + data[0].difficulty * 5,
//           }));
//           setLoading(false);
//         });
//     }
//   }, [gameStatus.gameEnd]);

//   // Called by Timer.js to update game status
//   // Called when timer runs out, so round is over
//   function roundEnd(scoreEarned) {
//     // Duplicate powerups and make all powerups available again
// eslint-disable-next-line max-len
//     updateInventory((prevInventory) => prevInventory.map((powerup) => new Powerup(powerup.name, powerup.quantity, false)));

//     if (gameStatus.round + 1 <= gameData.length) {
//       updateGameStatus((prev) => ({
//         ...prev,
//         round: prev.round + 1,
//         score: prev.score + scoreEarned,
//         currWord: gameData[prev.round],
//         roundTime: 10 + gameData[prev.round].difficulty * 5,
//         wordGuessed: false,
//       }));
//     } else {
//       // game ended
//       updateGameStatus((prev) => ({
//         ...prev,
//         score: prev.score + scoreEarned,
//         gameEnd: true,
//         roundTime: 0,
//       }));
//     }

//     restartRound();
//   }

//   // Called by CoreGame.js to update game status
//   // Called whenever a word was guessed, wordGuessed is set to true,
//   // And Timer.js will calculate the score and call roundEnd()
//   function wordGuessed() {
//     updateGameStatus((prev) => ({
//       ...prev,
//       wordGuessed: true,
//     }));

//     restartRound();
//   }

//   // Called by CoreGame.js to update round status
//   function incorrectLetterGuessed() {
//     updateRoundStatus((prev) => ({
//       incorrectLettersGuessed: prev.incorrectLettersGuessed + 1,
//     }));
//   }

//   function restartGame() {
//     updateGameStatus((prev) => ({
//       round: 1,
//       score: 0,
//       currWord: gameData[0],
//       gameEnd: false,
//       roundTime: 10 + gameData[0].difficulty * 5,
//       wordGuessed: false,
//     }));
//   }

//   function restartRound() {
//     updateRoundStatus({
//       incorrectLettersGuessed: 0,
//     });
//   }

//   // Called when a power up button is clicked
//   function powerupHandler(powerup) {
//     // Powerups can only be used once per round
//     if (!powerup.hasActivated) {
//       powerup.quantity -= 1;
//       powerup.hasActivated = true;

//       if (powerup.name == 'Add Time') {
//         updateActivePowerup('Add Time');
//       } else if (powerup.name == 'Reveal Letter') {
//         updateActivePowerup('Reveal Letter');
//       }
//     }
//   }

//   // Called after a powerup has been used
//   function powerupOnConsume() {
//     updateActivePowerup('none');
//   }

//   return (
//     <div className="game">
//       { !loading
//                 && (
//                 <GameHeader
//                   score={gameStatus.score}
//                   round={gameStatus.round}
//                   maxRound={numRounds}
//                   name={user}
//                 />
//                 )}
//       {
//                 !loading
//                 && gameStatus.gameEnd
//                 && (
//                 <GameOver
//                   score={gameStatus.score}
//                   restartGame={restartGame}
//                 />
//                 )
//             }
//       { !loading
//                 && !gameStatus.gameEnd
//                 && (
//                 <div className="gameContainer">
//                   <PowerupButton
//                     powerups={inventory}
//                     powerupHandler={powerupHandler}
//                     activePowerup={activePowerup}
//                   />
//                   <Timer
//                     initialTime={gameStatus.roundTime}
//                     wordGuessed={gameStatus.wordGuessed}
//                     onEnd={roundEnd}
//                     timePenalty={2}
//                     incorrectLettersGuessed={roundStatus.incorrectLettersGuessed}
//                     activePowerup={activePowerup}
//                     powerupOnConsume={powerupOnConsume}
//                   />
//                   <CoreGame
//                     wordData={gameStatus.currWord}
//                     roundEnd={wordGuessed}
//                     incorrectLetterGuessed={incorrectLetterGuessed}
//                     roundNum={gameStatus.round}
//                     activePowerup={activePowerup}
//                     powerupOnConsume={powerupOnConsume}
//                   />
//                 </div>
//                 )}
//     </div>
//   );
// }

// export default GamePage;
