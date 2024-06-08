import { DodecahedronGeometry, Material, Mesh, MeshPhongMaterial, Vector3 } from "three";
import GameEntity from "../entities/GameEntity";
import { randomIntRange, randomSign } from "../utils/MathUtils";

class ExplosionEffect extends GameEntity{

    private _size: number;
    private _effectDuration = 0.5;
    private _currentDuration: number;
    private _fireMesh: Mesh = new Mesh();

    constructor(position: Vector3, size: number) {
        super(position);
        this._size = size;
        this._currentDuration = this._effectDuration;
    }

    public load = async () => {
        const particalGeometry = new DodecahedronGeometry(this._size, 0);
        const totalParticals = randomIntRange(7,13);
        const fireMaterial = new MeshPhongMaterial({ color: 0xff4500 });

        for(let i = 0; i < totalParticals; i++){
            //random angle
            const particalAngle = Math.random() * Math.PI * 2;
            const fireGeometry = particalGeometry.clone();
            const particalSize = 0.7 * this._size * Math.random() * this._size * 0.4 * randomSign();

            fireGeometry.scale(particalSize, particalSize, particalSize);
            fireGeometry.rotateX(Math.random() * Math.PI);
            fireGeometry.rotateY(Math.random() * Math.PI);
            fireGeometry.rotateZ(Math.random() * Math.PI);


            const firePartical = new Mesh(fireGeometry, fireMaterial);
            firePartical.userData = {
                angle: particalAngle,
                speed: 0.5 + Math.random() * 2.5
            };

            this._fireMesh.add(firePartical);
        }
        this._mesh.add(this._fireMesh);

    };

    public update = (deltaT: number) => {
        this._currentDuration -= deltaT;
        if(this._currentDuration <= 0){
            this._shouldDispose = true;
            return;
        }

        const scale = this._currentDuration / this._effectDuration;
        this._fireMesh.children.forEach((element) => {
            const firePartical = element as Mesh;
            const angle = firePartical.userData["angle"];
            const speed = firePartical.userData["speed"];

            const computedMovement = new Vector3(
                speed * Math.sin(angle) * deltaT,
                -speed * Math.cos(angle) * deltaT,
                0
            );
            firePartical.scale.set(scale, scale, scale);
            firePartical.position.add(computedMovement);
        });
    };

    public dispose = () => {
        this._fireMesh.children.forEach((element) => {
            const firePartical = element as Mesh;
            (firePartical.material as Material).dispose();
            firePartical.geometry.dispose();
            this._fireMesh.remove(firePartical);
        });
        this._mesh.remove(this._fireMesh);
    };

}

export default ExplosionEffect;