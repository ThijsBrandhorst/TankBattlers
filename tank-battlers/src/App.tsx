import React, { useEffect } from 'react';
import './App.css';
import GameScene from './scene/GameScene';

function App() {
  useEffect(() => {
    // Ensure GameScene is instantiated only after the component has mounted
    const gameSceneInstance = GameScene.instance;
    gameSceneInstance.load();
    gameSceneInstance.render();
  }, []);

  return (
    <div className="App">
      <div id="threejs-container"></div>
    </div>
  );
}

export default App;