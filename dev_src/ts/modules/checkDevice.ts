import window from './window';

export default () => {

  window.deviceInfo = {};

  /**
   * Check <img> Orientation relative to the parent element.
   *     If a <img> is vertically long relative to the parent element add class 'is-portrait'.
   */
  window.checkImgOrientation = (imgElement?: HTMLImageElement) => {
    const imgs = imgElement ? [imgElement] : Array.from(document.querySelectorAll('img'));
    imgs.forEach(img => {
      const parentElement = (img.parentNode as HTMLElement);
      if (img.naturalWidth / img.naturalHeight < parentElement.offsetWidth / parentElement.offsetHeight) {
        img.classList.add('is-portrait');
      } else {
        img.classList.remove('is-portrait');
      }
    })
  }

  /**
   * Check complete of <img> load.
   *     Add class 'hasImg' to <img>'s parents.
   *     When is complete load of <img>, add class 'is-loaded'.
   */
  window.checkImgComplete = (imgElement?: HTMLImageElement) => {
    const imgs = imgElement ? [imgElement] : Array.from(document.querySelectorAll('img'));
    let isCompleteAllImg = false;
    imgs.forEach(img => {
      const parentElement = (img.parentNode as HTMLElement);
      parentElement.classList.add('hasImg');
    })
    const loop = () => {
      if (!isCompleteAllImg) {
        let countImgComplete = 0
        imgs.forEach(img => {
          const parentElement = (img.parentNode as HTMLElement);
          if (img.complete && img.hasAttribute('src')) {
            parentElement.classList.add('is-loaded');
            window.checkImgOrientation(img);
            countImgComplete++;
          }
        })
        if (countImgComplete === imgs.length) {
          isCompleteAllImg = true;
        } else {
          requestAnimationFrame(loop);
        }
      }
    }
    requestAnimationFrame(loop);
  }

  window.lazyload = () => {
    const imgs = document.querySelectorAll('img');
    const sources = document.querySelectorAll('source');
    const windowScrollTop: number = document.documentElement.scrollTop || document.body.scrollTop;
    
    imgs.forEach(img => {
      if (img.hasAttribute('data-src') && !img.hasAttribute('src') && (windowScrollTop + window.innerHeight ) > window.pageYOffset + img.getBoundingClientRect().top) {
        const parentElement = (img.parentNode as HTMLElement);
        parentElement.classList.remove('is-loaded');
        img.setAttribute('src', img.getAttribute('data-src'));
        window.checkImgComplete(img);
      }
    });
    sources.forEach(source => {
      if (source.hasAttribute('data-srcset') && !source.hasAttribute('srcset') && (windowScrollTop + window.innerHeight ) > window.pageYOffset + source.getBoundingClientRect().top) {
        const parentElement = (source.parentNode as HTMLElement);
        parentElement.classList.remove('is-loaded');
        source.setAttribute('srcset', source.getAttribute('data-srcset'));
        window.checkImgComplete(parentElement.querySelector('img'));
      }
    });
  }

  const changeViewPort = () => {
    const viewportMetaElement = document.querySelector("meta[name='viewport']");
    if (window.innerWidth > 768) {
      viewportMetaElement.setAttribute('content', 'width=device-width, initial-scale=1.0');
    } else {
      viewportMetaElement.setAttribute('content', 'width=375px');
    }
  }

  /**
   * Check size match
   *     window width and 100vw
   *     window height and 100vh
   */
  const checkWindowSizeMatch = () => {
    const windowSizeElement = document.createElement('div');
    const viewportSizeElement = document.createElement('div');
    document.body.appendChild(windowSizeElement); 
    document.body.appendChild(viewportSizeElement);
    windowSizeElement.style.setProperty('position', 'fixed');
    windowSizeElement.style.setProperty('left', '0');
    windowSizeElement.style.setProperty('bottom', '0');
    windowSizeElement.style.setProperty('z-index', '-1');
    windowSizeElement.style.setProperty('width', '100%');
    viewportSizeElement.style.setProperty('position', 'fixed');
    viewportSizeElement.style.setProperty('left', '0');
    viewportSizeElement.style.setProperty('bottom', '0');
    viewportSizeElement.style.setProperty('z-index', '-1');
    viewportSizeElement.style.setProperty('width', '100vw');
    if (windowSizeElement.offsetWidth !== viewportSizeElement.offsetWidth) {
      document.body.classList.add('isNotFit100vw');
    } else {
      document.body.classList.remove('isNotFit100vw');
    }
    if (window.userAgent.indexOf('iphone') > -1 || window.userAgent.indexOf('ipod') > -1) {
      windowSizeElement.style.setProperty('bottom', 'auto');
      windowSizeElement.style.setProperty('top', '0');
      windowSizeElement.style.setProperty('width', '0');
      windowSizeElement.style.setProperty('height', '100%');
      viewportSizeElement.style.setProperty('bottom', 'auto');
      viewportSizeElement.style.setProperty('top', '0');
      viewportSizeElement.style.setProperty('width', '0');
      viewportSizeElement.style.setProperty('wiheightdth', '100vh');
      if (Math.round(windowSizeElement.offsetHeight) !== Math.round(viewportSizeElement.offsetHeight)) {
        document.body.classList.add('isNotFit100vh');
      } else {
        document.body.classList.remove('isNotFit100vh');
      }
    }
    document.body.removeChild(windowSizeElement);
    document.body.removeChild(viewportSizeElement);
  }

  /**
   * Check OS
   */
  const checkOS = () => {
    window.deviceInfo.os = {
      isIE: false,
      isIOS: false
    }
    if (window.userAgent.indexOf('msie') != -1 || window.userAgent.indexOf('trident') != -1) {
      document.body.classList.add('is-IE');
      window.deviceInfo['os']['isIE'] = true;
    }
    if (window.userAgent.indexOf('iphone') != -1 || window.userAgent.indexOf('ipod') != -1) {
      document.body.classList.add('is-ios');
      window.deviceInfo['os']['isIOS'] = true;
    }
  }

  /**
   * Check CSS compativility
   *     - display: grid, contents
   *     - positon: sticky
   */
  const checkCSSCompativility = () => {
    const element = document.createElement('div')
    window.deviceInfo['css'] = {
      display: {
        contents: true,
        grid: true
      },
      position: {
        sticky: true
      }
    }
    element.style.display = window.deviceInfo.os.isIE ? '-ms-grid' : 'grid';
    if (element.style.display !== 'grid' && element.style.display !== '-ms-grid') {
      document.body.classList.add('no-css--dispGrid');
      window.deviceInfo.css.display.grid = false;
    }
    element.style.display = 'contents';
    if (element.style.display !== 'contents') {
      document.body.classList.add('no-css--dispContents');
      window.deviceInfo.css.display.contents = false;
    }
    element.style.position = 'sticky'
    if (element.style.position !== 'sticky' && window.userAgent.indexOf('iphone') === -1 && window.userAgent.indexOf('ipad') === -1) {
      document.body.classList.add('no-css--posSticky');
      window.deviceInfo.css.position.sticky = false;
    }
  }

  window.addEventListener('pageshow', () => {
    checkOS();
    // changeViewPort();
    window.checkImgOrientation();
    checkWindowSizeMatch();
    checkCSSCompativility();
    window.checkImgComplete();
  });

  let isRunning: boolean = true;
  let previousWindowWidth: number = window.innerWidth;
  window.addEventListener('resize', () => {
    if (isRunning) {
      isRunning = false;
      requestAnimationFrame(function () {
        isRunning = true;
        if (window.innerWidth !== previousWindowWidth) {
          previousWindowWidth =  window.innerWidth;
          // changeViewPort();
          window.checkImgOrientation();
          checkWindowSizeMatch();
        }
      })
    }
  })

  window.addEventListener('scroll', () => {
    window.lazyload();
  });

}