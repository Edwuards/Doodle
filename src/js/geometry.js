import { Rules } from './errors.js';
import { Helpers } from './helpers.js';

function Limits(){
  const LIMITS = {x:{},y:{}}
  const OBSERVER = new Helpers.observer(['update','add'])
  const SET = (axis,limit,pt)=>{
    LIMITS[axis][limit].value = pt[axis];
    LIMITS[axis][limit].points = [];
  };
  const ADD = (axis,limit,pt)=>{ LIMITS[axis][limit].points.push(pt); OBSERVER.notify('add',LIMITS[axis][limit].points); };
  const UPDATE = (axis,limit,pt)=>{ SET(axis,limit,pt); ADD(axis,limit,pt); OBSERVER.notify('update',LIMITS[axis][limit]); };

  LIMITS.x = {
    min: { value: undefined, points: [] },
    max: { value: undefined, points: [] }
  }
  LIMITS.y = {
    min: { value: undefined, points: [] },
    max: { value: undefined, points: [] }
  }

  Object.defineProperties(this,{
    'get': {
      enumerable: true,
      get: ()=>{ return Helpers.copyObject(LIMITS); }
    },
    'update': {
      enumerable: true,
      value: (pt)=>{
        ['x','y'].forEach((axis,i)=>{
          if(LIMITS[axis].min.value === undefined ){
            UPDATE(axis,'min',pt);
            UPDATE(axis,'max',pt);
          }
          else if(pt[axis] < LIMITS[axis].min.value){
            UPDATE(axis,'min',pt);
          }
          else if( pt[axis] > LIMITS[axis].max.value){
            UPDATE(axis,'max',pt);
          }
          else if(pt[axis] === LIMITS[axis].min.value){
            ADD(axis,'min',pt);
          }
          else if(pt[axis] === LIMITS[axis].max.value){
            ADD(axis,'max',pt);
          }

        });
      }
    },
    'register':{
      enumerable: true,
      writable: false,
      value: OBSERVER.register
    },
    'unregister':{
      enumerable: true,
      writable: false,
      value: OBSERVER.uregister
    }
  });

}

function Point (x, y){
  let test = undefined;
  [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
  if(!test.passed){ throw test.error(); }

  const PT = {x,y};
  const OBSERVER = new Helpers.observer(['x update','y update']);
  const METHODS = {
    'y':{
      enumerable: true,
      get: ()=>{ return PT.y },
      set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ throw test.error() }; PT.y = value; OBSERVER.notify('y update',value);  return value; }
    },
    'x':{
      enumerable: true,
      get: ()=>{ return PT.x },
      set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ test.error() }; PT.x = value; OBSERVER.notify('x update',value); return value; },
    },
    'translate': {
      enumerable: true,
      writable: false,
      value: function(x, y){
        this.x = PT.x + (x - PT.x);
        this.y = PT.y + (y - PT.y);
      }
    },
    'rotate': {
      enumerable: true,
      writable: false,
      value: function (degrees, origin) {
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
    },
    'register': {
      enumerable: true,
      writable: false,
      value: OBSERVER.register
    },
    'unregister': {
      enumerable: true,
      writable: false,
      value: OBSERVER.unregister
    },

  }

  Object.defineProperties(this,METHODS);

}

function Points (array){
  let test = undefined;
  [
    Rules.is.array(array),
    Rules.is.notEmptyArray(array),
    Rules.is.greaterThan(array.length,3),
    (()=>{ array.some((pt)=>{ test = Rules.is.instanceOf(pt,Point); return !test.passed }); return test })()
  ].some((check)=>{test = check; return !test.passed });

  if(!test.passed){ throw test.error(); }

  const PTS = [];
  const LIMITS = new Limits();

  array.forEach((pt)=>{
    PTS.push(pt);
    LIMITS.update(pt);
    pt.register('x update',LIMITS.update);
    pt.register('y update',LIMITS.update);
  });

  this.limits = ()=>{ return LIMITS.get }
  this.add = (x,y) => {
    let test = undefined;
    [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
    if(!test.passed){ throw test.error(); }

    return PTS[PTS.push(new Point(x, y)) - 1];
  }
  this.get = () => {
      let copy = [];
      PTS.forEach((pt) => { copy.push(pt) })
      return copy
  }
  this.find = (index)=>{
    let test = undefined;
    [Rules.is.number(index),Rules.has.index(PTS,index)].some((check)=>{
      test = check; return !test.passed;
    });
    if(!test.passed){ throw test.error(); }
    return PTS[index];
  }
}

function Plane (pts = []){
  let PTS = new Points(pts)

  this.get = {
    points: (index) => { return PTS.get(index) },
    limits: () => {
      let pts = PTS.get()
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
    point: PTS.add
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
      PTS.get().forEach((pt) => { pt.translate(pt.x + x, pt.y + y) })
    },
    rotate: (degrees, origin) => { PTS.get().forEach((pt) => { pt.rotate(degrees, origin) }) },
    scale: (size, origin) => {
      PTS.get().forEach((pt) => {
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
