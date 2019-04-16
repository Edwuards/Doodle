import { Graphics } from './graphics.js'
import { Layers } from './layers.js'
import { Render } from './render.js'

function create (container) {
  if (container === undefined) { throw new Error('An html element acting as a container is requiered') }
  let layers = new Layers(container)
  let render = new Render(layers)
  let graphics = new Graphics(layers)
  layers.add()
  render.start()
  return {
    layers,
    render,
    graphics,
    get: {
      center: function(){ return { x: this.width()/2, y: this.height()/2 }},
      width: () => { return container.offsetWidth },
      height: () => { return container.offsetHeight }
    }
  }
}

export { create }
