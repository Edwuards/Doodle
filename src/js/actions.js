function Actions (graphic) {
  let actions = { list: [], instance: this }

  this.define = function(define){
    if (typeof define !== 'object' ||
    [['name', 'string'], ['validate', 'function'], ['action', 'function']].some((check) => { return define[check[0]] === undefined || typeof define[check[0]] !== check[1] })) {
      throw 'The data paramter must have the following structure --> name: String, validate: function, action: function'
    }
    let validate = define.validate()
    if (['error', 'message'].some((prop) => { return validate[prop] === undefined })) {
      throw 'The validate function must return a valid response object --> { error: boolean , message: String }'
    }

    actions.instance.perform[define.name] = (data) => {
      let test = define.validate(data.data)
      if (test.error) { throw test.message };
      data.action = define.action
      data.type = define.name
      return actions.list[actions.list.push(new Action(data, actions.list.length, graphic)) - 1].execute()

    }
    return true
  }
  this.perform = {}
  this.get = (state) => {
    let copy = []
    if (state === undefined) {
      actions.list.forEach((action) => { copy.push(action.get) })
    } else if (typeof state === 'number' && state >= 0 && state <= 2) {
      actions.list.forEach((action) => { if (action.get.state() === state) { copy.push(action.get) } })
    } else {
      throw 'The state paramter must be one of the following values --> 0 (cancled) || 1 (completed) || 2 (progress)'
    }

    return copy
  }
  this.cancel = (selection) => { cancelOrResume('cancel', selection, actions.list) }
  this.resume = (selection) => { cancelOrResume('resume', selection, actions.list) }
}

function Action (data, id, graphic) {
  // state --> 0 = canceled || 1 = completed || 2 = progress
  data.duration = Math.round(data.duration / 10)
  let action = {
    perform: data.action,
    id: id,
    state: 2,
    loop: undefined,
    type: data.name ,
    repeat: (typeof data.repeat === 'number' && data.repeat > 0) || typeof data.repeat === 'boolean' ? data.repeat : false,
    duration: data.duration,
    progress: data.duration,
    data: data.data || []
  }
  this.cancel = () => { action.state = 0; return true }
  this.resume = function () {
    if (action.state === 1) { throw 'This action has already been completed' };
    if (action.state === 2) { throw 'This action is currently in progress' };
    action.state = 2; return this.execute(action, graphic)
  }
  this.execute = () => {
    return new Promise(function (resolve, reject) {
      action.loop = setInterval(() => {
        if (action.state === 1 || action.state === 0) {
          clearInterval(action.loop)
          action.loop = undefined
          action.state ? resolve(graphic) : reject(graphic)
        } else {
          if (action.progress) {
            action.perform.apply({ graphic: graphic, duration: action.duration, progress: action.progress }, [action.data])
            action.progress--
          } else if (action.repeat) {
            if (typeof action.repeat !== 'boolean') { action.repeat-- }
            action.progress = action.duration
          } else {
            action.state = 1
          }
        }
      }, 10)
    })
  }
  this.get = {
    state: () => { return action.state },
    type: () => { return action.state },
    repeat: () => { return action.state },
    duration: () => { return action.duration },
    progress: () => { return action.progress },
    id: () => { return action.id }
  }
}

function cancelOrResume (job, list, actions) {
  if (list === undefined) {
    actions.forEach((action) => { action[job]() })
  } else if (!Array.isArray(list) || list.some((int) => { return typeof int !== 'number' })) {
    throw 'The list paramter must be an array holding action id refrences --> [1,2,3,4,5,] '
  } else {
    let error = ''; actions.reduce((result, action) => {
      if (list.indexOf(action.get.id()) !== -1) { action[job](); result.push(true) } else { result.push(false) }
      return result
    }, []).forEach((r, i) => { if (!r) { error += String(list[i]) + ' ' } })
    if (error.length) { throw 'The following action id were not found --> ' + error }
  }
}

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
        this.graphic.transform.translate({ x, y }, origin)
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
  ].forEach(graphic.actions.define)
}

export { Actions, setOfBasicActions }
