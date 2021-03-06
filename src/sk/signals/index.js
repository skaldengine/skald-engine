module.exports = {
  ResizeSignal                : require('sk/signals/display/ResizeSignal'),
  EnterFullscreenSignal       : require('sk/signals/display/EnterFullscreenSignal'),
  LeaveFullscreenSignal       : require('sk/signals/display/LeaveFullscreenSignal'),
  EnterWrongOrientationSignal : require('sk/signals/display/EnterWrongOrientationSignal'),
  LeaveWrongOrientationSignal : require('sk/signals/display/LeaveWrongOrientationSignal'),
  FullscreenChangeSignal      : require('sk/signals/display/FullscreenChangeSignal'),
  OrientationChangeSignal     : require('sk/signals/display/OrientationChangeSignal'),
  
  ViewAddedSignal             : require('sk/signals/views/ViewAddedSignal'),
  ViewEnterSignal             : require('sk/signals/views/ViewEnterSignal'),
  ViewRemovedSignal           : require('sk/signals/views/ViewRemovedSignal'),
  
  LoadProgressSignal          : require('sk/signals/resources/LoadProgressSignal'),
  LoadErrorSignal             : require('sk/signals/resources/LoadErrorSignal'),
  ResourceLoadedSignal        : require('sk/signals/resources/ResourceLoadedSignal'),
  LoadCompletedSignal         : require('sk/signals/resources/LoadCompletedSignal'),
  LoadStartedSignal           : require('sk/signals/resources/LoadStartedSignal'),
  ResourceUnloadedSignal      : require('sk/signals/resources/ResourceUnloadedSignal'),
  
  KeyDownSignal               : require('sk/signals/keyboard/KeyDownSignal'),
  KeyHoldSignal               : require('sk/signals/keyboard/KeyHoldSignal'),
  KeyUpSignal                 : require('sk/signals/keyboard/KeyUpSignal'),
  
  ClickSignal                 : require('sk/signals/mouse/ClickSignal'),
  DoubleClickSignal           : require('sk/signals/mouse/DoubleClickSignal'),
  MouseDownSignal             : require('sk/signals/mouse/MouseDownSignal'),
  MouseUpSignal               : require('sk/signals/mouse/MouseUpSignal'),
  MouseMoveSignal             : require('sk/signals/mouse/MouseMoveSignal'),
  MouseLeaveSignal            : require('sk/signals/mouse/MouseLeaveSignal'),
  MouseEnterSignal            : require('sk/signals/mouse/MouseEnterSignal'),
  MouseWheelSignal            : require('sk/signals/mouse/MouseWheelSignal'),
  
  GamepadButtonDownSignal     : require('sk/signals/gamepads/GamepadButtonDownSignal'),
  GamepadButtonHoldSignal     : require('sk/signals/gamepads/GamepadButtonHoldSignal'),
  GamepadButtonUpSignal       : require('sk/signals/gamepads/GamepadButtonUpSignal'),
  GamepadStickMoveSignal      : require('sk/signals/gamepads/GamepadStickMoveSignal'),
  GamepadConnectedSignal      : require('sk/signals/gamepads/GamepadConnectedSignal'),
  GamepadDisconnectedSignal   : require('sk/signals/gamepads/GamepadDisconnectedSignal'),
  
  TouchDownSignal             : require('sk/signals/touches/TouchDownSignal'),
  TouchMoveSignal             : require('sk/signals/touches/TouchMoveSignal'),
  TouchUpSignal               : require('sk/signals/touches/TouchUpSignal'),

  UpdateSignal                : require('sk/signals/UpdateSignal'),
}