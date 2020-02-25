/*
  All RULES must have a test and message property
  All test must return true if passed or false if failed.
  If test returns false the message will be available to log
  All test function can not be anonymous


  Rule = {
    message: string
    test: (value)=>{ return false || true }
  }

*/
const Rules = {};
const RULES = {};


RULES.is = {};
RULES.has = {};
RULES.validate = {};

// RULES FOR IS TYPE

RULES.is.object = {
  message: 'The parameter is not an object type',
  test: function(value){
    if( Array.isArray(value) || typeof value !== 'object' ){ return false; }    return true;
  }
};

RULES.is.notDuplicateProperty = {
  message: 'The property already exist inside the object ',
  test: function(property,object){
    let test = this.rules.is.string(property);
    if(!test.passed){this.message = test.error; return false; }

    test = this.rules.is.object(object);
    if(!test.passed){ this.message = test.error; return false; }


    if(object[property] !== undefined ){
      return false
    }
    return true
  }
};

RULES.is.string = {
  message: 'The parameter is not a string type',
  test: function(value){
    if(typeof value !== 'string'){ return false; }
    return true;
  }
};

RULES.is.number = {
  message: 'The parameter is not a number type',
  test: function(value){
    if(typeof value !== 'number'){ return false; }
    return true;
  }
};

RULES.is.array = {
  message: 'The paramter is not an Array type',
  test: function(value){ return Array.isArray(value); }
};

RULES.is.instanceOf = {
  message: 'The object given is not an instance of',
  test: function(compare,against){
    let test = this.rules.is.object(compare);
    if(!test.passed){ this.message = test.error; return false; }

    test = this.rules.is.function(against);{
    if(!test.passed){ this.message = test.error; return false; }}

    if(!(compare instanceof against)){
      this.message = `${this.message} ${against.name}`;
      return false
    }
    return true
  }
};

RULES.is.function = {
  message: 'The property is not a function',
  test: function(value){
    if(typeof value !== 'function'){ return false; }
    return true;
  }
};

RULES.is.greaterThan = {
  message: 'The value',
  test: function(check,against){
    let test = this.rules.is.number(check);
    if(!test.passed){ this.message = test.error; return false; }

    test = this.rules.is.number(against);
    if(!test.passed){ this.message = test.error; return false; }

    if(check < against){
      this.message = `${this.message} ${check} is not greater than ${against}`;
      return false;
    }
    return true;
  }
};

RULES.is.htmlChildren = {
  message: 'The followin object does not posses an array property with HTMLElement instances ',
  test: function(children){
    if(!Array.isArray(children)){ return false }    if(children.some((child)=>{ return !(child instanceof HTMLElement) })){ return false }
    return true;
  }
};

RULES.is.defined = {
  message: 'The following property is not defined ',
  test: function(property,object){
    let test = this.rules.is.string(property);
    if(!test.passed){ this.message = test.error; return false; }

    test = this.rules.is.object(object);
    if(!test.passed){ this.message = test.error; return false; }

    if(object[property] === undefined ){ this.message += 'property'; return false; }
    return true;
  }
};

RULES.is.notEmptyArray = {
  message: 'The given array is empty',
  test: function(array){
    let test = this.rules.is.array(array);
    if(!test.passed){ this.message = test.error; return false; }

    return array.length != 0
  }
};

// RULES FOR HAS TYPE

RULES.has.arrayLength = {
  message:'The array must have a length of ',
  test: function(array,length){
    let test = this.rules.is.array(array);
    if(!test.passed){ this.message = test.error; return false}

    test = this.rules.is.number(length);
    if(!test.passed){ this.message = test.error; return false}

    if(array.length !== length){ return false }
    return true
  }
};

RULES.has.properties = {
  message: 'The object does not have all of the following properties ',
  test: function(properties,object){
    let test = this.rules.is.object(object);
    if(!test.passed){ this.message = test.error; return false }

    test = this.rules.is.array(properties);
    if(!test.passed){ this.message = test.error; return false }

    (function(properties){

      properties.every(function(prop){
        test = this.rules.is.string(prop);
        return test.passed
      }.bind(this));

      return test;

    }.bind(this))(properties);

    if(!test.passed){ this.message = test.error; return false }


    if(properties.some((property)=>{ return object[property] === undefined })){
      properties.forEach(function(property){ this.message = this.message+property+' '; }.bind(this));
      return false;
    }
    return true;
  }
};

