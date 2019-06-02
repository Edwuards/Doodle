function Point (x, y, z) {
  if (typeof x !== 'number') { throw 'The paremeter x must be an integer' }
  if (typeof y !== 'number') { throw 'The paremeter y must be an integer' }
  Object.defineProperty(this,'x',{
    enumerable: true,
    value: x,
    get: ()=>{ return x },
    set: (value)=>{ if(typeof value !== 'number'){ throw new Error('The value must be an integer'); } x  }
  })
  this.x = x
  this.y = y
  this.position = function(){ return { x: this.x, y: this.y } }
  this.translate = function (x, y) {
    this.x += x - this.x
    this.y += y - this.y
  }
  this.rotate = function (degrees, origin) {
    let radians = ((degrees) * (Math.PI/180)) * -1;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);

    this.x -= origin.x
    this.y -= origin.y
    let x = this.x*cos - this.y*sin
    let y = this.x*sin + this.y*cos
    this.x = x + origin.x
    this.y = y + origin.y
  }
}

function Points (pts = []) {
  if (!Array.isArray(pts) || (pts.length && pts.some((pt) => { return (typeof pt.x !== 'number' || typeof pt.y !== 'number') || Object.keys(pt).length !== 2 }))) { throw new Error('The paramter must be a an array of valid points --> [{x:int, y:int}]') };
  let Pts = pts.length ? pts.map((pt) => { return new Point(pt.x, pt.y) }) : []

  this.add = (x, y) => { return Pts[Pts.push(new Point(x, y)) - 1] }
  this.get = (index) => {
    if (typeof index === 'number' && Pts[index]) {
      return Pts[index]
    }
    else if (index !== undefined) {
      throw 'The index paramter must be a number'
    }
    else{
      let copy = []
      Pts.forEach((pt) => { copy.push(pt) })
      return copy
    }
  }
}

function Plane (pts = []) {
  if (pts.length < 3) { throw 'The paramter must be an array containing at least three valid point object --> [{x: int , y: int},{x: int , y: int},{x: int , y: int}]' };
  let Pts = new Points(pts)
  let instance = this

  let updateLimits = (type,int,min = false)=>{
    if(typeof int !== 'number' || int <= 0){ throw 'The paramter must be a number greater than 0'}
    int = int - instance.get[type]()
    type = type == 'width' ? 'x' : 'y'
    int = min ? int *= -1 : int
    let limit = Math.ceil(instance.get.limits()[type][min ? 'min' : 'max'])
    let update = []
    instance.get.points().forEach((pt)=>{ if(Math.ceil(pt[type]) === limit){ update.push(pt) }  })
    update.forEach((pt)=>{ pt[type] += int })
  }

  this.get = {
    points: (index) => { return Pts.get(index) },
    limits: () => {
      let pts = Pts.get()
      let x = pts[0].x
      let y = pts[0].y
      let limits = { x: { min: x, max: x }, y: { min: y, max: y } }
      pts.forEach((pt) => {
        let x = pt.x
        let y = pt.y
        limits.x.max = x > limits.x.max ? x : limits.x.max
        limits.x.min = x < limits.x.min ? x : limits.x.min

        limits.y.max = y > limits.y.max ? y : limits.y.max
        limits.y.min = y < limits.y.min ? y : limits.y.min
      })
      return limits
    },
    width: function () { let limits = this.limits(); return limits.x.max - limits.x.min },
    height: function () { let limits = this.limits(); return limits.y.max - limits.y.min },
    center: function () { let limits = this.limits(); return { x: limits.x.min + this.width() / 2, y: limits.y.min + this.height() / 2 } }
  }
  this.set ={
    width: (int,min = false) => { updateLimits('width',int,min) },
    height: (int,min = false) => { updateLimits('height',int,min) }
  }
  this.add = {
    point: Pts.add
  }
  this.move = (position,origin)=>{
    let x = typeof position.x  == 'number' ? (origin.x + position.x) : undefined
    let y = typeof position.y  == 'number' ? (origin.y + position.y) : undefined
    instance.transform.translate({x,y},origin)
  }
  this.transform = {
    translate: (update, origin) => {
      let x = typeof update.x  === 'number' ? update.x - origin.x : 0
      let y = typeof update.y === 'number'  ? update.y - origin.y : 0
      Pts.get().forEach((pt) => { pt.translate(pt.x + x, pt.y + y) })
    },
    rotate: (degrees, origin) => { Pts.get().forEach((pt) => { pt.rotate(degrees, origin) }) },
    scale: (size, origin) => {
      Pts.get().forEach((pt) => {
        pt.x -= origin.x
        pt.y -= origin.y
        pt.x *= size
        pt.y *= size
        pt.x += origin.x
        pt.y += origin.y
      })
    }
  }
}

export { Plane }
