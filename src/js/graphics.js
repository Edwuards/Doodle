import { Rules } from './errors.js';
import { Plane, Points, Point } from './geometry.js';
import { Helpers } from './helpers.js';
import { Actions, setOfBasicActions } from './actions.js';


const ID = (()=>{
  let id = 0;
  const expose = {};
  const METHODS = {
    'create': {
      enumerable: true,
      writable: false,
      value: ()=>{ id += 1; return id }
    }
  };
  
  Object.defineProperties(expose,METHODS);
  
  return expose;
})();

function Context(canvas){
  let test = undefined;
  
  [
    Rules.is.object(canvas),
    Rules.is.instanceOf(canvas,CanvasRenderingContext2D),
  ].some((check)=>{ test = check; return !test.passed });
  
  if(!test.passed){ throw test.error(); }
  
  const GRAPHIC = this;
  const CANVAS = canvas;
  const CONTEXT = {};
  const SETUP = ()=>{
    for (let prop in CONTEXT) {
      CANVAS[prop] = CONTEXT[prop];
    }
  }
  const PROPS = {
    fill: true,
    stroke: false,
  };
  const METHODS = {
    'render': {
      configurable: true,
      enumerable: true,
      set: (render)=>{
        let test = Rules.is.function(render)
        if(!test.passed){ throw test.error(); }
        Object.defineProperty(GRAPHIC,'render',{
          enumerable: true,
          writable: false,
          value: ()=>{
            CANVAS.save();
            CANVAS.beginPath();
            SETUP();
            render.call({graphic: GRAPHIC, canvas: CANVAS })
            if(PROPS.fill){ CANVAS.fill(); }
            if(PROPS.stroke){ CANVAS.stroke(); }
            CANVAS.closePath();
            CANVAS.restore();
          }
        })
<<<<<<< HEAD
=======
        
>>>>>>> graphics
      }
    }
  }
  
  Object.defineProperties(this,METHODS);
  
}

function Graphic (data) {
  let test = undefined;
  [
    Rules.is.object(data),
    Rules.has.properties(['points','canvas'],data),
    Rules.is.array(data.points),
    (()=>{
      let test = undefined;
      data.points.some((pt)=>{
        [
          Rules.is.array(pt),
          Rules.has.arrayLength(pt,2),
          Rules.is.number(pt[0]),
          Rules.is.number(pt[1]),
        ].some((check)=>{ test = check; return !test.passed });
        return !test.passed;
      })
      return test
    })()
  ].some((check)=>{ test = check; return !test.passed });
  
  if(data.context !== undefined){ test = Rules.is.object(data.context); }
  
  if(!test.passed){ throw test.error(); }
  
  data.points = data.points.map((axis)=>{ return new Point(axis[0],axis[1]); });
  data.points = new Points(data.points);
  Plane.call(this,data.points);
  Context.call(this,data.canvas);
 
  
  
}

