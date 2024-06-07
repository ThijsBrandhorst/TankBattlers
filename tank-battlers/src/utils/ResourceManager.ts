import { Texture, TextureLoader } from "three";
import { GLTF, GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

class ResourceManager{
    private static _instance = new ResourceManager();

    public static get instance(){
        return this._instance;
    }
    private constructor(){}

    //resource list
    private _groundTextures: Texture[] = [];
    private _models =  new Map<string, GLTF>();
    private _textures = new Map<string, Texture>();

    //methods acces game loaded resources
    public getModel(modelName: string): GLTF | undefined {
        return this._models.get(modelName);
    }

    public getTexture(textureName: string): Texture | undefined {
        return this._textures.get(textureName);
    }

    //load entry point
    public load = async () => {
        //create a unqie texture loader
        const textureLoader = new TextureLoader();
        await this.loadGroundTextures(textureLoader);
        await this.loadTextures(textureLoader);
        await this.loadModels();
    }

    private loadModels = async() => {
        //instance a model loader
        const modelLoader = new GLTFLoader();
        const playerTank = await modelLoader.loadAsync("models/tank.glb");
        this._models.set("tank", playerTank);

    }

    private loadTextures = async(textureLoader: TextureLoader) => {
        //load game texttures
        //player tank
        const tankBodyTexture = await textureLoader.loadAsync("textures/tank-body.png");
        const tankTurretTexture = await textureLoader.loadAsync("textures/tank-turret.png");
            

        //add to the game resources
        this._textures.set("tank-body", tankBodyTexture);
        this._textures.set("tank-turret", tankTurretTexture);
    }

    //ground texture loading
    private loadGroundTextures = async (textureLoader: TextureLoader) => {
        const groundTexturesFiles = [
            "g1.png",
            "g2.png",
            "g3.png",
            "g4.png",
            "g5.png",
            "g6.png",
            "g7.png",
            "g8.png"
        ];

        //load the texutures
        for(let index = 0; index < groundTexturesFiles.length; index++){
            const element = groundTexturesFiles[index];
            const texture = await textureLoader.loadAsync(`textures/${element}`);
            this._groundTextures.push(texture);
        }

    }

    public getRandomGroundTexture = () => {
        return this._groundTextures[
            Math.floor(Math.random() * this._groundTextures.length)
        ];
    }
}

export default ResourceManager