RULES.has.index = {
  message: 'The index is undefined for the given array.',
  test: function(array,index){
    let test = this.rules.is.array(array);
    if(!test.passed){ this.message = test.error; return false; }

    test = this.rules.is.number(index);
    if(!test.passed){ this.message = test.error; return false; }

    if(array[index] === undefined){ return false; }
    return true;
  }
};

for (let type in RULES) {
  for(let name in RULES[type]){
    let rule = RULES[type][name];
    if(Rules[type] == undefined){ Rules[type] = {}; }
    let context = { message: rule.message, rules: Rules };
    Rules[type][name] = function(){ return new Rule(context,rule,arguments) };
  }
}

function Rule(context,rule,args){
  this.passed = rule.test.apply(context,args);
  this.error = this.passed ? undefined : new Error(context.message);
}

function Test(tests){
  let test = undefined, rule = undefined, args = undefined;
  test = Rules.is.array(tests);
  if(!test.passed){ return test }  tests.every((check,i)=>{

    test = Rules.is.array(check);
    if(!test.passed){ return false; }

    test = Rules.has.arrayLength(check,2);
    if(!test.passed){ return false; }

    rule = check[0]; args = check[1];

    test = Rules.is.array(args);
    if(!test.passed){ return false; }

    test = Rules.is.function(rule);
    if(!test.passed){ return false; }

    rule = rule.apply(null,args);

    test = Rules.is.instanceOf(rule,Rule);
    if(!test.passed){ return false; }

    test = rule;

    return test.passed


  });

  return test
}

const Helpers = {};

Helpers.observer = function(events){
  const Events = {};

  this.event = {
    create: (event)=>{
      let test = undefined;
  	  [
    		Rules.is.string(event),
    		Rules.is.notDuplicateProperty(event,Events)
  	  ].some((check)=>{ test = check ; return !test.passed; });

      if(!test.passed){ throw test.error; }
      Events[event] = [];
    },
    delete: (event)=>{
      let test = undefined ;
  	  [
    		Rules.is.string(event),
    		Rules.is.defined(event,Events)
  	  ].some((check)=>{ test = check; return !test.passed });

    	if(!test.passed){ throw test.error; }

      delete Events[event];
    }
  };

  this.notify = (event,update)=>{
    let test = Rules.is.defined(event,Events);
    if(!test.passed){ throw test.error; }
    // could use the call function for each notification this way the parameters can be ambigous in length .
    Events[event].forEach((notify)=>{ notify.apply(null,update); });
  };

  this.register = (event,subscriber)=>{
  	let test = Test([
      [Rules.is.defined,[event,Events]],
      [Rules.is.function,[subscriber]]
    ]);

    if(!test.passed){ throw test.error; }

    return Events[event].push(subscriber) - 1;
  };

  this.unregister = (event,index)=>{
  	let test = undefined ;
	  [
      Rules.is.defined(event,Events),
      Rules.has.index(Events[event],index)
    ].some((check)=>{ test = check ; return !test.passed; });

	  if(!test.passed){ throw test.error; }

    Events[event]  = Events[event].reduce((a,c,i)=>{
      if(i !== index){ a.push(c); }
      return a;

    },[]);
  };

  if(Rules.is.array(events).passed){
	  events.forEach(this.event.create);
  }

};

Helpers.state = function(){
  const State = {
    registered:{},
    current:undefined,
    set: (state)=>{
      let test = {passed: true};
      [
        Rules.is.string(state),
        Rules.is.defined(state,State.registered)
      ].some((check)=>{ if(!check.passed){test = check; return true; } });

      if(!test.passed){ throw test.error; }

      State.current = state;
      State.registered[state].call(State);
      return true
    }
  };
  return {
    get: ()=>{ return State.current; },
    set: State.set,
    register: (states)=>{
      let test = Rules.is.object(states);
      if(!test.passed){ throw test.error; }
      for (let key in states) {
        if(State.registered[key] !== undefined){
          throw new Error('The following state already exist --> '+key);
        }

        test = Rules.is.function(states[key]);
        if(!test.passed){ throw test.error; }

        State.registered[key] = states[key];
      }
      return true;
    },
    unregister: (state)=>{
      let test = {passed:true};

      [
        Rules.is.string(state),
        Rules.is.defined(state,State.registered)
      ].some((check)=>{ if(!check.passed){ test = check; return true; } });

      if(!test.passed){ throw test.error; }
      if(State.current === state){ State.current = undefined; }
      delete State.registered[state];

      return true
    }
  }
};

