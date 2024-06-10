import { Box3, Mesh, MeshStandardMaterial, Sphere, Vector3 } from "three";
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

class PlayerTank2 extends GameEntity {
  private _rotation: number = 0;
  private _health: number = 100;
  private _shootCooldown = 1000;
  private _lastShoot: number = 0;

  private _keyboardState: keyboardState = {
    LeftPressed: false,
    RightPressed: false,
    UpPressed: false,
    DownPressed: false,
  };

  constructor(position: Vector3) {
    super(position, "player2");

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  //Handle key presses
  private handleKeyDown = (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        this._keyboardState.LeftPressed = true;
        break;
      case "ArrowRight":
        this._keyboardState.RightPressed = true;
        break;
      case "ArrowUp":
        this._keyboardState.UpPressed = true;
        break;
      case "ArrowDown":
        this._keyboardState.DownPressed = true;
        break;
      default:
        break;
    }
  };

  private handleKeyUp = async (e: KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        this._keyboardState.LeftPressed = false;
        break;
      case "ArrowRight":
        this._keyboardState.RightPressed = false;
        break;
      case "ArrowUp":
        this._keyboardState.UpPressed = false;
        break;
      case "ArrowDown":
        this._keyboardState.DownPressed = false;
        break;
      case "Enter": //shooting
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
    this._lastShoot = now;

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

    const tankBodyTexture =
      ResourceManager.instance.getTexture("tank-body-red");
    const tankTurretTexture =
      ResourceManager.instance.getTexture("tank-turret-red");

    if (
      !tankBodyTexture ||
      !tankTurretTexture ||
      !tankBodyMesh ||
      !tankTurretMesh
    ) {
      throw new Error("tank textures or models not found");
    }

    //Final mesh
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
    const moveSpeed = 2; //tiles per second

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

  public damage = (amount: number) => {
    this._health -= amount;
    if (this._health <= 0) {
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

    const countdownElement = document.createElement("div");
    countdownElement.style.position = "absolute";
    countdownElement.style.top = "20px";
    countdownElement.style.left = "20px";
    countdownElement.style.color = "white";
    countdownElement.style.fontSize = "24px";
    document.body.appendChild(countdownElement);

    let countdown = 5;

    const updateCountdown = () => {
      countdownElement.innerText = `Player 2 respawning in ${countdown}`;
      countdown--;

      if (countdown >= 0) {
        setTimeout(updateCountdown, 1000);
      } else {
        document.body.removeChild(countdownElement);
        proceedWithRespawn();
      }
    };

    updateCountdown();

    const proceedWithRespawn = async () => {
      const initialPosition = new Vector3(2, 18, 0);

      const newTank = new PlayerTank2(initialPosition);

      await newTank.load();
      GameScene.instance.addToScene(newTank);
    };
  };
}

export default PlayerTank2;
