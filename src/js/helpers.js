\import { Rules } from './errors.js';
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
  }

  this.notify = (event,update)=>{
    let test = Rules.is.defined(event,Events);
    if(!test.passed){ throw test.error; }
    // could use the call function for each notification this way the parameters can be ambigous in length .
    Events[event].forEach((notify)=>{ notify(update); });
  }

  this.register = (event,subscriber)=>{
  	let test = undefined ;
     [
       Rules.is.defined(event,Events),
       Rules.is.function(subscriber)
     ].some((check)=>{
		test = check ;
		return !test.passed ;
	});

      if(!test.passed){ throw test.error; }

     return Events[event].push(subscriber) - 1;
  }

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
  }

  if(Rules.is.array(events).passed){
	  events.forEach(this.event.create);
  }

}

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
      let test = Rules.is.object(states)
      if(!test.passed){ throw test.error; }

      let keys = Object.keys(state);
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
      ].some((check)=>{ if(!check.passed){ test = check; return true; }; });

      if(!test.passed){ throw test.error; };

      if(State.current === state){ State.current = undefined; };

      delete State.registered[state];

      return true
    }
  }
}

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

}

Helpers.angleToRadians = (angle)=>{ return (angle * (Math.PI/180)) }

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
}


export { Helpers }
