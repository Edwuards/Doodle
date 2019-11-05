var graphics = (function (exports) {
  'use strict';

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
  const EXPOSE = {};
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
      if(object[property] === undefined ){ this.message += 'property'; return false; }
      return true;
    }
  };

  RULES.is.notEmptyArray = {
    message: 'The given array is empty',
    test: function(array){
      return array.length != 0
    }
  };

  // RULES FOR HAS TYPE

  RULES.has.arrayLength = {
    message:'The array must have a length of ',
    test: function(array,length){
      if(!this.rules.is.array.test(array)){ this.message = this.rules.is.array.message; return false }
      if(!this.rules.is.number.test(length)){ this.message = this.rules.is.number.message; return false }
      if(array.length !== length){ return false }
      return true
    }
  };

  RULES.has.properties = {
    message: 'The object does not have all of the following properties ',
    test: function(properties,object){
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
      if(array[index] === undefined){ return false; }
      return true;
    }
  };

  for (let type in RULES) {
    for(let name in RULES[type]){
      let rule = RULES[type][name];
      if(EXPOSE[type] == undefined){ EXPOSE[type] = {}; }
      let context = { message: rule.message, rules: RULES };
      EXPOSE[type][name] = function(){ return test(context,rule,arguments) };
    }
  }

  function test(context,rule,value){
    let test = {passed: rule.test.apply(context,value), error: undefined };
    if(!test.passed){ test.error = ()=>{ return new Error(context.message); }; }
    return test
  }

  const Helpers = {};

  Helpers.observer = function(events){
    const Events = {};

    this.event = {
      create: (event)=>{
        let test = undefined;
  	  [
  		EXPOSE.is.string(event),
  		EXPOSE.is.notDuplicateProperty(event,Events)
  	  ].some((check)=>{ test = check ; return !test.passed; });

        if(!test.passed){ throw test.error(); }
        Events[event] = [];
      },
      delete: (event)=>{
        let test = undefined ;
  	  [
  		EXPOSE.is.string(event),
  		EXPOSE.is.defined(event,Events)
  	  ].some((check)=>{ test = check; return !test.passed });

  	if(!test.passed){ throw test.error(); }

        delete Events[event];
      }
    };

    this.notify = (event,update)=>{
      let test = EXPOSE.is.defined(event,Events);
      if(!test.passed){ throw test.error(); }
      // could use the call function for each notification this way the parameters can be ambigous in length .
      Events[event].forEach((notify)=>{ notify(update); });
    };

    this.register = (event,subscriber)=>{
    	let test = undefined ;
       [
         EXPOSE.is.defined(event,Events),
         EXPOSE.is.function(subscriber)
       ].some((check)=>{
  		test = check ;
  		return !test.passed ;
  	});

        if(!test.passed){ throw test.error(); }

       return Events[event].push(subscriber) - 1;
    };

    this.unregister = (event,index)=>{
    	let test = undefined ;
  	  [
        EXPOSE.is.defined(event,Events),
        EXPOSE.has.index(Events[event],index)
      ].some((check)=>{ test = check ; return !test.passed; });

  	  if(!test.passed){ throw test.error(); }

      Events[event]  = Events[event].reduce((a,c,i)=>{
        if(i !== index){ a.push(c); }
        return a;

      },[]);
    };

    if(EXPOSE.is.array(events).passed){
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
          EXPOSE.is.string(state),
          EXPOSE.is.defined(state,State.registered)
        ].some((check)=>{ if(!check.passed){test = check; return true; } });

        if(!test.passed){ throw test.error(); }

        State.current = state;
        State.registered[state].call(State);
        return true
      }
    };
    return {
      get: ()=>{ return State.current; },
      set: State.set,
      register: (states)=>{
        let test = EXPOSE.is.object(states);
        if(!test.passed){ throw test.error(); }
        for (let key in states) {
          if(State.registered[key] !== undefined){
            throw new Error('The following state already exist --> '+key);
          }

          test = EXPOSE.is.function(states[key]);
          if(!test.passed){ throw test.error(); }

          State.registered[key] = states[key];
        }
        return true;
      },
      unregister: (state)=>{
        let test = {passed:true};

        [
          EXPOSE.is.string(state),
          EXPOSE.is.defined(state,State.registered)
        ].some((check)=>{ if(!check.passed){ test = check; return true; } });

        if(!test.passed){ throw test.error(); }
        if(State.current === state){ State.current = undefined; }
        delete State.registered[state];

        return true
      }
    }
  };

  Helpers.copyObject = (obj)=>{
    function copy(obj){
      let test = EXPOSE.is.object(obj);
      if(!test.passed){ throw error(); }

      const clone = {};
      for(let key in obj){
        let value = obj[key];
        if(EXPOSE.is.object(value).passed){ value = copy(value); }
        clone[key] = value;
      }

      return clone;

    }

    return copy(obj);

  };

  function Limits(){
    const LIMITS = {x:{},y:{}};
    const OBSERVER = new Helpers.observer(['update','add']);
    const SET = (axis,limit,pt)=>{
      LIMITS[axis][limit].value = pt[axis];
      LIMITS[axis][limit].points = [];
    };
    const ADD = (axis,limit,pt)=>{ LIMITS[axis][limit].points.push(pt); OBSERVER.notify('add',LIMITS[axis][limit].points); };
    const UPDATE = (axis,limit,pt)=>{ SET(axis,limit,pt); ADD(axis,limit,pt); OBSERVER.notify('update',LIMITS[axis][limit]); };

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
    [x,y].some((value)=>{ test = EXPOSE.is.number(value); return !test.passed });
    if(!test.passed){ throw test.error(); }

    const PT = {x,y};
    const OBSERVER = new Helpers.observer(['x update','y update']);
    const METHODS = {
      'y':{
        enumerable: true,
        get: ()=>{ return PT.y },
        set: (value)=>{ test = EXPOSE.is.number(value); if(!test.passed){ throw test.error() } PT.y = value; OBSERVER.notify('y update',value);  return value; }
      },
      'x':{
        enumerable: true,
        get: ()=>{ return PT.x },
        set: (value)=>{ test = EXPOSE.is.number(value); if(!test.passed){ test.error(); } PT.x = value; OBSERVER.notify('x update',value); return value; },
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

    };

    Object.defineProperties(this,METHODS);

  }

  function Points (array){
    let test = undefined;
    [
      EXPOSE.is.array(array),
      EXPOSE.is.notEmptyArray(array),
      EXPOSE.is.greaterThan(array.length,3),
      (()=>{ array.some((pt)=>{ test = EXPOSE.is.instanceOf(pt,Point); return !test.passed }); return test })()
    ].some((check)=>{test = check; return !test.passed });

    if(!test.passed){ throw test.error(); }

    const PTS = [];
    const LIMITS = new Limits();
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
          [x,y].some((value)=>{ test = EXPOSE.is.number(value); return !test.passed });
          if(!test.passed){ throw test.error(); }

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
          [EXPOSE.is.number(index),EXPOSE.has.index(PTS,index)].some((check)=>{
            test = check; return !test.passed;
          });
          if(!test.passed){ throw test.error(); }
          return PTS[index];
        }
      }
    };
    array.forEach((pt)=>{
      PTS.push(pt);
      LIMITS.update(pt);
      pt.register('x update',LIMITS.update);
      pt.register('y update',LIMITS.update);
    });

    Object.defineProperties(this,METHODS);

  }

  function Plane (pts){
    let test = EXPOSE.is.instanceOf(pts,Points);
    if(!test.passed){ throw test.error(); }

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
        value: (x1,y1,x2,y2)=>{
          // x1 and y1 = translate , x2 and y2 = origin
          x1 = (!isNaN(x1) ? x1 - x2 : 0);
          y1 = (!isNaN(y1) ? y1 - y2 : 0);
          PTS.get().forEach((pt) => { pt.translate(pt.x + x1, pt.y + y1); });
        }
      },
      'rotate':{
        enumerable: true,
        writable: false,
        value: (degrees, origin) => { PTS.get().forEach((pt) => { pt.rotate(degrees, origin); }); }
      },
      'scale':{
        enumerable: true,
        writable: false,
        value: (size, origin) => {
          PTS.get().forEach((pt) => {
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
      EXPOSE.is.object(canvas),
      EXPOSE.is.instanceOf(canvas,CanvasRenderingContext2D),
    ].some((check)=>{ test = check; return !test.passed });

    if(!test.passed){ throw test.error(); }

    const GRAPHIC = this;
    const CANVAS = canvas;
    const CONTEXT = {};
    const SETUP = ()=>{
      for (let prop in CONTEXT) {
        CANVAS[prop] = CONTEXT[prop];
      }
    };
    const METHODS = {
      'render': {
        configurable: true,
        enumerable: true,
        set: (render)=>{
          let test = EXPOSE.is.function(render);
          if(!test.passed){ throw test.error(); }
          Object.defineProperty(GRAPHIC,'render',{
            enumerable: true,
            writable: false,
            value: ()=>{
              CANVAS.save();
              CANVAS.beginPath();
              SETUP();
              render.call({graphic: GRAPHIC, canvas: CANVAS });
              { CANVAS.fill(); }
              CANVAS.closePath();
              CANVAS.restore();
            }
          });

        }
      }
    };

    Object.defineProperties(this,METHODS);

  }

  function Graphic (data) {
    let test = undefined;
    [
      EXPOSE.is.object(data),
      EXPOSE.has.properties(['points','canvas'],data),
      EXPOSE.is.array(data.points),
      (()=>{
        let test = undefined;
        data.points.some((pt)=>{
          [
            EXPOSE.is.array(pt),
            EXPOSE.has.arrayLength(pt,2),
            EXPOSE.is.number(pt[0]),
            EXPOSE.is.number(pt[1]),
          ].some((check)=>{ test = check; return !test.passed });
          return !test.passed;
        });
        return test
      })()
    ].some((check)=>{ test = check; return !test.passed });

    if(data.context !== undefined){ test = EXPOSE.is.object(data.context); }

    if(!test.passed){ throw test.error(); }

    data.points = data.points.map((axis)=>{ return new Point(axis[0],axis[1]); });
    data.points = new Points(data.points);
    Plane.call(this,data.points);
    Context.call(this,data.canvas);
    // create METHODS and properties


  }

  function Polygon (data) {
    Graphic.call(this,data);
    this.render = function () {
      let pts = this.graphic.points.get;
      this.canvas.moveTo(pts[0].x, pts[0].y);
      pts.forEach((pt) => { this.canvas.lineTo(pt.x, pt.y); });
    };
  }

  exports.Polygon = Polygon;
  exports.Graphic = Graphic;

  return exports;

}({}));
