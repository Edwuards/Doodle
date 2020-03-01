import { Rules, Test } from './errors.js';
import { Plane, Points, Point } from './geometry.js';
import { Helpers } from './helpers.js';
import { Actions } from './actions.js';


const ID = Helpers.counter();

function Context(canvas) {
  let test = Test([
    [Rules.is.object,[canvas]],
    [Rules.is.instanceOf,[canvas,CanvasRenderingContext2D]]
  ]);
  if(!test.passed){ throw test.error; }

  const GRAPHIC = this;
  const CANVAS = canvas;
  const CONTEXT = { properties: {}, functions: {} };
  const CALL = ()=>{
    for (let key in CONTEXT.functions) {
      if(CONTEXT.functions[key].state){ CANVAS[key].apply(CANVAS,CONTEXT.functions[key].args); }
    }
  }
  const SETUP = ()=>{
    for (let prop in CONTEXT.properties) { CANVAS[prop] = CONTEXT.properties[prop]; }
  }
  for(let key in CANVAS){
    if(typeof CANVAS[key] !== 'function' && key !== 'canvas'){ CONTEXT.properties[key] = CANVAS[key]; }
    else{ CONTEXT.functions[key] = {state: false, args: [] }; }
  }

  CONTEXT.functions.fill.state = true;
  const METHODS = {
    'render': {
      configurable: true,
      enumerable: true,
      set: (render)=>{
        let test = Rules.is.function(render)
        if(!test.passed){ throw test.error; }
        Object.defineProperty(GRAPHIC,'render',{
          enumerable: true,
          writable: false,
          value: ()=>{
            CANVAS.save();
            CANVAS.beginPath();
            SETUP();
            render.call({graphic: GRAPHIC, canvas: CANVAS })
            CALL();
            CANVAS.closePath();
            CANVAS.restore();
          }
        })

      }
    },
    'context':{
      enumerable: true,
      writable: false,
      value: (()=>{
        let obj = {};
        for (let key in CANVAS) {
          if(typeof CANVAS[key] !== 'function' ){
            Object.defineProperty(obj,key,{
              enumerable: true,
              get: ()=>{ return CONTEXT.properties[key]; },
              set: (value)=>{ CONTEXT.properties[key] = value; }
            });
          }
          else{
            Object.defineProperty(obj,key,{
              enumerable: true,
              writable: false,
              value: function(){
                if(arguments.length === 1 && typeof arguments[0] === 'boolean'){ CONTEXT.functions[key].state = arguments[0]; }
                if(arguments.length >= 1 && typeof arguments[0] != 'boolean'){
                  CONTEXT.functions[key].state = true;
                  CONTEXT.functions[key].args = arguments;
                }
              }
            });
          }
        }

        return obj;
      })()
    }
  }

  Object.defineProperties(this,METHODS);

}

function Graphic (data) {
  let test = Test([
    [Rules.is.object,[data]],
    [Rules.has.properties,[['points','canvas'],data]],
    [Rules.is.array,[data.points]],
    [(points)=>{
      let test = undefined;
      points.every((pt)=>{
        test = Test([
          [Rules.is.array,[pt]],
          [Rules.has.arrayLength,[pt,2]],
          [Rules.is.number,[pt[0]]],
          [Rules.is.number,[pt[1]]]
        ]);
        return test.passed;
      });
      return test
    },[data.points]]
  ]);

  if(!test.passed){ throw test.error; }

  data.points = data.points.map((axis)=>{ return new Point(axis[0],axis[1]); });
  data.points = new Points(data.points);

  const PROPS = {
    id: ID.create()
  }
  const METHODS = {
    'id': {
      enumerable: true,
      get: ()=>{ return PROPS.id }
    },
    'actions':{
      enumerable: true,
      writable: false,
      value: Actions.call(this,(data.actions || {}))
    }
  }

  Plane.call(this,data.points);
  Context.call(this,data.canvas);
  Object.defineProperties(this,METHODS);

}

