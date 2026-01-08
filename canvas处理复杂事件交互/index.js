/**
 * t图形基类
 */
class Shape {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.color = color;
    // 存储事件监听器， 格式：{eventName: [callback1, callback2]}
    // 事件系统的核心，用对象来存储，key是事件名， value是一个数组,存放所有吉娜婷这个事件的回调函数
    this.listeners = {};
  }
  /**
   * 绘制方法（由子类实现）
   * @param {CanvasRenderContext2D} ctx 画布上下文
   */
  draw(ctx) {
    throw new Error("Draw method must be implemented by subclass.");
  }

  /**
   * 拾取检测方法（由子类实现）
   * @param {number} x 监测点x坐标
   * @param {number} y 监测点y坐标
   */
  isPointInside(x, y) {
    throw new Error("isPointInside method must be implemented by subclass.");
  }
  /**
   * 添加事件监听
   * @param {string} eventName 事件名称
   * @param {Function} listener 回调函数
   */
  on(eventName, listener) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(listener);
  }

  /**
   * 触发事件
   * @param {string} eventName 事件名称
   * @param {Object} event 事件对象
   */
  emit(eventName, event) {
    const listeners = this.listeners[eventName];
    if (listeners) {
      listeners.forEach((listener) => listener(event));
    }
  }
}

/**
 * 矩形类
 */
class Rectangle extends Shape {
  constructor(x, y, width, height, color) {
    super(x, y, color);
    this.width = width;
    this.height = height;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
  isPointInside(px, py) {
    return (
      px >= this.x &&
      px <= this.x + this.width &&
      py >= this.y &&
      py <= this.y + this.height
    );
  }
}

/**
 * 圆形类
 */
class Circle extends Shape {
  constructor(x, y, radius, color) {
    super(x, y, color);
    this.radius = radius;
  }
  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  isPointInside(px, py) {
    const dx = px - this.x;
    const dy = py - this.y;
    return dx * dx + dy * dy <= this.radius * this.radius;
  }
}

// ----------2.Canvas 管理器-------------
class CanvasManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.ctx.width = 600;
    this.ctx.height = 600;
    // this.canvas.width = 600;
    // this.canvas.height = 600;
    this.shapes = []; // 存储所有图像对象
    this.canvasRect = canvas.getBoundingClientRect();
    this._initListeners();
  }

  /**
   * 添加图片到画布
   * @param {Shape} shape 图形对象
   */
  addShape(shape) {
    this.shapes.push(shape);
  }

  /** 渲染所有图形 */
  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    // 注意绘制顺序：数组索引越大，绘制层级越高
    this.shapes.forEach((shape) => shape.draw(this.ctx));
  }

  /** 初始化事件监听 */
  _initListeners() {
    this.canvas.addEventListener("click", this._handleCanvasClick.bind(this));
    // 可扩展添加其他事件如：mousemove，mousedown等
  }

  /**
   * 转换鼠标坐标到画布坐标系
   * @param {MouseEvent} event 鼠标事件
   */
  _getCanvasCoordinates(event) {
    return {
      x: event.clientX - this.canvasRect.left,
      y: event.clientY - this.canvasRect.top,
    };
  }

  /**
   * 处理画布点击事件
   * @param {MouseEvent} event 鼠标事件
   */
  _handleCanvasClick(event) {
    const { x, y } = this._getCanvasCoordinates(event);
    let targetShape = null;

    // 倒序遍历实现上层元素优先拾取
    for (let i = this.shapes.length - 1; i >= 0; i--) {
      const shape = this.shapes[i];
      if (shape.isPointInside(x, y)) {
        targetShape = shape;
        break; // 找到最上层图形后终止循环
      }
    }
    if (targetShape) {
      const customEvent = {
        target: targetShape,
        nativeEvent: event,
      };
      targetShape.emit("click", customEvent);
    }
  }
}

// --------3.使用示例 ---------
const canvas = document.getElementById("myCanvas");
console.log("canvas===", canvas);
canvas.width = 600;
canvas.height = 400;

const manager = new CanvasManager(canvas);

// 创建图形
const rect = new Rectangle(50, 50, 150, 100, "blue");
const circle = new Circle(250, 200, 50, "red");
const overlappingRect = new Rectangle(80, 80, 100, 100, "green");

// 添加事件监听
rect.on("click", (e) => {
  console.log("blue rectangle clicked");
  e.target.color = "red";
  manager.render();
});
overlappingRect.on("click", (e) => {
  console.log("blue rectangle clicked");
  e.target.color = "yellow";
  manager.render();
});

circle.on("click", (e) => {
  console.log("green rectangle clicked");
  e.target.color = "lightgreen";
  manager.render();
});

// 添加图形到管理器(注意添加顺序决定绘制层级)
manager.addShape(rect);
manager.addShape(circle);
manager.addShape(overlappingRect); //最后添加的图形显示在最上层
// 初始渲染
manager.render();
