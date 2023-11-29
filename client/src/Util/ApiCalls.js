import { GAME_MODES } from './GameModes';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function fetchWords(count) {
  let words;
  try {
    const response = await fetch(`${API_URL}/words?count=${count}`);
    const result = await response.json();
    words = result;
  } catch (error) {
    console.log(error);
  }
  return words;
}

async function postScore(userId, score) {
  const payload = {
    score,
    userID: userId,
    gameMode: GAME_MODES.Solo, // TODO: update to reflect game mode
  };

  console.log(payload);

  await fetch(`${API_URL}/scores`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export {
  fetchWords,
  postScore,
};
