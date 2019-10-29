var graphics = (function (exports) {
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
      if( Array.isArray(value) || typeof value !== 'object' ){ return false; }    return true;
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

  Rules.has.arrayLength = {
    message:'The array must have a length of ',
    test: function(array,length){
      if(!Rules.is.array.test(array)){ this.message = Rules.is.array.message; return false }
      if(!Rules.is.number.test(length)){ this.message = Rules.is.number.message; return false }
      if(array.length !== length){ return false }
      return true
    }
  };

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
    let test = Rules.is.instanceOf(pts,Points);
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

  function Actions (graphic) {
    let actions = { list: [], instance: this };

    this.define = function(define){
      if (typeof define !== 'object' ||
      [['name', 'string'], ['validate', 'function'], ['action', 'function']].some((check) => { return define[check[0]] === undefined || typeof define[check[0]] !== check[1] })) {
        throw 'The data paramter must have the following structure --> name: String, validate: function, action: function'
      }
      let validate = define.validate();
      if (['error', 'message'].some((prop) => { return validate[prop] === undefined })) {
        throw 'The validate function must return a valid response object --> { error: boolean , message: String }'
      }

      actions.instance.perform[define.name] = (data) => {
        let test = define.validate(data.data);
        if (test.error) { throw test.message }      data.action = define.action;
        data.type = define.name;
        return actions.list[actions.list.push(new Action(data, actions.list.length, graphic)) - 1].execute()

      };
      return true
    };
    this.perform = {};
    this.get = (state) => {
      let copy = [];
      if (state === undefined) {
        actions.list.forEach((action) => { copy.push(action.get); });
      } else if (typeof state === 'number' && state >= 0 && state <= 2) {
        actions.list.forEach((action) => { if (action.get.state() === state) { copy.push(action.get); } });
      } else {
        throw 'The state paramter must be one of the following values --> 0 (cancled) || 1 (completed) || 2 (progress)'
      }

      return copy
    };
    this.cancel = (selection) => { cancelOrResume('cancel', selection, actions.list); };
    this.resume = (selection) => { cancelOrResume('resume', selection, actions.list); };
  }

  function Action (data, id, graphic) {
    // state --> 0 = canceled || 1 = completed || 2 = progress
    data.duration = Math.round(data.duration / 10);
    let action = {
      perform: data.action,
      id: id,
      state: 2,
      loop: undefined,
      type: data.name ,
      repeat: (typeof data.repeat === 'number' && data.repeat > 0) || typeof data.repeat === 'boolean' ? data.repeat : false,
      duration: data.duration,
      progress: data.duration,
      data: data.data || []
    };
    this.cancel = () => { action.state = 0; return true };
    this.resume = function () {
      if (action.state === 1) { throw 'This action has already been completed' }    if (action.state === 2) { throw 'This action is currently in progress' }    action.state = 2; return this.execute(action, graphic)
    };
    this.execute = () => {
      return new Promise(function (resolve, reject) {
        action.loop = setInterval(() => {
          if (action.state === 1 || action.state === 0) {
            clearInterval(action.loop);
            action.loop = undefined;
            action.state ? resolve(graphic) : reject(graphic);
          } else {
            if (action.progress) {
              action.perform.apply({ graphic: graphic, duration: action.duration, progress: action.progress }, [action.data]);
              action.progress--;
            } else if (action.repeat) {
              if (typeof action.repeat !== 'boolean') { action.repeat--; }
              action.progress = action.duration;
            } else {
              action.state = 1;
            }
          }
        }, 10);
      })
    };
    this.get = {
      state: () => { return action.state },
      type: () => { return action.state },
      repeat: () => { return action.state },
      duration: () => { return action.duration },
      progress: () => { return action.progress },
      id: () => { return action.id }
    };
  }

  function cancelOrResume (job, list, actions) {
    if (list === undefined) {
      actions.forEach((action) => { action[job](); });
    } else if (!Array.isArray(list) || list.some((int) => { return typeof int !== 'number' })) {
      throw 'The list paramter must be an array holding action id refrences --> [1,2,3,4,5,] '
    } else {
      let error = ''; actions.reduce((result, action) => {
        if (list.indexOf(action.get.id()) !== -1) { action[job](); result.push(true); } else { result.push(false); }
        return result
      }, []).forEach((r, i) => { if (!r) { error += String(list[i]) + ' '; } });
      if (error.length) { throw 'The following action id were not found --> ' + error }
    }
  }

  function setOfBasicActions(graphic){
    graphic.actions = new Actions(graphic);
    [
      {
        name: 'scale',
        validate: (data) => {
          let response = { error: false, message: '' };
          if (typeof data !== 'object' || typeof data.scale !== 'number' ) {
            response.error = true;
            response.message = 'The data must have the following structure --> {scale : int, origin: {x: int , y: int}}';
            return response
          }
          if (typeof data.origin === 'function' ) {
            let origin = data.origin();
            if( typeof origin.x !== 'number' && typeof origin.y !== 'number' ){
              response.error = true;
              response.message = 'The origin paramter does not return a valid point object --> {x: int , y: int}';
            }
            return response
          }
          if (typeof data.origin !== 'object' || typeof data.origin.x !== 'number' || typeof data.origin.x !== 'number' ) {
            response.error = true;
            response.message = 'The orign object must be a valid point object or a function returning a valid point object';
            return response
          }
          return response
        },
        action: function (data) {
          if (this.progress === this.duration) {
            data.pt = this.graphic.get.points();
            Math.round(data.pt[0].x) !== Math.round(data.origin.x) ? (data.x = data.pt[0].x, data.pt = data.pt[0]) : (data.x = data.pt[1].x , data.pt = data.pt[1]);
            data.x -= data.origin.x;
            data.step = ((data.x * data.scale) - data.x) / this.duration;
          }
          else{
            data.x = data.pt.x - data.origin.x;
          }
          data.scale = (data.x + data.step)/data.x;
          this.graphic.transform.scale(data.scale,(typeof data.origin === 'function' ? data.origin() : data.origin) );

        }
      },
      {
        name: 'rotate',
        validate: (data) => {
          let response = {error: false, message: ''};
          if (typeof data !== 'object' || typeof data.degrees !== 'number' ) {
            response.error = true;
            response.message = 'The data must have the following structure --> {degrees: int, origin: {x: int, y: int}}';
            return response
          }
          if (typeof data.origin === 'function' ) {
            let origin = data.origin();
            if( typeof origin.x !== 'number' && typeof origin.y !== 'number' ){
              response.error = true;
              response.message = 'The origin paramter does not return a valid point object --> {x: int , y: int}';
            }
            return response
          }
          if (typeof data.origin !== 'object' || typeof data.origin.x !== 'number' || typeof data.origin.x !== 'number' ) {
            response.error = true;
            response.message = 'The orign object must be a valid point object or a function returning a valid point object';
            return response
          }
          return response
        },
        action: function(data) {
          this.graphic.transform.rotate(data.degrees/this.duration ,(typeof data.origin === 'function' ? data.origin() : data.origin) );
        }
      },
      {
        name: 'translate',
        validate: (data) => {
          let response = { error: false, message: '' };
          if (
            typeof data !== 'object' ||
          (data.x === undefined && data.y === undefined) ||
          (data.x && typeof data.x !== 'number') ||
          (data.y && typeof data.y !== 'number')
          ) { response.error = true; response.message = 'The data must have the following structure --> {x: int, y: int origin: {x: int, y:int } } || {x: int, origin: {x: int, y: int } } || {x: int, origin: {x: int, y: int } }'; }
          return response
        },
        action: function (data) {
          let origin = (typeof data.origin === 'function' ? data.origin() : data.origin);
          let x = typeof data.x === 'number' ? ((data.x - origin.x) / this.duration) + origin.x : undefined;
          let y = typeof data.y === 'number' ? ((data.y - origin.y) / this.duration) + origin.y : undefined;
          this.graphic.transform.translate({ x, y }, origin);
        }
      },
      {
        name: 'move',
        validate: (data)=>{
          let response = {error: false, message: ''};
          if(typeof data != 'object' || (data.y == undefined && data.x == undefined)
          || (data.x && typeof data.x != 'number' ) || (data.y && typeof data.y != 'number')
          ){
            response.error = true, response.message = 'The data must have the following structure -->{ x: int || y:int , origin: {x: int , y:int} }';
            return response
          }
          return response
        },
        action: function(data){
          let origin = (typeof data.origin === 'function' ? data.origin() : data.origin);
          let x = typeof data.x === 'number' ? data.x/this.duration : undefined;
          let y = typeof data.y === 'number' ? data.y/this.duration : undefined;
          this.graphic.move({x,y},origin);
        }
      },
      {
        name: 'width',
        validate: (data) => {
          let response = { error: false, message: '' };
          if(typeof data !== 'object' || typeof data.width !== 'number' || data.width <= 0 ){ response.error = true; response.message = 'The parameter must have the following structure --> { width: int > 0, from: string (optional)}';}
          return response
        },
        action: function(data){
          if(this.progress === this.duration){
            if(typeof data.from == 'string'){
              if(data.from == 'right'){ data.from = true; }
              else{ data.from = false; }
            }
          }
          let current = this.graphic.get.width();
          let update = (data.width - current) / this.progress;
          this.graphic.set.width(current+update,data.from);
        }
      },
      {
        name: 'height',
        validate: (data) => {
          let response = { error: false, message: '' };
          if(typeof data != 'object' || typeof data.height !== 'number' || data.height <= 0){ response.error = true; response.message = 'The parameter must have the following structure --> { height: int > 0, from: string (optional)}';}
          return response
        },
        action: function(data){
          if(this.progress === this.duration){
            if(typeof data.from == 'string'){
              if(data.from == 'bottom'){ data.from = true; }
              else{ data.from = false; }
            }
          }
          let current = this.graphic.get.height();
          let update = (data.height - current) / this.progress;
          this.graphic.set.height(current+update,data.from);
        }
      }
    ].forEach(graphic.actions.define);
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
    ));

    let arc = {
      radius: data.radius,
      angle: {start: data.angle.start * ((Math.PI/180) * -1) , finish: data.angle.finish * ((Math.PI/180) * -1) },
    };

    this.get.radius = ()=>{ return arc.radius };
    this.get.angle = () => { return {start: arc.angle.start, finish: arc.angle.finish} };
    this.set.radius = (int) => {
      if (typeof int !== 'number' || int < 1 ){ throw 'the paramater must be a number and greater than 0'}
      arc.radius = int;
    };
    this.render = function (context) {
      let center = this.get.center();
      let clip = this.get.clip();
      if (clip) { context.clip(clip); }
      context.arc(center.x,center.y,arc.radius,arc.angle.start,arc.angle.finish);
      if (this.get.fill()) { context.fill(); }
      if (this.get.stroke()) { context.stroke(); }
    };

  }

  function Polygon (data) {
    if (typeof data !== 'object' && !Array.isArray(data.points)) { throw 'The data must have the following structure --> {points:[{x,y},{x,y},{x,y}]} ' }
    let prototype = new Graphic(data.points, data.context);
    for (let method in prototype) { this[method] = prototype[method]; }  this.render = function (context) {
      let pts = this.get.points();
      let clip = this.get.clip();
      if (clip) { context.clip(clip); }
      context.moveTo(pts[0].x, pts[0].y);
      pts.forEach((pt) => { context.lineTo(pt.x, pt.y); });
      if (this.get.fill()) { context.fill(); }
      if (this.get.stroke()) { context.stroke(); }
    };
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
    };
    Object.assign(this, new Polygon({ points:
      [{ x: data.x, y: data.y }, { x: data.x + data.size, y: data.y }, { x: data.x + data.size, y: data.y + data.size }, { x: data.x, y: data.y + data.size }]
    }));
    this.get.size = () => { return square.size };
    this.set.size = (size,origin) => {
      if (typeof size !== 'number' || size < 0 ) { throw 'The paramter must be a number and greater than 0 ' }
      if(origin === undefined){ origin = square.instance.get.points(0).position; }
      square.instance.transform.scale((size / square.size),origin);
      square.size = size;
    };
    this.actions.define({
      name: 'size',
      validate: (data) => {
        let response = {error: false, message: ''};
        if (typeof data !== 'object' || typeof data.size !== 'number' || data.size < 0 ) { response.error = true; response.message = 'The paramter must be a number and greater than 0 '; }
        return response
      },
      action: function (data) {
        let size = this.graphic.get.size();
        if (this.progress === this.duration) {
          data.step = (data.size - size)/this.duration;
          if (data.origin == undefined) { data.origin = this.graphic.get.points(0).position; }
        }
        this.graphic.set.size(size+data.step,(typeof data.origin === 'function' ? data.origin() : data.origin));
      }
    });
  }

  function Circle (data){
    if(typeof data !== 'object' || typeof data.x !== 'number' || typeof data.y !== 'number' || typeof data.radius !== 'number'){
      throw 'The data must have the following structure --> {x: int, y:int ,radius: int}'
    }

    Object.assign(this,new Arc({x:data.x,y:data.y,radius: data.radius, angle: {start: 0, finish: 360}, context: data.context || {} }));

    let circle = {
      instance: this,
      circumfrence: data.radius * 2
    };

    setOfBasicActions(this);

    this.get.circumfrence = () => { return circle.circumfrence };
    this.set.circumfrence = (int) => {
      if (typeof int !== 'number' || int < 1) { throw 'The parameter must be a number and greater than 0' }
      circle.circumfrence = int;
      circle.instance.set.radius(int/2);
    };
    this.transform.scale = (size,origin) => {
      circle.instance.set.radius(circle.instance.get.radius() * size);
      circle.instance.get.points().forEach((pt) => {
        pt.x -= origin.x;
        pt.y -= origin.y;
        pt.x *= size;
        pt.y *= size;
        pt.x += origin.x;
        pt.y += origin.y;
      });
    };
  }

  const available = {
    'polygon': Polygon,
    'square': Square,
    'rectangle': Rectangle,
    'circle': Circle
  };

  function Graphics (Layers) {
    let expose = {};
    for(let graphic in available){
      expose[graphic] = (create) => {
        if(typeof create !== 'object' || typeof create.data !== 'object' || typeof create.layer !== 'number'){
          throw 'The data must have the following structure --> { data: object , layer: number }'
        }
        return Layers.get(create.layer).graphics.add(new available[graphic](create.data) )
      };
    }
    this.create = expose;

  }

  exports.Graphics = Graphics;
  exports.Graphic = Graphic;

  return exports;

}({}));
