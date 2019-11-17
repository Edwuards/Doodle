var Layers = (function (exports) {
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

  const ID = Helpers.counter();

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
      id: ID.create(),
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
      'loop': {
        enumerable: true,
        get: ()=>{ return PROPS.loop },
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

  exports.Layers = Layers;

  return exports;

}({}));
