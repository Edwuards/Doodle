import { Rules, Test } from './errors.js';
import { Helpers } from './helpers.js';


const ID = Helpers.counter();

function Layers (container) {

  const LAYERS = [];
  const METHODS = {
    'add': {
      enumerable: true,
      writable: false,
      value: ()=>{

      }
    }
  }

  this.add = (name, width, height) => {
    let layer = {
      id: Layers.length,
      index: Layers.length,
      name: name || 'Untitled-' + Layers.length,
      height: height || container.offsetHeight,
      width: width || container.offsetWidth
    }
    layer = new Layer(layer)
    container.appendChild(layer.get.html())
    return Layers[Layers.push(layer) - 1]
  }
  this.get = (index) => {
    if (index !== undefined) {
      if (index !== undefined && typeof index !== 'number') { throw 'The index paramter must be a number' } else if (Layers[index] === undefined) { throw 'The index you supplied does is not defined in your points array' };
      return Layers[index]
    }
    let copy = []
    Layers.forEach((layer) => { copy.push(layer) })
    return copy
  }
  this.find = (key) => {
    if (typeof key !== 'object' || key.value === undefined || key.name === undefined || ['name', 'index', 'id'].every((name) => { return key.name !== name })) {
      throw 'The key paramter must a valid key object --> {name : "index" || "id" || "name" , value: "int" || "string" } '
    } else if ((key.name === 'index' || (key.name === 'id' && typeof key.value !== 'number')) || (key.name === 'name' && typeof key.value !== 'string')) {
      throw 'The key paramter must a valid key object --> {name : "index" || "id" || "name" , value: "int" || "string" '
    }
    let result = Layers.find((layer) => { return layer.get[key.name]() === key.value })
    if (result === undefined) { throw 'There was no match for the layer with the "' + key.name + '" property equivalent to the value "' + key.value + '"' };
    return result
  }
}

function Layer (data) {
  let test = Test([
    [Rules.is.object,[data]],
    [Rules.has.properties,[['name','index','width','height'],data]],
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
