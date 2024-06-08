import { Box3, Mesh, Sphere, Vector3 } from "three";

type EntityType = "general" | "player" | "bullet" | "enemy";  

abstract class GameEntity {
    protected _position: Vector3;
    protected _mesh: Mesh = new Mesh();

    public get mesh(){
        return this._mesh;
    }

    protected _collider?: Box3 | Sphere;
    public get collider(){
        return this._collider;
    }

    protected _EntityType: EntityType = "general";
    public get EntityType(){
        return this._EntityType;
    }

    protected _shouldDispose = false;
    public get shouldDispose(){
        return this._shouldDispose;
    }

    constructor(position: Vector3, entityType: EntityType = "general") {
        this._position = position;
        this._mesh.position.set(
            this._position.x,
            this._position.y,
            this._position.z
        )
        this._EntityType = entityType;
    }

    public load = async () => {};
    public update = (deltaT: number) => {};

    public dispose = () => {};
}
export default GameEntity;