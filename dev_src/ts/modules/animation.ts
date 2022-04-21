import window from './window';

export default () => {

  window.addEventListener('DOMContentLoaded', () => {

    /**
     * アニメーションのターゲット各要素のjQueryオブジェクトを配列で格納
     */
    var animationTargets = document.querySelectorAll('.js-animation');

    if(animationTargets.length) {
      let isInitAnimationExcecuted: boolean = false;
      window.addEventListener('pageshow', () => {
        isInitAnimationExcecuted = true;
        updateAnimation();
      })
      window.addEventListener('scroll', function() {
        updateAnimation();
      });
      const timer = setTimeout(() => {
        clearTimeout(timer);
        if (!isInitAnimationExcecuted) {
          updateAnimation();
          isInitAnimationExcecuted = true;
        }
      }, 1000);
    }

    /**
     * アニメーションの状態を更新する
     */
    function updateAnimation() {
      const windowScrollTop: number = document.documentElement.scrollTop || document.body.scrollTop;
      const applyPosition: number = window.innerWidth > 768 ? 4 / 5 : 1;
      animationTargets.forEach(animationTarget => {
        if((windowScrollTop + window.innerHeight * applyPosition) > window.pageYOffset + animationTarget.getBoundingClientRect().top) {
          animationTarget.classList.add('is-animated');
        }
      });
    }

    /**
     * スムーススクロール実装
     */
    const smoothScrollTriggers: NodeListOf<HTMLAnchorElement|HTMLAreaElement> = document.querySelectorAll('.js-scroll[href*="#"]');
    smoothScrollTriggers.forEach(smoothScrollTrigger => {
      smoothScrollTrigger.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();
        window.smoothScroll(smoothScrollTrigger.href);
      });
    });

    /**
     * ハッシュリンクの位置を調整
     */
    const hashPosFix = () => {
      if (location.hash) {
        window.smoothScroll(location.href, false, 0)
      }
    }
    hashPosFix()
    window.addEventListener('hashchange', () => {
      hashPosFix()
    });

  })

}