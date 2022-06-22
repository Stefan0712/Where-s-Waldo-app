(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('react')) :
  typeof define === 'function' && define.amd ? define(['react'], factory) :
  (global = global || self, global.useMousePosition = factory(global.React));
}(this, (function (React) { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function useEvent(target, type, listener, cleanup) {
    var storedListener = React.useRef(listener);
    var storedCleanup = React.useRef(cleanup);
    React.useEffect(function () {
      storedListener.current = listener;
      storedCleanup.current = cleanup;
    });
    React.useEffect(function () {
      var targetEl = target && 'current' in target ? target.current : target;
      if (!targetEl) return;
      var didUnsubscribe = 0;

      function listener() {
        if (didUnsubscribe) return;

        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        storedListener.current.apply(this, args);
      }

      targetEl.addEventListener(type, listener);
      var cleanup = storedCleanup.current;
      return function () {
        didUnsubscribe = 1;
        targetEl.removeEventListener(type, listener);
        cleanup && cleanup();
      }; // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [target, type]);
  }

  var useLatest = function useLatest(current) {
    var storedValue = React.useRef(current);
    storedValue.current = current;
    return storedValue;
  };

  var perf = typeof performance !== 'undefined' ? performance : Date;

  var now = function now() {
    return perf.now();
  };

  function useThrottleCallback(callback, fps, leading) {
    if (fps === void 0) {
      fps = 30;
    }

    if (leading === void 0) {
      leading = false;
    }

    var storedCallback = useLatest(callback);
    var ms = 1000 / fps;
    var prev = React.useRef(0);
    var trailingTimeout = React.useRef();

    var clearTrailing = function clearTrailing() {
      return trailingTimeout.current && clearTimeout(trailingTimeout.current);
    };

    var deps = [fps, leading, storedCallback]; // Reset any time the deps change

    function _ref() {
      prev.current = 0;
      clearTrailing();
    }

    React.useEffect(function () {
      return _ref;
    }, deps);
    return React.useCallback(function () {
      // eslint-disable-next-line prefer-rest-params
      var args = arguments;
      var rightNow = now();

      var call = function call() {
        prev.current = rightNow;
        clearTrailing();
        storedCallback.current.apply(null, args);
      };

      var current = prev.current; // leading

      if (leading && current === 0) return call(); // body

      if (rightNow - current > ms) {
        if (current > 0) return call();
        prev.current = rightNow;
      } // trailing


      clearTrailing();
      trailingTimeout.current = setTimeout(function () {
        call();
        prev.current = 0;
      }, ms);
    }, deps);
  }

  function _handleDown(state, action) {
    if (typeof window === 'undefined') return state;
    var e = action.event,
        element = action.element;
    var event;

    if ('touches' in e) {
      event = e.touches[0];
    } else {
      event = e;
    }

    var _event = event,
        clientX = _event.clientX,
        clientY = _event.clientY,
        screenX = _event.screenX,
        screenY = _event.screenY,
        _event$pageX = _event.pageX,
        pageX = _event$pageX === void 0 ? 0 : _event$pageX,
        _event$pageY = _event.pageY,
        pageY = _event$pageY === void 0 ? 0 : _event$pageY;
    var rect = element.getBoundingClientRect();
    var x = pageX - rect.left - (window.pageXOffset || window.scrollX);
    var y = pageY - rect.top - (window.pageYOffset || window.scrollY); // shims a mouseleave event for touch devices

    if ('touches' in e && (x < 0 || y < 0 || x > rect.width || y > rect.height)) {
      return _objectSpread2(_objectSpread2({}, state), {}, {
        context: _objectSpread2(_objectSpread2({}, state.context), {}, {
          hoverStatus: 'leave',
          touchStatus: 'end'
        })
      });
    }

    return {
      context: _objectSpread2(_objectSpread2({}, state.context), {}, {
        hoverStatus: 'enter'
      }),
      mouse: _objectSpread2(_objectSpread2({}, state.mouse), {}, {
        x: x,
        y: y,
        pageX: pageX,
        pageY: pageY,
        clientX: clientX,
        clientY: clientY,
        screenX: screenX,
        screenY: screenY,
        elementWidth: rect.width,
        elementHeight: rect.height,
        isOver: true,
        isTouch: 'touches' in e
      })
    };
  }

  function _ref(state, action) {
    var mouse = state.mouse,
        context = state.context;
    var handleDown = _handleDown;

    if (action.type === 'mousemove') {
      // Bails out if touch has ended
      if (context.touchStatus === 'end') return state;
      return handleDown(state, action);
    } else if (action.type === 'touchmove') {
      var nextState = {
        context: _objectSpread2(_objectSpread2({}, context), {}, {
          touchStatus: 'start'
        }),
        mouse: mouse
      };
      return handleDown(nextState, action);
    } else if (action.type === 'touchdown') {
      var _nextState = {
        context: _objectSpread2(_objectSpread2({}, context), {}, {
          touchStatus: 'start'
        }),
        mouse: _objectSpread2(_objectSpread2({}, mouse), {}, {
          isDown: true
        })
      };
      return handleDown(_nextState, action);
    } else if (action.type === 'mousedown') {
      return {
        context: context,
        mouse: _objectSpread2(_objectSpread2({}, mouse), {}, {
          isDown: true
        })
      };
    } else if (action.type === 'mouseup') {
      return {
        context: context,
        mouse: _objectSpread2(_objectSpread2({}, mouse), {}, {
          isDown: false
        })
      };
    } else if (action.type === 'mouseleave') {
      return {
        context: _objectSpread2(_objectSpread2({}, context), {}, {
          hoverStatus: 'leave'
        }),
        mouse: _objectSpread2(_objectSpread2({}, mouse), {}, {
          isOver: false
        })
      };
    } else if (action.type === 'touchleave') {
      return {
        context: _objectSpread2(_objectSpread2({}, context), {}, {
          hoverStatus: 'leave',
          touchStatus: 'end'
        }),
        mouse: _objectSpread2(_objectSpread2({}, mouse), {}, {
          isOver: false,
          isDown: false
        })
      };
    } else if (action.type === 'activeStatus') {
      return {
        context: _objectSpread2(_objectSpread2({}, context), {}, {
          activeStatus: action.value
        }),
        mouse: mouse
      };
    }

    return state;
  }

  function useMouse(target, options) {
    if (options === void 0) {
      options = {};
    }

    var _options = options,
        _options$fps = _options.fps,
        fps = _options$fps === void 0 ? 30 : _options$fps,
        _options$enterDelay = _options.enterDelay,
        enterDelay = _options$enterDelay === void 0 ? 0 : _options$enterDelay,
        _options$leaveDelay = _options.leaveDelay,
        leaveDelay = _options$leaveDelay === void 0 ? 0 : _options$leaveDelay;

    var _React$useReducer = React.useReducer(_ref, {
      mouse: initialState,
      context: initialContext
    }),
        state = _React$useReducer[0],
        dispatch = _React$useReducer[1];

    var onMove = useThrottleCallback(function (event) {
      var element = target && 'current' in target ? target.current : target;
      if (!element) return;
      dispatch({
        type: 'mousemove',
        event: event,
        element: element
      });
    }, fps, true);
    var onTouchMove = useThrottleCallback(function (event) {
      var element = target && 'current' in target ? target.current : target;
      if (!element) return;
      dispatch({
        type: 'touchmove',
        event: event,
        element: element
      });
    }, fps, true);
    var onLeave = useThrottleCallback(function () {
      return dispatch({
        type: 'mouseleave'
      });
    }, fps, // This has to be false because we always want this callback to fire after any
    // move events.
    false);
    var onDown = useThrottleCallback(function (event) {
      var element = target && 'current' in target ? target.current : target;
      if (!element) return;
      dispatch('touches' in event ? {
        type: 'touchdown',
        element: element,
        event: event
      } : {
        type: 'mousedown',
        element: element,
        event: event
      });
    }, fps, true);
    var onUp = useThrottleCallback(function () {
      return dispatch({
        type: 'mouseup'
      });
    }, fps, // This has to be false because we always want this callback to fire after any
    // down events.
    false);
    var onTouchEnd = useThrottleCallback(function () {
      return dispatch({
        type: 'touchleave'
      });
    }, fps, // This has to be false because we always want this callback to fire after any
    // move events.
    false);
    useEvent(target, 'mouseenter', onMove);
    useEvent(target, 'mousemove', onMove);
    useEvent(target, 'mouseleave', onLeave);
    useEvent(target, 'mousedown', onDown);
    useEvent(typeof window !== 'undefined' ? window : null, 'mousedown', onDown);
    useEvent(typeof window !== 'undefined' ? window : null, 'mouseup', onUp);
    useEvent(target, 'touchstart', onDown);
    useEvent(target, 'touchmove', onTouchMove);
    useEvent(target, 'touchend', onTouchEnd);
    useEvent(target, 'touchcancel', onTouchEnd);

    function _ref2() {
      return dispatch({
        type: 'activeStatus',
        value: 'active'
      });
    }

    function _ref3() {
      return dispatch({
        type: 'activeStatus',
        value: 'inactive'
      });
    }

    React.useEffect(function () {
      if (state.context.hoverStatus === 'enter') {
        if (enterDelay) {
          var timeout = setTimeout(_ref2, enterDelay);
          return function () {
            return clearTimeout(timeout);
          };
        }

        dispatch({
          type: 'activeStatus',
          value: 'active'
        });
      } else {
        if (leaveDelay) {
          var _timeout = setTimeout(_ref3, leaveDelay);

          return function () {
            return clearTimeout(_timeout);
          };
        }

        dispatch({
          type: 'activeStatus',
          value: 'inactive'
        });
      }
    }, [state.context.hoverStatus, enterDelay, leaveDelay]);
    return state.context.activeStatus === 'active' ? state.mouse : initialState;
  }

  var initialState = {
    x: null,
    y: null,
    pageX: null,
    pageY: null,
    clientX: null,
    clientY: null,
    screenX: null,
    screenY: null,
    elementWidth: null,
    elementHeight: null,
    isOver: false,
    isDown: false,
    isTouch: false
  };
  var initialContext = {
    hoverStatus: 'idle',
    touchStatus: 'idle',
    activeStatus: 'inactive'
  };

  return useMouse;

})));
//# sourceMappingURL=use-mouse-position.dev.js.map
