import $ from 'jquery';
import 'slick-carousel';

export default () => {

  /**
   * タッチイベントの振り分け
   * @type {Object}
   */
  const EVENT = {
    TOUCH_START: 'mousedown',
    TOUCH_MOVE: 'mousemove',
    TOUCH_END: 'mouseup'
  };
  if ('ontouchstart' in window) {
    EVENT.TOUCH_START = 'touchstart'
    EVENT.TOUCH_MOVE = 'touchmove'
    EVENT.TOUCH_END = 'touchend'
  }

  $(() => {

    if ($('.mainvisual').length) {
      $('.mainvisual').slick({
        infinite: false,
        arrows: false,
        dots: true
      });
    }

    //.l-footer__banner
    var popBnr = $('.l-footer__banner, .l-footer__bannerBg');
    $(popBnr).fadeIn()
    $(".l-footer__bannerButton, .l-footer__bannerBg").on('click', function() {
      $(popBnr).addClass("is-pop-close");
      $(popBnr).fadeOut();
    });


    if ($('.productImages__main').length) {
      const $productImages__thumbnails__list = $('.productImages__thumbnails__list')
      const $productImages__thumbnails__items = $('.productImages__thumbnails__item')
      $productImages__thumbnails__items.eq(0).addClass('is-current')

      $('.productImages__main').slick({
        infinite: false
      }).on('beforeChange', (_e, _slick, _currentSlide, nextSlide) => {
        $productImages__thumbnails__items.removeClass('is-current')
        $productImages__thumbnails__items.eq(nextSlide).addClass('is-current')
      });

      if ($('.productImages__thumbnails').length) {
        let prevTouchPosition: {[s:string]: number}|false = false;
        let prevStyleLeft = 0;
        $productImages__thumbnails__items
          .on(EVENT.TOUCH_START, (e: JQuery.MouseDownEvent|JQuery.TouchStartEvent) => {
            if (!prevTouchPosition) {
              e.preventDefault();
              prevTouchPosition = {}
              prevTouchPosition['left'] = 'pageX' in e.originalEvent ? e.originalEvent.pageX : e.originalEvent.changedTouches[0].pageX
              $productImages__thumbnails__list.css({
                'transition': 'none'
              })
              prevStyleLeft = Number(($productImages__thumbnails__list.css('left')).replace('px', ''))
            }
          })
          .on(EVENT.TOUCH_MOVE, (e: JQuery.MouseMoveEvent|JQuery.TouchMoveEvent) => {
            if (prevTouchPosition) {
              e.preventDefault();
              let currentPageX = 'pageX' in e.originalEvent ? e.originalEvent.pageX : e.originalEvent.changedTouches[0].pageX
              $productImages__thumbnails__list.css({
                'left': (prevStyleLeft + currentPageX - prevTouchPosition.left) + 'px'
              })
            }
          })
          .on(EVENT.TOUCH_END, function (e: JQuery.MouseUpEvent|JQuery.TouchEndEvent) {
            if (prevTouchPosition) {
              e.preventDefault()
              let currentPageX = 'pageX' in e.originalEvent ? e.originalEvent.pageX : e.originalEvent.changedTouches[0].pageX
              const distanceTouchMove = prevTouchPosition.left - currentPageX
              const maxTouchMove = ($productImages__thumbnails__items.outerWidth(true) * $productImages__thumbnails__items.length) - $('.productImages__thumbnails').outerWidth()
              if (distanceTouchMove - prevStyleLeft < 0 || maxTouchMove < 0) {
                $productImages__thumbnails__list.css({
                  'transition': '0.3s',
                  'left': '0'
                })
              } else if (distanceTouchMove - prevStyleLeft > maxTouchMove) {
                $productImages__thumbnails__list.css({
                  'transition': '0.3s',
                  'left': '-' + maxTouchMove + 'px'
                })
              }
              if (Math.abs(distanceTouchMove) === 0) {
                const index = $(this).data('index')
                $('.productImages__main').slick('slickGoTo', index);
              }
              prevTouchPosition = false
            }
          })
      }
    }

    
    
  })

}