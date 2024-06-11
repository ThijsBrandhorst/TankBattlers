import {
  Audio,
  Box3,
  Mesh,
  MeshStandardMaterial,
  Sphere,
  Vector3,
  AudioListener,
  AudioLoader,
} from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";
import GameScene from "../scene/GameScene";
import Bullet from "./Bullet";
import ShootEffect from "../effects/ShootEffect";
import ExplosionEffect from "../effects/ExplosionEffect";

type keyboardState = {
  LeftPressed: boolean;
  RightPressed: boolean;
  UpPressed: boolean;
  DownPressed: boolean;
};

class playerTank extends GameEntity {
  private _rotation: number = 0;
  private _health: number = 100;
  private moveSpeed = 2;
  private _shootCooldown = 2500;
  private _lastShoot: number = 0;
  private ammo = 7;

  private _shootingSound: Audio;
  private _explodingSound: Audio;
  private _shootReady : Audio;
  private _audioListener: AudioListener;

  private _keyboardState: keyboardState = {
    LeftPressed: false,
    RightPressed: false,
    UpPressed: false,
    DownPressed: false,
  };

  constructor(position: Vector3) {
    super(position, "player");

    this._audioListener = new AudioListener();
    //SOUNDS
    this._shootingSound = new Audio(this._audioListener);
    this._explodingSound = new Audio(this._audioListener);
    this._shootReady = new Audio(this._audioListener);

  

    const shootingAudio = new AudioLoader();
    shootingAudio.load('audio/shooting.mp3', (buffer) => {
      this._shootingSound.setBuffer(buffer);
      this._shootingSound.setVolume(1);
    });

    const explodingAudio = new AudioLoader();
    explodingAudio.load('audio/death-explosion.mp3', (buffer) => {
      this._explodingSound.setBuffer(buffer);
      this._explodingSound.setVolume(2.5);
    });

    const readyAudio = new AudioLoader();
    readyAudio.load('audio/shoot-ready.mp3', (buffer) => {
      this._shootReady.setBuffer(buffer);
      this._shootReady.setVolume(0.5);
    });


    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  //handle key presses
  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "a":
        this._keyboardState.LeftPressed = true;
        break;
      case "d":
        this._keyboardState.RightPressed = true;
        break;
      case "w":
        this._keyboardState.UpPressed = true;
        break;
      case "s":
        this._keyboardState.DownPressed = true;
        break;
      case "r":
        this.ammo = 7;
        this.updateUI();
        break;
      default:
        break;
    }
  };

  private handleKeyUp = async (e: KeyboardEvent) => {
    switch (e.key) {
      case "a":
        this._keyboardState.LeftPressed = false;
        break;
      case "d":
        this._keyboardState.RightPressed = false;
        break;
      case "w":
        this._keyboardState.UpPressed = false;
        break;
      case "s":
        this._keyboardState.DownPressed = false;
        break;
      case " ": //shooting
        await this.shoot();
        break;
      default:
        break;
    }
  };

  private shoot = async () => {
    const now = performance.now();
    if (now - this._lastShoot < this._shootCooldown) {
      return;
    }
    this._shootReady.play();
    this._lastShoot = now;

    if (this.ammo <= 0) {
      return;
    }
    this.ammo--;

    this.updateUI();

    this._shootingSound.play();

    const offset = new Vector3(
      Math.sin(this._rotation) * 0.7,
      -Math.cos(this._rotation) * 0.7,
      0.5
    );
    const shootingPosition = this._mesh.position.clone().add(offset);

    //create and load bullet
    const bullet = new Bullet(shootingPosition, this._rotation);
    await bullet.load();

    //partical effect
    const shootEffect = new ShootEffect(shootingPosition, this._rotation);
    await shootEffect.load();

    GameScene.instance.addToScene(shootEffect);
    GameScene.instance.addToScene(bullet);
  };

  public load = async () => {
    //ask the models and textures to resource manager
    const tankModel = ResourceManager.instance.getModel("tank");
    if (!tankModel) {
      throw new Error("tank model not found");
    }

    //entities require a unique instance
    const tankSceneData = tankModel.scene.clone();

    //the model contains the meshes for the scene
    const tankBodyMesh = tankSceneData.children.find(
      (m) => m.name === "Body"
    ) as Mesh;
    const tankTurretMesh = tankSceneData.children.find(
      (m) => m.name === "Turret"
    ) as Mesh;

    const tankBodyTexture = ResourceManager.instance.getTexture("tank-body");
    const tankTurretTexture =
      ResourceManager.instance.getTexture("tank-turret");

    if (
      !tankBodyTexture ||
      !tankTurretTexture ||
      !tankBodyMesh ||
      !tankTurretMesh
    ) {
      throw new Error("tank textures or models not found");
    }

    //final mesh
    const bodyMaterial = new MeshStandardMaterial({
      map: tankBodyTexture,
    });

    const turretMaterial = new MeshStandardMaterial({
      map: tankTurretTexture,
    });

    tankBodyMesh.material = bodyMaterial;
    tankTurretMesh.material = turretMaterial;

    //add meshes as child of entity mesh
    this._mesh.add(tankBodyMesh);
    this._mesh.add(tankTurretMesh);

    //tank collider
    const collider = new Box3()
      .setFromObject(this._mesh)
      .getBoundingSphere(new Sphere(this._mesh.position.clone()));

    //reduce the size of collider
    collider.radius *= 0.55;
    this._collider = collider;
  };

  public update = (deltaT: number) => {
    let computedRotation = this._rotation;
    let computedMovement = new Vector3();
    const moveSpeed = this.moveSpeed; //tiles per second

    if (this._keyboardState.LeftPressed) {
      computedRotation += Math.PI * deltaT;
    } else if (this._keyboardState.RightPressed) {
      computedRotation -= Math.PI * deltaT;
    }
    const fullCircle = Math.PI * 2;
    if (computedRotation > fullCircle) {
      computedRotation = fullCircle - computedRotation;
    } else if (computedRotation < 0) {
      computedRotation = fullCircle + computedRotation;
    }

    //rotation
    const yMovement = moveSpeed * deltaT * Math.cos(computedRotation);
    const xMovement = moveSpeed * deltaT * Math.sin(computedRotation);

    if (this._keyboardState.UpPressed) {
      computedMovement = new Vector3(xMovement, -yMovement, 0);
    } else if (this._keyboardState.DownPressed) {
      computedMovement = new Vector3(-xMovement, yMovement, 0);
    }

    this._rotation = computedRotation;
    this._mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), computedRotation);

    //check for collisions before moving
    const testingSphere = this._collider?.clone() as Sphere;
    testingSphere.center.add(computedMovement);

    //search for collisions
    const colliders = GameScene.instance.gameEntities.filter(
      (e) =>
        e !== this &&
        e.EntityType !== "bullet" &&
        e.collider &&
        e.collider!.intersectsSphere(testingSphere)
    );

    //smth is blocking the tank
    if (colliders.length) {
      return;
    }

    //update position
    this._mesh.position.add(computedMovement);
    (this._collider as Sphere).center.add(computedMovement);
  };

  private updateUI = () => {
    document.getElementById('player1-health')!.innerText = this._health.toString();
    document.getElementById('player1-ammo')!.innerText = this.ammo.toString();
  }

  public damage = (amount: number) => {
    this._health -= amount;
    this.updateUI();
    if (this._health <= 0) {
      this._explodingSound.play();
      this._shouldDispose = true;
      const explosion = new ExplosionEffect(this._mesh.position, 2);
      explosion.load().then(() => {
        GameScene.instance.addToScene(explosion);
        this.respawn();
      });
    }
  };



  private respawn = async () => {
    window.removeEventListener("keydown", this.handleKeyDown);
    window.removeEventListener("keyup", this.handleKeyUp);

    //stop sounds!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    this._shootingSound.stop();
    this._shootingSound.buffer = null;

    //respawn countdown
    let countdown = 5;
    const countdownElement = document.getElementById("player1-respawn")!;
    const countdownText = document.getElementById("player1-countdown")!;
    countdownElement.style.display = "block";
    countdownText.innerText = countdown.toString();

    const updateCountdown = () => {
      countdown--;
      countdownText.innerText = countdown.toString();
      if (countdown > 0) {
        setTimeout(updateCountdown, 1000);
      } else {
        countdownElement.style.display = "none";
        proceedWithRespawn();
      }
    };
    updateCountdown();

    const proceedWithRespawn = async () => {
      const initialPosition = new Vector3(2, 18, 0);
      const newTank = new playerTank(initialPosition);
      await newTank.load();
      GameScene.instance.addToScene(newTank);
      newTank.updateUI();
    };
  };
}

export default playerTank;
