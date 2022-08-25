import * as THREE from 'three'
import React, { createRef, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, ThreeElements } from '@react-three/fiber'
import { OrbitControls, TransformControls } from '@react-three/drei';
import LoadModelUtil from './LoadModelUtil';


const modelMap = new Map();

const App = () => {
  const [models, setModels] = useState<any>([])
  const [focus, setFocus] = useState<string|boolean>(false);

  const uploadModel = async (e:any) => {
    const file = e.target.files[0];
    const fileMap = new Map();
    fileMap.set(file.name,file);


    LoadModelUtil(fileMap).then( (model:any) => {
      modelMap.set(model.scene.uuid, model.scene);
      setModels((prev:any) => [...prev, model.scene]);
    });
  }

  useEffect(()=> console.log(models),[models])



  return (
    <>

    <Canvas camera={{position: [7,7,0]}}>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <gridHelper args={[10,10, 'red']}/>

      <OrbitControls makeDefault/>

      { models.map((model:any, index: number) => (
          <primitive object={model} onClick={(e:any)=> setFocus(e.eventObject.uuid)} key={index}/>
      ))}
      { focus && <TransformControls object={modelMap.get(focus)}/>}


    </Canvas>

    <label className='btn btn-primary upload_button'>
      <div>Загрузить модель</div>
      <input type='file' accept='.glb' onChange={(e) => uploadModel(e)} />
    </label>

    </>

  )
};


export default App;