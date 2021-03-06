function sortableFactory() {
  if (typeof window === "undefined" || !window.document) {
    return function sortableError() {
      throw new Error("Sortable.js requires a window with a document")
    }
  }
  var dragEl, parentEl, ghostEl, cloneEl, rootEl, nextEl, lastDownEl, scrollEl, scrollParentEl, scrollCustomFn, oldIndex, newIndex, activeGroup, putSortable, autoScrolls = [],
  scrolling = false,
  awaitingDragStarted = false,
  ignoreNextClick = false,
  sortables = [],
  pointerElemChangedInterval,
  lastPointerElemX,
  lastPointerElemY,
  tapEvt,
  touchEvt,
  moved,
  lastTarget,
  lastDirection,
  pastFirstInvertThresh = false,
  isCircumstantialInvert = false,
  lastMode,
  targetMoveDistance,
  forRepaintDummy,
  realDragElRect,
  R_SPACE = /\s+/g,
  expando = "Sortable" + (new Date).getTime(),
  win = window,
  document = win.document,
  parseInt = win.parseInt,
  setTimeout = win.setTimeout,
  $ = win.jQuery || win.Zepto,
  Polymer = win.Polymer,
  captureMode = {
    capture: false,
    passive: false
  },
  IE11OrLess = !!navigator.userAgent.match(/(?:Trident.*rv[ :]?11\.|msie|iemobile)/i),
  Edge = !!navigator.userAgent.match(/Edge/i),
  CSSFloatProperty = Edge || IE11OrLess ? "cssFloat": "float",
  supportDraggable = ("draggable" in document.createElement("div")),
  supportCssPointerEvents = (function() {
    if (IE11OrLess) {
      return false
    }
    var el = document.createElement("x");
    el.style.cssText = "pointer-events:auto";
    return el.style.pointerEvents === "auto"
  })(),
  _silent = false,
  _alignedSilent = false,
  abs = Math.abs,
  min = Math.min,
  savedInputChecked = [],
  _detectDirection = function(el, options) {
    var elCSS = _css(el),
    elWidth = parseInt(elCSS.width),
    child1 = _getChild(el, 0, options),
    child2 = _getChild(el, 1, options),
    firstChildCSS = child1 && _css(child1),
    secondChildCSS = child2 && _css(child2),
    firstChildWidth = firstChildCSS && parseInt(firstChildCSS.marginLeft) + parseInt(firstChildCSS.marginRight) + _getRect(child1).width,
    secondChildWidth = secondChildCSS && parseInt(secondChildCSS.marginLeft) + parseInt(secondChildCSS.marginRight) + _getRect(child2).width;
    if (elCSS.display === "flex") {
      return elCSS.flexDirection === "column" || elCSS.flexDirection === "column-reverse" ? "vertical": "horizontal"
    }
    return (child1 && (firstChildCSS.display === "block" || firstChildCSS.display === "flex" || firstChildCSS.display === "table" || firstChildCSS.display === "grid" || firstChildWidth >= elWidth && elCSS[CSSFloatProperty] === "none" || child2 && elCSS[CSSFloatProperty] === "none" && firstChildWidth + secondChildWidth > elWidth) ? "vertical": "horizontal")
  },
  _detectNearestEmptySortable = function(x, y) {
    for (var i = 0; i < sortables.length; i++) {
      if (sortables[i].children.length) {
        continue
      }
      var rect = _getRect(sortables[i]),
      threshold = sortables[i][expando].options.emptyInsertThreshold,
      insideHorizontally = x >= (rect.left - threshold) && x <= (rect.right + threshold),
      insideVertically = y >= (rect.top - threshold) && y <= (rect.bottom + threshold);
      if (insideHorizontally && insideVertically) {
        return sortables[i]
      }
    }
  },
  _isClientInRowColumn = function(x, y, el, axis, options) {
    var targetRect = _getRect(el),
    targetS1Opp = axis === "vertical" ? targetRect.left: targetRect.top,
    targetS2Opp = axis === "vertical" ? targetRect.right: targetRect.bottom,
    mouseOnOppAxis = axis === "vertical" ? x: y;
    return targetS1Opp < mouseOnOppAxis && mouseOnOppAxis < targetS2Opp
  },
  _isElInRowColumn = function(el1, el2, axis) {
    var el1Rect = el1 === dragEl && realDragElRect || _getRect(el1),
    el2Rect = el2 === dragEl && realDragElRect || _getRect(el2),
    el1S1Opp = axis === "vertical" ? el1Rect.left: el1Rect.top,
    el1S2Opp = axis === "vertical" ? el1Rect.right: el1Rect.bottom,
    el1OppLength = axis === "vertical" ? el1Rect.width: el1Rect.height,
    el2S1Opp = axis === "vertical" ? el2Rect.left: el2Rect.top,
    el2S2Opp = axis === "vertical" ? el2Rect.right: el2Rect.bottom,
    el2OppLength = axis === "vertical" ? el2Rect.width: el2Rect.height;
    return (el1S1Opp === el2S1Opp || el1S2Opp === el2S2Opp || (el1S1Opp + el1OppLength / 2) === (el2S1Opp + el2OppLength / 2))
  },
  _getParentAutoScrollElement = function(el, includeSelf) {
    if (!el || !el.getBoundingClientRect) {
      return win
    }
    var elem = el;
    var gotSelf = false;
    do {
      if (elem.clientWidth < elem.scrollWidth || elem.clientHeight < elem.scrollHeight) {
        var elemCSS = _css(elem);
        if (elem.clientWidth < elem.scrollWidth && (elemCSS.overflowX == "auto" || elemCSS.overflowX == "scroll") || elem.clientHeight < elem.scrollHeight && (elemCSS.overflowY == "auto" || elemCSS.overflowY == "scroll")) {
          if (!elem || !elem.getBoundingClientRect || elem === document.body) {
            return win
          }
          if (gotSelf || includeSelf) {
            return elem
          }
          gotSelf = true
        }
      }
    } while ( elem = elem . parentNode );
    return win
  },
  _autoScroll = _throttle(function(evt, options, rootEl, isFallback) {
    if (options.scroll) {
      var _this = rootEl ? rootEl[expando] : window,
      sens = options.scrollSensitivity,
      speed = options.scrollSpeed,
      x = evt.clientX,
      y = evt.clientY,
      winWidth = window.innerWidth,
      winHeight = window.innerHeight,
      scrollThisInstance = false;
      if (scrollParentEl !== rootEl) {
        _clearAutoScrolls();
        scrollEl = options.scroll;
        scrollCustomFn = options.scrollFn;
        if (scrollEl === true) {
          scrollEl = _getParentAutoScrollElement(rootEl, true);
          scrollParentEl = scrollEl
        }
      }
      var layersOut = 0;
      var currentParent = scrollEl;
      do {
        var el = currentParent,
        rect = _getRect(el), top = rect.top, bottom = rect.bottom, left = rect.left, right = rect.right, width = rect.width, height = rect.height, scrollWidth, scrollHeight, css, vx, vy, canScrollX, canScrollY, scrollPosX, scrollPosY;
        if (el !== win) {
          scrollWidth = el.scrollWidth;
          scrollHeight = el.scrollHeight;
          css = _css(el);
          canScrollX = width < scrollWidth && (css.overflowX === "auto" || css.overflowX === "scroll");
          canScrollY = height < scrollHeight && (css.overflowY === "auto" || css.overflowY === "scroll");
          scrollPosX = el.scrollLeft;
          scrollPosY = el.scrollTop
        } else {
          scrollWidth = document.documentElement.scrollWidth;
          scrollHeight = document.documentElement.scrollHeight;
          css = _css(document.documentElement);
          canScrollX = width < scrollWidth && (css.overflowX === "auto" || css.overflowX === "scroll" || css.overflowX === "visible");
          canScrollY = height < scrollHeight && (css.overflowY === "auto" || css.overflowY === "scroll" || css.overflowY === "visible");
          scrollPosX = document.documentElement.scrollLeft;
          scrollPosY = document.documentElement.scrollTop
        }
        vx = canScrollX && (abs(right - x) <= sens && (scrollPosX + width) < scrollWidth) - (abs(left - x) <= sens && !!scrollPosX);
        vy = canScrollY && (abs(bottom - y) <= sens && (scrollPosY + height) < scrollHeight) - (abs(top - y) <= sens && !!scrollPosY);
        if (!autoScrolls[layersOut]) {
          for (var i = 0; i <= layersOut; i++) {
            if (!autoScrolls[i]) {
              autoScrolls[i] = {}
            }
          }
        }
        if (autoScrolls[layersOut].vx != vx || autoScrolls[layersOut].vy != vy || autoScrolls[layersOut].el !== el) {
          autoScrolls[layersOut].el = el;
          autoScrolls[layersOut].vx = vx;
          autoScrolls[layersOut].vy = vy;
          clearInterval(autoScrolls[layersOut].pid);
          if (el && (vx != 0 || vy != 0)) {
            scrollThisInstance = true;
            autoScrolls[layersOut].pid = setInterval((function() {
              if (isFallback && this.layer === 0) {
                Sortable.active._emulateDragOver(true)
              }
              var scrollOffsetY = autoScrolls[this.layer].vy ? autoScrolls[this.layer].vy * speed: 0;
              var scrollOffsetX = autoScrolls[this.layer].vx ? autoScrolls[this.layer].vx * speed: 0;
              if ("function" === typeof(scrollCustomFn)) {
                if (scrollCustomFn.call(_this, scrollOffsetX, scrollOffsetY, evt, touchEvt, autoScrolls[this.layer].el) !== "continue") {
                  return
                }
              }
              if (autoScrolls[this.layer].el === win) {
                win.scrollTo(win.pageXOffset + scrollOffsetX, win.pageYOffset + scrollOffsetY)
              } else {
                autoScrolls[this.layer].el.scrollTop += scrollOffsetY;
                autoScrolls[this.layer].el.scrollLeft += scrollOffsetX
              }
            }).bind({
              layer: layersOut
            }), 24)
          }
        }
        layersOut++
      } while ( options . bubbleScroll && currentParent !== win && ( currentParent = _getParentAutoScrollElement ( currentParent , false )));
      scrolling = scrollThisInstance
    }
  },
  30),
  _clearAutoScrolls = function() {
    autoScrolls.forEach(function(autoScroll) {
      clearInterval(autoScroll.pid)
    });
    autoScrolls = []
  },
  _prepareGroup = function(options) {
    function toFn(value, pull) {
      return function(to, from, dragEl, evt) {
        var sameGroup = to.options.group.name && from.options.group.name && to.options.group.name === from.options.group.name;
        if (value == null && (pull || sameGroup)) {
          return true
        } else {
          if (value == null || value === false) {
            return false
          } else {
            if (pull && value === "clone") {
              return value
            } else {
              if (typeof value === "function") {
                return toFn(value(to, from, dragEl, evt), pull)(to, from, dragEl, evt)
              } else {
                var otherGroup = (pull ? to: from).options.group.name;
                return (value === true || (typeof value === "string" && value === otherGroup) || (value.join && value.indexOf(otherGroup) > -1))
              }
            }
          }
        }
      }
    }
    var group = {};
    var originalGroup = options.group;
    if (!originalGroup || typeof originalGroup != "object") {
      originalGroup = {
        name: originalGroup
      }
    }
    group.name = originalGroup.name;
    group.checkPull = toFn(originalGroup.pull, true);
    group.checkPut = toFn(originalGroup.put);
    group.revertClone = originalGroup.revertClone;
    options.group = group
  },
  _checkAlignment = function(evt) {
    if (!dragEl || !dragEl.parentNode) {
      return
    }
    dragEl.parentNode[expando] && dragEl.parentNode[expando]._computeIsAligned(evt)
  },
  _isTrueParentSortable = function(el, target) {
    var trueParent = target;
    while (!trueParent[expando]) {
      trueParent = trueParent.parentNode
    }
    return el === trueParent
  },
  _artificalBubble = function(sortable, originalEvt, method) {
    var nextParent = sortable.parentNode;
    while (nextParent && !nextParent[expando]) {
      nextParent = nextParent.parentNode
    }
    if (nextParent) {
      nextParent[expando][method](_extend(originalEvt, {
        artificialBubble: true
      }))
    }
  },
  _hideGhostForTarget = function() {
    if (!supportCssPointerEvents && ghostEl) {
      _css(ghostEl, "display", "none")
    }
  },
  _unhideGhostForTarget = function() {
    if (!supportCssPointerEvents && ghostEl) {
      _css(ghostEl, "display", "")
    }
  };
  document.addEventListener("click",
  function(evt) {
    if (ignoreNextClick) {
      evt.preventDefault();
      evt.stopPropagation && evt.stopPropagation();
      evt.stopImmediatePropagation && evt.stopImmediatePropagation();
      ignoreNextClick = false;
      return false
    }
  },
  true);
  var nearestEmptyInsertDetectEvent = function(evt) {
    if (dragEl) {
      var nearest = _detectNearestEmptySortable(evt.clientX, evt.clientY);
      if (nearest) {
        nearest[expando]._onDragOver({
          clientX: evt.clientX,
          clientY: evt.clientY,
          target: nearest,
          rootEl: nearest
        })
      }
    }
  };
  document.addEventListener("dragover", nearestEmptyInsertDetectEvent);
  document.addEventListener("mousemove", nearestEmptyInsertDetectEvent);
  function Sortable(el, options) {
    if (! (el && el.nodeType && el.nodeType === 1)) {
      throw "Sortable: `el` must be HTMLElement, not " + {}.toString.call(el)
    }
    this.el = el;
    this.options = options = _extend({},
    options);
    el[expando] = this;
    var defaults = {
      group: null,
      sort: true,
      disabled: false,
      store: null,
      handle: null,
      scroll: true,
      scrollSensitivity: 30,
      scrollSpeed: 10,
      bubbleScroll: true,
      draggable: /[uo]l/i.test(el.nodeName) ? "li": ">*",
      swapThreshold: 1,
      invertSwap: false,
      invertedSwapThreshold: null,
      removeCloneOnHide: true,
      direction: function() {
        return _detectDirection(el, this.options)
      },
      ghostClass: "sortable-ghost",
      chosenClass: "sortable-chosen",
      dragClass: "sortable-drag",
      ignore: "a, img",
      filter: null,
      preventOnFilter: true,
      animation: 0,
      easing: null,
      setData: function(dataTransfer, dragEl) {
        dataTransfer.setData("Text", dragEl.textContent)
      },
      dropBubble: false,
      dragoverBubble: false,
      dataIdAttr: "data-id",
      delay: 0,
      touchStartThreshold: parseInt(window.devicePixelRatio, 10) || 1,
      forceFallback: false,
      fallbackClass: "sortable-fallback",
      fallbackOnBody: false,
      fallbackTolerance: 0,
      fallbackOffset: {
        x: 0,
        y: 0
      },
      supportPointer: Sortable.supportPointer !== false && (("PointerEvent" in window) || window.navigator && ("msPointerEnabled" in window.navigator)),
      emptyInsertThreshold: 5
    };
    for (var name in defaults) { ! (name in options) && (options[name] = defaults[name])
    }
    _prepareGroup(options);
    for (var fn in this) {
      if (fn.charAt(0) === "_" && typeof this[fn] === "function") {
        this[fn] = this[fn].bind(this)
      }
    }
    this.nativeDraggable = options.forceFallback ? false: supportDraggable;
    if (options.supportPointer) {
      _on(el, "pointerdown", this._onTapStart)
    } else {
      _on(el, "mousedown", this._onTapStart);
      _on(el, "touchstart", this._onTapStart)
    }
    if (this.nativeDraggable) {
      _on(el, "dragover", this);
      _on(el, "dragenter", this)
    }
    sortables.push(this.el);
    options.store && options.store.get && this.sort(options.store.get(this) || [])
  }
  Sortable.prototype = {
    constructor: Sortable,
    _computeIsAligned: function(evt) {
      var target;
      if (ghostEl && !supportCssPointerEvents) {
        _hideGhostForTarget();
        target = document.elementFromPoint(evt.clientX, evt.clientY);
        _unhideGhostForTarget()
      } else {
        target = evt.target
      }
      target = _closest(target, this.options.draggable, this.el, false);
      if (_alignedSilent) {
        return
      }
      if (!dragEl || dragEl.parentNode !== this.el) {
        return
      }
      var children = this.el.children;
      for (var i = 0; i < children.length; i++) {
        if (_closest(children[i], this.options.draggable, this.el, false) && children[i] !== target) {
          children[i].sortableMouseAligned = _isClientInRowColumn(evt.clientX, evt.clientY, children[i], this._getDirection(evt, null), this.options)
        }
      }
      if (!_closest(target, this.options.draggable, this.el, true)) {
        lastTarget = null
      }
      _alignedSilent = true;
      setTimeout(function() {
        _alignedSilent = false
      },
      30)
    },
    _getDirection: function(evt, target) {
      return (typeof this.options.direction === "function") ? this.options.direction.call(this, evt, target, dragEl) : this.options.direction
    },
    _onTapStart: function(evt) {
      if (!evt.cancelable) {
        return
      }
      var _this = this,
      el = this.el,
      options = this.options,
      preventOnFilter = options.preventOnFilter,
      type = evt.type,
      touch = evt.touches && evt.touches[0],
      target = (touch || evt).target,
      originalTarget = evt.target.shadowRoot && ((evt.path && evt.path[0]) || (evt.composedPath && evt.composedPath()[0])) || target,
      filter = options.filter,
      startIndex;
      _saveInputCheckedState(el);
      if (IE11OrLess && !evt.artificialBubble && !_isTrueParentSortable(el, target)) {
        return
      }
      if (dragEl) {
        return
      }
      if (/mousedown|pointerdown/.test(type) && evt.button !== 0 || options.disabled) {
        return
      }
      if (originalTarget.isContentEditable) {
        return
      }
      target = _closest(target, options.draggable, el, false);
      if (!target) {
        if (IE11OrLess) {
          _artificalBubble(el, evt, "_onTapStart")
        }
        return
      }
      if (lastDownEl === target) {
        return
      }
      startIndex = _index(target, options.draggable);
      if (typeof filter === "function") {
        if (filter.call(this, evt, target, this)) {
          _dispatchEvent(_this, originalTarget, "filter", target, el, el, startIndex);
          preventOnFilter && evt.cancelable && evt.preventDefault();
          return
        }
      } else {
        if (filter) {
          filter = filter.split(",").some(function(criteria) {
            criteria = _closest(originalTarget, criteria.trim(), el, false);
            if (criteria) {
              _dispatchEvent(_this, criteria, "filter", target, el, el, startIndex);
              return true
            }
          });
          if (filter) {
            preventOnFilter && evt.cancelable && evt.preventDefault();
            return
          }
        }
      }
      if (options.handle && !_closest(originalTarget, options.handle, el, false)) {
        return
      }
      this._prepareDragStart(evt, touch, target, startIndex)
    },
    _handleAutoScroll: function(evt, fallback) {
      if (!dragEl || !this.options.scroll) {
        return
      }
      var x = evt.clientX,
      y = evt.clientY,
      elem = document.elementFromPoint(x, y),
      _this = this;
      if (fallback || Edge || IE11OrLess) {
        _autoScroll(evt, _this.options, elem, fallback);
        var ogElemScroller = _getParentAutoScrollElement(elem, true);
        if (scrolling && (!pointerElemChangedInterval || x !== lastPointerElemX || y !== lastPointerElemY)) {
          pointerElemChangedInterval && clearInterval(pointerElemChangedInterval);
          pointerElemChangedInterval = setInterval(function() {
            if (!dragEl) {
              return
            }
            var newElem = _getParentAutoScrollElement(document.elementFromPoint(x, y), true);
            if (newElem !== ogElemScroller) {
              ogElemScroller = newElem;
              _clearAutoScrolls();
              _autoScroll(evt, _this.options, ogElemScroller, fallback)
            }
          },
          10);
          lastPointerElemX = x;
          lastPointerElemY = y
        }
      } else {
        if (!_this.options.bubbleScroll || _getParentAutoScrollElement(elem, true) === window) {
          _clearAutoScrolls();
          return
        }
        _autoScroll(evt, _this.options, _getParentAutoScrollElement(elem, false), false)
      }
    },
    _prepareDragStart: function(evt, touch, target, startIndex) {
      var _this = this,
      el = _this.el,
      options = _this.options,
      ownerDocument = el.ownerDocument,
      dragStartFn;
      if (target && !dragEl && (target.parentNode === el)) {
        rootEl = el;
        dragEl = target;
        parentEl = dragEl.parentNode;
        nextEl = dragEl.nextSibling;
        lastDownEl = target;
        activeGroup = options.group;
        oldIndex = startIndex;
        tapEvt = {
          target: dragEl,
          clientX: (touch || evt).clientX,
          clientY: (touch || evt).clientY
        };
        this._lastX = (touch || evt).clientX;
        this._lastY = (touch || evt).clientY;
        dragEl.style["will-change"] = "all";
        dragEl.style.transition = "";
        dragEl.style.transform = "";
        dragStartFn = function() {
          _this._disableDelayedDrag();
          dragEl.draggable = _this.nativeDraggable;
          _this._triggerDragStart(evt, touch);
          _dispatchEvent(_this, rootEl, "choose", dragEl, rootEl, rootEl, oldIndex);
          _toggleClass(dragEl, options.chosenClass, true)
        };
        options.ignore.split(",").forEach(function(criteria) {
          _find(dragEl, criteria.trim(), _disableDraggable)
        });
        if (options.supportPointer) {
          _on(ownerDocument, "pointerup", _this._onDrop);
          _on(ownerDocument, "pointercancel", _this._onDrop)
        } else {
          _on(ownerDocument, "mouseup", _this._onDrop);
          _on(ownerDocument, "touchend", _this._onDrop);
          _on(ownerDocument, "touchcancel", _this._onDrop)
        }
        if (options.delay) {
          _on(ownerDocument, "mouseup", _this._disableDelayedDrag);
          _on(ownerDocument, "touchend", _this._disableDelayedDrag);
          _on(ownerDocument, "touchcancel", _this._disableDelayedDrag);
          _on(ownerDocument, "mousemove", _this._delayedDragTouchMoveHandler);
          _on(ownerDocument, "touchmove", _this._delayedDragTouchMoveHandler);
          options.supportPointer && _on(ownerDocument, "pointermove", _this._delayedDragTouchMoveHandler);
          _this._dragStartTimer = setTimeout(dragStartFn, options.delay)
        } else {
          dragStartFn()
        }
      }
    },
    _delayedDragTouchMoveHandler: function(e) {
      var touch = e.touches ? e.touches[0] : e;
      if (min(abs(touch.clientX - this._lastX), abs(touch.clientY - this._lastY)) >= this.options.touchStartThreshold) {
        this._disableDelayedDrag()
      }
    },
    _disableDelayedDrag: function() {
      var ownerDocument = this.el.ownerDocument;
      clearTimeout(this._dragStartTimer);
      _off(ownerDocument, "mouseup", this._disableDelayedDrag);
      _off(ownerDocument, "touchend", this._disableDelayedDrag);
      _off(ownerDocument, "touchcancel", this._disableDelayedDrag);
      _off(ownerDocument, "mousemove", this._delayedDragTouchMoveHandler);
      _off(ownerDocument, "touchmove", this._delayedDragTouchMoveHandler);
      _off(ownerDocument, "pointermove", this._delayedDragTouchMoveHandler)
    },
    _triggerDragStart: function(evt, touch) {
      touch = touch || (evt.pointerType == "touch" ? evt: null);
      if (!this.nativeDraggable || touch) {
        if (this.options.supportPointer) {
          _on(document, "pointermove", this._onTouchMove)
        } else {
          if (touch) {
            _on(document, "touchmove", this._onTouchMove)
          } else {
            _on(document, "mousemove", this._onTouchMove)
          }
        }
      } else {
        _on(dragEl, "dragend", this);
        _on(rootEl, "dragstart", this._onDragStart)
      }
      try {
        if (document.selection) {
          _nextTick(function() {
            document.selection.empty()
          })
        } else {
          window.getSelection().removeAllRanges()
        }
      } catch(err) {}
    },
    _dragStarted: function(fallback) {
      awaitingDragStarted = false;
      if (rootEl && dragEl) {
        if (this.nativeDraggable) {
          _on(document, "dragover", this._handleAutoScroll);
          _on(document, "dragover", _checkAlignment)
        }
        var options = this.options; ! fallback && _toggleClass(dragEl, options.dragClass, false);
        _toggleClass(dragEl, options.ghostClass, true);
        _css(dragEl, "transform", "");
        Sortable.active = this;
        fallback && this._appendGhost();
        _dispatchEvent(this, rootEl, "start", dragEl, rootEl, rootEl, oldIndex)
      } else {
        this._nulling()
      }
    },
    _emulateDragOver: function(bypassLastTouchCheck) {
      if (touchEvt) {
        if (this._lastX === touchEvt.clientX && this._lastY === touchEvt.clientY && !bypassLastTouchCheck) {
          return
        }
        this._lastX = touchEvt.clientX;
        this._lastY = touchEvt.clientY;
        _hideGhostForTarget();
        var target = document.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
        var parent = target;
        while (target && target.shadowRoot) {
          target = target.shadowRoot.elementFromPoint(touchEvt.clientX, touchEvt.clientY);
          parent = target
        }
        if (parent) {
          do {
            if (parent[expando]) {
              var inserted;
              inserted = parent[expando]._onDragOver({
                clientX: touchEvt.clientX,
                clientY: touchEvt.clientY,
                target: target,
                rootEl: parent
              });
              if (inserted && !this.options.dragoverBubble) {
                break
              }
            }
            target = parent
          } while ( parent = parent . parentNode )
        }
        dragEl.parentNode[expando]._computeIsAligned(touchEvt);
        _unhideGhostForTarget()
      }
    },
    _onTouchMove: function(evt) {
      if (tapEvt) {
        if (!evt.cancelable) {
          return
        }
        var options = this.options,
        fallbackTolerance = options.fallbackTolerance,
        fallbackOffset = options.fallbackOffset,
        touch = evt.touches ? evt.touches[0] : evt,
        matrix = ghostEl && _matrix(ghostEl),
        scaleX = ghostEl && matrix && matrix.a,
        scaleY = ghostEl && matrix && matrix.d,
        dx = ((touch.clientX - tapEvt.clientX) + fallbackOffset.x) / (scaleX ? scaleX: 1),
        dy = ((touch.clientY - tapEvt.clientY) + fallbackOffset.y) / (scaleY ? scaleY: 1),
        translate3d = evt.touches ? "translate3d(" + dx + "px," + dy + "px,0)": "translate(" + dx + "px," + dy + "px)";
        if (!Sortable.active && !awaitingDragStarted) {
          if (fallbackTolerance && min(abs(touch.clientX - this._lastX), abs(touch.clientY - this._lastY)) < fallbackTolerance) {
            return
          }
          this._onDragStart(evt, true)
        }
        this._handleAutoScroll(touch, true);
        moved = true;
        touchEvt = touch;
        _css(ghostEl, "webkitTransform", translate3d);
        _css(ghostEl, "mozTransform", translate3d);
        _css(ghostEl, "msTransform", translate3d);
        _css(ghostEl, "transform", translate3d);
        evt.cancelable && evt.preventDefault()
      }
    },
    _appendGhost: function() {
      if (!ghostEl) {
        var rect = _getRect(dragEl, this.options.fallbackOnBody ? document.body: rootEl, true),
        css = _css(dragEl),
        options = this.options;
        ghostEl = dragEl.cloneNode(true);
        _toggleClass(ghostEl, options.ghostClass, false);
        _toggleClass(ghostEl, options.fallbackClass, true);
        _toggleClass(ghostEl, options.dragClass, true);
        _css(ghostEl, "box-sizing", "border-box");
        _css(ghostEl, "margin", 0);
        _css(ghostEl, "top", rect.top);
        _css(ghostEl, "left", rect.left);
        _css(ghostEl, "width", rect.width);
        _css(ghostEl, "height", rect.height);
        _css(ghostEl, "opacity", "0.8");
        _css(ghostEl, "position", "fixed");
        _css(ghostEl, "zIndex", "100000");
        _css(ghostEl, "pointerEvents", "none");
        options.fallbackOnBody && document.body.appendChild(ghostEl) || rootEl.appendChild(ghostEl)
      }
    },
    _onDragStart: function(evt, fallback) {
      var _this = this;
      var dataTransfer = evt.dataTransfer;
      var options = _this.options;
      cloneEl = _clone(dragEl);
      cloneEl.draggable = false;
      cloneEl.style["will-change"] = "";
      this._hideClone();
      _toggleClass(cloneEl, _this.options.chosenClass, false);
      _this._cloneId = _nextTick(function() {
        if (!_this.options.removeCloneOnHide) {
          rootEl.insertBefore(cloneEl, dragEl)
        }
        _dispatchEvent(_this, rootEl, "clone", dragEl)
      }); ! fallback && _toggleClass(dragEl, options.dragClass, true);
      if (fallback) {
        ignoreNextClick = true;
        _this._loopId = setInterval(_this._emulateDragOver, 50)
      } else {
        _off(document, "mouseup", _this._onDrop);
        _off(document, "touchend", _this._onDrop);
        _off(document, "touchcancel", _this._onDrop);
        _off(document, "pointercancel", _this._onDrop);
        if (dataTransfer) {
          dataTransfer.effectAllowed = "move";
          options.setData && options.setData.call(_this, dataTransfer, dragEl)
        }
        _on(document, "drop", _this);
        _css(dragEl, "transform", "translateZ(0)")
      }
      awaitingDragStarted = true;
      _this._dragStartId = _nextTick(_this._dragStarted.bind(_this, fallback));
      _on(document, "selectstart", _this)
    },
    _onDragOver: function(evt) {
      var el = this.el,
      target = evt.target,
      dragRect, targetRect, revert, options = this.options,
      group = options.group,
      activeSortable = Sortable.active,
      isOwner = (activeGroup === group),
      canSort = options.sort,
      _this = this;
      if (_silent) {
        return
      }
      if (IE11OrLess && !evt.rootEl && !evt.artificialBubble && !_isTrueParentSortable(el, target)) {
        return
      }
      function completed() {
        if (activeSortable) {
          _toggleClass(dragEl, putSortable ? putSortable.options.ghostClass: activeSortable.options.ghostClass, false);
          _toggleClass(dragEl, options.ghostClass, true)
        }
        if (putSortable !== _this && _this !== Sortable.active) {
          putSortable = _this
        } else {
          if (_this === Sortable.active) {
            putSortable = null
          }
        }
        if ((target === dragEl && !dragEl.animated) || (target === el && !target.animated)) {
          lastTarget = null
        }
        if (!options.dragoverBubble && !evt.rootEl && target !== document) {
          _this._handleAutoScroll(evt);
          dragEl.parentNode[expando]._computeIsAligned(evt)
        } ! options.dragoverBubble && evt.stopPropagation && evt.stopPropagation();
        return true
      }
      function changed() {
        _dispatchEvent(_this, rootEl, "change", target, el, rootEl, oldIndex, _index(dragEl, options.draggable), evt)
      }
      if (evt.preventDefault !== void 0) {
        evt.cancelable && evt.preventDefault()
      }
      moved = true;
      target = _closest(target, options.draggable, el, true);
      if ( !! _closest(evt.target, null, dragEl, true) || target.animated) {
        return completed()
      }
      if (target !== dragEl) {
        ignoreNextClick = false
      }
      if (activeSortable && !options.disabled && (isOwner ? canSort || (revert = !rootEl.contains(dragEl)) : (putSortable === this || ((this.lastPutMode = activeGroup.checkPull(this, activeSortable, dragEl, evt)) && group.checkPut(this, activeSortable, dragEl, evt))))) {
        var axis = this._getDirection(evt, target);
        dragRect = _getRect(dragEl);
        if (revert) {
          this._hideClone();
          parentEl = rootEl;
          if (nextEl) {
            rootEl.insertBefore(dragEl, nextEl)
          } else {
            rootEl.appendChild(dragEl)
          }
          return completed()
        }
        if ((el.children.length === 0) || (el.children[0] === ghostEl) || _ghostIsLast(evt, axis, el) && !dragEl.animated) {
          if (el.children.length !== 0 && el.children[0] !== ghostEl && el === evt.target) {
            target = _lastChild(el)
          }
          if (target) {
            targetRect = _getRect(target)
          }
          if (isOwner) {
            activeSortable._hideClone()
          } else {
            activeSortable._showClone(this)
          }
          if (_onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, !!target) !== false) {
            el.appendChild(dragEl);
            parentEl = el;
            realDragElRect = null;
            changed();
            this._animate(dragRect, dragEl);
            target && this._animate(targetRect, target);
            return completed()
          }
        } else {
          if (target && target !== dragEl && (target.parentNode[expando] !== void 0) && target !== el) {
            var direction = 0,
            targetBeforeFirstSwap, aligned = target.sortableMouseAligned,
            differentLevel = dragEl.parentNode !== el,
            scrolledPastTop = _isScrolledPast(target, axis === "vertical" ? "top": "left");
            if (lastTarget !== target) {
              lastMode = null;
              targetBeforeFirstSwap = _getRect(target)[axis === "vertical" ? "top": "left"];
              pastFirstInvertThresh = false
            }
            if (_isElInRowColumn(dragEl, target, axis) && aligned || differentLevel || scrolledPastTop || options.invertSwap || lastMode === "insert" || lastMode === "swap") {
              if (lastMode !== "swap") {
                isCircumstantialInvert = options.invertSwap || differentLevel || scrolling || scrolledPastTop
              }
              direction = _getSwapDirection(evt, target, axis, options.swapThreshold, options.invertedSwapThreshold == null ? options.swapThreshold: options.invertedSwapThreshold, isCircumstantialInvert, lastTarget === target);
              lastMode = "swap"
            } else {
              direction = _getInsertDirection(target, options);
              lastMode = "insert"
            }
            if (direction === 0) {
              return completed()
            }
            realDragElRect = null;
            lastTarget = target;
            lastDirection = direction;
            targetRect = _getRect(target);
            var nextSibling = target.nextElementSibling,
            after = false;
            after = direction === 1;
            var moveVector = _onMove(rootEl, el, dragEl, dragRect, target, targetRect, evt, after);
            if (moveVector !== false) {
              if (moveVector === 1 || moveVector === -1) {
                after = (moveVector === 1)
              }
              _silent = true;
              setTimeout(_unsilent, 30);
              if (isOwner) {
                activeSortable._hideClone()
              } else {
                activeSortable._showClone(this)
              }
              if (after && !nextSibling) {
                el.appendChild(dragEl)
              } else {
                target.parentNode.insertBefore(dragEl, after ? nextSibling: target)
              }
              parentEl = dragEl.parentNode;
              if (targetBeforeFirstSwap !== undefined && !isCircumstantialInvert) {
                targetMoveDistance = abs(targetBeforeFirstSwap - _getRect(target)[axis === "vertical" ? "top": "left"])
              }
              changed(); ! differentLevel && this._animate(targetRect, target);
              this._animate(dragRect, dragEl);
              return completed()
            }
          }
        }
        if (el.contains(dragEl)) {
          return completed()
        }
      }
      if (IE11OrLess && !evt.rootEl) {
        _artificalBubble(el, evt, "_onDragOver")
      }
      return false
    },
    _animate: function(prevRect, target) {
      var ms = this.options.animation;
      if (ms) {
        var currentRect = _getRect(target);
        if (target === dragEl) {
          realDragElRect = currentRect
        }
        if (prevRect.nodeType === 1) {
          prevRect = _getRect(prevRect)
        }
        if ((prevRect.left + prevRect.width / 2) !== (currentRect.left + currentRect.width / 2) || (prevRect.top + prevRect.height / 2) !== (currentRect.top + currentRect.height / 2)) {
          var matrix = _matrix(this.el),
          scaleX = matrix && matrix.a,
          scaleY = matrix && matrix.d;
          _css(target, "transition", "none");
          _css(target, "transform", "translate3d(" + (prevRect.left - currentRect.left) / (scaleX ? scaleX: 1) + "px," + (prevRect.top - currentRect.top) / (scaleY ? scaleY: 1) + "px,0)");
          forRepaintDummy = target.offsetWidth;
          _css(target, "transition", "transform " + ms + "ms" + (this.options.easing ? " " + this.options.easing: ""));
          _css(target, "transform", "translate3d(0,0,0)")
        } (typeof target.animated === "number") && clearTimeout(target.animated);
        target.animated = setTimeout(function() {
          _css(target, "transition", "");
          _css(target, "transform", "");
          target.animated = false
        },
        ms)
      }
    },
    _offUpEvents: function() {
      var ownerDocument = this.el.ownerDocument;
      _off(document, "touchmove", this._onTouchMove);
      _off(document, "pointermove", this._onTouchMove);
      _off(ownerDocument, "mouseup", this._onDrop);
      _off(ownerDocument, "touchend", this._onDrop);
      _off(ownerDocument, "pointerup", this._onDrop);
      _off(ownerDocument, "touchcancel", this._onDrop);
      _off(ownerDocument, "pointercancel", this._onDrop);
      _off(document, "selectstart", this)
    },
    _onDrop: function(evt) {
      var el = this.el,
      options = this.options;
      awaitingDragStarted = false;
      scrolling = false;
      isCircumstantialInvert = false;
      pastFirstInvertThresh = false;
      clearInterval(this._loopId);
      clearInterval(pointerElemChangedInterval);
      _clearAutoScrolls();
      _cancelThrottle();
      clearTimeout(this._dragStartTimer);
      _cancelNextTick(this._cloneId);
      _cancelNextTick(this._dragStartId);
      _off(document, "mousemove", this._onTouchMove);
      if (this.nativeDraggable) {
        _off(document, "drop", this);
        _off(el, "dragstart", this._onDragStart);
        _off(document, "dragover", this._handleAutoScroll);
        _off(document, "dragover", _checkAlignment)
      }
      this._offUpEvents();
      if (evt) {
        if (moved) {
          evt.cancelable && evt.preventDefault(); ! options.dropBubble && evt.stopPropagation()
        }
        ghostEl && ghostEl.parentNode && ghostEl.parentNode.removeChild(ghostEl);
        if (rootEl === parentEl || (putSortable && putSortable.lastPutMode !== "clone")) {
          cloneEl && cloneEl.parentNode && cloneEl.parentNode.removeChild(cloneEl)
        }
        if (dragEl) {
          if (this.nativeDraggable) {
            _off(dragEl, "dragend", this)
          }
          _disableDraggable(dragEl);
          dragEl.style["will-change"] = "";
          _toggleClass(dragEl, putSortable ? putSortable.options.ghostClass: this.options.ghostClass, false);
          _toggleClass(dragEl, this.options.chosenClass, false);
          _dispatchEvent(this, rootEl, "unchoose", dragEl, parentEl, rootEl, oldIndex, null, evt);
          if (rootEl !== parentEl) {
            newIndex = _index(dragEl, options.draggable);
            if (newIndex >= 0) {
              _dispatchEvent(null, parentEl, "add", dragEl, parentEl, rootEl, oldIndex, newIndex, evt);
              _dispatchEvent(this, rootEl, "remove", dragEl, parentEl, rootEl, oldIndex, newIndex, evt);
              _dispatchEvent(null, parentEl, "sort", dragEl, parentEl, rootEl, oldIndex, newIndex, evt);
              _dispatchEvent(this, rootEl, "sort", dragEl, parentEl, rootEl, oldIndex, newIndex, evt)
            }
            putSortable && putSortable.save()
          } else {
            if (dragEl.nextSibling !== nextEl) {
              newIndex = _index(dragEl, options.draggable);
              if (newIndex >= 0) {
                _dispatchEvent(this, rootEl, "update", dragEl, parentEl, rootEl, oldIndex, newIndex, evt);
                _dispatchEvent(this, rootEl, "sort", dragEl, parentEl, rootEl, oldIndex, newIndex, evt)
              }
            }
          }
          if (Sortable.active) {
            if (newIndex == null || newIndex === -1) {
              newIndex = oldIndex
            }
            _dispatchEvent(this, rootEl, "end", dragEl, parentEl, rootEl, oldIndex, newIndex, evt);
            this.save()
          }
        }
      }
      this._nulling()
    },
    _nulling: function() {
      rootEl = dragEl = parentEl = ghostEl = nextEl = cloneEl = lastDownEl = scrollEl = scrollParentEl = autoScrolls.length = pointerElemChangedInterval = lastPointerElemX = lastPointerElemY = tapEvt = touchEvt = moved = newIndex = oldIndex = lastTarget = lastDirection = forRepaintDummy = realDragElRect = putSortable = activeGroup = Sortable.active = null;
      savedInputChecked.forEach(function(el) {
        el.checked = true
      });
      savedInputChecked.length = 0
    },
    handleEvent: function(evt) {
      switch (evt.type) {
      case "drop":
      case "dragend":
        this._onDrop(evt);
        break;
      case "dragenter":
      case "dragover":
        if (dragEl) {
          this._onDragOver(evt);
          _globalDragOver(evt)
        }
        break;
      case "selectstart":
        evt.preventDefault();
        break
      }
    },
    toArray: function() {
      var order = [],
      el,
      children = this.el.children,
      i = 0,
      n = children.length,
      options = this.options;
      for (; i < n; i++) {
        el = children[i];
        if (_closest(el, options.draggable, this.el, false)) {
          order.push(el.getAttribute(options.dataIdAttr) || _generateId(el))
        }
      }
      return order
    },
    sort: function(order) {
      var items = {},
      rootEl = this.el;
      this.toArray().forEach(function(id, i) {
        var el = rootEl.children[i];
        if (_closest(el, this.options.draggable, rootEl, false)) {
          items[id] = el
        }
      },
      this);
      order.forEach(function(id) {
        if (items[id]) {
          rootEl.removeChild(items[id]);
          rootEl.appendChild(items[id])
        }
      })
    },
    save: function() {
      var store = this.options.store;
      store && store.set && store.set(this)
    },
    closest: function(el, selector) {
      return _closest(el, selector || this.options.draggable, this.el, false)
    },
    option: function(name, value) {
      var options = this.options;
      if (value === void 0) {
        return options[name]
      } else {
        options[name] = value;
        if (name === "group") {
          _prepareGroup(options)
        }
      }
    },
    destroy: function() {
      var el = this.el;
      el[expando] = null;
      _off(el, "mousedown", this._onTapStart);
      _off(el, "touchstart", this._onTapStart);
      _off(el, "pointerdown", this._onTapStart);
      if (this.nativeDraggable) {
        _off(el, "dragover", this);
        _off(el, "dragenter", this)
      }
      Array.prototype.forEach.call(el.querySelectorAll("[draggable]"),
      function(el) {
        el.removeAttribute("draggable")
      });
      this._onDrop();
      sortables.splice(sortables.indexOf(this.el), 1);
      this.el = el = null
    },
    _hideClone: function() {
      if (!cloneEl.cloneHidden) {
        _css(cloneEl, "display", "none");
        cloneEl.cloneHidden = true;
        if (cloneEl.parentNode && this.options.removeCloneOnHide) {
          cloneEl.parentNode.removeChild(cloneEl)
        }
      }
    },
    _showClone: function(putSortable) {
      if (putSortable.lastPutMode !== "clone") {
        this._hideClone();
        return
      }
      if (cloneEl.cloneHidden) {
        if (rootEl.contains(dragEl) && !this.options.group.revertClone) {
          rootEl.insertBefore(cloneEl, dragEl)
        } else {
          if (nextEl) {
            rootEl.insertBefore(cloneEl, nextEl)
          } else {
            rootEl.appendChild(cloneEl)
          }
        }
        if (this.options.group.revertClone) {
          this._animate(dragEl, cloneEl)
        }
        _css(cloneEl, "display", "");
        cloneEl.cloneHidden = false
      }
    }
  };
  function _closest(el, selector, ctx, includeCTX) {
    if (el) {
      ctx = ctx || document;
      do {
        if ((selector === ">*" && el.parentNode === ctx) || _matches(el, selector) || (includeCTX && el === ctx)) {
          return el
        }
        if (el === ctx) {
          break
        }
      } while ( el = _getParentOrHost ( el ))
    }
    return null
  }
  function _getParentOrHost(el) {
    return (el.host && el !== document && el.host.nodeType) ? el.host: el.parentNode
  }
  function _globalDragOver(evt) {
    if (evt.dataTransfer) {
      evt.dataTransfer.dropEffect = "move"
    }
    evt.cancelable && evt.preventDefault()
  }
  function _on(el, event, fn) {
    el.addEventListener(event, fn, captureMode)
  }
  function _off(el, event, fn) {
    el.removeEventListener(event, fn, captureMode)
  }
  function _toggleClass(el, name, state) {
    if (el && name) {
      if (el.classList) {
        el.classList[state ? "add": "remove"](name)
      } else {
        var className = (" " + el.className + " ").replace(R_SPACE, " ").replace(" " + name + " ", " ");
        el.className = (className + (state ? " " + name: "")).replace(R_SPACE, " ")
      }
    }
  }
  function _css(el, prop, val) {
    var style = el && el.style;
    if (style) {
      if (val === void 0) {
        if (document.defaultView && document.defaultView.getComputedStyle) {
          val = document.defaultView.getComputedStyle(el, "")
        } else {
          if (el.currentStyle) {
            val = el.currentStyle
          }
        }
        return prop === void 0 ? val: val[prop]
      } else {
        if (! (prop in style) && prop.indexOf("webkit") === -1) {
          prop = "-webkit-" + prop
        }
        style[prop] = val + (typeof val === "string" ? "": "px")
      }
    }
  }
  function _matrix(el) {
    var appliedTransforms = "";
    do {
      var transform = _css(el, "transform");
      if (transform && transform !== "none") {
        appliedTransforms = transform + " " + appliedTransforms
      }
    } while ( el = el . parentNode );
    if (window.DOMMatrix) {
      return new DOMMatrix(appliedTransforms)
    } else {
      if (window.WebKitCSSMatrix) {
        return new WebKitCSSMatrix(appliedTransforms)
      } else {
        if (window.CSSMatrix) {
          return new CSSMatrix(appliedTransforms)
        }
      }
    }
  }
  function _find(ctx, tagName, iterator) {
    if (ctx) {
      var list = ctx.getElementsByTagName(tagName),
      i = 0,
      n = list.length;
      if (iterator) {
        for (; i < n; i++) {
          iterator(list[i], i)
        }
      }
      return list
    }
    return []
  }
  function _dispatchEvent(sortable, rootEl, name, targetEl, toEl, fromEl, startIndex, newIndex, originalEvt) {
    sortable = (sortable || rootEl[expando]);
    var evt, options = sortable.options,
    onName = "on" + name.charAt(0).toUpperCase() + name.substr(1);
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent(name, {
        bubbles: true,
        cancelable: true
      })
    } else {
      evt = document.createEvent("Event");
      evt.initEvent(name, true, true)
    }
    evt.to = toEl || rootEl;
    evt.from = fromEl || rootEl;
    evt.item = targetEl || rootEl;
    evt.clone = cloneEl;
    evt.oldIndex = startIndex;
    evt.newIndex = newIndex;
    evt.originalEvent = originalEvt;
    if (rootEl) {
      rootEl.dispatchEvent(evt)
    }
    if (options[onName]) {
      options[onName].call(sortable, evt)
    }
  }
  function _onMove(fromEl, toEl, dragEl, dragRect, targetEl, targetRect, originalEvt, willInsertAfter) {
    var evt, sortable = fromEl[expando],
    onMoveFn = sortable.options.onMove,
    retVal;
    if (window.CustomEvent && !IE11OrLess && !Edge) {
      evt = new CustomEvent("move", {
        bubbles: true,
        cancelable: true
      })
    } else {
      evt = document.createEvent("Event");
      evt.initEvent("move", true, true)
    }
    evt.to = toEl;
    evt.from = fromEl;
    evt.dragged = dragEl;
    evt.draggedRect = dragRect;
    evt.related = targetEl || toEl;
    evt.relatedRect = targetRect || _getRect(toEl);
    evt.willInsertAfter = willInsertAfter;
    evt.originalEvent = originalEvt;
    fromEl.dispatchEvent(evt);
    if (onMoveFn) {
      retVal = onMoveFn.call(sortable, evt, originalEvt)
    }
    return retVal
  }
  function _disableDraggable(el) {
    el.draggable = false
  }
  function _unsilent() {
    _silent = false
  }
  function _getChild(el, childNum, options) {
    var currentChild = 0,
    i = 0,
    children = el.children;
    while (i < children.length) {
      if (children[i].style.display !== "none" && children[i] !== ghostEl && children[i] !== dragEl && _closest(children[i], options.draggable, el, false)) {
        if (currentChild === childNum) {
          return children[i]
        }
        currentChild++
      }
      i++
    }
    return null
  }
  function _lastChild(el) {
    var last = el.lastElementChild;
    if (last === ghostEl) {
      last = el.children[el.childElementCount - 2]
    }
    return last || null
  }
  function _ghostIsLast(evt, axis, el) {
    var elRect = _getRect(_lastChild(el)),
    mouseOnAxis = axis === "vertical" ? evt.clientY: evt.clientX,
    mouseOnOppAxis = axis === "vertical" ? evt.clientX: evt.clientY,
    targetS2 = axis === "vertical" ? elRect.bottom: elRect.right,
    targetS1Opp = axis === "vertical" ? elRect.left: elRect.top,
    targetS2Opp = axis === "vertical" ? elRect.right: elRect.bottom;
    return (mouseOnOppAxis > targetS1Opp && mouseOnOppAxis < targetS2Opp && mouseOnAxis > targetS2)
  }
  function _getSwapDirection(evt, target, axis, swapThreshold, invertedSwapThreshold, invertSwap, isLastTarget) {
    var targetRect = _getRect(target),
    mouseOnAxis = axis === "vertical" ? evt.clientY: evt.clientX,
    targetLength = axis === "vertical" ? targetRect.height: targetRect.width,
    targetS1 = axis === "vertical" ? targetRect.top: targetRect.left,
    targetS2 = axis === "vertical" ? targetRect.bottom: targetRect.right,
    dragRect = _getRect(dragEl),
    invert = false;
    if (!invertSwap) {
      if (isLastTarget && targetMoveDistance < targetLength * swapThreshold) {
        if (!pastFirstInvertThresh && (lastDirection === 1 ? (mouseOnAxis > targetS1 + targetLength * invertedSwapThreshold / 2) : (mouseOnAxis < targetS2 - targetLength * invertedSwapThreshold / 2))) {
          pastFirstInvertThresh = true
        }
        if (!pastFirstInvertThresh) {
          var dragS1 = axis === "vertical" ? dragRect.top: dragRect.left,
          dragS2 = axis === "vertical" ? dragRect.bottom: dragRect.right;
          if (lastDirection === 1 ? (mouseOnAxis < targetS1 + targetMoveDistance) : (mouseOnAxis > targetS2 - targetMoveDistance)) {
            return lastDirection * -1
          }
        } else {
          invert = true
        }
      } else {
        if (mouseOnAxis > targetS1 + (targetLength * (1 - swapThreshold) / 2) && mouseOnAxis < targetS2 - (targetLength * (1 - swapThreshold) / 2)) {
          return ((mouseOnAxis > targetS1 + targetLength / 2) ? -1 : 1)
        }
      }
    }
    invert = invert || invertSwap;
    if (invert) {
      if (mouseOnAxis < targetS1 + (targetLength * invertedSwapThreshold / 2) || mouseOnAxis > targetS2 - (targetLength * invertedSwapThreshold / 2)) {
        return ((mouseOnAxis > targetS1 + targetLength / 2) ? 1 : -1)
      }
    }
    return 0
  }
  function _getInsertDirection(target, options) {
    var dragElIndex = _index(dragEl, options.draggable),
    targetIndex = _index(target, options.draggable);
    if (dragElIndex < targetIndex) {
      return 1
    } else {
      return - 1
    }
  }
  function _generateId(el) {
    var str = el.tagName + el.className + el.src + el.href + el.textContent,
    i = str.length,
    sum = 0;
    while (i--) {
      sum += str.charCodeAt(i)
    }
    return sum.toString(36)
  }
  function _index(el, selector) {
    var index = 0;
    if (!el || !el.parentNode) {
      return - 1
    }
    while (el && (el = el.previousElementSibling)) {
      if ((el.nodeName.toUpperCase() !== "TEMPLATE") && el !== cloneEl) {
        index++
      }
    }
    return index
  }
  function _matches(el, selector) {
    if (el) {
      try {
        if (el.matches) {
          return el.matches(selector)
        } else {
          if (el.msMatchesSelector) {
            return el.msMatchesSelector(selector)
          } else {
            if (el.webkitMatchesSelector) {
              return el.webkitMatchesSelector(selector)
            }
          }
        }
      } catch(_) {
        return false
      }
    }
    return false
  }
  var _throttleTimeout;
  function _throttle(callback, ms) {
    return function() {
      if (!_throttleTimeout) {
        var args = arguments,
        _this = this;
        _throttleTimeout = setTimeout(function() {
          if (args.length === 1) {
            callback.call(_this, args[0])
          } else {
            callback.apply(_this, args)
          }
          _throttleTimeout = void 0
        },
        ms)
      }
    }
  }
  function _cancelThrottle() {
    clearTimeout(_throttleTimeout);
    _throttleTimeout = void 0
  }
  function _extend(dst, src) {
    if (dst && src) {
      for (var key in src) {
        if (src.hasOwnProperty(key)) {
          dst[key] = src[key]
        }
      }
    }
    return dst
  }
  function _clone(el) {
    if (Polymer && Polymer.dom) {
      return Polymer.dom(el).cloneNode(true)
    } else {
      if ($) {
        return $(el).clone(true)[0]
      } else {
        return el.cloneNode(true)
      }
    }
  }
  function _saveInputCheckedState(root) {
    savedInputChecked.length = 0;
    var inputs = root.getElementsByTagName("input");
    var idx = inputs.length;
    while (idx--) {
      var el = inputs[idx];
      el.checked && savedInputChecked.push(el)
    }
  }
  function _nextTick(fn) {
    return setTimeout(fn, 0)
  }
  function _cancelNextTick(id) {
    return clearTimeout(id)
  }
  function _getRect(el, container, adjustForTransform) {
    if (!el.getBoundingClientRect && el !== win) {
      return
    }
    var elRect, top, left, bottom, right, height, width;
    if (el !== win) {
      elRect = el.getBoundingClientRect();
      top = elRect.top;
      left = elRect.left;
      bottom = elRect.bottom;
      right = elRect.right;
      height = elRect.height;
      width = elRect.width
    } else {
      top = 0;
      left = 0;
      bottom = window.innerHeight;
      right = window.innerWidth;
      height = window.innerHeight;
      width = window.innerWidth
    }
    if (adjustForTransform && el !== win) {
      container = container || el.parentNode;
      if (!IE11OrLess) {
        do {
          if (container && container.getBoundingClientRect && _css(container, "transform") !== "none") {
            var containerRect = container.getBoundingClientRect();
            top -= containerRect.top + parseInt(_css(container, "border-top-width"));
            left -= containerRect.left + parseInt(_css(container, "border-left-width"));
            bottom = top + elRect.height;
            right = left + elRect.width;
            break
          }
        } while ( container = container . parentNode )
      }
      var matrix = _matrix(el),
      scaleX = matrix && matrix.a,
      scaleY = matrix && matrix.d;
      if (matrix) {
        top /= scaleY;
        left /= scaleX;
        width /= scaleX;
        height /= scaleY;
        bottom = top + height;
        right = left + width
      }
    }
    return {
      top: top,
      left: left,
      bottom: bottom,
      right: right,
      width: width,
      height: height
    }
  }
  function _isScrolledPast(el, side) {
    var parent = _getParentAutoScrollElement(parent, true),
    elSide = _getRect(el)[side];
    while (parent) {
      var parentSide = _getRect(parent)[side],
      visible;
      if (side === "top" || side === "left") {
        visible = elSide >= parentSide
      } else {
        visible = elSide <= parentSide
      }
      if (!visible) {
        return true
      }
      if (parent === win) {
        break
      }
      parent = _getParentAutoScrollElement(parent, false)
    }
    return false
  }
  _on(document, "touchmove",
  function(evt) {
    if ((Sortable.active || awaitingDragStarted) && evt.cancelable) {
      evt.preventDefault()
    }
  });
  Sortable.utils = {
    on: _on,
    off: _off,
    css: _css,
    find: _find,
    is: function(el, selector) {
      return !! _closest(el, selector, el, false)
    },
    extend: _extend,
    throttle: _throttle,
    closest: _closest,
    toggleClass: _toggleClass,
    clone: _clone,
    index: _index,
    nextTick: _nextTick,
    cancelNextTick: _cancelNextTick,
    detectDirection: _detectDirection,
    getChild: _getChild
  };
  Sortable.create = function(el, options) {
    return new Sortable(el, options)
  };
  Sortable.version = "1.8.1";
  return Sortable
}
export default sortableFactory