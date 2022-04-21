/**
* extends type of window properties
*/
interface MyWindow extends Window {
  userAgent: string,
  appVersion: string,
  smoothScroll: Function,
  deviceInfo: {[s: string]: any},
  checkImgOrientation: Function,
  checkImgComplete: Function,
  lazyload: Function
}
declare var window: MyWindow;

export default window;