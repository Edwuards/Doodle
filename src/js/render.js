let loop = (layer) => {
  if (layer.constructor.name === 'Layer' && layer.get.loop() === undefined) {
    let context = layer.get.context()
    layer.set.loop(setInterval(function () {
      context.clearRect(0, 0, layer.get.width(), layer.get.height())
      layer.get.graphics().forEach((graphic) => {
        context.save()
        context.beginPath()
        layer.set.context(graphic.get.context())
        graphic.render(context, layer)
        context.closePath()
        context.restore()
      })
    }, 10))
  }
}

function Render (Layers) {
  if (Layers.constructor.name !== 'Layers') { throw 'The Layers parameter must be a valid Layers() instance.' };
  this.start = (layers) => {
    layers = layers ? layers.map(Layers.find) : Layers.get()
    layers.forEach(loop)
  }
  this.stop = (layers) => {
    layers = layers ? layers.map(Layers.find) : Layers.get()
    layers.forEach((layer) => { layer.set.loop(clearInterval(layer.get.loop())) })
  }
}

export { Render }