Helpers.copyObject = (obj)=>{
  function copy(obj){
    let test = Rules.is.object(obj);
    if(!test.passed){ throw error(); }

    const clone = {};
    for(let key in obj){
      let value = obj[key];
      if(Rules.is.object(value).passed){ value = copy(value); }
      clone[key] = value;
    }

    return clone;

  }

  return copy(obj);

};

Helpers.angleToRadians = (angle)=>{ return (angle * (Math.PI/180)) };

Helpers.counter = ()=>{
  let id = 0;
  const EXPOSE = {};
  const METHODS = {
    'create': {
      enumerable: true,
      writable: false,
      value: ()=>{ id += 1; return id }
    }
  };

  Object.defineProperties(EXPOSE,METHODS);

  return EXPOSE;
};

Helpers.list = ()=>{
  let List = [];
  const EXPOSE = {};
  const Observer = new Helpers.observer();

  [
    'before insert',
    'after insert',
    'before delete',
    'after delete',
    'before get',
  ].forEach((name)=>{ Observer.event.create(name); });

  const METHODS = {
    'add':{
      enumerable: true,
      writable: false,
      value: (item)=>{
        Observer.notify('before insert',[item]);
        List.push(item);
        Observer.notify('after insert',[item]);
        return item
      }
    },
    'delete':{
      enumerable: true,
      writable: false,
      value: (index)=>{
        let test = Test([
          [Rules.is.number,[index]],
          [Rules.has.index,[List,index]]
        ]);
        if(!test.passed){ throw test.error; }

        Observer.notify('before delete',[index,List]);
        List.reduce((a,c,i)=>{ if(i !== index){ a.push(c); } return a },[]);
        Observer.notify('after delete',[index,List]);

        return true
      }
    },
    'get':{
      enumerable: true,
      writable: false,
      value: (index)=>{
        if(index !== undefined){
          let test = Test([
            [Rules.is.number,[index]],
            [Rules.has.index,[List,index]]
          ]);
          if(!test.passed){ throw test.error; }

          Observer.notify('before get',[List,index]);
          return List[index];
        }
        return List.map((l)=>{ return l });
      }
    },
    'find':{
      enumerable: true,
      writable: false,
      value: (find)=>{
        let test = Rules.is.function(find);
        if(!test.passed){ throw test.error; }        return List.find(find);
      }
    },
    'update': {
      enumerable: true,
      writable: false,
      value: (index,value)=>{
        let test = Test([
          [Rules.is.number,[index]],
          [Rules.has.index,[List,index]]
        ]);
        if(!test.passed){ throw test.error; }

        List[index] = value;

        return true;
      }
    },
    'register':{
      enumerable: true,
      writable: false,
      value: Observer.register
    },
    'unregister':{
      enumerable: true,
      writable: false,
      value: Observer.unregister
    }
  };

  Object.defineProperties(EXPOSE,METHODS);

  return EXPOSE;
};

function Limits(pts){
  let LIMITS = {x:{},y:{}};
  const SET = function(axis,limit,pt){
    LIMITS[axis][limit].value = pt[axis];
    LIMITS[axis][limit].points = [];
  };
  const ADD = function(axis,limit,pt){ LIMITS[axis][limit].points.push(pt);  };
  const UPDATE = function(axis,limit,pt){ SET(axis,limit,pt); ADD(axis,limit,pt);  };

  LIMITS.x = {
    min: { value: undefined, points: [] },
    max: { value: undefined, points: [] }
  };
  LIMITS.y = {
    min: { value: undefined, points: [] },
    max: { value: undefined, points: [] }
  };

  Object.defineProperties(this,{
    'get': {
      enumerable: true,
      get: (pt)=>{

          LIMITS.x = {
            min: { value: undefined, points: [] },
            max: { value: undefined, points: [] }
          };
          LIMITS.y = {
            min: { value: undefined, points: [] },
            max: { value: undefined, points: [] }
          };

        pts.get.forEach((pt)=>{
          ['x','y'].forEach((axis,i)=>{
            if(LIMITS[axis].min.value === undefined ){
              UPDATE(axis,'min',pt);
              UPDATE(axis,'max',pt);
            }
            if(pt[axis] < LIMITS[axis].min.value){
              UPDATE(axis,'min',pt);
            }
            if( pt[axis] > LIMITS[axis].max.value){
              UPDATE(axis,'max',pt);
            }


          });
        });
        return LIMITS;
      }
    },
  });

}

