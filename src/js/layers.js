import { Rules, Test } from './errors.js';
import { Helpers } from './helpers.js';


const ID = Helpers.counter();

function Layers (container) {
  let test = Rules.is.instanceOf(container,HTMLElement);
  if(!test.passed){ throw test.error; }

  const LAYERS = Helpers.list();
  const METHODS = {
    'add': {
      enumerable: true,
      writable: false,
      value: (layer)=>{
        layer.index = LAYERS.get().length;
        container.append(LAYERS.add(new Layer(layer)).canvas);
      }
    },
    'get':{
      enumerable: true,
      writable: false,
      value: LAYERS.get
    },
    'delete':{
      enumerable: true,
      writable: false,
      value: LAYERS.delete
    },
    'find':{
      enumerable: true,
      writable: false,
      value: (name)=>{
        let test = Rules.is.string(name);
        if(!test.passed){ throw test.error; }
        return LAYERS.find((layer)=>{ return layer.name == name });
      }
    }
  }

  Object.defineProperties(this,METHODS);

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
    loop: undefined,
    graphics: Helpers.list()
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
    'canvas': {
      enumerable: true,
      get: ()=>{ return PROPS.canvas; }
    },
    'context': {
      enumerable: true,
      get: ()=>{ return PROPS.context; }
    },
    'width': {
      enumerable: true,
      get: ()=>{ return CANVAS.width },
    },
    'height': {
      enumerable: true,
      get: ()=>{ return CANVAS.height },
    },
    'graphics':{
      enumerable: true,
      writable: false,
      value: PROPS.graphics
    }
  }

  Object.defineProperties(this,METHODS);

}

export { Layers }
