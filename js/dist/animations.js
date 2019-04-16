var animation = (function (exports) {
  'use strict';

  function Point (x, y, z) {
    if (typeof x !== 'number') { throw 'The paremeter x must be an integer' }
    if (typeof y !== 'number') { throw 'The paremeter y must be an integer' }
    this.x = x;
    this.y = y;
    this.position = function(){ return { x: this.x, y: this.y } };
    this.translate = function (x, y) {
      this.x += x - this.x;
      this.y += y - this.y;
    };
    this.rotate = function (degrees, origin) {
      let radians = ((degrees) * (Math.PI/180)) * -1;
      let cos = Math.cos(radians);
      let sin = Math.sin(radians);

      this.x -= origin.x;
      this.y -= origin.y;
      let x = this.x*cos - this.y*sin;
      let y = this.x*sin + this.y*cos;
      this.x = x + origin.x;
      this.y = y + origin.y;
    };
  }

  function Points (pts = []) {
    if (!Array.isArray(pts) || (pts.length && pts.some((pt) => { return (typeof pt.x !== 'number' || typeof pt.y !== 'number') || Object.keys(pt).length !== 2 }))) { throw new Error('The paramter must be a an array of valid points --> [{x:int, y:int}]') }  let Pts = pts.length ? pts.map((pt) => { return new Point(pt.x, pt.y) }) : [];

    this.add = (x, y) => { return Pts[Pts.push(new Point(x, y)) - 1] };
    this.get = (index) => {
      if (typeof index === 'number' && Pts[index]) {
        return Pts[index]
      }
      else if (index !== undefined) {
        throw 'The index paramter must be a number'
      }
      else{
        let copy = [];
        Pts.forEach((pt) => { copy.push(pt); });
        return copy
      }
    };
  }

  function Plane (pts = []) {
    if (pts.length < 3) { throw 'The paramter must be an array containing at least three valid point object --> [{x: int , y: int},{x: int , y: int},{x: int , y: int}]' }  let Pts = new Points(pts);
    let instance = this;

    let updateLimits = (type,int,min = false)=>{
      if(typeof int !== 'number' || int <= 0){ throw 'The paramter must be a number greater than 0'}
      int = int - instance.get[type]();
      type = type == 'width' ? 'x' : 'y';
      int = min ? int *= -1 : int;
      let limit = Math.ceil(instance.get.limits()[type][min ? 'min' : 'max']);
      let update = [];
      instance.get.points().forEach((pt)=>{ if(Math.ceil(pt[type]) === limit){ update.push(pt); }  });
      update.forEach((pt)=>{ pt[type] += int; });
    };

    this.get = {
      points: (index) => { return Pts.get(index) },
      limits: () => {
        let pts = Pts.get();
        let x = pts[0].x;
        let y = pts[0].y;
        let limits = { x: { min: x, max: x }, y: { min: y, max: y } };
        pts.forEach((pt) => {
          let x = pt.x;
          let y = pt.y;
          limits.x.max = x > limits.x.max ? x : limits.x.max;
          limits.x.min = x < limits.x.min ? x : limits.x.min;

          limits.y.max = y > limits.y.max ? y : limits.y.max;
          limits.y.min = y < limits.y.min ? y : limits.y.min;
        });
        return limits
      },
      width: function () { let limits = this.limits(); return limits.x.max - limits.x.min },
      height: function () { let limits = this.limits(); return limits.y.max - limits.y.min },
      center: function () { let limits = this.limits(); return { x: limits.x.min + this.width() / 2, y: limits.y.min + this.height() / 2 } }
    };
    this.set ={
      width: (int,min = false) => { updateLimits('width',int,min); },
      height: (int,min = false) => { updateLimits('height',int,min); }
    };
    this.add = {
      point: Pts.add
    };
    this.move = (position,origin)=>{
      let x = typeof position.x  == 'number' ? (origin.x + position.x) : undefined;
      let y = typeof position.y  == 'number' ? (origin.y + position.y) : undefined;
      instance.transform.translate({x,y},origin);
    };
    this.transform = {
      translate: (update, origin) => {
        let x = typeof update.x  === 'number' ? update.x - origin.x : 0;
        let y = typeof update.y === 'number'  ? update.y - origin.y : 0;
        Pts.get().forEach((pt) => { pt.translate(pt.x + x, pt.y + y); });
      },
      rotate: (degrees, origin) => { Pts.get().forEach((pt) => { pt.rotate(degrees, origin); }); },
      scale: (size, origin) => {
        Pts.get().forEach((pt) => {
          pt.x -= origin.x;
          pt.y -= origin.y;
          pt.x *= size;
          pt.y *= size;
          pt.x += origin.x;
          pt.y += origin.y;
        });
      }
    };
  }

  function Actions (graphic) {
    let actions = { list: [], instance: this };

    this.define = function(define){
      if (typeof define !== 'object' ||
      [['name', 'string'], ['validate', 'function'], ['action', 'function']].some((check) => { return define[check[0]] === undefined || typeof define[check[0]] !== check[1] })) {
        throw 'The data paramter must have the following structure --> name: String, validate: function, action: function'
      }
      let validate = define.validate();
      if (['error', 'message'].some((prop) => { return validate[prop] === undefined })) {
        throw 'The validate function must return a valid response object --> { error: boolean , message: String }'
      }

      actions.instance.perform[define.name] = (data) => {
        let test = define.validate(data.data);
        if (test.error) { throw test.message }      data.action = define.action;
        data.type = define.name;
        return actions.list[actions.list.push(new Action(data, actions.list.length, graphic)) - 1].execute()

      };
      return true
    };
    this.perform = {};
    this.get = (state) => {
      let copy = [];
      if (state === undefined) {
        actions.list.forEach((action) => { copy.push(action.get); });
      } else if (typeof state === 'number' && state >= 0 && state <= 2) {
        actions.list.forEach((action) => { if (action.get.state() === state) { copy.push(action.get); } });
      } else {
        throw 'The state paramter must be one of the following values --> 0 (cancled) || 1 (completed) || 2 (progress)'
      }

      return copy
    };
    this.cancel = (selection) => { cancelOrResume('cancel', selection, actions.list); };
    this.resume = (selection) => { cancelOrResume('resume', selection, actions.list); };
  }

  function Action (data, id, graphic) {
    // state --> 0 = canceled || 1 = completed || 2 = progress
    data.duration = Math.round(data.duration / 10);
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
    };
    this.cancel = () => { action.state = 0; return true };
    this.resume = function () {
      if (action.state === 1) { throw 'This action has already been completed' }    if (action.state === 2) { throw 'This action is currently in progress' }    action.state = 2; return this.execute(action, graphic)
    };
    this.execute = () => {
      return new Promise(function (resolve, reject) {
        action.loop = setInterval(() => {
          if (action.state === 1 || action.state === 0) {
            clearInterval(action.loop);
            action.loop = undefined;
            action.state ? resolve(graphic) : reject(graphic);
          } else {
            if (action.progress) {
              action.perform.apply({ graphic: graphic, duration: action.duration, progress: action.progress }, [action.data]);
              action.progress--;
            } else if (action.repeat) {
              if (typeof action.repeat !== 'boolean') { action.repeat--; }
              action.progress = action.duration;
            } else {
              action.state = 1;
            }
          }
        }, 10);
      })
    };
    this.get = {
      state: () => { return action.state },
      type: () => { return action.state },
      repeat: () => { return action.state },
      duration: () => { return action.duration },
      progress: () => { return action.progress },
      id: () => { return action.id }
    };
  }

  function cancelOrResume (job, list, actions) {
    if (list === undefined) {
      actions.forEach((action) => { action[job](); });
    } else if (!Array.isArray(list) || list.some((int) => { return typeof int !== 'number' })) {
      throw 'The list paramter must be an array holding action id refrences --> [1,2,3,4,5,] '
    } else {
      let error = ''; actions.reduce((result, action) => {
        if (list.indexOf(action.get.id()) !== -1) { action[job](); result.push(true); } else { result.push(false); }
        return result
      }, []).forEach((r, i) => { if (!r) { error += String(list[i]) + ' '; } });
      if (error.length) { throw 'The following action id were not found --> ' + error }
    }
  }

  function setOfBasicActions(graphic){
    graphic.actions = new Actions(graphic);
    [
      {
        name: 'scale',
        validate: (data) => {
          let response = { error: false, message: '' };
          if (typeof data !== 'object' || typeof data.scale !== 'number' ) {
            response.error = true;
            response.message = 'The data must have the following structure --> {scale : int, origin: {x: int , y: int}}';
            return response
          }
          if (typeof data.origin === 'function' ) {
            let origin = data.origin();
            if( typeof origin.x !== 'number' && typeof origin.y !== 'number' ){
              response.error = true;
              response.message = 'The origin paramter does not return a valid point object --> {x: int , y: int}';
            }
            return response
          }
          if (typeof data.origin !== 'object' || typeof data.origin.x !== 'number' || typeof data.origin.x !== 'number' ) {
            response.error = true;
            response.message = 'The orign object must be a valid point object or a function returning a valid point object';
            return response
          }
          return response
        },
        action: function (data) {
          if (this.progress === this.duration) {
            data.pt = this.graphic.get.points();
            Math.round(data.pt[0].x) !== Math.round(data.origin.x) ? (data.x = data.pt[0].x, data.pt = data.pt[0]) : (data.x = data.pt[1].x , data.pt = data.pt[1]);
            data.x -= data.origin.x;
            data.step = ((data.x * data.scale) - data.x) / this.duration;
          }
          else{
            data.x = data.pt.x - data.origin.x;
          }
          data.scale = (data.x + data.step)/data.x;
          this.graphic.transform.scale(data.scale,(typeof data.origin === 'function' ? data.origin() : data.origin) );

        }
      },
      {
        name: 'rotate',
        validate: (data) => {
          let response = {error: false, message: ''};
          if (typeof data !== 'object' || typeof data.degrees !== 'number' ) {
            response.error = true;
            response.message = 'The data must have the following structure --> {degrees: int, origin: {x: int, y: int}}';
            return response
          }
          if (typeof data.origin === 'function' ) {
            let origin = data.origin();
            if( typeof origin.x !== 'number' && typeof origin.y !== 'number' ){
              response.error = true;
              response.message = 'The origin paramter does not return a valid point object --> {x: int , y: int}';
            }
            return response
          }
          if (typeof data.origin !== 'object' || typeof data.origin.x !== 'number' || typeof data.origin.x !== 'number' ) {
            response.error = true;
            response.message = 'The orign object must be a valid point object or a function returning a valid point object';
            return response
          }
          return response
        },
        action: function(data) {
          this.graphic.transform.rotate(data.degrees/this.duration ,(typeof data.origin === 'function' ? data.origin() : data.origin) );
        }
      },
      {
        name: 'translate',
        validate: (data) => {
          let response = { error: false, message: '' };
          if (
            typeof data !== 'object' ||
          (data.x === undefined && data.y === undefined) ||
          (data.x && typeof data.x !== 'number') ||
          (data.y && typeof data.y !== 'number')
          ) { response.error = true; response.message = 'The data must have the following structure --> {x: int, y: int origin: {x: int, y:int } } || {x: int, origin: {x: int, y: int } } || {x: int, origin: {x: int, y: int } }'; }
          return response
        },
        action: function (data) {
          let origin = (typeof data.origin === 'function' ? data.origin() : data.origin);
          let x = typeof data.x === 'number' ? ((data.x - origin.x) / this.duration) + origin.x : undefined;
          let y = typeof data.y === 'number' ? ((data.y - origin.y) / this.duration) + origin.y : undefined;
          this.graphic.transform.translate({ x, y }, origin);
        }
      },
      {
        name: 'move',
        validate: (data)=>{
          let response = {error: false, message: ''};
          if(typeof data != 'object' || (data.y == undefined && data.x == undefined)
          || (data.x && typeof data.x != 'number' ) || (data.y && typeof data.y != 'number')
          ){
            response.error = true, response.message = 'The data must have the following structure -->{ x: int || y:int , origin: {x: int , y:int} }';
            return response
          }
          return response
        },
        action: function(data){
          let origin = (typeof data.origin === 'function' ? data.origin() : data.origin);
          let x = typeof data.x === 'number' ? data.x/this.duration : undefined;
          let y = typeof data.y === 'number' ? data.y/this.duration : undefined;
          this.graphic.move({x,y},origin);
        }
      },
      {
        name: 'width',
        validate: (data) => {
          let response = { error: false, message: '' };
          if(typeof data !== 'object' || typeof data.width !== 'number' || data.width <= 0 ){ response.error = true; response.message = 'The parameter must have the following structure --> { width: int > 0, from: string (optional)}';}
          return response
        },
        action: function(data){
          if(this.progress === this.duration){
            if(typeof data.from == 'string'){
              if(data.from == 'right'){ data.from = true; }
              else{ data.from = false; }
            }
          }
          let current = this.graphic.get.width();
          let update = (data.width - current) / this.progress;
          this.graphic.set.width(current+update,data.from);
        }
      },
      {
        name: 'height',
        validate: (data) => {
          let response = { error: false, message: '' };
          if(typeof data != 'object' || typeof data.height !== 'number' || data.height <= 0){ response.error = true; response.message = 'The parameter must have the following structure --> { height: int > 0, from: string (optional)}';}
          return response
        },
        action: function(data){
          if(this.progress === this.duration){
            if(typeof data.from == 'string'){
              if(data.from == 'bottom'){ data.from = true; }
              else{ data.from = false; }
            }
          }
          let current = this.graphic.get.height();
          let update = (data.height - current) / this.progress;
          this.graphic.set.height(current+update,data.from);
        }
      }
    ].forEach(graphic.actions.define);
  }

  let ID = 0;

  function Graphic (pts = [], context = {}) {
    let prototype = new Plane(pts);
    let graphic = {
      id: ID++,
      context,
      fill: true,
      stroke: false,
      clip: false
    };
    this.get = {};
    this.set = {};
    for (let method in prototype) { this[method] = prototype[method]; }
    [
      [this.get, {
        id: () => { return graphic.id },
        fill: () => { return graphic.fill },
        stroke: () => { return graphic.stroke },
        clip: () => { return graphic.clip },
        context: () => { return graphic.context }
      }],
      [this.set, {
        fill: (fill) => {
          if (typeof fill === 'boolean') { graphic.fill = fill; } else if (typeof fill === 'string') { graphic.context.fillStyle = fill; graphic.fill = true; } else { throw 'The fill paramter must be a boolean or a string refrencing a color --> true || false || #hex || rgba() || hsla || color' }
        },
        stroke: (stroke) => {
          if (typeof stroke === 'boolean') { graphic.stroke = stroke; } else if (typeof stroke === 'string') { graphic.context.strokeStyle = stroke; graphic.stroke = true; } else { throw 'The fill paramter must be a boolean or a string refrencing a color --> true || false || #hex || rgba() || hsla || color' }
        },
        clip: (clip) => {
          if (typeof clip === 'boolean' && clip === false) { graphic.clip = false; } else if (typeof clip === 'object') {
            if (['Plane', 'Polygon', 'Square', 'Rectangle'].some((type) => { return clip.constructor.name === type })) {
              let path = new Path2D();
              let pts = clip.get.points();
              path.moveTo(pts[0].x, clip[0].y);
              pts.forEach((pt) => { path.lineTo(pt.x, pt.y); });
              path.closePath();
              graphic.clip = path;
            }
          } else {
            throw 'The clip parameter must be a boolean value equal to false or valid Graphic --> false || Plane, Polygon, Square, Rectangle, Arc, Circle'
          }
        },
        context: function (context) {
          if (typeof context === 'object') {
            for (let setting in context) {
              graphic.context[setting] = context[setting];
            }
          } else { throw 'The paramter must a be a valid object containing canvas api properties --> {fillStyle: "red", lineWidth: 5, ... } ' }      }
      }]
    ].forEach((obj) => { Object.assign(obj[0], obj[1]); });
  }

  function Arc (data) {
    if (
      typeof data !== 'object' || typeof data.x !== 'number' ||
      typeof data.y !== 'number' || typeof data.radius !== 'number' ||
      typeof data.angle !== 'object' || typeof data.angle.start !== 'number' ||
      typeof data.angle.finish !== 'number'
    ){
      throw 'The parameter must have the following structure ---> {x: int, y: int, radius: int, angle: {start: int, finish: int} }'
    }
    Object.assign(this,new Graphic(
      [{ x: data.x, y: data.y }, { x: data.x + data.radius, y: data.y }, { x: data.x + data.radius, y: data.y + data.radius }, { x: data.x, y: data.y + data.radius }],
      data.context || {}
    ));

    let arc = {
      radius: data.radius,
      angle: {start: data.angle.start * ((Math.PI/180) * -1) , finish: data.angle.finish * ((Math.PI/180) * -1) },
    };

    this.get.radius = ()=>{ return arc.radius };
    this.get.angle = () => { return {start: arc.angle.start, finish: arc.angle.finish} };
    this.set.radius = (int) => {
      if (typeof int !== 'number' || int < 1 ){ throw 'the paramater must be a number and greater than 0'}
      arc.radius = int;
    };
    this.render = function (context) {
      let center = this.get.center();
      let clip = this.get.clip();
      if (clip) { context.clip(clip); }
      context.arc(center.x,center.y,arc.radius,arc.angle.start,arc.angle.finish);
      if (this.get.fill()) { context.fill(); }
      if (this.get.stroke()) { context.stroke(); }
    };

  }

  function Polygon (data) {
    if (typeof data !== 'object' && !Array.isArray(data.points)) { throw 'The data must have the following structure --> {points:[{x,y},{x,y},{x,y}]} ' }
    let prototype = new Graphic(data.points, data.context);
    for (let method in prototype) { this[method] = prototype[method]; }  this.render = function (context) {
      let pts = this.get.points();
      let clip = this.get.clip();
      if (clip) { context.clip(clip); }
      context.moveTo(pts[0].x, pts[0].y);
      pts.forEach((pt) => { context.lineTo(pt.x, pt.y); });
      if (this.get.fill()) { context.fill(); }
      if (this.get.stroke()) { context.stroke(); }
    };
    setOfBasicActions(this);
  }

  function Rectangle(data){
    if(typeof data !== 'object' || typeof data.width !== 'number' || typeof data.height !== 'number' || typeof data.x !== 'number' || typeof data.y !== 'number' ){
      throw 'The data must have the following structure --> {x: int, y: int, width: int, height: int }'
    }
    Object.assign(this,new Polygon({points: [
      {x:data.x, y:data.y},
      {x:data.x + data.width, y:data.y},
      {x:data.x + data.width, y:data.y + data.height},
      {x:data.x, y:data.y + data.height}], context: data.context || {} }));

  }

  function Square (data) {
    if (typeof data !== 'object' || (typeof data.x !== 'number' && typeof data.y !== 'number' && typeof data.size !== 'number')) {
      throw 'The data must have the following structure --> {x: int, y: int size: int}'
    }
    let square = {
      instance: this,
      size: data.size
    };
    Object.assign(this, new Polygon({ points:
      [{ x: data.x, y: data.y }, { x: data.x + data.size, y: data.y }, { x: data.x + data.size, y: data.y + data.size }, { x: data.x, y: data.y + data.size }]
    }));
    this.get.size = () => { return square.size };
    this.set.size = (size,origin) => {
      if (typeof size !== 'number' || size < 0 ) { throw 'The paramter must be a number and greater than 0 ' }
      if(origin === undefined){ origin = square.instance.get.points(0).position; }
      square.instance.transform.scale((size / square.size),origin);
      square.size = size;
    };
    this.actions.define({
      name: 'size',
      validate: (data) => {
        let response = {error: false, message: ''};
        if (typeof data !== 'object' || typeof data.size !== 'number' || data.size < 0 ) { response.error = true; response.message = 'The paramter must be a number and greater than 0 '; }
        return response
      },
      action: function (data) {
        let size = this.graphic.get.size();
        if (this.progress === this.duration) {
          data.step = (data.size - size)/this.duration;
          if (data.origin == undefined) { data.origin = this.graphic.get.points(0).position; }
        }
        this.graphic.set.size(size+data.step,(typeof data.origin === 'function' ? data.origin() : data.origin));
      }
    });
  }

  function Circle (data){
    if(typeof data !== 'object' || typeof data.x !== 'number' || typeof data.y !== 'number' || typeof data.radius !== 'number'){
      throw 'The data must have the following structure --> {x: int, y:int ,radius: int}'
    }

    Object.assign(this,new Arc({x:data.x,y:data.y,radius: data.radius, angle: {start: 0, finish: 360}, context: data.context || {} }));

    let circle = {
      instance: this,
      circumfrence: data.radius * 2
    };

    setOfBasicActions(this);

    this.get.circumfrence = () => { return circle.circumfrence };
    this.set.circumfrence = (int) => {
      if (typeof int !== 'number' || int < 1) { throw 'The parameter must be a number and greater than 0' }
      circle.circumfrence = int;
      circle.instance.set.radius(int/2);
    };
    this.transform.scale = (size,origin) => {
      circle.instance.set.radius(circle.instance.get.radius() * size);
      circle.instance.get.points().forEach((pt) => {
        pt.x -= origin.x;
        pt.y -= origin.y;
        pt.x *= size;
        pt.y *= size;
        pt.x += origin.x;
        pt.y += origin.y;
      });
    };
  }

  const available = {
    'polygon': Polygon,
    'square': Square,
    'rectangle': Rectangle,
    'circle': Circle
  };

  function Graphics (Layers) {
    let expose = {};
    for(let graphic in available){
      expose[graphic] = (create) => {
        if(typeof create !== 'object' || typeof create.data !== 'object' || typeof create.layer !== 'number'){
          throw 'The data must have the following structure --> { data: object , layer: number }'
        }
        return Layers.get(create.layer).graphics.add(new available[graphic](create.data) )
      };
    }
    this.create = expose;

  }

  function Layers (container) {
    if (container.nodeType !== 1) {
      throw 'The container parameter needs to be an HTML ELEMENT'
    }
    let Layers = [];
    this.add = (name, width, height) => {
      let layer = {
        id: Layers.length,
        index: Layers.length,
        name: name || 'Untitled-' + Layers.length,
        height: height || container.offsetHeight,
        width: width || container.offsetWidth
      };
      layer = new Layer(layer);
      container.appendChild(layer.get.html());
      return Layers[Layers.push(layer) - 1]
    };
    this.get = (index) => {
      if (index !== undefined) {
        if (index !== undefined && typeof index !== 'number') { throw 'The index paramter must be a number' } else if (Layers[index] === undefined) { throw 'The index you supplied does is not defined in your points array' }      return Layers[index]
      }
      let copy = [];
      Layers.forEach((layer) => { copy.push(layer); });
      return copy
    };
    this.find = (key) => {
      if (typeof key !== 'object' || key.value === undefined || key.name === undefined || ['name', 'index', 'id'].every((name) => { return key.name !== name })) {
        throw 'The key paramter must a valid key object --> {name : "index" || "id" || "name" , value: "int" || "string" } '
      } else if ((key.name === 'index' || (key.name === 'id' && typeof key.value !== 'number')) || (key.name === 'name' && typeof key.value !== 'string')) {
        throw 'The key paramter must a valid key object --> {name : "index" || "id" || "name" , value: "int" || "string" '
      }
      let result = Layers.find((layer) => { return layer.get[key.name]() === key.value });
      if (result === undefined) { throw 'There was no match for the layer with the "' + key.name + '" property equivalent to the value "' + key.value + '"' }    return result
    };
  }

  function Layer (data) {
    if (typeof data !== 'object' || ['name', 'id', 'index', 'width', 'height'].some((prop) => { return data[prop] === undefined })) {
      throw 'The data must be an object with the following structure --> {name: string, id: int, index: int, height: int > 0, width: int > 0 }'
    }
    if (typeof data.id !== 'number' ||
      typeof data.index !== 'number' ||
      typeof data.name !== 'string' ||
      (typeof data.height === 'number' && data.height < 0) ||
      (typeof data.width === 'number' && data.width < 0)) {
      throw 'The data must be an object with the following structure --> {name: string, id: int, index: int, height: int > 0, width: int > 0 }'
    }

    let layer = {
      name: data.name,
      id: data.id,
      index: data.index,
      html: document.createElement('canvas'),
      graphics: [],
      context: undefined,
      loop: undefined
    };

    layer.html.setAttribute('height', data.height);
    layer.html.setAttribute('width', data.width);
    layer.html.setAttribute('data-layer-id', data.id);
    layer.context = layer.html.getContext('2d');

    this.get = {
      name: () => { return layer.name },
      id: () => { return layer.id },
      index: () => { return layer.index },
      html: () => { return layer.html },
      graphics: () => { let copy = []; layer.graphics.forEach((graphic) => { copy.push(graphic); }); return copy },
      context: () => { return layer.context },
      loop: () => { return layer.loop },
      width: () => { return layer.html.width },
      height: () => { return layer.html.height }
    };
    this.set = {
      context: (context) => {
        if (typeof context === 'object') {
          for (let setting in context) {
            layer.context[setting] = context[setting];
          }
        } else { throw 'The paramter must a be a valid object containing canvas api properties --> {fillStyle: "red", lineWidth: 5, ... } ' }    },
      loop: (id) => {
        if (typeof id === 'number') { layer.loop = id; } else if (id === undefined) { layer.loop = undefined; } else { throw 'Parameter must be a number or undefined' }
      },
      width: (width) => {
        if (typeof width === 'number') { layer.html.setAttribute('width', width); } else { throw 'Parameter must be a number' }
      },
      height: (height) => {
        if (typeof height === 'number') { layer.html.setAttribute('height', height); } else { throw 'Parameter must be a number' }
      }
    };

    this.graphics = {
      add: (graphic) => {
        return layer.graphics[layer.graphics.push(graphic) - 1]
      }
    };
  }

  let loop = (layer) => {
    if (layer.constructor.name === 'Layer' && layer.get.loop() === undefined) {
      let context = layer.get.context();
      layer.set.loop(setInterval(function () {
        context.clearRect(0, 0, layer.get.width(), layer.get.height());
        layer.get.graphics().forEach((graphic) => {
          context.save();
          context.beginPath();
          layer.set.context(graphic.get.context());
          graphic.render(context, layer);
          context.closePath();
          context.restore();
        });
      }, 10));
    }
  };

  function Render (Layers) {
    if (Layers.constructor.name !== 'Layers') { throw 'The Layers parameter must be a valid Layers() instance.' }  this.start = (layers) => {
      layers = layers ? layers.map(Layers.find) : Layers.get();
      layers.forEach(loop);
    };
    this.stop = (layers) => {
      layers = layers ? layers.map(Layers.find) : Layers.get();
      layers.forEach((layer) => { layer.set.loop(clearInterval(layer.get.loop())); });
    };
  }

  function create (container) {
    if (container === undefined) { throw new Error('An html element acting as a container is requiered') }
    let layers = new Layers(container);
    let render = new Render(layers);
    let graphics = new Graphics(layers);
    layers.add();
    render.start();
    return {
      layers,
      render,
      graphics,
      get: {
        center: function(){ return { x: this.width()/2, y: this.height()/2 }},
        width: () => { return container.offsetWidth },
        height: () => { return container.offsetHeight }
      }
    }
  }

  exports.create = create;

  return exports;

}({}));
