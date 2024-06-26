import { BoxGeometry, Mesh, MeshStandardMaterial, Box3 } from "three";
import GameEntity from "../entities/GameEntity";
import ResourceManager from "../utils/ResourceManager";

class Wall extends GameEntity{

    public load = async () => {
        const geometry = new BoxGeometry(1, 1, 1);
        const material = new MeshStandardMaterial({
            map: ResourceManager.instance.getTexture("wall"),
        });
        this._mesh = new Mesh(geometry, material);

        this._mesh.position.set(
            this._position.x,
            this._position.y,
            this._position.z
        )

        //wall collider
        this._collider = new Box3().setFromObject(this._mesh);

    };
}

export default Wall;