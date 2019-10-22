import { Rules } from './errors.js';
import { Helpers } from './helpers.js';


function Point (x, y) {
  const Pt = {x,y};
  const Observer = new Helpers.observer(['x update','y update']);
  let test = undefined;
  Observer.register('y update', (value)=>{ console.log(`y --> ${value}`)});
  Observer.register('x update', (value)=>{ console.log(`x --> ${value}`)});
  [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
  if(!test.passed){ throw test.error(); }

  // assign the x and y properties as get and setters to "this".
  [
    {
      property: 'y',
      descriptor: {
        enumerable: true,
        get: ()=>{ return Pt.y },
        set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ throw test.error() }; Pt.y = value; Observer.notify('y update',value);  return value; },
      }
    },
    {
      property: 'x',
      descriptor: {
        enumerable: true,
        get: ()=>{ return Pt.x },
        set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ test.error() }; Pt.x = value; Observer.notify('x update',value); return value; },
      }
    }
  ].forEach((obj)=>{ Object.defineProperty(this,obj.property,obj.descriptor); });

  this.translate = function(x, y){
    this.x = Pt.x + (x - Pt.x);
    this.y = Pt.y + (y - Pt.y);
    return true
  }

  this.rotate = function (degrees, origin) {
    let radians = ((degrees) * (Math.PI/180)) * -1;
    let cos = Math.cos(radians);
    let sin = Math.sin(radians);

    this.x =  this.x - origin.x;
    this.y = this.y - origin.y;
    let x = this.x*cos - this.y*sin;
    let y = this.x*sin + this.y*cos;
    this.x = x + origin.x;
    this.y = y + origin.y;

    return true
  }

}

function Points (array) {
  const Pts = [];
  let test = undefined;
  [
    Rules.is.array(array),
    Rules.is.notEmptyArray(array),
    Rules.is.greaterThan(array.length,3),
    (()=>{ array.some((pt)=>{ test = Rules.is.instanceOf(pt,Point); return !test.passed }); return test })()
  ].some((check)=>{test = check; return !test.passed });

  if(!test.passed){ throw test.error(); }

  array.forEach((pt)=>{ Pts.push(pt); });

  this.limits = ()=>{
    let limits = {
      x: { min: { value: Pts[0].x, points: [] }, max:{ value: Pts[0].x, points: [] } },
      y: { min: { value: Pts[0].y, points: [] }, max:{ value: Pts[0].y, points: [] } }
    };
    return Pts.reduce((limits,pt,i)=>{

      ['x','y'].forEach((axis)=>{

        if(pt[axis] < limits[axis].min.value){
          limits[axis].min.value = pt[axis];
          limits[axis].min.points = [Pts[i]];
        }
        else if( pt[axis] > limits[axis].max.value){
          limits[axis].max.value = pt[axis];
          limits[axis].max.points = [Pts[i]];
        }
        else if(pt[axis] === limits[axis].min.value){
          limits[axis].min.points.push(Pts[i]);
        }
        else if(pt[axis] === limits[axis].max.value){
          limits[axis].max.points.push(Pts[i]);
        }

      });

      return limits
    },limits);
  };
  this.add = (x,y) => {
    let test = undefined;
    [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
    if(!test.passed){ throw test.error(); }

    return Pts[Pts.push(new Point(x, y)) - 1];
  }
  this.get = () => {
      let copy = [];
      Pts.forEach((pt) => { copy.push(pt) })
      return copy
  }
  this.find = (index)=>{
    let test = undefined;
    [Rules.is.number(index),Rules.has.index(Pts,index)].some((check)=>{
      test = check; return !test.passed;
    });
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
      });
      return limits
    },
    width: function () { let limits = this.limits(); return limits.x.max - limits.x.min },
    height: function () { let limits = this.limits(); return limits.y.max - limits.y.min },
    center: function () { let limits = this.limits(); return { x: limits.x.min + this.width() / 2, y: limits.y.min + this.height() / 2 } }
  }
  this.set = {
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
