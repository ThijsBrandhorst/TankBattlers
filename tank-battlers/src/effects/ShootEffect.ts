import { DodecahedronGeometry, Mesh, MeshPhongMaterial, Vector3 } from "three";
import GameEntity from "../entities/GameEntity";
import { randomIntRange, randomSign } from "../utils/MathUtils";

class ShootEffect extends GameEntity {
  private _angle: number;
  private _fire = new Mesh();
  private _smoke = new Mesh();
  private _size = 0.1;
  private _effectDuration = 1; //seconds

  constructor(position: Vector3, angle: number) {
    super(position);
    this._angle = angle;
  }

  public load = async () => {
    const particalGeometry = new DodecahedronGeometry(this._size, 0);

    //Materials for each partical
    const smokeMaterial = new MeshPhongMaterial({
      color: 0xfafafa,
      transparent: true,
    });

    const fireMaterial = new MeshPhongMaterial({
      color: 0xff4500,
    });

    //random amount particals
    const totalParticals = randomIntRange(4, 9);
    for (let i = 0; i < totalParticals; i++) {
      //random angleOffset for each partical
      const angleOffset = Math.PI * 0.08 * Math.random() * randomSign();

      //random speed
      const particalSpeed = 1.75 * Math.random() * 3;

      //building partical
      const firePartical = new Mesh(particalGeometry, fireMaterial);

      firePartical.userData = {
        angle: this._angle + angleOffset,
        speed: particalSpeed,
      };
      this._fire.add(firePartical);

      //smoke partical
      const smokePositionOffset = new Vector3(
        Math.random() * this._size * randomSign(),
        Math.random() * this._size * randomSign(),
        Math.random() * this._size * randomSign()
      );

      const smokePartical = new Mesh(particalGeometry, smokeMaterial);
      smokePartical.position.add(smokePositionOffset);
      this._smoke.add(smokePartical);
    }

    this._mesh.add(this._fire);
    this._mesh.add(this._smoke);
  };

  public update = (deltaT: number) => {
    //update duration
    this._effectDuration -= deltaT;
    if (this._effectDuration <= 0) {
      this._shouldDispose = true;
      return;
    }

    this._fire.children.forEach((element) => {
      const firePartical = element as Mesh;
      const angle = firePartical.userData["angle"];
      const speed = firePartical.userData["speed"];

      //movement
      const computedMovement = new Vector3(
        speed * Math.sin(angle) * deltaT * this._effectDuration * 0.75,
        -speed * Math.cos(angle) * deltaT * this._effectDuration * 0.75
      );
      firePartical.position.add(computedMovement);

      //update size
      firePartical.scale.set(
        (firePartical.scale.x = this._effectDuration),
        (firePartical.scale.y = this._effectDuration),
        (firePartical.scale.z = this._effectDuration)
      );
    });

    this._smoke.children.forEach((element) => {
        const smokePartical = element as Mesh;
        (smokePartical.material as MeshPhongMaterial).opacity = this._effectDuration;
        smokePartical.position.add(new Vector3(0, 0, 3 * deltaT));
    });
  };

  public dispose = () => {
    this._fire.children.forEach(element => {
        (element as Mesh).geometry.dispose();
        ((element as Mesh).material as MeshPhongMaterial).dispose();
        this._fire.remove(element);
    });

    this._mesh.remove(this._fire);


    this._smoke.children.forEach(element => {
        (element as Mesh).geometry.dispose();
        ((element as Mesh).material as MeshPhongMaterial).dispose();
        this._smoke.remove(element);
    });

    this._mesh.remove(this._smoke);
  };
}


export default ShootEffect;