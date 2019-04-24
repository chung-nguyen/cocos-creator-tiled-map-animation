const { ccclass, property } = cc._decorator;

@ccclass
export default class TiledMapExt extends cc.TiledMap {
  public tileAnimationTime: number;

  private tilesets: any;
  private tileAnimations: any;

  constructor () {
    super();

    this.tilesets = null;
    this.tileAnimations = null;
    this.tileAnimationTime = 0;
  }

  public update (dt: number) {
    if (!this.tileAnimations) {
      return;
    }

    this.tileAnimationTime += dt;

    // get current animation frame of tilset at this time
    for (let key in this.tileAnimations) {
      const animation = this.tileAnimations[key];
      if (!animation) {
        continue;
      }

      const framesCount = animation.frames.length;

      let time = this.tileAnimationTime % animation.totalDuration;

      let curr = animation.frames[0];
      let frame = 0;
      while (time > 0 && frame < framesCount) {
        time -= curr.duration;
        frame = (frame + 1) % framesCount;
        curr = animation.frames[frame];
      }

      animation.currentFrame = curr;
    }

    // rebuild the tilesets
    const tilesets = this.tilesets;
    if (!tilesets) {
      return;
    }

    const layers = this.getLayers();
    for (let i = 0; i < layers.length; ++i) {
      const layer = layers[i];

      for (let j = 0, l = tilesets.length; j < l; ++j) {
        let tilesetInfo = tilesets[j];

        (layer as any)._fillTextureGrids(tilesetInfo, j);
      }
    }
  }

  public getAnimationForGID (gid: number): void {
    return this.tileAnimations[gid];
  }

  _applyFile () {
    let file = (this as any)._tmxFile;
    if (file) {
      let texValues = file.textures;
      let texKeys = file.textureNames;
      let textures = {};
      for (let i = 0; i < texValues.length; ++i) {
        textures[texKeys[i]] = texValues[i];
      }

      let tsxFileNames = file.tsxFileNames;
      let tsxFiles = file.tsxFiles;
      let tsxMap = {};
      for (let i = 0; i < tsxFileNames.length; ++i) {
        if (tsxFileNames[i].length > 0) {
          tsxMap[tsxFileNames[i]] = tsxFiles[i].text;
        }
      }

      let mapInfo: any = new cc.TMXMapInfoExt(this, file.tmxXmlStr, tsxMap, textures);

      this.tilesets = mapInfo.getTilesets();
      this.tileAnimations = mapInfo.getTileAnimations();

      (this as any)._buildWithMapInfo(mapInfo);
    } else {
      (this as any)._relseasMapInfo();
    }
  }
}