function Point (x, y){
  let test = undefined;
  [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
  if(!test.passed){ throw test.error; }

  const PT = {x,y};
  const OBSERVER = new Helpers.observer(['x update','y update']);
  const METHODS = {
    'y':{
      enumerable: true,
      get: ()=>{ return PT.y },
      set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ throw test.error() } PT.y = value; OBSERVER.notify('y update',[value]);  return value; }
    },
    'x':{
      enumerable: true,
      get: ()=>{ return PT.x },
      set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ test.error(); } PT.x = value; OBSERVER.notify('x update',[value]); return value; },
    },
    'translate': {
      enumerable: true,
      writable: false,
      value: function(x, y){
        PT.x = PT.x + x;
        PT.y = PT.y + y;
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

  };

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

  if(!test.passed){ throw test.error; }

  const PTS = [];
  const LIMITS = new Limits(this);
  const METHODS = {
    'limits':{
      enumerable: true,
      get: ()=>{ return LIMITS },
    },
    'add': {
      enumerable: true,
      writable: false,
      value: (x,y) => {
        let test = undefined;
        [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
        if(!test.passed){ throw test.error; }

        return PTS[PTS.push(new Point(x, y)) - 1];
      }
    },
    'get': {
      enumerable: true,
      get: ()=>{
        let copy = [];
        PTS.forEach((pt) => { copy.push(pt); });
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
        if(!test.passed){ throw test.error; }
        return PTS[index];
      }
    }
  };
  array.forEach((pt)=>{ PTS.push(pt); });

  Object.defineProperties(this,METHODS);

}

function Plane (pts){
  let test = Rules.is.instanceOf(pts,Points);
  if(!test.passed){ throw test.error; }

  const PTS = pts;
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
      get: function(){ let limits = PTS.limits.get; return { x: limits.x.min.value + (this.width / 2), y: limits.y.min.value + (this.height / 2)  } }
    },
    'translate': {
      enumerable: true,
      writable: false,
      value: (x1,y1)=>{
        // x1 and y1 = translate , x2 and y2 = origin
        PTS.get.forEach((pt) => { pt.translate(x1,y1); });
      }
    },
    'rotate':{
      enumerable: true,
      writable: false,
      value: (degrees, origin) => { if(origin === undefined){ origin = this.center; } PTS.get.forEach((pt) => { pt.rotate(degrees, origin); }); }
    },
    'scale':{
      enumerable: true,
      writable: false,
      value: (size, origin) => {
        PTS.get.forEach((pt) => {
          pt.x -= origin.x;
          pt.y -= origin.y;
          pt.x *= size;
          pt.y *= size;
          pt.x += origin.x;
          pt.y += origin.y;
        });
      }
    }
  };

  Object.defineProperties(this,METHODS);

}

const ID = Helpers.counter();

function Context(canvas){
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
  };
  const SETUP = ()=>{
    for (let prop in CONTEXT.properties) { CANVAS[prop] = CONTEXT.properties[prop]; }
  };
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
        let test = Rules.is.function(render);
        if(!test.passed){ throw test.error; }
        Object.defineProperty(GRAPHIC,'render',{
          enumerable: true,
          writable: false,
          value: ()=>{
            CANVAS.save();
            CANVAS.beginPath();
            SETUP();
            render.call({graphic: GRAPHIC, canvas: CANVAS });
            CALL();
            CANVAS.closePath();
            CANVAS.restore();
          }
        });

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
  };

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
  };
  const METHODS = {
    'id': {
      enumerable: true,
      get: ()=>{ return PROPS.id }
    }
  };

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
  };
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
  };

  {
    let x = data.x, xr = x + PROPS.radius;
    let y = data.y, yr = y + PROPS.radius;

    let pts = [[x,y],[xr,y],[xr,yr],[x,yr]];

    Graphic.call(this,{canvas: data.canvas, points: pts});
  }

  Object.defineProperties(this,METHODS);

  this.render = function () {
    let center = this.graphic.center;
    this.canvas.arc(center.x,center.y,PROPS.radius,PROPS.angle.start,PROPS.angle.finish);
  };

}