function Arc (data) {
<<<<<<< HEAD
 
  if (
    typeof data !== 'object' || typeof data.x !== 'number' ||
    typeof data.y !== 'number' || typeof data.radius !== 'number' ||
    typeof data.angle !== 'object' || typeof data.angle.start !== 'number' ||
    typeof data.angle.finish !== 'number'
  ){
    throw 'The parameter must have the following structure ---> {x: int, y: int, radius: int, angle: {start: int, finish: int} }'
  }
  Object.assign(this,new Graphic(
    [{ x: data.x, y: data.y }, { x: data.x + data.radius, y: data.y }, { x: data.x + data.radius, y: data.y + data.radius }, { x: data.x, y: data.y + data.radius }],
    data.context || {}
  ))

  let arc = {
=======
  let test = undefined ;
  [
    Rules.is.object(data),
    Rules.has.properties(['x','y','radius','angle','canvas'],data),
    Rules.is.number(data.x),
    Rules.is.number(data.y),
    Rules.is.number(data.radius),
    Rules.is.object(data.angle),
    Rules.has.properties(['start','finish'],data.angle),
    Rules.is.number(data.angle.start,data.angle.finish)
  ].some((check)=>{ test = check; return !test.passed });
  
  if(!test.passed){ throw test.error(); }
  
  data.angle.start = Helpers.angleToRadians(data.angle.start);
  data.angle.finish = Helpers.angleToRadians(data.angle.finish);
  const PROPS = {
>>>>>>> graphics
    radius: data.radius,
    angle : data.angle,
  }
  const METHODS = {
    'radius': {
      enumerable: true,
      get: ()=>{ return PROPS.radius },
        set: (radius)=>{
          let test = undefined;
          [
            Rules.is.number(radius),
            Rules.is.greaterThan(radius,0)
          ].some((check)=>{ test = check; return !test.passed });
          
          if(!test.passed){ throw test.error(); }
          PROPS.radius = radius;
        }
    },
    'angle': {
      enumerable: true,
      writable: false,
      value: (()=>{
        let obj = {};
        Object.defineProperties(obj,{
          'start': {
            enumerable: true,
            get: ()=>{ return PROPS.angle.start; },
            set: (angle)=>{
              let test = Rules.is.number(angle);
              if(!test.passed){ throw test.error(); }
              PROPS.angle.start = Helpers.angleToRadians(angle);
            }
          },
          'finish': {
            enumerable: true,
            get: ()=>{ return PROPS.angle.finish; },
            set: (angle)=>{
              let test = Rules.is.number(angle);
              if(!test.passed){ throw test.error(); }
              PROPS.angle.finish = Helpers.angleToRadians(angle);
            }
          }
        });
        
        return obj
      })()
    }
  }
  
  {
    let x = data.x, xr = x + PROPS.radius;
    let y = data.y, yr = y + PROPS.radius;
    
    let pts = [[x,y],[xr,y],[xr,yr],[x,yr]];
    
    Graphic.call(this,{canvas: data.canvas, points: pts});
  }
  
  Object.defineProperties(this,METHODS);
  
  this.render = function () {
    let center = this.graphic.center;
    this.canvas.arc(center.x,center.y,PROPS.radius,PROPS.angle.start,PROPS.angle.finish)
  }
  
}

function Polygon (data) {
  Graphic.call(this,data);
  this.render = function () {
    let pts = this.graphic.points.get;
    this.canvas.moveTo(pts[0].x, pts[0].y)
    pts.forEach((pt) => { this.canvas.lineTo(pt.x, pt.y) })
  }
}

function Rectangle(data){
  
  let test = undefined;
  [
    Rules.is.object(data),
    Rules.has.properties(['x','y','w','h']),
    (()=>{
      ['x','y','w','h'].every((prop)=>{
        test = Rules.is.number(data[prop]);
        return test.passed;
      });
      return test
    })
  ].some((check)=>{ test = check; return !test.passed });
  
  if(!test.passed){ throw test.error(); }
  
  {
    let x = data.x, w = x+data.w;
    let y = data.y, h = y+data.h;
    data.points = [[x,y],[w,y],[w,h],[x,h]];
    Polygon.call(this,data);
  }
  
}


function Square (data) {
  
  let test = undefined;
  [
    Rules.is.object(data),
    Rules.has.properties(['x','y','size']),
    (()=>{
      ['x','y','size'].every((prop)=>{
        test = Rules.is.number(data[prop]);
        return test.passed;
      });
      return test
    })
  ].some((check)=>{ test = check; return !test.passed });
  
  if(!test.passed){ throw test.error(); }
  
  {
    let x = data.x, w = x+data.size;
    let y = data.y, h = y+data.size;
    data.points = [[x,y],[w,y],[w,h],[x,h]];
    Polygon.call(this,data);
  }
  
  
}

function Circle (data){
  data.angle = { start: 0, finish: 360};
  Arc.call(this,data);
  
  const METHODS = {
    'circumference': {
      enumerable: true,
      get: function(){ return (this.radius * 2) }
    }
  }
  
  Object.defineProperties(this,METHODS);
  
 
}



export { Polygon, Rectangle, Square, Circle, Arc }
