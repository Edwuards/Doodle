var geometry = (function (exports) {
  'use strict';

  /*
    All rules must have a test and message property
    All test must return true if passed or false if failed.
    If test returns false the message will be available to log
    All test function can not be anonymous


    Rule = {
      message: string
      test: (value)=>{ return false || true }
    }

  */

  const Rules = {};
  Rules.is = {};
  Rules.has = {};
  Rules.validate = {};

  // RULES FOR IS TYPE

  Rules.is.object = {
    message: 'The parameter is not an object type',
    test: function(value){
      if(typeof value !== 'object' || Array.isArray(value) ){ return false; }    return true;
    }
  };

  Rules.is.notDuplicateProperty = {
    message: 'The property already exist inside the object ',
    test: function(property,object){
      if(object[property] !== undefined ){
        return false
      }
      return true
    }
  };

  Rules.is.string = {
    message: 'The parameter is not a string type',
    test: function(value){
      if(typeof value !== 'string'){ return false; }
      return true;
    }
  };

  Rules.is.number = {
    message: 'The parameter is not a number type',
    test: function(value){
      if(typeof value !== 'number'){ return false; }
      return true;
    }
  };

  Rules.is.array = {
    message: 'The paramter is not an Array type',
    test: function(value){ return Array.isArray(value); }
  };

  Rules.is.instanceOf = {
    message: 'The object given is not an instance of',
    test: function(compare,against){
      if(!(compare instanceof against)){
        this.message = `${this.message} ${against.name}`;
        return false
      }
      return true
    }
  };

  Rules.is.function = {
    message: 'The property is not a function',
    test: function(value){
      if(typeof value !== 'function'){ return false; }
      return true;
    }
  };

  Rules.is.greaterThan = {
    message: 'The value',
    test: function(check,against){
      if(check < against){
        this.message = `${this.message} ${check} is not greater than ${against}`;
        return false;
      }
      return true;
    }
  };

  Rules.is.htmlChildren = {
    message: 'The followin object does not posses an array property with HTMLElement instances ',
    test: function(children){
      if(!Array.isArray(children)){ return false }    if(children.some((child)=>{ return !(child instanceof HTMLElement) })){ return false }
      return true;
    }
  };

  Rules.is.defined = {
    message: 'The following property is not defined ',
    test: function(property,object){
      if(object[property] === undefined ){ this.message += 'property'; return false; }
      return true;
    }
  };

  Rules.is.notEmptyArray = {
    message: 'The given array is empty',
    test: function(array){
      return array.length != 0
    }
  };

  // RULES FOR HAS TYPE

  Rules.has.properties = {
    message: 'The object does not have all of the following properties ',
    test: function(properties,object){
      if(properties.some((property)=>{ return object[property] === undefined })){
        properties.forEach(function(property){ this.message = this.message+property+' '; }.bind(this));
        return false;
      }
      return true;
    }
  };

  Rules.has.index = {
    message: 'The index is undefined for the given array.',
    test: function(array,index){
      if(array[index] === undefined){ return false; }
      return true;
    }
  };

  for (let type in Rules) {
    for(let name in Rules[type]){
      let rule = Rules[type][name];
      let context = { message: rule.message, rules: Rules };
      Rules[type][name] = function(){ return test(context,rule,arguments) };
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
  		Rules.is.string(event),
  		Rules.is.notDuplicateProperty(event,Events)
  	  ].some((check)=>{ test = check ; return !test.passed; });

        if(!test.passed){ throw test.error(); }
        Events[event] = [];
      },
      delete: (event)=>{
        let test = undefined ;
  	  [
  		Rules.is.string(event),
  		Rules.is.defined(event,Events)
  	  ].some((check)=>{ test = check; return !test.passed });

  	if(!test.passed){ throw test.error(); }

        delete Events[event];
      }
    };

    this.notify = (event,update)=>{
      let test = Rules.is.defined(event,Events);
      if(!test.passed){ throw test.error(); }
      // could use the call function for each notification this way the parameters can be ambigous in length .
      Events[event].forEach((notify)=>{ notify(update); });
    };

    this.register = (event,subscriber)=>{
    	let test = undefined ;
       [
         Rules.is.defined(event,Events),
         Rules.is.function(subscriber)
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
        Rules.is.defined(event,Events),
        Rules.has.index(Events[event],index)
      ].some((check)=>{ test = check ; return !test.passed; });

  	  if(!test.passed){ throw test.error(); }

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
        let test = Rules.is.object(states);
        if(!test.passed){ throw test.error(); }
        for (let key in states) {
          if(State.registered[key] !== undefined){
            throw new Error('The following state already exist --> '+key);
          }

          test = Rules.is.function(states[key]);
          if(!test.passed){ throw test.error(); }

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

        if(!test.passed){ throw test.error(); }
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
    [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
    if(!test.passed){ throw test.error(); }

    const PT = {x,y};
    const OBSERVER = new Helpers.observer(['x update','y update']);
    const METHODS = {
      'y':{
        enumerable: true,
        get: ()=>{ return PT.y },
        set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ throw test.error() } PT.y = value; OBSERVER.notify('y update',value);  return value; }
      },
      'x':{
        enumerable: true,
        get: ()=>{ return PT.x },
        set: (value)=>{ test = Rules.is.number(value); if(!test.passed){ test.error(); } PT.x = value; OBSERVER.notify('x update',value); return value; },
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

    this.limits = ()=>{ return LIMITS.get };
    this.add = (x,y) => {
      let test = undefined;
      [x,y].some((value)=>{ test = Rules.is.number(value); return !test.passed });
      if(!test.passed){ throw test.error(); }

      return PTS[PTS.push(new Point(x, y)) - 1];
    };
    this.get = () => {
        let copy = [];
        PTS.forEach((pt) => { copy.push(pt); });
        return copy
    };
    this.find = (index)=>{
      let test = undefined;
      [Rules.is.number(index),Rules.has.index(PTS,index)].some((check)=>{
        test = check; return !test.passed;
      });
      if(!test.passed){ throw test.error(); }
      return PTS[index];
    };
  }

  function Plane (pts = []){
    let PTS = new Points(pts);

    this.get = {
      points: (index) => { return PTS.get(index) },
      limits: () => {
        let pts = PTS.get();
        let x = pts[0].x;
        let y = pts[0].y;
        let limits = { x: { min: x, max: x }, y: { min: y, max: y } };
        pts.forEach((pt) => {
          let x = pt.x;
          let y = pt.y;
          limits.x.max = x > limits.x.max ? x : limits.x.max;
          limits.x.min = x < limits.x.min ? x : limits.x.min;

          limits.y.max = y > limits.y.max ? y : limits.y.max;
          limits.y.min = y < limits.y.min ? y : limits.y.min;
        });
        return limits
      },
      width: function () { let limits = this.limits(); return limits.x.max - limits.x.min },
      height: function () { let limits = this.limits(); return limits.y.max - limits.y.min },
      center: function () { let limits = this.limits(); return { x: limits.x.min + this.width() / 2, y: limits.y.min + this.height() / 2 } }
    };
    this.set = {
      width: (int,min = false) => { updateLimits('width',int,min); },
      height: (int,min = false) => { updateLimits('height',int,min); }
    };
    this.add = {
      point: PTS.add
    };
    this.move = (position,origin)=>{
      let x = typeof position.x  == 'number' ? (origin.x + position.x) : undefined;
      let y = typeof position.y  == 'number' ? (origin.y + position.y) : undefined;
      instance.transform.translate({x,y},origin);
    };
    this.transform = {
      translate: (update, origin) => {
        let x = typeof update.x  === 'number' ? update.x - origin.x : 0;
        let y = typeof update.y === 'number'  ? update.y - origin.y : 0;
        PTS.get().forEach((pt) => { pt.translate(pt.x + x, pt.y + y); });
      },
      rotate: (degrees, origin) => { PTS.get().forEach((pt) => { pt.rotate(degrees, origin); }); },
      scale: (size, origin) => {
        PTS.get().forEach((pt) => {
          pt.x -= origin.x;
          pt.y -= origin.y;
          pt.x *= size;
          pt.y *= size;
          pt.x += origin.x;
          pt.y += origin.y;
        });
      }
    };
  }

  exports.Plane = Plane;
  exports.Point = Point;
  exports.Points = Points;

  return exports;

}({}));