function Polygon (data) {
  Graphic.call(this,data);
  this.render = function () {
    let pts = this.graphic.points.get;
    this.canvas.moveTo(pts[0].x, pts[0].y);
    pts.forEach((pt) => { this.canvas.lineTo(pt.x, pt.y); });
  };
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
  };

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

  function Radial(x,y,r){

    const METHODS = {
      'x':{
        enumerable: true,
        get:()=>{ return x; },
        set:(value)=>{ x = value; }
      },
      'y':{
        enumerable: true,
        get:()=>{ return y; },
        set:(value)=>{ y = value; }
      },
      'r':{
        enumerable: true,
        get:()=>{ return r; },
        set:(value)=>{ r = value; }
      },
    };

    Object.defineProperties(this,METHODS);
  }

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
        };
        Object.defineProperties(OBJ,METHODS);
        return OBJ;
      })()
    }
  };

  const PROPS = {
    radials: [],
    colorStops: {}
  };

  let x = data.x, w = x+data.w;
  let y = data.y, h = y+data.h;
  let points = [[x,y],[w,y],[w,h],[x,h]];
  data.radials.forEach((radial,i)=>{ PROPS.radials.push(new Radial(radial.x,radial.y,radial.r)); });

  Graphic.call(this,{points,canvas:data.canvas});
  Object.defineProperties(this,METHODS);
  this.render = function () {
    let pts = this.graphic.points.get;
    this.canvas.moveTo(pts[0].x, pts[0].y);
    pts.forEach((pt) => { this.canvas.lineTo(pt.x, pt.y); });

    let radials = this.graphic.radials;
    let gradient = this.canvas.createRadialGradient(radials[0].x,radials[0].y,radials[0].r,radials[1].x,radials[1].y,radials[1].r);
    this.graphic.colorStops.get.forEach((data)=>{ gradient.addColorStop(data.stop,data.color); });
    this.canvas.fillStyle = gradient;
  };
}

var Graphics = /*#__PURE__*/Object.freeze({
  Polygon: Polygon,
  Rectangle: Rectangle,
  Square: Square,
  Circle: Circle,
  Arc: Arc,
  RadialGradient: RadialGradient
});

const ID$1 = Helpers.counter();

function Layers (container) {
  let test = Rules.is.instanceOf(container,HTMLElement);
  if(!test.passed){ throw test.error; }

  const LAYERS = Helpers.list();
  const METHODS = {
    'add': {
      enumerable: true,
      writable: false,
      value: (layer)=>{
        layer.index = LAYERS.get().length;
        container.append(LAYERS.add(new Layer(layer)).canvas);
      }
    },
    'get':{
      enumerable: true,
      writable: false,
      value: LAYERS.get
    },
    'delete':{
      enumerable: true,
      writable: false,
      value: LAYERS.delete
    },
    'find':{
      enumerable: true,
      writable: false,
      value: (name)=>{
        let test = Rules.is.string(name);
        if(!test.passed){ throw test.error; }
        return LAYERS.find((layer)=>{ return layer.name == name });
      }
    }
  };

  Object.defineProperties(this,METHODS);

}

function Layer (data) {
  let test = Test([
    [Rules.is.object,[data]],
    [Rules.has.properties,[['name','index','width','height'],data]],
    [Rules.has.arrayLength,[Object.keys(data),4]],
    [Rules.is.string,[data.name]],
    [(data)=>{
      let test = undefined;
      ['index','height','width'].every((prop)=>{ test = Rules.is.number(data[prop]); return test.passed; });
      return test
    },[data]]
  ]);

  if(!test.passed){ throw test.error; }

  const CANVAS = document.createElement('canvas');

  const PROPS = {
    name: data.name,
    id: ID$1.create(),
    index: data.index,
    canvas: CANVAS,
    context: CANVAS.getContext('2d'),
    loop: undefined,
    graphics: Helpers.list()
  };

  [['height',data.height],['width',data.width],['data-id',PROPS.id]].forEach((attr)=>{ CANVAS.setAttribute(attr[0],attr[1]); });

  const METHODS = {
    'name': {
      enumerable: true,
      get: ()=>{ return PROPS.name }
    },
    'id': {
      enumerable: true,
      get: ()=>{ return PROPS.id; }
    },
    'canvas': {
      enumerable: true,
      get: ()=>{ return PROPS.canvas; }
    },
    'context': {
      enumerable: true,
      get: ()=>{ return PROPS.context; }
    },
    'width': {
      enumerable: true,
      get: ()=>{ return CANVAS.width },
    },
    'height': {
      enumerable: true,
      get: ()=>{ return CANVAS.height },
    },
    'graphics':{
      enumerable: true,
      writable: false,
      value: PROPS.graphics
    }
  };

  Object.defineProperties(this,METHODS);

}

