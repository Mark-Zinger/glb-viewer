import {LoaderUtils, LoadingManager, REVISION} from 'three';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import {GLTF, GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";


/**
 * @description Функция для загрузки gltf/glb моделей с подгрузкой дочерних текстур (устарела)
 * @deprecated TODO: Необходим рефакторинг
 * @param fileMap 
 * @returns {Promice<GLTF>} gltf модель
 */
function loadModelUtil(fileMap: Map<string,File>) {
    const MANAGER = new LoadingManager();
    const THREE_PATH = `https://unpkg.com/three@0.${REVISION}.x`;
    const DRACO_LOADER = new DRACOLoader( MANAGER ).setDecoderPath( `${THREE_PATH}/examples/js/libs/draco/gltf/` );

    let rootFile: any;
    let rootPath: any;
    Array.from(fileMap).forEach(([path, file]) => {
      if (file.name.match(/\.(gltf|glb)$/)) {
        rootFile = file;
        rootPath = path.replace(file.name, '');
      }
    });

    if (!rootFile) {
      console.error('No .gltf or .glb asset found.');
    }
    //@ts-ignore
    const fileURL = typeof rootFile === 'string' ? rootFile : URL.createObjectURL(rootFile);

    const cleanup = () => { //@ts-ignore
      if (typeof rootFile === 'object') URL.revokeObjectURL(fileURL);
    };

    const blobURLs: any = [];

    return new Promise((resolve, reject) => {
      const url = fileURL;
      const assetMap = fileMap;

      const baseURL = LoaderUtils.extractUrlBase(url);

      //@ts-ignore
      MANAGER.setURLModifier((url: any, path: any) => {

        // URIs in a glTF file may be escaped, or not. Assume that assetMap is
        // from an un-escaped source, and decode all URIs before lookups.
        // See: https://github.com/donmccurdy/three-gltf-viewer/issues/146
        const normalizedURL = rootPath + decodeURI(url)
          .replace(baseURL, '')
          .replace(/^(\.?\/)/, '');

        if (assetMap.has(normalizedURL)) {
          const blob = assetMap.get(normalizedURL);
          const blobURL = URL.createObjectURL(blob as File);
          blobURLs.push(blobURL);
          return blobURL;
        }

        return (path || '') + url;

      });

      const loader = new GLTFLoader( MANAGER )
        .setCrossOrigin('anonymous')
        .setDRACOLoader( DRACO_LOADER )

      blobURLs.forEach(URL.revokeObjectURL);


      loader.load(url, (gltf) => {

        const scene = gltf.scene || gltf.scenes[0];

        if (!scene) {
          // Valid, but not supported by this viewer.
          throw new Error(
            'This model contains no scene, and cannot be viewed here. However,'
            + ' it may contain individual 3D resources.'
          );
        }


        cleanup();

        // See: https://github.com/google/draco/issues/349
        // DRACOLoader.releaseDecoderModule();

        resolve(gltf);

      }, undefined, reject);

    }).catch(error => console.error(error));
}


export default loadModelUtil;