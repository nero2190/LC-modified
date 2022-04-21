import 'core-js/features/array/from';
import 'core-js/features/dom-collections/for-each';
import window from './modules/window';

/**
 * global; ユーザーエージェント
 */
window.userAgent = window.navigator.userAgent.toLowerCase();
/**
 * global; APPバージョン
 */
window.appVersion = window.navigator.appVersion.toLowerCase();

/**
 * Easing Functions
 */
const Ease: { [s: string]: Function } = {
  easeInOut: (t: number) => t<.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1
}

/**
 * Smooth Scroll
 * @param {string}  href     target hash or URL (example: #hoge, https://example.com#hoge)
 * @param {boolean} isForce  forced execution regardless of the href type
 * @param {number}  duration animation duration (ms); default: 500ms
 */
window.smoothScroll = (href: string, isForce: boolean, duration: number) => {

  duration = typeof duration !== 'undefined' ? duration : 800;
  const targetUrl: string = href.split('#')[0];
  const currentUrl: string = String(location.href).replace(location.hash, '');

  // Execute smooth scroll if href URL and current page URL are equal.
  if (targetUrl == currentUrl || isForce) {
    const hash: string = href.split('#')[1];
    const currentPostion: number = document.documentElement.scrollTop || document.body.scrollTop;
    const targetElement: HTMLElement = document.getElementById(hash);

    if (targetElement) {
      const targetPosition: number = window.pageYOffset + targetElement.getBoundingClientRect().top - (window.innerWidth <= 768 ? 70 : 112);
      const startTime: number = performance.now();
      const loop: FrameRequestCallback = (nowTime: number) => {

        const time: number = nowTime - startTime;
        const normalizedTime: number = time / duration;

        if (normalizedTime < 1) {
          window.scrollTo(0, currentPostion + ((targetPosition - currentPostion) * Ease.easeInOut(normalizedTime)));
          requestAnimationFrame(loop);
        } else {
          window.scrollTo(0, targetPosition);
        }

      }
      requestAnimationFrame(loop);
    }

  } else {
    location.href = href;
  }

}

import header from './modules/header'
import checkDevice from './modules/checkDevice'
import animation from './modules/animation'
import component from './modules/component'

document.createElement('main')
header();
checkDevice();
animation();
component();