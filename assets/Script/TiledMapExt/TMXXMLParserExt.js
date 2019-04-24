cc.TMXTilesetInfoExt = function (tiledmap, info) {
  cc.TMXTilesetInfo.call(this);

  for (let key in info) {
    if (info.hasOwnProperty(key)) {
      this[key] = info[key];
    }
  }

  this._tiledmap = tiledmap;
  this._cachedRect = {};
};

cc.TMXTilesetInfoExt.prototype = Object.create(cc.TMXTilesetInfo.prototype);

cc.TMXTilesetInfoExt.prototype.rectForGID = function (gid, result) {
  const animations = this._tiledmap.getAnimationForGID(gid);
  if (animations) {
    gid = animations.currentFrame.gid;
  } else {
    const cachedRect = this._cachedRect[gid];
    if (cachedRect) {
      result.x = cachedRect.x;
      result.y = cachedRect.y;
      result.width = cachedRect.width;
      result.height = cachedRect.height;
      return result;
    }
  }

  const rect = cc.TMXTilesetInfo.prototype.rectForGID.call(this, gid, result);
  this._cachedRect[gid] = rect;
  return rect;
};

cc.TMXMapInfoExt = function (tiledmap, tmxFile, tsxMap, textures) {
  this._tileAnimations = {};
  this._tiledmap = tiledmap;

  cc.TMXMapInfo.call(this, tmxFile, tsxMap, textures);
};

cc.TMXMapInfoExt.prototype = Object.create(cc.TMXMapInfo.prototype);

cc.TMXMapInfoExt.prototype.parseXMLString = function (xmlStr, tilesetFirstGid) {
  cc.TMXMapInfo.prototype.parseXMLString.call(this, xmlStr, tilesetFirstGid);

  // Extension for tile animation

  // clone original tileset info map into extensions
  for (let i = 0; i < this._tilesets.length; ++i) {
    const tileset = this._tilesets[i];
    const ext = new cc.TMXTilesetInfoExt(this._tiledmap, tileset);
    this._tilesets[i] = ext;
  }

  let mapXML = this._parser._parseXML(xmlStr);
  let i, j;

  // PARSE <map>
  let map = mapXML.documentElement;

  // PARSE <tileset>
  let tilesets = map.getElementsByTagName('tileset');
  if (map.nodeName !== 'map') {
    tilesets = [];
    tilesets.push(map);
  }

  for (i = 0; i < tilesets.length; i++) {
    let selTileset = tilesets[i];

    // If this is an external tileset then start parsing that
    let tsxName = selTileset.getAttribute('source');

    if (!tsxName) {
      const tileset = this._tilesets[i];
      const firstGid = parseInt(tileset.firstGid);

      // PARSE  <tile>
      let tiles = selTileset.getElementsByTagName('tile');
      if (tiles) {
        for (let tIdx = 0; tIdx < tiles.length; tIdx++) {
          let t = tiles[tIdx];

          const gid = firstGid + parseInt(t.getAttribute('id') || 0);
          this._tileAnimations[gid] = this.getAnimationData(t, firstGid);
        }
      }
    }
  }
};

cc.TMXMapInfoExt.prototype.getAnimationData = function (node, firstGid, list) {
  const animation = node.getElementsByTagName('animation')[0];
  if (!animation) {
    return null;
  }

  let sum = 0;
  list = list || [];

  const frames = animation.getElementsByTagName('frame');
  if (frames.length === 0) {
    return null;
  }

  for (let i = 0; i < frames.length; ++i) {
    const frame = frames[i];
    const duration = parseInt(frame.getAttribute('duration')) * 0.001;
    list.push({
      duration,
      gid: firstGid + parseInt(frame.getAttribute('tileid'))
    });

    sum += duration;
  }

  return {
    frames: list,
    totalDuration: sum,
    currentFrame: frames[0]
  };
};

cc.TMXMapInfoExt.prototype.getTileAnimations = function () {
  return this._tileAnimations;
};
