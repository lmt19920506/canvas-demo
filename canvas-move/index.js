const colorPicker = document.querySelector("input");
const cvs = document.querySelector("canvas");
const ctx = cvs.getContext("2d");

function init() {
  const w = 500,
    h = 300;
  ctx.width = w * devicePixelRatio;
  ctx.height = h * devicePixelRatio;
  //   cvs.style.width = w + "px";
  //   cvs.style.height = h + "px";
}
init();

const shapes = [];
class Rectangle {
  constructor(startX, startY, color) {
    this.startX = startX;
    this.startY = startY;
    this.color = color;
    this.endX = startX;
    this.endY = startY;
  }

  // 访问器
  get minX() {
    return Math.min(this.startX, this.endX);
  }
  get minY() {
    return Math.min(this.startY, this.endY);
  }
  get maxX() {
    return Math.max(this.startX, this.endX);
  }
  get maxY() {
    return Math.max(this.startY, this.endY);
  }
  draw() {
    // ctx.beginPath(); // 开始一条路径
    // ctx.moveTo(50, 50);
    // ctx.lineTo(150, 50);
    // ctx.lineTo(150, 150);
    // ctx.lineTo(50, 150);
    // console.log("color:", this.color);
    // ctx.closePath(); // 关闭路径
    // ctx.strokeStyle = this.color; // 描边颜色
    // ctx.lineWidth = 5; // 边框宽度
    // ctx.stroke(); // 以边框的方式显示出来

    // console.log("draw rectangle");
    ctx.fillStyle = this.color;
    // console.log("start", this.endX, this.endY);
    ctx.fillRect(
      this.minX * devicePixelRatio,
      this.minY * devicePixelRatio,
      (this.maxX - this.minX) * devicePixelRatio,
      (this.maxY - this.minY) * devicePixelRatio
    );
    // 绘制边框
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 3 * devicePixelRatio;
    ctx.strokeRect(
      this.minX * devicePixelRatio,
      this.minY * devicePixelRatio,
      (this.maxX - this.minX) * devicePixelRatio,
      (this.maxY - this.minY) * devicePixelRatio
    );
  }

  isInside(x, y) {
    return x >= this.minX && x <= this.maxX && y >= this.minY && y <= this.maxY;
  }
}

function getShape(x, y) {
  for (let i = shapes.length - 1; i >= 0; i--) {
    const shape = shapes[i];
    if (shape.isInside(x, y)) {
      return shape;
    }
  }
  return null;
}

cvs.onmousedown = (e) => {
  const shape = getShape(e.offsetX, e.offsetY);
  const rect = new Rectangle(e.offsetX, e.offsetY, colorPicker.value);
  if (shape) {
    // console.log("点击到了图形", shape);
    const sx = e.offsetX,
      sy = e.offsetY;
    const { startX, startY, endX, endY } = shape;
    window.onmousemove = (e) => {
      const x = e.clientX - cvs.getBoundingClientRect().left;
      const y = e.clientY - cvs.getBoundingClientRect().top;
      const dx = x - sx;
      const dy = y - sy;
      shape.startX = startX + dx;
      shape.startY = startY + dy;
      shape.endX = endX + dx;
      shape.endY = endY + dy;
    };
  } else {
    shapes.push(rect);
    console.log("shapes:", shapes);
    const cvsRect = cvs.getBoundingClientRect();

    window.onmousemove = (e) => {
      // 改变矩形的结束坐标
      const x = e.clientX - cvsRect.left;
      const y = e.clientY - cvsRect.top;
      rect.endX = x;
      rect.endY = y;
    };
  }
  window.onmouseup = (e) => {
    // 停止绘制
    window.onmousemove = null;
    window.onmouseup = null;
  };
};

function draw() {
  requestAnimationFrame(draw);
  // 清除画布
  ctx.clearRect(0, 0, cvs.width, cvs.height);
  // 重绘所有图形
  for (const shape of shapes) {
    shape.draw();
  }
}
draw();
