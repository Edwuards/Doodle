import { Rules, Test } from './errors.js';
import { Plane, Points } from './geometry.js';

function Group(data){
  let test = Test([
    [Rules.is.array,[data]],
    [Rules.is.greaterThan,[data.length,2]]
  ]);

  const GRAPHICS = [];

  Plane.call(this,new Points(data.reduce((pts,graphic)=>{
    graphic.points.get.forEach((pt)=>{ pts.push(pt); });
    return pts;
  },[])));

}

export { Group }
