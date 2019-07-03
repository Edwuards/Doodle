
/*
  All rules must have a test and message property
  All test must return true if passed or false if failed.

  Rule = {
    message: string
    test: (value)=>{ return false || true }
  }

*/

let Rules = {};
Rules.is = {};
Rules.has = {};
Rules.validate = {};

//Rules under the "is" property
Rules.is.number = {
  message: 'The value provided is not a number',
  test: (value)=>{ return typeof value === 'number'; }
}
Rules.is.point = {
  message: 'The value does not support the following structure --> {x: int, y: int}',
  test: (value)=>{
    let keys = Object.keys(value);
    if(typeof value !== 'object') { return false }
    if(keys.length !== 2 || ['x','y'].some((property)=>{ return keys.indexOf(property) === -1 })){
      return false
    }
    return true
   }
}
Rules.is.greaterThan = {

}

//Rules under the "has" property
Rules.has.index = {
  message: 'The item could not be found with the given index -->',
  test: function(value){
    if(value.array[value.index] === undefined){ this.message += index.toString();  return false }
    return true;
  }
}

//Rules under the "validate" property
Rules.validate.points = {
  message: 'The array must be conformed of points --> [Point, Point, ...]',
  test: (value)=>{
    if(!Array.isArray(value) || value.length < 3){ return false }
    else{ return value.every((point)=>{ return Rules.is.point(point).passed }); }
  }
}



// construct the Rules
for (let type in Rules) {
  for(let name in Rules[type]){
    let rule = Rules[type][name];
    Rules[type][name] = (value)=>{ return test.call(Rules[type][name],rule,value) }
  }
}

function test(rule,value){
  let test = {passed: rule.test(value), error: undefined }
  if(!test.passed){ test.error = ()=>{ return new Error(rule.message); } }
  return test
}

export { Rules }
