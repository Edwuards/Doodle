import { Rules } from './errors.js';
import { Plane, Points, Point } from './geometry.js';
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

function Graphic (data) {
  debugger;
  let test = undefined;
  [
    Rules.is.object(data),
    Rules.has.properties(['points','context']),
    Rules.is.array(data.points),
    Rules.is.object(data.context),
    // (()=>{
    //   let test = undefined;
    //   data.array.some((pt)=>{
    //     [
    //       Rules.is.array(pt),
    //       Rules.has.arrayLength(pt,2),
    //       Rules.is.number(pt[0]),
    //       Rules.is.number(pt[1]),
    //     ].some((check)=>{ test = check; return !test.passed });
    //     return !test.passed;
    //   })
    //   return test
    // })()
  ].some((check)=>{ test = check; return !test.passed });

  if(!test.passed){ throw test.error(); }

  data.points = data.points.map((axis)=>{ return new Point[axis[0],axis[1]]; });
  data.points = new Points(data.points);
  Plane.call(this,data.points);
  // let graphic = {
  //   id: ID.create(),
  //   context,
  //   fill: true,
  //   stroke: false,
  //   clip: false
  // }
  // this.get = {}
  // this.set = {}
  // for (let method in prototype) { this[method] = prototype[method] };
  //
  // [
  //   [this.get, {
  //     id: () => { return graphic.id },
  //     fill: () => { return graphic.fill },
  //     stroke: () => { return graphic.stroke },
  //     clip: () => { return graphic.clip },
  //     context: () => { return graphic.context }
  //   }],
  //   [this.set, {
  //     fill: (fill) => {
  //       if (typeof fill === 'boolean') { graphic.fill = fill } else if (typeof fill === 'string') { graphic.context.fillStyle = fill; graphic.fill = true } else { throw 'The fill paramter must be a boolean or a string refrencing a color --> true || false || #hex || rgba() || hsla || color' }
  //     },
  //     stroke: (stroke) => {
  //       if (typeof stroke === 'boolean') { graphic.stroke = stroke } else if (typeof stroke === 'string') { graphic.context.strokeStyle = stroke; graphic.stroke = true } else { throw 'The fill paramter must be a boolean or a string refrencing a color --> true || false || #hex || rgba() || hsla || color' }
  //     },
  //     clip: (clip) => {
  //       if (typeof clip === 'boolean' && clip === false) { graphic.clip = false } else if (typeof clip === 'object') {
  //         if (['Plane', 'Polygon', 'Square', 'Rectangle'].some((type) => { return clip.constructor.name === type })) {
  //           let path = new Path2D()
  //           let pts = clip.get.points()
  //           path.moveTo(pts[0].x, clip[0].y)
  //           pts.forEach((pt) => { path.lineTo(pt.x, pt.y) })
  //           path.closePath()
  //           graphic.clip = path
  //         }
  //       } else {
  //         throw 'The clip parameter must be a boolean value equal to false or valid Graphic --> false || Plane, Polygon, Square, Rectangle, Arc, Circle'
  //       }
  //     },
  //     context: function (context) {
  //       if (typeof context === 'object') {
  //         for (let setting in context) {
  //           graphic.context[setting] = context[setting]
  //         }
  //       } else { throw 'The paramter must a be a valid object containing canvas api properties --> {fillStyle: "red", lineWidth: 5, ... } ' };
  //     }
  //   }]
  // ].forEach((obj) => { Object.assign(obj[0], obj[1]) })
}

function Arc (data) {
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
    radius: data.radius,
    angle: {start: data.angle.start * ((Math.PI/180) * -1) , finish: data.angle.finish * ((Math.PI/180) * -1) },
  }

  this.get.radius = ()=>{ return arc.radius }
  this.get.angle = () => { return {start: arc.angle.start, finish: arc.angle.finish} }
  this.set.radius = (int) => {
    if (typeof int !== 'number' || int < 1 ){ throw 'the paramater must be a number and greater than 0'}
    arc.radius = int;
  }
  this.render = function (context) {
    let center = this.get.center()
    let clip = this.get.clip()
    if (clip) { context.clip(clip) }
    context.arc(center.x,center.y,arc.radius,arc.angle.start,arc.angle.finish)
    if (this.get.fill()) { context.fill() }
    if (this.get.stroke()) { context.stroke() }
  }

}

