import { Texture, TextureLoader } from "three";

class ResourceManager{
    private static _instance = new ResourceManager();

    public static get instance(){
        return this._instance;
    }
    private constructor(){}

    //resource list
    private _groundTextures: Texture[] = [];

    //load entry point
    public load = async () => {
        //create a unqie texture loader
        const textureLoader = new TextureLoader();
        await this.loadGroundTextures(textureLoader);
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