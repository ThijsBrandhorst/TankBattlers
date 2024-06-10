import { Box3, Material, Mesh, MeshPhongMaterial, Sphere, SphereGeometry, Vector3 } from "three";
import GameEntity from "./GameEntity";
import GameScene from "../scene/GameScene";
import ExplosionEffect from "../effects/ExplosionEffect";
import playerTank from "./PlayerTank";
import PlayerTank2 from "./PlayerTank2";

class Bullet extends GameEntity{

    private _angle: number;

    constructor(position: Vector3, angle: number){
        super(position, "bullet");
        this._angle = angle;
    }

    public load = async () => {
        const bulletGeometry = new SphereGeometry(0.085);
        const bulletMaterial = new MeshPhongMaterial({ color: 0x262626  });

        this._mesh = new Mesh(bulletGeometry, bulletMaterial);
        this._mesh.position.set(
            this._position.x,
            this._position.y,
            this._position.z
        );

        this._collider = new Box3()
        .setFromObject(this._mesh)
        .getBoundingSphere(new Sphere(this._mesh.position));

    };

    public update = (deltaT: number) => {
        const travelSpeed = 9;
        const computedMovement = new Vector3(
            travelSpeed * Math.sin(this._angle) * deltaT,
            -travelSpeed * Math.cos(this._angle) * deltaT,
            0
        );
        //move the bullet
        this._mesh.position.add(computedMovement);

        //collision detection
        const colliders = GameScene.instance.gameEntities.filter(
            (c) =>
            c.collider &&
            c !== this &&
            c.collider.intersectsSphere(this._collider as Sphere)
        );



        //when there is a collision the bullet removes
        if(colliders.length){
            this._shouldDispose = true;

            //explode
            const explosion = new ExplosionEffect(this._mesh.position, 1);
            explosion.load().then(() => {
                GameScene.instance.addToScene(explosion);
            });

            //PLAYERS IN THE COLLIDERS!?!!??!?!?!?!??!?!?!??!?!?!
            const player1 = colliders.filter((c) => c.EntityType === "player");
            const player2 = colliders.filter((c) => c.EntityType === "player2");

            if(player1.length){
                (player1[0] as playerTank).damage(20);
            }

            if(player2.length){
                (player2[0] as PlayerTank2).damage(20);
            }

        }
    };

    public dispose = () => {
        (this._mesh.material as Material).dispose();
        this._mesh.geometry.dispose();
    };
}

export default Bullet;