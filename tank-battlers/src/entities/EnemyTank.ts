import {
  Box3,
  Material,
  Mesh,
  MeshStandardMaterial,
  Sphere,
  Vector3,
} from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";
import GameScene from "../scene/GameScene";
import ExplosionEffect from "../effects/ExplosionEffect";

class EnemyTank extends GameEntity {
  private _life = 100;
  private _rotation: number;
  private _moveSpeed = 1;

  constructor(position: Vector3) {
    super(position, "enemy");

    //random starting rotation
    this._rotation = Math.floor(Math.random() * Math.PI * 2);
  }

  public load = async () => {
    const tankModel = ResourceManager.instance.getModel("tank");
    if (!tankModel) {
      throw "unable to get tank model";
    }

    const tankSceneData = tankModel.scene.clone();

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
      !tankBodyMesh ||
      !tankTurretMesh ||
      !tankBodyTexture ||
      !tankTurretTexture
    ) {
      throw "unable to load player model or textures";
    }

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

    //create the collider for the tank
    const collider = new Box3()
      .setFromObject(this._mesh)
      .getBoundingSphere(new Sphere(this._mesh.position.clone()));


    collider.radius *= 0.75;
    this._collider = collider;
  };

  public update = (deltaT: number) => {
    const computedMovement = new Vector3(
      this._moveSpeed * deltaT * Math.sin(this._rotation),
      -this._moveSpeed * deltaT * Math.cos(this._rotation),
      0
    );

    //testing collider
    const testingSphere = new Sphere(
      (this._collider as Sphere).clone().center,
      (this._collider as Sphere).clone().radius
    );
    testingSphere.center.add(computedMovement);

    //check for valid colliders
    const colliders = GameScene.instance.gameEntities.filter(
      (c) =>
        c !== this &&
        c.collider &&
        c.collider!.intersectsSphere(testingSphere) &&
        c.EntityType !== "bullet"
    );

    if (colliders.length) {
      //pick a new rotation
      this._rotation = Math.floor(Math.random() * Math.PI * 2);
      return;
    }

    this._mesh.position.add(computedMovement);
    (this._collider as Sphere).center.add(computedMovement);
    this._mesh.setRotationFromAxisAngle(new Vector3(0, 0, 1), this._rotation);
  };

  public damage = (amount: number) => {
    this._life -= amount;
    if (this._life <= 0) {
      this._shouldDispose = true;
      const explosion = new ExplosionEffect(this._mesh.position, 2);
      explosion.load().then(() => {
        GameScene.instance.addToScene(explosion);
      });
    }
  };

  public dispose = () => {
    this._mesh.children.forEach((c) => {
      (c as Mesh).geometry.dispose();
      ((c as Mesh).material as Material).dispose();
      this._mesh.remove(c);
    });
  };

}

export default EnemyTank;