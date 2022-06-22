import { useReducer, useEffect } from 'react';
import useEvent from '@react-hook/event';
import { useThrottleCallback } from '@react-hook/throttle';

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

function _ref(state, action) {
  if (typeof window === 'undefined') return state;
  var {
    event: e,
    element
  } = action;
  var event;

  if ('touches' in e) {
    event = e.touches[0];
  } else {
    event = e;
  }

  var {
    clientX,
    clientY,
    screenX,
    screenY,
    pageX = 0,
    pageY = 0
  } = event;
  var rect = element.getBoundingClientRect();
  var x = pageX - rect.left - (window.pageXOffset || window.scrollX);
  var y = pageY - rect.top - (window.pageYOffset || window.scrollY); // shims a mouseleave event for touch devices

  if ('touches' in e && (x < 0 || y < 0 || x > rect.width || y > rect.height)) {
    return _extends({}, state, {
      context: _extends({}, state.context, {
        hoverStatus: 'leave',
        touchStatus: 'end'
      })
    });
  }

  return {
    context: _extends({}, state.context, {
      hoverStatus: 'enter'
    }),
    mouse: _extends({}, state.mouse, {
      x,
      y,
      pageX,
      pageY,
      clientX,
      clientY,
      screenX,
      screenY,
      elementWidth: rect.width,
      elementHeight: rect.height,
      isOver: true,
      isTouch: 'touches' in e
    })
  };
}

function _ref2(state, action) {
  var {
    mouse,
    context
  } = state;
  var handleDown = _ref;

  if (action.type === 'mousemove') {
    // Bails out if touch has ended
    if (context.touchStatus === 'end') return state;
    return handleDown(state, action);
  } else if (action.type === 'touchmove') {
    var nextState = {
      context: _extends({}, context, {
        touchStatus: 'start'
      }),
      mouse
    };
    return handleDown(nextState, action);
  } else if (action.type === 'touchdown') {
    var _nextState = {
      context: _extends({}, context, {
        touchStatus: 'start'
      }),
      mouse: _extends({}, mouse, {
        isDown: true
      })
    };
    return handleDown(_nextState, action);
  } else if (action.type === 'mousedown') {
    return {
      context,
      mouse: _extends({}, mouse, {
        isDown: true
      })
    };
  } else if (action.type === 'mouseup') {
    return {
      context,
      mouse: _extends({}, mouse, {
        isDown: false
      })
    };
  } else if (action.type === 'mouseleave') {
    return {
      context: _extends({}, context, {
        hoverStatus: 'leave'
      }),
      mouse: _extends({}, mouse, {
        isOver: false
      })
    };
  } else if (action.type === 'touchleave') {
    return {
      context: _extends({}, context, {
        hoverStatus: 'leave',
        touchStatus: 'end'
      }),
      mouse: _extends({}, mouse, {
        isOver: false,
        isDown: false
      })
    };
  } else if (action.type === 'activeStatus') {
    return {
      context: _extends({}, context, {
        activeStatus: action.value
      }),
      mouse
    };
  }

  return state;
}

function useMouse(target, options) {
  if (options === void 0) {
    options = {};
  }

  var {
    fps = 30,
    enterDelay = 0,
    leaveDelay = 0
  } = options;
  var [state, dispatch] = useReducer(_ref2, {
    mouse: initialState,
    context: initialContext
  });
  var onMove = useThrottleCallback(event => {
    var element = target && 'current' in target ? target.current : target;
    if (!element) return;
    dispatch({
      type: 'mousemove',
      event,
      element
    });
  }, fps, true);
  var onTouchMove = useThrottleCallback(event => {
    var element = target && 'current' in target ? target.current : target;
    if (!element) return;
    dispatch({
      type: 'touchmove',
      event,
      element
    });
  }, fps, true);
  var onLeave = useThrottleCallback(() => dispatch({
    type: 'mouseleave'
  }), fps, // This has to be false because we always want this callback to fire after any
  // move events.
  false);
  var onDown = useThrottleCallback(event => {
    var element = target && 'current' in target ? target.current : target;
    if (!element) return;
    dispatch('touches' in event ? {
      type: 'touchdown',
      element,
      event: event
    } : {
      type: 'mousedown',
      element,
      event: event
    });
  }, fps, true);
  var onUp = useThrottleCallback(() => dispatch({
    type: 'mouseup'
  }), fps, // This has to be false because we always want this callback to fire after any
  // down events.
  false);
  var onTouchEnd = useThrottleCallback(() => dispatch({
    type: 'touchleave'
  }), fps, // This has to be false because we always want this callback to fire after any
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

  function _ref3() {
    return dispatch({
      type: 'activeStatus',
      value: 'active'
    });
  }

  function _ref4() {
    return dispatch({
      type: 'activeStatus',
      value: 'inactive'
    });
  }

  useEffect(() => {
    if (state.context.hoverStatus === 'enter') {
      if (enterDelay) {
        var timeout = setTimeout(_ref3, enterDelay);
        return () => clearTimeout(timeout);
      }

      dispatch({
        type: 'activeStatus',
        value: 'active'
      });
    } else {
      if (leaveDelay) {
        var _timeout = setTimeout(_ref4, leaveDelay);

        return () => clearTimeout(_timeout);
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

export default useMouse;
//# sourceMappingURL=index.dev.mjs.map
