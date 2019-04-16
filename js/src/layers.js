
function Layers (container) {
  if (container.nodeType !== 1) {
    throw 'The container parameter needs to be an HTML ELEMENT'
  }
  let Layers = []
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
  if (typeof data !== 'object' || ['name', 'id', 'index', 'width', 'height'].some((prop) => { return data[prop] === undefined })) {
    throw 'The data must be an object with the following structure --> {name: string, id: int, index: int, height: int > 0, width: int > 0 }'
  }
  if (typeof data.id !== 'number' ||
    typeof data.index !== 'number' ||
    typeof data.name !== 'string' ||
    (typeof data.height === 'number' && data.height < 0) ||
    (typeof data.width === 'number' && data.width < 0)) {
    throw 'The data must be an object with the following structure --> {name: string, id: int, index: int, height: int > 0, width: int > 0 }'
  }

  let layer = {
    name: data.name,
    id: data.id,
    index: data.index,
    html: document.createElement('canvas'),
    graphics: [],
    context: undefined,
    loop: undefined
  }

  layer.html.setAttribute('height', data.height)
  layer.html.setAttribute('width', data.width)
  layer.html.setAttribute('data-layer-id', data.id)
  layer.context = layer.html.getContext('2d')

  this.get = {
    name: () => { return layer.name },
    id: () => { return layer.id },
    index: () => { return layer.index },
    html: () => { return layer.html },
    graphics: () => { let copy = []; layer.graphics.forEach((graphic) => { copy.push(graphic) }); return copy },
    context: () => { return layer.context },
    loop: () => { return layer.loop },
    width: () => { return layer.html.width },
    height: () => { return layer.html.height }
  }
  this.set = {
    context: (context) => {
      if (typeof context === 'object') {
        for (let setting in context) {
          layer.context[setting] = context[setting]
        }
      } else { throw 'The paramter must a be a valid object containing canvas api properties --> {fillStyle: "red", lineWidth: 5, ... } ' };
    },
    loop: (id) => {
      if (typeof id === 'number') { layer.loop = id } else if (id === undefined) { layer.loop = undefined } else { throw 'Parameter must be a number or undefined' }
    },
    width: (width) => {
      if (typeof width === 'number') { layer.html.setAttribute('width', width) } else { throw 'Parameter must be a number' }
    },
    height: (height) => {
      if (typeof height === 'number') { layer.html.setAttribute('height', height) } else { throw 'Parameter must be a number' }
    }
  }

  this.graphics = {
    add: (graphic) => {
      return layer.graphics[layer.graphics.push(graphic) - 1]
    }
  }
}

export { Layers }
