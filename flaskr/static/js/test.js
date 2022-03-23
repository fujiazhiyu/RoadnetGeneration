(function () {
  //变量声明
  var mouseFrom = {},
    mouseTo = {},
    drawType = null,
    canvasObjectIndex = 0,
    textbox = null;
  var drawWidth = 2; //笔触宽度
  var color = "#FF0000"; //画笔颜色
  var drawingObject = null; //当前绘制对象
  var moveCount = 1; //绘制移动计数器
  var doDrawing = false; // 绘制状态
  //##
  var polygonTempLine = []; //存储画一个polygon的临时折线点，直到polygon被完成时被清空
  var polygonDrawingObjects = [];  //存储临时折线对象，直到polygon被完成时，之前的折线对象被从canvas里清除


  //初始化画板
  var canvas = new fabric.Canvas("c", {
    isDrawingMode: false,
    skipTargetFind: true,
    selectable: false,
    selection: false,
    backgroundColor: "#000000"
  });

  window.canvas = canvas;
  window.zoom = window.zoom ? window.zoom : 1;

  canvas.freeDrawingBrush.color = color; //设置自由绘颜色
  canvas.freeDrawingBrush.width = drawWidth + 4;
  canvas.setWidth(512);
  canvas.setHeight(512);
  canvas.renderAll();
  drawType = "line";

  //绑定画板事件
  canvas.on("mouse:down", function (options) {
    var xy = transformMouse(options.e.offsetX, options.e.offsetY);
    mouseFrom.x = xy.x;
    mouseFrom.y = xy.y;

    doDrawing = true;
  });
  canvas.on("mouse:up", function (options) {
    var xy = transformMouse(options.e.offsetX, options.e.offsetY);
    mouseTo.x = xy.x;
    mouseTo.y = xy.y;

    moveCount = 1;
    doDrawing = false;

    if (drawType == 'polygon') {
        doDrawing = true;
        polygonTempLine.push({
            x: xy.x,
            y: xy.y
        });
        console.log(canvas.getObjects());
        polygonDrawingObjects.push(drawingObject);
    }

    drawingObject = null;
  });
  canvas.on("mouse:move", function (options) {
    if (moveCount % 2 && !doDrawing) {
      //减少绘制频率
      return;
    }
    moveCount++;
    var xy = transformMouse(options.e.offsetX, options.e.offsetY);
    mouseTo.x = xy.x;
    mouseTo.y = xy.y;
    drawing();
  });
  canvas.on("mouse:dblclick", function (options) {
      var xy = transformMouse(options.e.offsetX, options.e.offsetY);
      doDrawing = false;

      if (drawType == 'polygon') {
          canvasObject = new fabric.Polygon(polygonTempLine, {
            stroke: color,
            strokeWidth: drawWidth,
            fill: color,
            globalCompositeOperation: "lighter"
          });
          polygonDrawingObjects.forEach((item) => {
              canvas.remove(item);
          });
          canvas.add(canvasObject);
          polygonTempLine = [];
          polygonDrawingObjects = [];
      }
  });

  canvas.on("selection:created", function (e) {
    if (drawType == "remove") {
        if (e.target._objects) {
          //多选删除
          var etCount = e.target._objects.length;
          for (var etindex = 0; etindex < etCount; etindex++) {
            canvas.remove(e.target._objects[etindex]);
          }
        } else {
          //单选删除
          canvas.remove(e.target);
        }
        canvas.discardActiveObject(); //清楚选中框
    }

  });

  canvas.on('path:created', function(opt) {
    opt.path.globalCompositeOperation = 'lighter';
    canvas.renderAll();
  });
  //坐标转换
  function transformMouse(mouseX, mouseY) {
    return { x: mouseX / window.zoom, y: mouseY / window.zoom };
  }

  //绑定工具事件
  jQuery("#toolsul")
    .find("li")
    .on("click", function () {
      //设置样式
      jQuery("#toolsul")
        .find("li>i")
        .each(function () {
          jQuery(this).attr("class", jQuery(this).attr("data-default"));
        });
      jQuery(this)
        .addClass("active")
        .siblings()
        .removeClass("active");
      jQuery(this)
        .find("i")
        .attr(
          "class",
          jQuery(this)
            .find("i")
            .attr("class")
            .replace("black", "select")
        );
      drawType = jQuery(this).attr("data-type");
      canvas.isDrawingMode = false;
      if (drawType == "move") {
          canvas.selection = true;
          canvas.skipTargetFind = false;
          canvas.selectable = true;
      }
      else if (drawType == "remove") {
        canvas.selection = true;
        canvas.skipTargetFind = false;
        canvas.selectable = true;
      } else {
        canvas.skipTargetFind = true; //画板元素不能被选中
        canvas.selection = false; //画板不显示选中
      }
    });

  jQuery('.color-item')
    .on("click", function () {
        jQuery(this)
          .addClass("active")
          .siblings()
          .removeClass("active");
        color = jQuery(this).css("backgroundColor");
        canvas.freeDrawingBrush.color = color;
    });


  //绘画方法
  function drawing() {
    if (drawingObject) {
      canvas.remove(drawingObject);
    }
    var canvasObject = null;
    switch (drawType) {
      case "line": //直线
        canvasObject = new fabric.Line([mouseFrom.x, mouseFrom.y, mouseTo.x, mouseTo.y], {
          stroke: color,
          strokeWidth: 6,
	  strokeLineCap: "round",
          globalCompositeOperation: "lighter"
        });
        break;
      case "circle": //点
        canvasObject = new fabric.Circle({
            left: mouseFrom.x - 9,
            top: mouseFrom.y - 9,
            stroke: color,
            radius: 7.5,
            // strokeWidth: drawWidth + 10,
            fill: color,
            globalCompositeOperation: "lighter"
        });

        break;
      case "polygon": //多边形
        canvasObject = new fabric.Polyline(polygonTempLine.concat([{x: mouseTo.x, y: mouseTo.y}]), {
          stroke: color,
          strokeWidth: drawWidth,
          fill: "grey",
        });
        break;
      case "remove":
        break;
      default:
        break;
    }
    if (canvasObject) {
      // canvasObject.index = getCanvasObjectIndex();
      canvas.add(canvasObject); //.setActiveObject(canvasObject)
      drawingObject = canvasObject;
    }
  }

  //获取画板对象的下标
  function getCanvasObjectIndex() {
    return canvasObjectIndex++;
  }
  // 后面单独抽出来放一个js文件里
  jQuery("#save").click(function(){
      $("#c").get(0).toBlob(function(blob){
		saveAs(blob, "myIMG.png");
	  });
  });
  
})();
