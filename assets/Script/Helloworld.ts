import TiledMapExt from "./TiledMapExt/TiledMapExt";

const {ccclass, property} = cc._decorator;

var temp = 0;

@ccclass
export default class Helloworld extends cc.Component {

    @property(cc.Label)
    label: cc.Label = null;

    @property
    text: string = 'hello';

    @property(cc.TiledMap)
    tilemap: TiledMapExt;

    start () {
        // init logic
        /*console.error(this.tilemap);

        const gid = this.tilemap.getLayer('Tile Layer 1').getTileGIDAt(cc.p(24, 30));
        console.error(gid);
        console.error(this.tilemap);*/
    }

    update (dt: number) {
      //this.tilemap.updateAnimation(dt);
    }
}
