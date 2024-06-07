import { Mesh, MeshStandardMaterial, Vector3 } from "three";
import GameEntity from "./GameEntity";
import ResourceManager from "../utils/ResourceManager";

class playerTank extends GameEntity {
    constructor(position: Vector3){
        super(position)
    }

    public load = async () => {
        //ask the models and textures to resource manager
        const tankModel = ResourceManager.instance.getModel("tank");
        if(!tankModel){
            throw new Error("tank model not found");
        }
        //the model contains the meshes for the scene
        const tankBodyMesh = tankModel.scene.children.find((m) => m.name === "Body") as Mesh;
        const tankTurretMesh = tankModel.scene.children.find((m) => m.name === "Turret") as Mesh;

        const tankBodyTexture = ResourceManager.instance.getTexture("tank-body");
        const tankTurretTexture = ResourceManager.instance.getTexture("tank-turret");

        if(!tankBodyTexture || !tankTurretTexture || !tankBodyMesh || !tankTurretMesh){
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
}

export default playerTank