import { Rules, Test } from './errors.js';
import { Helpers } from './helpers.js';


const ID = Helpers.counter();

function Layers (container) {

  const LAYERS = [];
  const METHODS = {
    'add': {
      enumerable: true,
      writable: false,
      value: (layer)=>{
        layer.index = LAYERS.length;
        LAYERS.push(new Layer(layer));
        return LAYERS[layers.index];
      }
    },
    'get':{
      enumerable: true,
      get:(index)=>{
        if(index !== undefined){
          let test = Test([ [Rules.is.number,[index]],[Rules.has.index,[LAYERS,index]] ]);
          if(!test.passed){ throw test.error; }
          return LAYERS[index];
        }

        return LAYERS.map((l)=>{ return l });

      }
    }
  }

  
}

function Layer (data) {
  let test = Test([
    [Rules.is.object,[data]],
    [Rules.has.properties,[['name','index','width','height'],data]],
    [Rules.has.arrayLength,[Object.keys(data),4]],
    [Rules.is.string,[data.name]],
    [(data)=>{
      let test = undefined;
      ['index','height','width'].every((prop)=>{ test = Rules.is.number(data[prop]); return test.passed; });
      return test
    },[data]]
  ]);

  if(!test.passed){ throw test.error; }

  const CANVAS = document.createElement('canvas');

  const PROPS = {
    name: data.name,
    id: ID.create(),
    index: data.index,
    canvas: CANVAS,
    context: CANVAS.getContext('2d'),
    loop: undefined
  };

  [['height',data.height],['width',data.width],['data-id',PROPS.id]].forEach((attr)=>{ CANVAS.setAttribute(attr[0],attr[1]); });

  const METHODS = {
    'name': {
      enumerable: true,
      get: ()=>{ return PROPS.name }
    },
    'id': {
      enumerable: true,
      get: ()=>{ return PROPS.id; }
    },
    'context': {
      enumerable: true,
      get: ()=>{ return PROPS.context }
    },
    'loop': {
      enumerable: true,
      get: ()=>{ return PROPS.loop },
    },
    'width': {
      enumerable: true,
      get: ()=>{ return CANVAS.width },
    },
    'height': {
      enumerable: true,
      get: ()=>{ return CANVAS.height },
    }
  }

  Object.defineProperties(this,METHODS)

}

export { Layers }
