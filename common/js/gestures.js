
	function GestureUnlocker(options) {
			this.sideLength = options.sideLength ? options.sideLength : 0;
			var container = options.containner;
			if (!container || typeof options.callback !== 'function') {
					throw new Error('container must be offered and the callback should be a function');
			}
			this.container = container;
			this.callback = options.callback;
			this.lineColor = options.lineColor ? options.lineColor : '#ffa500';
			this.circleColor = options.circleColor ? options.circleColor : '#cecece';
			this.successColor = options.successColor ? options.successColor : 'green';
			this.errorColor = options.errorColor ? options.errorColor : 'red';
			this.mode = options.mode === 'simple' || options.mode === 'complex' ? options.mode : 'complex';

			var edge = typeof options.edge === 'number' && options.edge > 0 ? options.edge : 2;
			var gap = typeof options.gap === 'number' && options.gap > 0 ? options.gap : 2;

			this._init(options.className, edge, gap);
	}

	GestureUnlocker.prototype = {

			// 初始化画布面板，绑定事件
			_init: function (className, edge, gap) {
					this.canvas = document.createElement('canvas');
					this.canvas.className = typeof className === 'string' ? className : '';
					this.canvas.width = this.canvas.height = this.sideLength;
					this.container.appendChild(this.canvas);
					this.ctx = this.canvas.getContext('2d');

					// 获取canvas盒子模型的数值
					this.borderLeft = window.getComputedStyle(this.canvas).getPropertyValue('border-left-width').replace('px', '');
					this.borderTop = window.getComputedStyle(this.canvas).getPropertyValue('border-top-width').replace('px', '');
					this.paddingLeft = window.getComputedStyle(this.canvas).getPropertyValue('padding-left').replace('px', '');
					this.paddingRight = window.getComputedStyle(this.canvas).getPropertyValue('padding-right').replace('px', '');
					this.paddingTop = window.getComputedStyle(this.canvas).getPropertyValue('padding-top').replace('px', '');

					// clientWidth = width + padding-left + padding-right
					// 如果class样式中定义了width属性，则重新计算canvas的width值
					if (this.canvas.clientWidth - this.paddingLeft - this.paddingRight !== this.canvas.width) {
							this.canvas.width = this.canvas.height = this.canvas.clientWidth - this.paddingLeft - this.paddingRight;
					}

					this.radius = this.canvas.width / (6 + 2 * edge + 2 * gap);

					// code： 用户绘画的密码
					this.code = [];
					this._initCircles(edge, gap);
					this._bindEvent();
			},

			// 9个密码圆
			_initCircles: function (edge, gap) {
					this.points = [];
					for (var i = 0; i < 3; i++) {
							for (var j = 0; j < 3; j++) {
									this.points.push({
											x: j * (2 + gap) * this.radius + (1 + edge) * this.radius,
											y: i * (2 + gap) * this.radius + (1 + edge) * this.radius,
											number: i * 3 + j + 1
									});
							}
					}
					this._drawCircle();
			},

			_drawCircle: function () {
					for (var i = 0; i < this.points.length; i++) {
							this.ctx.strokeStyle = this.circleColor;
							this.ctx.lineWidth = 2;
							this.ctx.beginPath();
							this.ctx.arc(this.points[i].x, this.points[i].y, this.radius, 0, Math.PI * 2, true);
							this.ctx.closePath();
							this.ctx.stroke();
					}
			},

			// 绘画用户滑动的路径
			_drawCurrentPoint: function (notClear) {
					if (!notClear) {
							this.clear();
					}
					this.ctx.fillStyle = this.lineColor;
					this.ctx.lineWidth = 3;
					for (var i = 0; i < this.code.length; i++) {
							var index = this.code[i] - 1;
							this.ctx.beginPath();
							this.ctx.arc(this.points[index].x, this.points[index].y, this.radius * 0.5, 0, Math.PI * 2, true);
							this.ctx.closePath();
							this.ctx.fill();
							if (i !== 0) {
									this._drawLine(this.points[this.code[i - 1] - 1], this.points[index]);
							}
					}

			},

			// 点到点之间的连线
			_drawLine: function (startPoint, endPoint) {
					this.ctx.strokeStyle = this.lineColor;
					this.ctx.beginPath();
					this.ctx.moveTo(startPoint.x, startPoint.y);
					this.ctx.lineTo(endPoint.x, endPoint.y);
					this.ctx.closePath();
					this.ctx.stroke();
			},

			// 清除用户绘画的路径
			clear: function () {
					this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
					this._drawCircle();
			},

			// 移动时的线条跟踪
			_movingLine: function (currentPoint) {
					this._drawCurrentPoint();
					var index = this.code[this.code.length - 1] - 1;
					this._drawLine(this.points[index], currentPoint);
			},

			// 用户绘画结束后的正确错误显示
			drawCode: function (isSuccess, clearTime) {
					this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

					clearTime = clearTime ? clearTime : 300;

					for (var i = 0; i < this.points.length; i++) {
							if (this.code.toString().replace(/,/g, '').indexOf(i + 1) === -1) {
									// 不在绘画code中的原色显示
									this.ctx.strokeStyle = this.circleColor;
									this.ctx.lineWidth = 2;
							} else if (isSuccess) {
									// 在绘画code中,正确色显示
									this.ctx.strokeStyle = this.successColor;
									this.ctx.lineWidth = 3;
							} else {
									// 在绘画code中,错误色显示
									this.ctx.strokeStyle = this.errorColor;
									this.ctx.lineWidth = 3;
							}
							this.ctx.beginPath();
							this.ctx.arc(this.points[i].x, this.points[i].y, this.radius, 0, Math.PI * 2, true);
							this.ctx.closePath();
							this.ctx.stroke();
					}
					this._drawCurrentPoint(true);

					this.code = [];
					var self = this;
					// 延迟界面清楚
					setTimeout(function () {
							self.clear();
					}, clearTime);
			},

			// 将event的x,y坐标转换为canvas中的相对绘画源点的坐标
			_relativePosition: function (event) {
					// 不仅要考虑canvas元素相对视口的偏移，还要考虑canvas元素本身盒子模型造成的偏移
					// 相对canvas绘画源点x,y = event-x,y - 视口偏移(文档流中的偏移，包含margin) - 盒子模型偏移(padding和border)
					var rect = event.currentTarget.getBoundingClientRect(),
							relativeX = event.touches[0].clientX - rect.left - this.paddingLeft - this.borderLeft,
							relativeY = event.touches[0].clientY - rect.top - this.paddingTop - this.borderTop;

					return {
							x: relativeX,
							y: relativeY
					}
			},

			// 检查点是否已经存在
			_codeExist: function (number) {
					for (var i = 0; i < this.code.length; i++) {
							if (this.code[i] === number) {
									return true;
							}
					}
					return false;
			},

			// 根据给定的坐标判断位于哪个数字圆中
			_inWhichCode: function (posX, posY) {
					for (var i = 0; i < this.points.length; i++) {
							if (Math.pow((posX - this.points[i].x), 2)
									+ Math.pow(posY - this.points[i].y, 2) < Math.pow(this.radius, 2)) {
									return i+1;
							}
					}
					return -1;
			},

			// 监听滑动
			_bindEvent: function () {
					var self = this;

					this.canvas.addEventListener('touchstart', function (event) {
							event.preventDefault();
							var relative = self._relativePosition(event),
									singleCode = self._inWhichCode(relative.x, relative.y);

							if (singleCode !== -1 && !self._codeExist(singleCode)) {
									self.code.push(singleCode);
									self._drawCurrentPoint();
									self.touching = true;
							}
					}, false);

					this.canvas.addEventListener('touchmove', function (event) {
							event.preventDefault();
							if (self.touching) {
									var relative = self._relativePosition(event),
											singleCode = self._inWhichCode(relative.x, relative.y),
											// simple模式用来判断是否中途有绕过的点，例如对于singleCode = 1来说
											// 轨迹的上一个点可能是3 7 9，中途绕过了2 4 5，如果有绕过，轨迹需要包含上 
											crossMap = [[],[3,7,9],[8],[1,7,9],[6],[],[4],[1,3,9],[2],[1,3,7]];

									if (singleCode !== -1 && !self._codeExist(singleCode)) {
											// 例如：从1绕过4滑到7，需要自动把4勾上，push进code数组
											if (self.mode === 'simple') {
													var top = self.code[self.code.length - 1];
													for (var i = 0; i < crossMap[singleCode].length; i++) {
															if (top === crossMap[singleCode][i] && !self._codeExist((top + singleCode)/2)) {
																	self.code.push((top + singleCode)/2);
																	break;
															}
													}
											}
											// complex模式不需要检查轨迹是否有绕过点
											self.code.push(singleCode);                        
									}

									self._movingLine(relative);
							}
					}, false);

					this.canvas.addEventListener('touchend', function (event) {
							event.preventDefault();
							if (self.touching) {
									self.touching = false;
									// 重画路径，去掉最后移动的线条
									self._drawCurrentPoint();
									var data = self.code.toString().replace(/,/g, '');

									self.callback.call(self, data);
									self.code = [];
							}
					}, false);
			}
	}

export default GestureUnlocker