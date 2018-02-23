
let history = "Il processo formativo dell'insediamento gesuitico a l'Aquila risulta piuttosto lungo e complesso. Il progetto dei gesuiti per realizzare nel cuore dell'Aquila un collegio con annessa chiesa risale alla seconda meta' del Cinquecento ma l'iter progettuale incontro' numerose difficolta' che posticiparono l'inizio dei lavori e finirono per limitare l'impatto urbanistico-architettonico originario dell'intervento. La vicenda urbanistica-edilizia inizia il 9 ottobre 1592, con l'assegnazione ai gesuiti delle case Camponeschi. Solo nel 1597, dopo circa trent'anni di trattative e grazie all'appoggio delle autorita' civili e religiose, l'ordine riusci' a rilevare l'antico palazzo della Camera e la vicina chiesa in piazza Santa Margherita per installarvi il collegio e nel 1598-1599 cominciarono i lavori per l'adeguamento dei fabbricati. Le proposte per la costruzione di una nuova chiesa in sostituzione della precedente cominciarono gia' a partire dalla fine del XVI secolo e si protrassero per lungo tempo.";

history = history.split(" ");
let historyPages = [];
for(let start = 0, n_words = 135; start < history.length; start = start + n_words) {
  if (start + n_words < history.length) {
    historyPages.push(history.slice(start, start + n_words).join(" ") + ' ...'); 
  }
  else {
    historyPages.push(history.slice(start, history.length).join(" ")); 
  }
}
let currentIndexHistory = 0;
  
AFRAME.registerComponent('basic-material', {
  init: function (){
    var material = new THREE.MeshBasicMaterial({color: this.el.getAttribute('color')});
    var geometry = this.el.getObject3D('mesh').geometry;
    this.el.setObject3D('mesh', new THREE.Mesh(geometry, material));
  },
  remove: function(){
    this.el.removeObject3D('mesh');
  }
});

AFRAME.registerComponent('show-history', {
  init: function(){
    this.el.addEventListener('click', function(event){
      document.querySelector('.history').setAttribute('visible', true);
      if (historyPages.length > 1) {
        document.querySelector('[go-forward-history]').setAttribute('visible', true);
      }
      else {
        document.querySelector('[go-forward-history]').setAttribute('visible', false);
      }
      document.querySelector('[go-backward-history]').setAttribute('visible', false);
      currentIndexHistory = 0;
      document.querySelector('.history').setAttribute('value', historyPages[currentIndexHistory]);
    })
  }
});

AFRAME.registerComponent('go-backward-history', {
  init: function(){
    this.el.addEventListener('click', (event) => {
      if (currentIndexHistory > 0) {
        currentIndexHistory--;
        document.querySelector('[go-forward-history]').setAttribute('visible', true);
        if (currentIndexHistory == 0) {
          this.el.setAttribute('visible', false);
        }
      }
      document.querySelector('.history').setAttribute('value', historyPages[currentIndexHistory]);
    })
  }
});

AFRAME.registerComponent('go-forward-history', {
  init: function(){
    this.el.addEventListener('click', (event) => {
      if (currentIndexHistory < historyPages.length - 1) {
        currentIndexHistory++;
        document.querySelector('[go-backward-history]').setAttribute('visible', true);
        if (currentIndexHistory == historyPages.length - 1) {
          this.el.setAttribute('visible', false);
        }
      }
      document.querySelector('.history').setAttribute('value', historyPages[currentIndexHistory]);
    })
  }
});

AFRAME.registerComponent('hide-history', {
  init: function(){
    this.el.addEventListener('click', function(event){
      currentIndexHistory = 0;
      document.querySelector('.history').setAttribute('visible', false);
      document.querySelector('.history').setAttribute('value', '');
    })
  }
});

AFRAME.registerComponent('look-at-camera', {
  tick: function(time, timeDelta){
    let camera = document.querySelector('a-camera');
    let position = camera.getAttribute('position');
    this.el.object3D.lookAt(position);
  }
});

AFRAME.registerComponent('follow-camera', {
  schema: {
    offset: {
      type: 'vec3',
      default: '0 0 0'
    }
  },
  tick: function(time, timeDelta){
    let camera = document.querySelector('a-camera');
    let position = camera.getAttribute('position');
    this.el.setAttribute('position', (position.x + this.data.offset.x) + ' ' + (position.y + this.data.offset.y) + ' ' + (position.z + this.data.offset.z));
  }
});

