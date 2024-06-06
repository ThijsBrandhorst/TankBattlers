import { PerspectiveCamera, WebGLRenderer, Scene, BoxGeometry, MeshBasicMaterial, Mesh } from "three";

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

  // Three.js scene
  private readonly _scene = new Scene();

  private constructor() {
    this._width = window.innerWidth;
    this._height = window.innerHeight;

    this._renderer = new WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(this._width, this._height);

    const targetElement = document.querySelector<HTMLElement>("#threejs-container");
    if (!targetElement) {
      throw new Error("target element not found");
    }
    targetElement.appendChild(this._renderer.domElement);

    const aspectRatio = this._width / this._height;
    this._camera = new PerspectiveCamera(45, aspectRatio, 0.1, 1000);
    this._camera.position.set(0, 0, 3);

    window.addEventListener("resize", this.resize, false);
  }

  private resize = () => {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._renderer.setSize(this._width, this._height);
    this._camera.aspect = this._width / this._height;
    this._camera.updateProjectionMatrix();
  }

  public load = () => {
    const geometry = new BoxGeometry(1, 1, 1);
    const material = new MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new Mesh(geometry, material);

    this._scene.add(cube);
  };

  public render = () => {
    requestAnimationFrame(this.render);
    this._renderer.render(this._scene, this._camera);
  };
}

export default GameScene;
