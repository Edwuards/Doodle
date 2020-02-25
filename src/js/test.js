import { Doodle } from './doodle.js';

let doodle
window.addEventListener('DOMContentLoaded',function(){
  doodle = new Doodle();
});


function setOfBasicActions(graphic){
  graphic.actions = new Actions(graphic);
  [
    {
      name: 'scale',
      validate: (data) => {
        let response = { error: false, message: '' }
        if (typeof data !== 'object' || typeof data.scale !== 'number' ) {
          response.error = true
          response.message = 'The data must have the following structure --> {scale : int, origin: {x: int , y: int}}'
          return response
        }
        if (typeof data.origin === 'function' ) {
          let origin = data.origin()
          if( typeof origin.x !== 'number' && typeof origin.y !== 'number' ){
            response.error = true
            response.message = 'The origin paramter does not return a valid point object --> {x: int , y: int}'
          }
          return response
        }
        if (typeof data.origin !== 'object' || typeof data.origin.x !== 'number' || typeof data.origin.x !== 'number' ) {
          response.error = true
          response.message = 'The orign object must be a valid point object or a function returning a valid point object'
          return response
        }
        return response
      },
      action: function (data) {
        if (this.progress === this.duration) {
          data.pt = this.graphic.get.points();
          Math.round(data.pt[0].x) !== Math.round(data.origin.x) ? (data.x = data.pt[0].x, data.pt = data.pt[0]) : (data.x = data.pt[1].x , data.pt = data.pt[1])
          data.x -= data.origin.x
          data.step = ((data.x * data.scale) - data.x) / this.duration
        }
        else{
          data.x = data.pt.x - data.origin.x
        }
        data.scale = (data.x + data.step)/data.x
        this.graphic.transform.scale(data.scale,(typeof data.origin === 'function' ? data.origin() : data.origin) )

      }
    },
    {
      name: 'rotate',
      validate: (data) => {
        let response = {error: false, message: ''}
        if (typeof data !== 'object' || typeof data.degrees !== 'number' ) {
          response.error = true;
          response.message = 'The data must have the following structure --> {degrees: int, origin: {x: int, y: int}}'
          return response
        }
        if (typeof data.origin === 'function' ) {
          let origin = data.origin()
          if( typeof origin.x !== 'number' && typeof origin.y !== 'number' ){
            response.error = true
            response.message = 'The origin paramter does not return a valid point object --> {x: int , y: int}'
          }
          return response
        }
        if (typeof data.origin !== 'object' || typeof data.origin.x !== 'number' || typeof data.origin.x !== 'number' ) {
          response.error = true
          response.message = 'The orign object must be a valid point object or a function returning a valid point object'
          return response
        }
        return response
      },
      action: function(data) {
        this.graphic.transform.rotate(data.degrees/this.duration ,(typeof data.origin === 'function' ? data.origin() : data.origin) )
      }
    },
    {
      name: 'translate',
      validate: (data) => {
        let response = { error: false, message: '' }
        if (
          typeof data !== 'object' ||
        (data.x === undefined && data.y === undefined) ||
        (data.x && typeof data.x !== 'number') ||
        (data.y && typeof data.y !== 'number')
        ) { response.error = true; response.message = 'The data must have the following structure --> {x: int, y: int origin: {x: int, y:int } } || {x: int, origin: {x: int, y: int } } || {x: int, origin: {x: int, y: int } }' }
        return response
      },
      action: function (data) {
        let origin = (typeof data.origin === 'function' ? data.origin() : data.origin)
        let x = typeof data.x === 'number' ? ((data.x - origin.x) / this.duration) + origin.x : undefined
        let y = typeof data.y === 'number' ? ((data.y - origin.y) / this.duration) + origin.y : undefined
        this.graphic.transform.translate({ x, y }, origin);
      }
    },
    {
      name: 'move',
      validate: (data)=>{
        let response = {error: false, message: ''}
        if(typeof data != 'object' || (data.y == undefined && data.x == undefined)
        || (data.x && typeof data.x != 'number' ) || (data.y && typeof data.y != 'number')
        ){
          response.error = true, response.message = 'The data must have the following structure -->{ x: int || y:int , origin: {x: int , y:int} }';
          return response
        }
        return response
      },
      action: function(data){
        let origin = (typeof data.origin === 'function' ? data.origin() : data.origin)
        let x = typeof data.x === 'number' ? data.x/this.duration : undefined
        let y = typeof data.y === 'number' ? data.y/this.duration : undefined
        this.graphic.move({x,y},origin)
      }
    },
    {
      name: 'width',
      validate: (data) => {
        let response = { error: false, message: '' }
        if(typeof data !== 'object' || typeof data.width !== 'number' || data.width <= 0 ){ response.error = true; response.message = 'The parameter must have the following structure --> { width: int > 0, from: string (optional)}'}
        return response
      },
      action: function(data){
        if(this.progress === this.duration){
          if(typeof data.from == 'string'){
            if(data.from == 'right'){ data.from = true }
            else{ data.from = false }
          }
        }
        let current = this.graphic.get.width()
        let update = (data.width - current) / this.progress
        this.graphic.set.width(current+update,data.from)
      }
    },
    {
      name: 'height',
      validate: (data) => {
        let response = { error: false, message: '' }
        if(typeof data != 'object' || typeof data.height !== 'number' || data.height <= 0){ response.error = true; response.message = 'The parameter must have the following structure --> { height: int > 0, from: string (optional)}'}
        return response
      },
      action: function(data){
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
    }
  ].forEach(graphic.actions.define);
}