AFRAME.registerComponent('animation-move', {
  schema: {
    path: {
      default: [],
      parse: function (value) {
        return JSON.parse(value);
      }
    },
    animationStepTime: {
      type: 'int',
      default: 0
    }
  },
  init: function(){
    this.next = 0;
    let object = this.el;
    for (let prop in this.data.path[this.next]) {
      object.setAttribute( prop, this.data.path[this.next][prop] );
    }
  },
  tick: function (time, timeDelta) {
    let updated = false

    if ( this.next >= this.data.path.length ) {
      this.next = 0;
    }

    let delta = this.data.animationStepTime / (16.7 * ((this.data.animationStepTime+timeDelta)/this.data.animationStepTime));
    let object = this.el;

    for (let prop in this.data.path[this.next]) {

      let attr = object.getAttribute(prop);
      let nextStep = this.data.path[this.next][prop];

      let xDelta = Math.abs( (this.next-1 >= 0) ? nextStep.x - this.data.path[this.next-1][prop].x : nextStep.x - this.data.path[this.data.path.length-1][prop].x)/delta;
      let yDelta = Math.abs( (this.next-1 >= 0) ? nextStep.y - this.data.path[this.next-1][prop].y : nextStep.y - this.data.path[this.data.path.length-1][prop].y)/delta;
      let zDelta = Math.abs( (this.next-1 >= 0) ? nextStep.z - this.data.path[this.next-1][prop].z : nextStep.z - this.data.path[this.data.path.length-1][prop].z)/delta;

      if (attr.x != nextStep.x) {
        if ((this.next-1 >= 0 && nextStep.x < this.data.path[this.next-1][prop].x) || (this.next == 0 && nextStep.x < this.data.path[this.data.path.length-1][prop].x)) {
          if (attr.x-xDelta < nextStep.x) {
            attr.x = nextStep.x;
          }
          else {
            attr.x -= xDelta;
            updated = true;
          }
        }
        else if (this.next-1 >= 0 && nextStep.x > this.data.path[this.next-1][prop].x || (this.next == 0 && nextStep.x > this.data.path[this.data.path.length-1][prop].x)) {
          if (attr.x+xDelta > nextStep.x) {
            attr.x = nextStep.x;
          }
          else {
            attr.x += xDelta;
            updated = true;
          }
        }
        else {
          attr.x = nextStep.x;
        }
      }

      if (attr.y != nextStep.y) {
        if (this.next-1 >= 0 && nextStep.y < this.data.path[this.next-1][prop].y || (this.next == 0 && nextStep.y < this.data.path[this.data.path.length-1][prop].y)) {
          if (attr.y-yDelta < nextStep.y) {
            attr.y = nextStep.y;
          }
          else {
            attr.y -= yDelta;
            updated = true;
          }
        }
        else if (this.next-1 >= 0 && nextStep.y > this.data.path[this.next-1][prop].y || (this.next == 0 && nextStep.y > this.data.path[this.data.path.length-1][prop].y)) {
          if (attr.y+yDelta > nextStep.y) {
            attr.y = nextStep.y;
          }
          else {
            attr.y += yDelta;
            updated = true;
          }
        }
        else {
          attr.y = nextStep.y;
        }
      }

      if (attr.z != nextStep.z) {
        if (this.next-1 >= 0 && nextStep.z < this.data.path[this.next-1][prop].z || (this.next == 0 && nextStep.z < this.data.path[this.data.path.length-1][prop].z)) {
          if (attr.z-zDelta < nextStep.z) {
            attr.z = nextStep.z;
          }
          else {
            attr.z -= zDelta;
            updated = true;
          }
        }
        else if (this.next-1 >= 0 && nextStep.z > this.data.path[this.next-1][prop].z || (this.next == 0 && nextStep.z > this.data.path[this.data.path.length-1][prop].z)) {
          if (attr.z+zDelta > nextStep.z) {
            attr.z = nextStep.z;
          }
          else {
            attr.z += zDelta;
            updated = true;
          }
        }
        else {
          attr.z = nextStep.z;
        }
      }

      object.setAttribute( prop, attr.x+' '+attr.y+' '+attr.z );
    }
    if (!updated) {
      this.next++;
    }
  }
});

AFRAME.registerComponent('highlight', {
  init: function () {
    this.el.addEventListener('mouseenter', (evt) => {
      this.el.querySelector('a-plane').setAttribute('color', '#F44336');
    });
    this.el.addEventListener('mouseleave', (evt) => {
      this.el.querySelector('a-plane').setAttribute('color', '#000');
    });
  }
});

AFRAME.registerComponent('move-camera', {
  schema: {
    position: {
      default: '0 0 0',
      type: 'vec3',
    }
  },
  init: function () {
    this.focused = false;
    this.maxPosition = {
      x: {
        max: 0,
        min: 0
      },
      y: {
        max: 20,
        min: 2,
      },
      z: {
        max: 15,
        min: 0
      }
    };
    this.el.addEventListener('mouseenter', (evt) => {
      this.cameraPositionY = document.querySelector('a-camera').getAttribute('position').y;
      this.focused = true;
    });
    this.el.addEventListener('mouseleave', (evt) => {
      this.focused = false;
    });
  },
  tick: function(time, timeDelta) {
    let camera = document.querySelector('a-camera');
    let position = camera.getAttribute('position');

    if ( this.focused ) {

      for (const axis in this.data.position) {
        if (this.data.position[axis] == 0) {
          continue;
        }
        if (position[axis] + this.data.position[axis] > this.maxPosition[axis].max) {
          position[axis] = this.maxPosition[axis].max;
          
        }
        else if (position[axis] + this.data.position[axis] < this.maxPosition[axis].min) {
          position[axis] = this.maxPosition[axis].min;
        }
        else {
          position[axis] += this.data.position[axis];
        }
      }
      // fix for signs position
      let signs = document.querySelectorAll('.sign');
      for(let i = 0, length1 = signs.length; i < length1; i++){
        let p = AFRAME.utils.coordinates.parse(signs[i].attributes['follow-camera'].value.replace('offset:', '').replace(';', ''));
        signs[i].setAttribute('position', (position.x + p.x) + ' ' + (position.y + p.y) + ' ' + (position.z + p.z));
      }

      camera.setAttribute('position', position);
    }
  }
});