const Loop = (layer) => {
  let context = layer.context;
  return setInterval(function () {
    context.clearRect(0, 0, layer.width, layer.height);
    layer.graphics.get().forEach((graphic) => { graphic.render(); });
  }, 10);
};

function Render (LAYERS) {
  let test = Rules.is.instanceOf(LAYERS,Layers);

  if(!test.passed){ throw test.error; }

  const LOOPS = Helpers.list();
  // might need an obesrver to add a layer
  LAYERS.get().forEach((layer)=>{ LOOPS.add(false); });

  const METHODS = {
    'start':{
      enumerable: true,
      writable: false,
      value: (layer)=>{
        if(layer !== undefined){
          let string = Rules.is.string(layer);
          let int = Rules.is.number(layer);
          let valid = string.passed && int.passed ;
          if(!valid){ throw (string.passed ? int.error : string.error); }

          layer = ( string.passed ? LAYERS.find(layer) : LAYERS.get(layer) );

          if(!layer){ throw new Error(`The layer was not found`); }

          if(LOOPS.get(layer.index) !== undefined){ LOOPS.update(layer.index, Loop(layer) ); }

        }
        else{
          console.log(LOOPS.get());
          LOOPS.get().forEach((loop,i)=>{ if(!loop){ LOOPS.update(i,Loop(LAYERS.get(i))); }  });
        }
      }
    },
    'stop':{
      enumerable: true,
      writable: false,
      value: (layer)=>{
        if(layer !== undefined){
          let string = Rules.is.string(layer);
          let int = Rules.is.number(layer);
          let valid = string.passed && int.passed ;
          if(!valid){ throw (string.passed ? int.error : string.error); }

          layer = ( string.passed ? LAYERS.find(layer) : LAYERS.get(layer) );

          if(!layer){ throw new Error(`The layer was not found`); }

          let active = LOOPS.get(layer.index);
          clearInterval(active);
          if(active){ LOOPS.update(layer.index, false ); }
        }
        else{
          LOOPS.get().forEach((loop,i)=>{ if(loop){ clearInterval(loop); LOOPS.update(i,false); }  });
        }

      }
    }
  };

  Object.defineProperties(this,METHODS);
}

function graphicsBuilder(LAYERS){
  const METHODS = {
    'create': {
      enumerable: true,
      writable: false,
      value: (()=>{
        let graphics = {};
        for(let type in Graphics){
          Object.defineProperty(graphics,type.toLowerCase(),{
            enumerable: true,
            writable: false,
            value: (data,layer = 0)=>{
              layer = LAYERS.get(layer);
              data.canvas = layer.context;
              return layer.graphics.add(new Graphics[type](data));
            }
          });
        }
        return graphics;
      })()
    },
    'get': {
      enumerable: true,
      writable: false,
      value: (id)=>{
        if(id !== undefined){
          let test = Rules.is.number(id);
          if(!test.passed){ throw test.error; }

          let graphic = undefined;
          {
            let layers = LAYERS.get();
            for (var i = 0; i < layers.length; i++) {
              graphic = layers[i].graphics.find((g)=>{ return g.id = id; });
            }
          }
          return graphic;
        }

        return LAYERS.get().reduce((result,layer)=>{
          layer.graphics.get().forEach(graphic => result.push(graphic));
          return result
        },[]);
      }
    }
  };

  Object.defineProperties(this,METHODS);
}

function Doodle(data){
  let test = Test([
    [Rules.is.object,[data]],
    [Rules.is.defined,['container',data]]
  ]);

  if(!test.passed){ throw test.error; }

  let METHODS = {};

  METHODS.layers = {
    enumerable: true,
    writable: false,
    value: (()=>{
      let layers = new Layers(data.container);

      layers.add({
        width: data.width || Number(data.container.offsetWidth),
        height: data.height || Number(data.container.offsetHeight),
        name: 'Untitled-0'
      });
      return layers
    })()
  };

  METHODS.render = {
    enumerable: true,
    writable: false,
    value: (()=>{ let render = new Render(METHODS.layers.value); render.start(); return render; })()
  };

  METHODS.graphics = {
    enumerable: true,
    writable: false,
    value:new graphicsBuilder(METHODS.layers.value)
  };



  Object.defineProperties(this,METHODS);
}

export default Doodle ;