function Polygon (data) {
  if (typeof data !== 'object' && !Array.isArray(data.points)) { throw 'The data must have the following structure --> {points:[{x,y},{x,y},{x,y}]} ' }
  let prototype = new Graphic(data.points, data.context)
  for (let method in prototype) { this[method] = prototype[method] };
  this.render = function (context) {
    let pts = this.get.points()
    let clip = this.get.clip()
    if (clip) { context.clip(clip) }
    context.moveTo(pts[0].x, pts[0].y)
    pts.forEach((pt) => { context.lineTo(pt.x, pt.y) })
    if (this.get.fill()) { context.fill() }
    if (this.get.stroke()) { context.stroke() }
  }
  setOfBasicActions(this);
}

function Rectangle(data){
  if(typeof data !== 'object' || typeof data.width !== 'number' || typeof data.height !== 'number' || typeof data.x !== 'number' || typeof data.y !== 'number' ){
    throw 'The data must have the following structure --> {x: int, y: int, width: int, height: int }'
  }
  Object.assign(this,new Polygon({points: [
    {x:data.x, y:data.y},
    {x:data.x + data.width, y:data.y},
    {x:data.x + data.width, y:data.y + data.height},
    {x:data.x, y:data.y + data.height}], context: data.context || {} }));

}

function Square (data) {
  if (typeof data !== 'object' || (typeof data.x !== 'number' && typeof data.y !== 'number' && typeof data.size !== 'number')) {
    throw 'The data must have the following structure --> {x: int, y: int size: int}'
  }
  let square = {
    instance: this,
    size: data.size
  }
  Object.assign(this, new Polygon({ points:
    [{ x: data.x, y: data.y }, { x: data.x + data.size, y: data.y }, { x: data.x + data.size, y: data.y + data.size }, { x: data.x, y: data.y + data.size }]
  }))
  this.get.size = () => { return square.size }
  this.set.size = (size,origin) => {
    if (typeof size !== 'number' || size < 0 ) { throw 'The paramter must be a number and greater than 0 ' }
    if(origin === undefined){ origin = square.instance.get.points(0).position; }
    square.instance.transform.scale((size / square.size),origin)
    square.size = size
  }
  this.actions.define({
    name: 'size',
    validate: (data) => {
      let response = {error: false, message: ''}
      if (typeof data !== 'object' || typeof data.size !== 'number' || data.size < 0 ) { response.error = true; response.message = 'The paramter must be a number and greater than 0 ' }
      return response
    },
    action: function (data) {
      let size = this.graphic.get.size();
      if (this.progress === this.duration) {
        data.step = (data.size - size)/this.duration
        if (data.origin == undefined) { data.origin = this.graphic.get.points(0).position }
      }
      this.graphic.set.size(size+data.step,(typeof data.origin === 'function' ? data.origin() : data.origin))
    }
  })
}

function Circle (data){
  if(typeof data !== 'object' || typeof data.x !== 'number' || typeof data.y !== 'number' || typeof data.radius !== 'number'){
    throw 'The data must have the following structure --> {x: int, y:int ,radius: int}'
  }

  Object.assign(this,new Arc({x:data.x,y:data.y,radius: data.radius, angle: {start: 0, finish: 360}, context: data.context || {} }))

  let circle = {
    instance: this,
    circumfrence: data.radius * 2
  }

  setOfBasicActions(this)

  this.get.circumfrence = () => { return circle.circumfrence }
  this.set.circumfrence = (int) => {
    if (typeof int !== 'number' || int < 1) { throw 'The parameter must be a number and greater than 0' }
    circle.circumfrence = int
    circle.instance.set.radius(int/2)
  }
  this.transform.scale = (size,origin) => {
    circle.instance.set.radius(circle.instance.get.radius() * size)
    circle.instance.get.points().forEach((pt) => {
      pt.x -= origin.x
      pt.y -= origin.y
      pt.x *= size
      pt.y *= size
      pt.x += origin.x
      pt.y += origin.y
    })
  }
}

const available = {
  'polygon': Polygon,
  'square': Square,
  'rectangle': Rectangle,
  'circle': Circle
}

function Graphics (Layers) {
  let expose = {};
  for(let graphic in available){
    expose[graphic] = (create) => {
      if(typeof create !== 'object' || typeof create.data !== 'object' || typeof create.layer !== 'number'){
        throw 'The data must have the following structure --> { data: object , layer: number }'
      }
      return Layers.get(create.layer).graphics.add(new available[graphic](create.data) )
    }
  }
  this.create = expose

}

export { Graphics, Graphic }
