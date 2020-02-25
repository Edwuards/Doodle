import { Helpers } from './helpers.js';

const ACTIONS = {
  'scale': function(data){
    if (this.progress === this.duration) {
      data.pt = this.graphic.points.get;
      Math.round(data.pt[0].x) !== Math.round(data.origin.x) ? (data.x = data.pt[0].x, data.pt = data.pt[0]) : (data.x = data.pt[1].x , data.pt = data.pt[1])
      data.x -= data.origin.x
      data.step = ((data.x * data.scale) - data.x) / this.duration
    }
    else{

      data.x = data.pt.x - data.origin.x
    }
    console.log(data);
    data.scale = (data.x + data.step)/data.x
    this.graphic.scale(data.scale,(typeof data.origin === 'function' ? data.origin() : data.origin) )
  },
  'rotate': function(data){
    this.graphic.transform.rotate(data.degrees/this.duration ,(typeof data.origin === 'function' ? data.origin() : data.origin) )
  },
  'translate': function(data){
    let origin = (typeof data.origin === 'function' ? data.origin() : data.origin)
    let x = typeof data.x === 'number' ? ((data.x - origin.x) / this.duration) + origin.x : undefined
    let y = typeof data.y === 'number' ? ((data.y - origin.y) / this.duration) + origin.y : undefined
    this.graphic.transform.translate({ x, y }, origin);
  },
  'move': function(data){
    let origin = (typeof data.origin === 'function' ? data.origin() : data.origin)
    let x = typeof data.x === 'number' ? data.x/this.duration : undefined
    let y = typeof data.y === 'number' ? data.y/this.duration : undefined
    this.graphic.move({x,y},origin)
  },
  'width': function(data){
    if(this.progress === this.duration){
      if(typeof data.from == 'string'){
        if(data.from == 'right'){ data.from = true }
        else{ data.from = false }
      }
    }
    let current = this.graphic.get.width()
    let update = (data.width - current) / this.progress
    this.graphic.set.width(current+update,data.from)
  },
  'height': function(data){
    if(this.progress === this.duration){
      if(typeof data.from == 'string'){
        if(data.from == 'bottom'){ data.from = true }
        else{ data.from = false }
      }
    }
    let current = this.graphic.get.height()
    let update = (data.height - current) / this.progress
    this.graphic.set.height(current+update,data.from)
  }
};

function Actions(actions){
  const PERFORM = {};
  const EXPOSE = {};
  const METHODS = {
    'define':{},
    'perform':{
      enumerable: true,
      writable: false,
      value: (name,args)=>{ if(PERFORM[name]){ return PERFORM[name](args); } }
    },
  };

  for (let name in ACTIONS) { PERFORM[name] = Action(this,ACTIONS[name]); }
  for (let name in actions) { PERFORM[name] = Action(this,actions[name]); }

  Object.defineProperties(EXPOSE,METHODS);

  return EXPOSE;
}

function Action (GRAPHIC,ACTION) {

  return (data) => {
    data.duration = Math.round(data.duration / 10);
    const {duration,args} = data; let progress = duration, context = { graphic: GRAPHIC, duration, progress };
    let execute = (resolve)=>{
      setInterval(() => {
        if(progress) { console.log(progress); ACTION.apply(context,[args]); progress--; }
        else{ resolve(GRAPHIC); }
      },10);
    }

    return new Promise(function (resolve, reject){ execute(resolve,reject); });

  };

}

export { Actions }
