import { Rules } from './errors.js';
const Helpers = {};

Helpers.observer = function(){
  let subscribers = [];

  this.notify = (update)=>{
    subscribers.forEach((notify)=>{ notify(update); });
  }

  this.register = (subscriber)=>{
    return subscribers.push(subscriber) - 1;
  }

  this.unregister = (index)=>{
    subscribers = subscribers.reduce((a,c,i)=>{
      if(i !== index){ a.push(c); }
      return a;
    },[]);
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
      let test = Rules.is.object(states)
      if(!test.passed){ throw test.error(); }

      let keys = Object.keys(state);
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
      ].some((check)=>{ if(!check.passed){ test = check; return true; }; });

      if(!test.passed){ throw test.error(); };

      if(State.current === state){ State.current = undefined; };

      delete State.registered[state];

      return true
    }
  }
}

export { Helpers }
