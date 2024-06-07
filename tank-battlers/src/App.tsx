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
      <div id="threejs-container"></div>
    </div>
  );
}

export default App;
