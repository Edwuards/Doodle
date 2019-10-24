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
  const METHODS = {
    'limits':{
      enumerable: true,
      writable: false,
      value: ()=>{ return LIMITS },
    },
    'add': {
      enumerable: true,
      writable: false,
      value: (x,y) => {
        let test = undefined;
        [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
        if(!test.passed){ throw test.error(); }
    
        return PTS[PTS.push(new Point(x, y)) - 1];
      }
    },
    'get': {
      enumerable: true,
      get: ()=>{
        let copy = [];
        PTS.forEach((pt) => { copy.push(pt) })
        return copy
      }
    },
    'find': {
      enumerable: true, 
      writable: false,
      value: (index)=>{
        let test = undefined;
        [Rules.is.number(index),Rules.has.index(PTS,index)].some((check)=>{
          test = check; return !test.passed;
        });
        if(!test.passed){ throw test.error(); }
        return PTS[index];
      }
    }
  }
  array.forEach((pt)=>{
    PTS.push(pt);
    LIMITS.update(pt);
    pt.register('x update',LIMITS.update);
    pt.register('y update',LIMITS.update);
  });

  Object.defineProperties(this,METHODS);

}

function Plane (pts = []){
  const PTS = new Points(pts)
  const METHODS = {
    'points': {
      enumerable: true,
      get: ()=>{ return PTS }
    },
    'width': {
      enumerable: true,
      get:()=>{ let limits = PTS.limits.get; return limits.x.max.value - limits.x.min.value; }
    },
    'height': {
      enumerable: true,
      get:()=>{ let limits = PTS.limits.get; return limits.y.max.value - limits.y.min.value; }
    },
    'center': {
      enumerable: true,
      get:function(){ let limits = PTS.limits.get; return { x: limits.x.min.value + (this.width / 2), y: limits.y.min.value + (this.height / 2)  }
    }
    
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
