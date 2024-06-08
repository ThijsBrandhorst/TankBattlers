import { Box3, Mesh, MeshStandardMaterial, Sphere, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";
import GameScene from "../scene/GameScene";
import Bullet from "./Bullet";
import ShootEffect from "../effects/ShootEffect";

type keyboardState = {
  LeftPressed: boolean;
  RightPressed: boolean;
  UpPressed: boolean;
  DownPressed: boolean;
};

class playerTank extends GameEntity {
    private _rotation: number = 0;

  private _keyboardState: keyboardState = {
    LeftPressed: false,
    RightPressed: false,
    UpPressed: false,
    DownPressed: false,
  };

  constructor(position: Vector3) {
    super(position, "player");

    window.addEventListener("keydown", this.handleKeyDown);
    window.addEventListener("keyup", this.handleKeyUp);
  }

  //Handle key presses
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
    const offset = new Vector3(
      Math.sin(this._rotation) * 0.45,
      -Math.cos(this._rotation) * 0.45,
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
    //the model contains the meshes for the scene
    const tankBodyMesh = tankModel.scene.children.find(
      (m) => m.name === "Body"
    ) as Mesh;
    const tankTurretMesh = tankModel.scene.children.find(
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
    const collider = new Box3().setFromObject(this._mesh).getBoundingSphere(new Sphere(this._mesh.position.clone()));

    //reduce the size of collider 
    collider.radius *= 0.75;
    this._collider = collider;
  };

  public update = (deltaT: number) => {
    let computedRotation = this._rotation;
    let computedMovement = new Vector3();
    const moveSpeed = 2; //tiles per second


    if(this._keyboardState.LeftPressed){
        computedRotation += Math.PI * deltaT;
    }else if(this._keyboardState.RightPressed){
        computedRotation -= Math.PI * deltaT;
    }
    const fullCircle = Math.PI * 2;
    if(computedRotation > fullCircle){
        computedRotation = fullCircle - computedRotation;
    }else if(computedRotation < 0){
        computedRotation = fullCircle + computedRotation;
    }

    //rotation
    const yMovement = moveSpeed * deltaT * Math.cos(computedRotation);
    const xMovement = moveSpeed * deltaT * Math.sin(computedRotation);

    if (this._keyboardState.UpPressed) {
      computedMovement = new Vector3(xMovement, -yMovement, 0);
    }else if(this._keyboardState.DownPressed){
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
            e !== this && e.EntityType !== "bullet" && e.collider && e.collider!.intersectsSphere(testingSphere)
    );

    //smth is blocking the tank
    if(colliders.length){
        return;
    }

    //update position
    this._mesh.position.add(computedMovement);
    (this._collider as Sphere).center.add(computedMovement);

    GameScene.instance.camera.position.set(
        this._mesh.position.x,
        this._mesh.position.y,
        GameScene.instance.camera.position.z
    );
  };
}

export default playerTank;
