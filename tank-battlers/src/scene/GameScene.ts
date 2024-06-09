import {
  PerspectiveCamera,
  WebGLRenderer,
  Scene,
  Vector3,
  HemisphereLight,
  Clock,
} from "three";
import GameEntity from "../entities/GameEntity";
import GameMap from "../map/GameMap";
import ResourceManager from "../utils/ResourceManager";
import PlayerTank from "../entities/PlayerTank";
import Wall from "../map/Wall";
import EnemyTank from "../entities/EnemyTank";
import PlayerTank2 from "../entities/PlayerTank2";

class GameScene {
  private static _instance: GameScene;
  public static get instance() {
    if (!this._instance) {
      this._instance = new GameScene();
    }
    return this._instance;
  }
  private _width: number;
  private _height: number;
  private _renderer: WebGLRenderer;
  private _camera: PerspectiveCamera;

  //Three.js scene
  private readonly _scene = new Scene();

  // Game entities
  private _gameEntities: GameEntity[] = [];

  private _mapSize = 15;

  private _clock:Clock = new Clock();

  public get camera(){
    return this._camera;
  }

  public get gameEntities(){
    return this._gameEntities;
  }

  private constructor() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(this._width, this._height);

    const targetElement =
      document.querySelector<HTMLElement>("#threejs-container");
    if (!targetElement) {
      throw new Error("target element not found");
    }
    targetElement.appendChild(this._renderer.domElement);

    const aspectRatio = this._width / this._height;
    this._camera = new PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    this._camera.position.set(7, 7, 15);

    //Size change
    window.addEventListener("resize", this.resize, false);

    //add the map
    const gameMap = new GameMap(new Vector3(0, 0, 0), this._mapSize);
    this._gameEntities.push(gameMap);

    //add the player tank
    const playerTank = new PlayerTank(new Vector3(7, 7, 0));
    this._gameEntities.push(playerTank);

    //add player tank 2
    const playerTank2 = new PlayerTank2(new Vector3(8, 8, 0));
    this._gameEntities.push(playerTank2);

    const enemyTank = new EnemyTank(new Vector3(3, 3, 0));
    this._gameEntities.push(enemyTank);

    this.createWalls();
  }

  //creating walls
  private createWalls = () => {
    const edge = this._mapSize;


    //boundary walls
    this._gameEntities.push(new Wall(new Vector3(0, 0, 0)));
    this._gameEntities.push(new Wall(new Vector3(edge, 0, 0)));
    this._gameEntities.push(new Wall(new Vector3(edge, edge, 0)));
    this._gameEntities.push(new Wall(new Vector3(0, edge, 0)));

    for(let i = 1; i < edge; i++){
      this._gameEntities.push(new Wall(new Vector3(i, 0, 0)));
      this._gameEntities.push(new Wall(new Vector3(0, i, 0)));
      this._gameEntities.push(new Wall(new Vector3(edge, i, 0)));
      this._gameEntities.push(new Wall(new Vector3(i, edge, 0)));
    }

      //random walls
    // const numWalls = Math.floor((edge * edge) / 12);
    // for (let i = 0; i < numWalls; i++) {
    //     const x = Math.floor(Math.random() * edge);
    //     const y = Math.floor(Math.random() * edge);

    //     if ((x === 0 && y === 0) || (x === edge && y === edge)) {
    //         continue;
    //     }

    //     this._gameEntities.push(new Wall(new Vector3(x, y, 0)));
    // }
  };

  private resize = () => {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._renderer.setSize(this._width, this._height);
    this._camera.aspect = this._width / this._height;
    this._camera.updateProjectionMatrix();
  };

  public load = async () => {
    //Load game resources
    await ResourceManager.instance.load();

    //Load game entities
    for (let index = 0; index < this._gameEntities.length; index++) {
      const element = this._gameEntities[index];
      await element.load();
      this._scene.add(element.mesh);
    }

    //Add light
    const light = new HemisphereLight(0xffffbb, 0x080820, 1);
    this._scene.add(light);
  };

  public render = () => {
    requestAnimationFrame(this.render);
 
    this.disposeEntities();

    const deltaT = this._clock.getDelta();

    for(let index = 0; index < this._gameEntities.length; index++){
      const element = this._gameEntities[index];
      element.update(deltaT);
    }
    this._renderer.render(this._scene, this._camera);
  };

  //Add entities
  public addToScene = (entity: GameEntity) => {
    this._gameEntities.push(entity);
    this._scene.add(entity.mesh);
  }

  //remove entities when not needed
  private disposeEntities = () => {
    const entitiesToBeDisposed = this._gameEntities.filter((e) => e.shouldDispose);
    entitiesToBeDisposed.forEach((element) => {
      this._scene.remove(element.mesh);
      element.dispose();
    });
    //update entity arraay
    this._gameEntities = [ ...this._gameEntities.filter((e) => !e.shouldDispose) ];
  };
}

export default GameScene;
