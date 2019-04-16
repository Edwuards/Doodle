let test = animation.create(document.querySelector('body'))
let square = test.graphics.create({
  type: 'square',
  layer: test.layers.get()[0].get.index(),
  data: {
    x: 100, y: 100, size: 100
  }
})

{
  let repeat = function () {
    square.set.fill('pink')
    return square.actions.perform({
      action: 'translate',
      duration: 500,
      data: { x: 200, origin: square.get.points()[0].position }
    }).then((square) => {
      square.set.fill('yellow')
      return square.actions.perform({
        duration: 1500,
        action: 'translate',
        data: { y: 500, origin: square.get.center() }
      })
    }).then((square) => {
      square.set.fill('red')
      return square.actions.perform({
        duration: 500,
        action: 'translate',
        data: { x: 100, origin: square.get.center() }
      })
    }).then((square) => {
      square.set.fill('orange')
      square.actions.perform({
        duration: 1500,
        action: 'translate',
        data: { y: 75, origin: square.get.center() }
      }).then(repeat)
    })
  }
  // repeat()
}
