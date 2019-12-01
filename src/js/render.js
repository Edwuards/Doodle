import { Layers } from './layers.js';
import { Rules, Test } from './errors.js';
import { Helpers } from './helpers.js';

const Loop = (layer) => {
    let context = layer.context;
    return setInterval(function () {
      context.clearRect(0, 0, layer.get.width(), layer.get.height())
      layer.graphics.get().forEach((graphic) => { graphic.render(); });
    }, 10);
  }
}

function Render (LAYERS) {
  let test = Rules.is.instanceOf(LAYERS,Layers)

  if(!test.passed){ throw test.error; }

  const LOOPS = Helpers.list();
  LAYERS.get().forEach(()=>{ LOOPS.add(undefined); });

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

export { Render }
