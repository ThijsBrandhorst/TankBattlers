import React, { useEffect } from 'react';
import './App.css';
import GameScene from './scene/GameScene';

function App() {
  useEffect(() => {
    async function initializeGame() {
      const gameSceneInstance = GameScene.instance;
      await gameSceneInstance.load();
      gameSceneInstance.render();
    }

    initializeGame();
  }, []);

  return (
    <div className="App">
      <div id="threejs-container">
        <div id="ui-container">
          <div className="player-status" id="player1-status">
            <div id ="player1-name">Player 1</div>
            <div>Health: <span id="player1-health">100</span></div>
            <div>Ammo: <span id="player1-ammo">7</span></div>
            <div id="player1-respawn" style={{ display: 'none' }}>Respawning in <span id="player1-countdown"></span></div>
          </div>
          <div className="player-status" id="player2-status">
            <div id ="player2-name">Player 2</div>
            <div>Health: <span id="player2-health">100</span></div>
            <div>Ammo: <span id="player2-ammo">7</span></div>
            <div id="player2-respawn" style={{ display: 'none' }}>Respawning in <span id="player2-countdown"></span></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
