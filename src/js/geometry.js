import { Rules } from './errors.js';
function Point (x, y) {
  const Pt = {x,y};
  [x,y].forEach((value)=>{let test = Rules.is.number(value); if(!test.passed){throw test.error(); } });
  [{
    property: 'y',
    descriptor: {
      enumerable: true,
      get: ()=>{ return Pt.y },
      set: (value)=>{let test = Rules.is.number(value); if(test.passed){ Pt.y = value; }else{ throw test.error() } },
    }
  },
  {
    property: 'x',
    descriptor: {
      enumerable: true,
      get: ()=>{ return Pt.x },
      set: (value)=>{let test = Rules.is.number(value); if(test.passed){ Pt.x = value; }else{ throw test.error() } },
    }
  }].forEach((obj)=>{
    Object.defineProperty(this,obj.property,obj.descriptor);
  });

  this.position = ()=>{ return Pt }
  this.translate = (x, y)=>{
    Pt.x += (x -Pt.x);
    Pt.y += (y - Pt.y);

    return Pt;
  }
  this.rotate = function (degrees, origin) {
    let radians = ((degrees) * (Math.PI/180)) * -1;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);

    Pt.x -= origin.x;
    Pt.y -= origin.y;
    let x = Pt.x*cos - Pt.y*sin;
    let y = Pt.x*sin + Pt.y*cos;
    Pt.x = x + origin.x;
    Pt.y = y + origin.y;

    return Pt;
  }
}

function Points (array) {
  let test = Rules.validate.points(array);
  if(!test.passed){ throw test.error(); }
  const Pts = array.map((pt) => { return new Point(pt.x, pt.y) }) ;

  this.add = (point) => {
    let test = Rules.is.point(point);
    if(!test.passed){ throw test.error(); }
    return Pts[Pts.push(new Point(x, y)) - 1];
  }
  this.get = (index = undefined) => {
      let copy = []
      Pts.forEach((pt) => { copy.push(pt) })
      return copy
  }
  this.find = (index)=>{
    let test = Rules.has.index({array:Pts,index:index});
    if(!test.passed){ throw test.error(); }
    return Pts[index];
  }
}

function Plane (pts = []) {
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

export { Plane, Point ,Points }
