import * as Graphics from './graphics.js';
import { Layers } from './layers.js';
import { Render } from './render.js';
import { Test, Rules } from './errors.js';

function graphicsBuilder(LAYERS){
  const METHODS = {
    'create': {
      enumerable: true,
      writable: false,
      value: (()=>{
        let graphics = {};
        for(let type in Graphics){
          Object.defineProperty(graphics,type.toLowerCase(),{
            enumerable: true,
            writable: false,
            value: (data,layer = 0)=>{
              layer = LAYERS.get(layer);
              data.canvas = layer.context;
              return layer.graphics.add(new Graphics[type](data));
            }
          });
        }
        return graphics;
      })()
    },
    'get': {
      enumerable: true,
      writable: false,
      value: (id)=>{
        if(id !== undefined){
          let test = Rules.is.number(id);
          if(!test.passed){ throw test.error; }

          let graphic = undefined;
          {
            let layers = LAYERS.get();
            for (var i = 0; i < layers.length; i++) {
              graphic = layers[i].graphics.find((g)=>{ return g.id = id; });
            }
          }
          return graphic;
        }

        return LAYERS.get().reduce((result,layer)=>{
          layer.graphics.get().forEach(graphic => result.push(graphic));
          return result
        },[]);
      }
    }
  }

  Object.defineProperties(this,METHODS);
}

function Doodle(data){
  let test = Test([
    [Rules.is.object,[data]],
    [Rules.is.defined,['container',data]]
  ]);

  if(!test.passed){ throw test.error; }

  let METHODS = {};

  METHODS.layers = {
    enumerable: true,
    writable: false,
    value: (()=>{
      let layers = new Layers(data.container);

      layers.add({
        width: data.width || Number(data.container.offsetWidth),
        height: data.height || Number(data.container.offsetHeight),
        name: 'Untitled-0'
      });
      return layers
    })()
  }

  METHODS.render = {
    enumerable: true,
    writable: false,
    value: (()=>{ let render = new Render(METHODS.layers.value); render.start(); return render; })()
  }

  METHODS.graphics = {
    enumerable: true,
    writable: false,
    value:new graphicsBuilder(METHODS.layers.value)
  }



  Object.defineProperties(this,METHODS);
}

export { Doodle } ;