function Arc (data) {
  let test = Test([
    [Rules.is.object,[data]],
    [Rules.has.properties,[['x','y','radius','angle','canvas'],data]],
    [Rules.is.number,[data.x]],
    [Rules.is.number,[data.y]],
    [Rules.is.number,[data.radius]],
    [Rules.is.object,[data.angle]],
    [Rules.has.properties,[['start','finish'],data.angle]],
    [Rules.is.number,[data.angle.start]],
    [Rules.is.number,[data.angle.finish]]
  ]) ;

  if(!test.passed){ throw test.error; }

  data.angle.start = Helpers.angleToRadians(data.angle.start);
  data.angle.finish = Helpers.angleToRadians(data.angle.finish);
  const PROPS = {
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

          if(!test.passed){ throw test.error; }
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
              if(!test.passed){ throw test.error; }
              PROPS.angle.start = Helpers.angleToRadians(angle);
            }
          },
          'finish': {
            enumerable: true,
            get: ()=>{ return PROPS.angle.finish; },
            set: (angle)=>{
              let test = Rules.is.number(angle);
              if(!test.passed){ throw test.error; }
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

  let test = Test([
    [Rules.is.object,[data]],
    [Rules.has.properties,[['x','y','w','h'],data]],
    [(data)=>{
      let test = undefined;
      ['x','y','w','h'].every((prop)=>{
        test = Rules.is.number(data[prop]);
        return test.passed;
      });
      return test
    },[data]]
  ]);

  if(!test.passed){ throw test.error; }

  {
    let x = data.x, w = x+data.w;
    let y = data.y, h = y+data.h;
    data.points = [[x,y],[w,y],[w,h],[x,h]];
    Polygon.call(this,data);
  }

}

function Square (data) {

  let test = Test([
    [Rules.is.object,[data]],
    [Rules.has.properties,[['x','y','size'],data]],
    [(data)=>{
      let test = undefined;
      ['x','y','size'].every((prop)=>{
        test = Rules.is.number(data[prop]);
        return test.passed;
      });
      return test
    },[data]]
  ]);

  if(!test.passed){ throw test.error; }

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

function RadialGradient(data){
  // let test = Test([
  //   [Rules.is.object,[data]],
  //   [Rules.has.properties,[['x','y','w','h','radials','canvas'],data]],
  //   [Rules.is.array,[data.radials]],
  //   [Rules.has.arrayLength,[data.radials,2]]
  //   [Rules.is.number,[data.w]],
  //   [Rules.is.number,[data.h]]
  // ]);
  //
  // if(!test.passed){ throw test.error; }
  let test = undefined;
  if(data.radials.some((data)=>{
    test = Test([
      [Rules.is.object,[data]],
      [Rules.has.properties,[['x','y','r'],data]],
      [Rules.is.number,[data.x]],
      [Rules.is.number,[data.y]],
      [Rules.is.number,[data.r]]
    ]);
    return !test.passed
  })){ throw test.error; }

  function Radial(X,Y,R){
    let xr = X + R, yr = Y + R;

    let pts = [[X,Y],[xr,Y],[xr,yr],[X,yr]];
    pts = pts.map((axis)=>{ return new Point(axis[0],axis[1]); });
    pts = new Points(pts);


    const METHODS = {
      'radius':{
        enumerable: true,
        get: ()=>{ return R; },
        set: (value)=>{ R = value; }
      },
      'circumference':{
        enumerable: true,
        get: ()=>{ return R*2; }
      }
    }

    Plane.call(this,pts)
    Object.defineProperties(this,METHODS);
  }

  const ACTIONS = {
    'scale': function(data){
      console.log('hello');
    },
    'translate':function(data){
      let { origin } = data; origin = origin();

      this.graphic.context.translate
    }
  };

  const METHODS = {
    'radials':{
      enumerable: true,
      get: ()=>{ return PROPS.radials.map((r)=>{ return r }); },
    },
    'colorStops':{
      enumerable: true,
      writable: false,
      value: (()=>{
        const OBJ = {};
        const METHODS = {
          'add': {
            enumerable: true,
            writable: false,
            value: (stop,color)=>{
              stop = `#${stop}`;
              if(PROPS.colorStops[stop] == undefined){ PROPS.colorStops[stop] = color; }
            },
          },
          'get': {
            enumerable: true,
            get:()=>{
               return Object.keys(PROPS.colorStops).sort((a,b)=>{ return Number(a.split('#')[1]) - Number(b.split('#')[1]) })
               .map((stop,i)=>{ return { stop: Number(stop.split('#')[1]), color: PROPS.colorStops[stop] }; });
            }
          }
        }
        Object.defineProperties(OBJ,METHODS);
        return OBJ;
      })()
    },
    'translate':{
      enumerable: true,
      writable: false,
      value: function(data){
        let x = undefined, y = undefined, pt = undefined;
        this.radials.forEach((r,i)=>{
          if(i == 0){
            pt = r.points.get[0];
            x = pt.x + (data.x - pt.x);
            y = pt.y + (data.y - pt.y);
          }
          console.log({x,y})
          r.translate({x,y});
        })
      }
    }
  }

  const PROPS = {
    radials: [],
    colorStops: {}
  }


  data.radials.forEach((radial,i)=>{ PROPS.radials.push(new Radial(radial.x,radial.y,radial.r)); });

  {
    let x = data.x, w = x+data.w;
    let y = data.y, h = y+data.h;
    let points = [[x,y],[w,y],[w,h],[x,h]];
    Graphic.call(this,{canvas:data.canvas,points});
  }


  Object.defineProperties(this,METHODS);
  this.render = function () {
    let pts = this.graphic.points.get;
    this.canvas.moveTo(pts[0].x, pts[0].y)
    pts.forEach((pt) => { this.canvas.lineTo(pt.x, pt.y) })

    let [r1,r2] = this.graphic.radials;
    let c1 = r1.center, c2 = r2.center;
    let gradient = this.canvas.createRadialGradient(c1.x,c1.y,r1.radius,c2.x,c2.y,r2.radius);
    this.graphic.colorStops.get.forEach((data)=>{ gradient.addColorStop(data.stop,data.color); });
    this.canvas.fillStyle = gradient;
  }
}


export { Polygon, Rectangle, Square, Circle, Arc , RadialGradient}
