
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
    if( Array.isArray(value) || typeof value !== 'object' ){ return false; };
    return true;
  }
}

Rules.is.notDuplicateProperty = {
  message: 'The property already exist inside the object ',
  test: function(property,object){
    if(object[property] !== undefined ){
      return false
    }
    return true
  }
}

Rules.is.string = {
  message: 'The parameter is not a string type',
  test: function(value){
    if(typeof value !== 'string'){ return false; }
    return true;
  }
}

Rules.is.number = {
  message: 'The parameter is not a number type',
  test: function(value){
    if(typeof value !== 'number'){ return false; }
    return true;
  }
}

Rules.is.array = {
  message: 'The paramter is not an Array type',
  test: function(value){ return Array.isArray(value); }
}

Rules.is.instanceOf = {
  message: 'The object given is not an instance of',
  test: function(compare,against){
    if(!(compare instanceof against)){
      this.message = `${this.message} ${against.name}`;
      return false
    }
    return true
  }
}

Rules.is.function = {
  message: 'The property is not a function',
  test: function(value){
    if(typeof value !== 'function'){ return false; }
    return true;
  }
}

Rules.is.greaterThan = {
  message: 'The value',
  test: function(check,against){
    if(check < against){
      this.message = `${this.message} ${check} is not greater than ${against}`;
      return false;
    }
    return true;
  }
}

Rules.is.htmlChildren = {
  message: 'The followin object does not posses an array property with HTMLElement instances ',
  test: function(children){
    if(!Array.isArray(children)){ return false };
    if(children.some((child)=>{ return !(child instanceof HTMLElement) })){ return false }
    return true;
  }
}

Rules.is.defined = {
  message: 'The following property is not defined ',
  test: function(property,object){
    if(object[property] === undefined ){ this.message += 'property'; return false; }
    return true;
  }
}

Rules.is.notEmptyArray = {
  message: 'The given array is empty',
  test: function(array){
    return array.length != 0
  }
}

// RULES FOR HAS TYPE

Rules.has.arrayLength = {
  message:'The array must have a length of ',
  test: function(array,length){
    if(!Rules.is.array.test(array)){ this.message = Rules.is.array.message; return false }
    if(!Rules.is.number.test(length)){ this.message = Rules.is.number.message; return false }
    if(array.length !== length){ return false }
    return true
  }
}

Rules.has.properties = {
  message: 'The object does not have all of the following properties ',
  test: function(properties,object){
    if(properties.some((property)=>{ return object[property] === undefined })){
      properties.forEach(function(property){ this.message = this.message+property+' '; }.bind(this))
      return false;
    }
    return true;
  }
}

Rules.has.index = {
  message: 'The index is undefined for the given array.',
  test: function(array,index){
    if(array[index] === undefined){ return false; }
    return true;
  }
}

for (let type in Rules) {
  for(let name in Rules[type]){
    let rule = Rules[type][name];
    let context = { message: rule.message, rules: Rules };
    Rules[type][name] = function(){ return test(context,rule,arguments) }
  }
}

function test(context,rule,value){
  let test = {passed: rule.test.apply(context,value), error: undefined }
  if(!test.passed){ test.error = ()=>{ return new Error(context.message); } }
  return test
}

export { Rules }
