import { Rules, Test } from './errors.js';
import { Limits , Points } from './geometry.js';

function Group(data){
  let test = Test([
    [Rules.is.array,[data]],
    [Rules.is.greaterThan,[data.length,2]]
  ]);

  const GRAPHICS = [];

  const PTS = new Points(data.reduce((pts,graphic)=>{
    graphic.points.get.forEach((pt)=>{ pts.push(pt); });
    return pts;
  },[]));

  const LIMITS = new Limits(PTS);

  const METHODS = {
    'points': {
      enumerable: true,
      get: ()=>{ return PTS }
    },
    'limits': {
      enumerable: true,
      get: ()=>{ return LIMITS }
    }
  }

  data.forEach((g)=>{ GRAPHICS.push(g); });

  Object.defineProperties(this,METHODS);

}

export { Group }
