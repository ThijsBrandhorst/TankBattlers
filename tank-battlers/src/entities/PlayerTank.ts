import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";

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
    super(position);

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

  private handleKeyUp = (e: KeyboardEvent) => {
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
      default:
        break;
    }
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
    this._mesh.position.add(computedMovement);
  };
}

export default playerTank;
