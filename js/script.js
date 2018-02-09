(function() {
  var el, lastActive, object;
  //var mods = 0;
  //var state = [];

  var config = {
    canvasState             : [],
    currentStateIndex       : -1,
    undoStatus              : false,
    redoStatus              : false,
    undoFinishedStatus      : 1,
    redoFinishedStatus      : 1
  };

  fabric.Object.prototype.transparentCorners = false;
  var $ = function(id){return document.getElementById(id)};

  function applyFilter(index, filter) {
    var obj = canvas.getActiveObject();
    obj.filters[index] = filter;
    obj.applyFilters(canvas.renderAll.bind(canvas));
  }

  function applyFilterValue(index, prop, value) {
    var obj = canvas.getActiveObject();
    if (obj.filters[index]) {
      obj.filters[index][prop] = value;
      obj.applyFilters(canvas.renderAll.bind(canvas));
    }
  }

  fabric.Object.prototype.padding = 5;
  fabric.Object.prototype.transparentCorners = false;

  var canvas = this.__canvas = new fabric.Canvas('c'),
      f = fabric.Image.filters;

  canvas.backgroundColor = '#ffffff';
  canvas.on({
    'object:selected': function() {
      fabric.util.toArray(document.getElementsByTagName('input'))
                          .forEach(function(el){ el.disabled = false; })

      var filters = ['grayscale', 'invert', 'remove-white', 'sepia', 'sepia2',
                      'brightness', 'noise', 'gradient-transparency', 'pixelate',
                      'blur', 'sharpen', 'emboss', 'tint'];

      for (var i = 0; i < filters.length; i++) {
        $(filters[i]).checked = !!canvas.getActiveObject().filters[i];
      }
    },

    'selection:cleared': function() {
      fabric.util.toArray(document.getElementsByTagName('input')).forEach(function(el){ el.disabled = true; })
    },

     'object:modified': function () {
      //console.log('object modified');
      updateModifications();  
    },

    'object:added': function () {
      //console.log('object added ');
      updateModifications();  
    }
  });

  fabric.Image.fromURL(document.getElementById('gingerbread-house').src, function(img) {
    var oImg = img.set({ left: 50, top: 100, angle: 0 }).scale(0.9);
    canvas.add(oImg).renderAll();
    canvas.setActiveObject(oImg);
  });

  fabric.Image.fromURL(document.getElementById('pavlova').src, function(img) {
    var oImg = img.set({ left: 300, top: 350, angle: 0  }).scale(0.9);
    canvas.add(oImg).renderAll();
    canvas.setActiveObject(oImg);
  });

  $('grayscale').onclick = function() {
    applyFilter(0, this.checked && new f.Grayscale());
  };
  $('invert').onclick = function() {
    applyFilter(1, this.checked && new f.Invert());
  };
  $('remove-white').onclick = function () {
    applyFilter(2, this.checked && new f.RemoveWhite({
      threshold: $('remove-white-threshold').value,
      distance: $('remove-white-distance').value
    }));
  };
  $('remove-white-threshold').onchange = function() {
    applyFilterValue(2, 'threshold', this.value);
  };
  $('remove-white-distance').onchange = function() {
    applyFilterValue(2, 'distance', this.value);
  };
  $('sepia').onclick = function() {
    applyFilter(3, this.checked && new f.Sepia());
  };
  $('sepia2').onclick = function() {
    applyFilter(4, this.checked && new f.Sepia2());
  };
  $('brightness').onclick = function () {
    applyFilter(5, this.checked && new f.Brightness({
      brightness: parseInt($('brightness-value').value, 10)
    }));
  };
  $('brightness-value').onchange = function() {
    applyFilterValue(5, 'brightness', parseInt(this.value, 10));
  };
  $('noise').onclick = function () {
    applyFilter(6, this.checked && new f.Noise({
      noise: parseInt($('noise-value').value, 10)
    }));
  };
  $('noise-value').onchange = function() {
    applyFilterValue(6, 'noise', parseInt(this.value, 10));
  };
  $('gradient-transparency').onclick = function () {
    applyFilter(7, this.checked && new f.GradientTransparency({
      threshold: parseInt($('gradient-transparency-value').value, 10)
    }));
  };
  $('gradient-transparency-value').onchange = function() {
    applyFilterValue(7, 'threshold', parseInt(this.value, 10));
  };
  $('pixelate').onclick = function() {
    applyFilter(8, this.checked && new f.Pixelate({
      blocksize: parseInt($('pixelate-value').value, 10)
    }));
  };
  $('pixelate-value').onchange = function() {
    applyFilterValue(8, 'blocksize', parseInt(this.value, 10));
  };
  $('blur').onclick = function() {
    applyFilter(9, this.checked && new f.Convolute({
      matrix: [ 1/9, 1/9, 1/9,
                1/9, 1/9, 1/9,
                1/9, 1/9, 1/9 ]
    }));
  };
  $('sharpen').onclick = function() {
    applyFilter(10, this.checked && new f.Convolute({
      matrix: [  0, -1,  0,
                -1,  5, -1,
                 0, -1,  0 ]
    }));
  };
  $('emboss').onclick = function() {
    applyFilter(11, this.checked && new f.Convolute({
      matrix: [ 1,   1,  1,
                1, 0.7, -1,
               -1,  -1, -1 ]
    }));
  };
  $('tint').onclick = function() {
    applyFilter(12, this.checked && new f.Tint({
      color: document.getElementById('tint-color').value,
      opacity: parseFloat(document.getElementById('tint-opacity').value)
    }));
    var svg = canvas.toSVG();
  };
  $('tint-color').onchange = function() {
    applyFilterValue(12, 'color', this.value);
  };
  $('tint-opacity').onchange = function() {
    applyFilterValue(12, 'opacity', this.value);
  };
  $('text-input').onchange = (function (e) {
    var formatted = textArea.value;
    var textSample = new fabric.Text(formatted, {
        left: 50,
        top: 70,
        fontSize: 25,
        fontFamily: 'delicious_500',
        backgroundColor: 'transparent',
        padding: 10,
        scaleX: 0.9,
        scaleY: 0.9
    });
    canvas.add(textSample).renderAll();
    canvas.setActiveObject(textSample, e);
  });

   $('button').onclick = function() {
      var canvas = document.getElementById('c').getContext('2d');
      var button = document.getElementById('button');
      
      var image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = function(event) {
        try {
          canvas.drawImage(image, 0, 0, 1, 1);
          button.download = 'image.jpg';
          button.href = canvas.canvas.toDataURL();
        } catch (e) {
          alert(e);
        }
      }
      image.src = document.getElementById('img-three').src;
    };


  var progress = document.querySelector('.percent');

  function abortRead() {
    reader.abort();
  }

  function errorHandler(evt) {
    switch(evt.target.error.code) {
      case evt.target.error.NOT_FOUND_ERR:
        alert('File Not Found!');
        break;
      case evt.target.error.NOT_READABLE_ERR:
        alert('File is not readable');
        break;
      case evt.target.error.ABORT_ERR:
        break; // noop
      default:
        alert('An error occurred reading this file.');
    };
  }

  function updateProgress(evt) {
    if (evt.lengthComputable) {
      var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
      if (percentLoaded < 100) {
        progress.style.width = percentLoaded + '%';
        progress.textContent = percentLoaded + '%';
      }
    }
  }

  function handleFileSelect(evt) {
    var files = evt.target.files; 
    progress.style.width = '0%';
    progress.textContent = '0%';

    for (var i = 0, f; f = files[i]; i++) {
      if (!f.type.match('image.*')) {
        continue;
      }

      var reader = new FileReader();
      reader.onerror = errorHandler;
      reader.onprogress = updateProgress;
      reader.onabort = function(e) {
        alert('File read cancelled');
      };
      reader.onloadstart = function(e) {
        document.getElementById('progress_bar').className = 'loading';
      };

      reader.onload = (function(theFile) {
      progress.style.width = '100%';
      progress.textContent = '100%';
      setTimeout("document.getElementById('progress_bar').className='';", 2000);
        return function(e) {
          var file = e.target.result; 
          var fileName = escape(theFile.name);
          canvas.getActiveObject().remove()
          fabric.Image.fromURL(file, function(img) {
          var oImg = img.set({ left: 300, top: 350, angle: 0 }).scale(0.9);
          canvas.add(oImg).renderAll();
          canvas.setActiveObject(oImg);
          });
        };
      })(f);
      reader.readAsDataURL(f);
    }
  }
  document.getElementById('files3').addEventListener('change', handleFileSelect, false);
  
  var radios5 = document.getElementsByName("fonttype");
    for (var i = 0, max = radios5.length; i < max; i++) {
      radios5[i].onclick = function() {
        if (document.getElementById(this.id).checked == true) {
          if (this.id == "text-cmd-bold") {
              canvas.getActiveObject().set("fontWeight", "bold");
          }
          if (this.id == "text-cmd-italic") {
              canvas.getActiveObject().set("fontStyle", "italic");
          }
          if (this.id == "text-cmd-underline") {
              canvas.getActiveObject().set("textDecoration", "underline");
          }
          if (this.id == "text-cmd-linethrough") {
              canvas.getActiveObject().set("textDecoration", "line-through");
          }
          if (this.id == "text-cmd-overline") {
              canvas.getActiveObject().set("textDecoration", "overline");
          }
        } else {
          if (this.id == "text-cmd-bold") {
              canvas.getActiveObject().set("fontWeight", "");
          }
          if (this.id == "text-cmd-italic") {
              canvas.getActiveObject().set("fontStyle", "");
          }
          if (this.id == "text-cmd-underline") {
              canvas.getActiveObject().set("textDecoration", "");
          }
          if (this.id == "text-cmd-linethrough") {
              canvas.getActiveObject().set("textDecoration", "");
          }
          if (this.id == "text-cmd-overline") {
              canvas.getActiveObject().set("textDecoration", "");
          }
        }
        canvas.renderAll();
      }
    }
  // text editor functions 
      $('text-color').onchange = function() {
        canvas.getActiveObject().setFill(this.value);
        canvas.renderAll();
      };
      $('text-bg-color').onchange = function() {
        canvas.getActiveObject().setBackgroundColor(this.value);
        canvas.renderAll();
      };
      $('text-stroke-color').onchange = function() {
        canvas.getActiveObject().setStroke(this.value);
        canvas.renderAll();
      };
      $('text-stroke-width').onchange = function() {
        canvas.getActiveObject().setStrokeWidth(this.value);
        canvas.renderAll();
      };
      $('font-family').onchange = function() {
        canvas.getActiveObject().setFontFamily(this.value);
        canvas.renderAll();
      };
      $('text-font-size').onchange = function() {
        canvas.getActiveObject().setFontSize(this.value);
        canvas.renderAll();
      };

  // delete object
  window.deleteObject = function() {
    canvas.getActiveObject().remove();
  }

  // copy & paste
  $('copy').onclick = function(){
    copy();
  };

  $('paste').onclick = function(){
    paste();
  };

  // crop image
  $('startCrop').onclick = function(){
    startCrop();
  };

  $('endCrop').onclick = function(){
    endCrop();
  };

  $('undoCrop').onclick = function(){
    undoCrop();
  };

  $('redoCrop').onclick = function(){
    redoCrop();
  };

  var copiedObject,
      copiedObjects = new Array();

  function copy(){
    copiedObjects = new Array();
    if(canvas.getActiveGroup()){
        //console.log(canvas.getActiveGroup().getObjects());
        canvas.getActiveGroup().getObjects().forEach(function(o){
            var object = fabric.util.object.clone(o);
            copiedObjects.push(object);
        });             
    }
    else if(canvas.getActiveObject()){
        var object = fabric.util.object.clone(canvas.getActiveObject());
        copiedObject = object;
        copiedObjects = new Array();
        
    }
  }

  function paste(){
    if(copiedObjects.length > 0){
        for(var i in copiedObjects){
          copiedObjects[i]=fabric.util.object.clone(copiedObjects[i]);
      
          copiedObjects[i].set("top", copiedObjects[i].top+100);
          copiedObjects[i].set("left", copiedObjects[i].left+100);
            
          canvas.add(copiedObjects[i]);
          canvas.item(canvas.size() - 1).hasControls = true;
        }                
    }
    else if(copiedObject){
      copiedObject= fabric.util.object.clone(copiedObject);
      copiedObject.set("top", 150);
      copiedObject.set("left", 150);
        canvas.add(copiedObject);
        canvas.item(canvas.size() - 1).hasControls = true;
    }
    canvas.renderAll();  
  }

  function startCrop(){

    canvas.remove(el);
    if(canvas.getActiveObject()) {  
      object=canvas.getActiveObject();
  
      if(lastActive !== object)
        {console.log('different object');}  
      else {console.log('same object');}
      if (lastActive && lastActive !== object) {
        lastActive.clipTo = null;    
      }
   
      el = new fabric.Rect({
        fill: 'transparent',
        originX: 'left',
        originY: 'top',
        stroke: '#ccc',
        strokeDashArray: [2, 2],
        opacity: 1,
        width: 1,
        height: 1,
        borderColor: '#36fd00',
        cornerColor: 'green',
        hasRotatingPoint:false,
        objectCaching: false
      });
  
      el.left=canvas.getActiveObject().left;
      el.top=canvas.getActiveObject().top;
      el.width=canvas.getActiveObject().width*canvas.getActiveObject().scaleX;
      el.height=canvas.getActiveObject().height*canvas.getActiveObject().scaleY;
    
      canvas.add(el);
      canvas.setActiveObject(el)
    }
  
    else {
      alert("Please select an object or layer");
    }
  }

  function endCrop(){
    var left = el.left - object.left;
    var top = el.top - object.top;
    
    left *= 1;
    top *= 1;
    
    var width = el.width * 1;
    var height = el.height * 1;
    object.clipTo = function (ctx) {      
      ctx.rect(-(el.width/2)+left, -(el.height/2)+top, parseInt(width*el.scaleX), parseInt(el.scaleY*height));
    }   
    canvas.remove(canvas.getActiveObject(el));
    //console.log('end crop, ', object);
    lastActive = object;
    canvas.renderAll();   
  }
  
    var updateModifications = function() {
    if((config.undoStatus == false && config.redoStatus == false)){
      var jsonData = canvas.toJSON();
      var canvasAsJson = JSON.stringify(jsonData);
      if(config.currentStateIndex < config.canvasState.length-1){
        var indexToBeInserted = config.currentStateIndex+1;
        config.canvasState[indexToBeInserted] = canvasAsJson;
        var numberOfElementsToRetain = indexToBeInserted+1;
        config.canvasState = config.canvasState.splice(0, numberOfElementsToRetain);
      } else {
        config.canvasState.push(canvasAsJson);
      }
      config.currentStateIndex = config.canvasState.length-1;
      //console.log('modification fcn', jsonData);
     }
  }
 
  var undoCrop = function() {
    if(config.undoFinishedStatus){
      if(config.currentStateIndex == -1){
        config.undoStatus = false;
      } else {
        if (config.canvasState.length >= 1) {
            config.undoFinishedStatus = 0;
          if(config.currentStateIndex != 0){
            config.undoStatus = true;
            canvas.loadFromJSON(config.canvasState[config.currentStateIndex-1],function(){
                var jsonData = JSON.parse(config.canvasState[config.currentStateIndex-1]);
                //console.log('undo crop, ', jsonData);
                lastActive = object;
                canvas.renderAll();   
                config.undoStatus = false;
                config.currentStateIndex -= 1;
                config.undoFinishedStatus = 1;
            });
          }
          else if(config.currentStateIndex == 0){
            canvas.clear();
            config.undoFinishedStatus = 1;
            config.currentStateIndex -= 1;
          }
        }
      }
    }
  }

  var redoCrop = function() {
    if(config.redoFinishedStatus){
      if (config.canvasState.length > config.currentStateIndex && config.canvasState.length != 0){
          config.redoFinishedStatus = 0;
          config.redoStatus = true;
          canvas.loadFromJSON(config.canvasState[config.currentStateIndex+1], function(){
            var jsonData = JSON.parse(config.canvasState[config.currentStateIndex+1]);
            //console.log('redo crop, ', jsonData);
            canvas.renderAll();
            config.redoStatus = false;
            config.currentStateIndex += 1;
            config.redoFinishedStatus = 1;
        });
      }
    }
  } 
})();