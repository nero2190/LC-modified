const webdriver = require('selenium-webdriver');
const By = webdriver.By;

/**
 * If you get the following error, please install a chromedriver for your Chrome version. 
 * - UnhandledPromiseRejectionWarning: SessionNotCreatedError: session not created: This version of ChromeDriver only supports Chrome version 
 * http://chromedriver.chromium.org/downloads
 */

const timeoutMSec = 20000;

const URL = 'https://dev-ninomiya.sterfield.co.jp/';
const URL_ADMIN = 'https://dev-ninomiya.sterfield.co.jp/app_dev.php/admin/';
const PRODUCT_ID = 2;
// Japan
const ACCOUNT = {
  email: 'ninomiya@sterfield.co.jp',
  password: '13581358',
  last_name: 'てすと',
  first_name: 'てすと',
  country: 'Japan',
  birthday: '1985-01-01',
  tel: ['090', '0000', '0001'],
  zip: ['001', '0021'],
  street: '1-1',
  currency: 'JPY',
  language: '4'
}

// China
// const ACCOUNT = {
//   email: 'ninomiya_test01@sterfield.co.jp',
//   password: '13581358',
//   last_name: 'てすと',
//   first_name: 'てすと',
//   country: 'China',
//   birthday: '1985-01-01',
//   tel: '09000000001',
//   province: '北京市',
//   area: '东城区',
//   street: '1-1',
//   currency: 'CNY',
//   language: '2'
// }
//
// Taiwan
// const ACCOUNT = {
//   email: 'ninomiya@sterfield.co.jp',
//   password: '13581358',
//   last_name: 'てすと',
//   first_name: 'てすと',
//   country: 'Taiwan',
//   birthday: '1985-01-01',
//   tel: '09000000001',
//   province: '臺北市',
//   area: '中正區',
//   street: '1-1',
//   currency: 'TWD',
//   language: '1'
// }
const PAYMENT_METHOD_IDS = {
  credit: 3,  // クレジットカード
  yinlian: 4, // 銀聯
  alipay: 5,  // Alipay
  wechat: 6   // WeChat
}
const CARD = {
  cardno: '4111111111111111',
  csc: '111',
  exp_mm: '01',
  exp_yy: '22',
  cardname: 'TEST TEST',
  paymode: '1'
}
const ADMIN_USER = {
  name: 'LcAdmin',
  password: 'kakunin'
}

const authRegistName = 'application_frontend_consumer_type';

const driver = new webdriver.Builder().
   withCapabilities(webdriver.Capabilities.chrome()).
   build();
const $ = driver.findElement.bind(driver);

driver.get(URL);
if (process.argv[2].startsWith('order')) {
  Promise.resolve()
    .then(goTo('cart'))
    .then(toOrderFlow)
    .then(() => {
      return new Promise ((resolve, reject) => {
        if (process.argv.indexOf('order') > -1) {
          Promise.resolve()
            .then(login)
            .then(() => {
              resolve();
            });
        } else if (process.argv.indexOf('order:auth-regist') > -1) {
          Promise.resolve()
            .then(toAuthRegistPage)
            .then(authRegist)
            .then(authRegistConfirm)
            .then(() => {
              resolve();
            });
        }
      });
    })
    .then(selectDestination)
    .then(selectDeliveryTime)
    .then(selectPaymentMethod)
    .then(toOrder)
    .then(inputCardInfo);
} else if (process.argv[2].startsWith('goto:')) {
  var requestPage = String(process.argv[2]).replace('goto:', '');
  Promise.resolve()
    .then(goTo(requestPage));
} else if (process.argv[2].startsWith('confirm:')) {
  var requestPage = String(process.argv[2]).replace('confirm:', '');
  Promise.resolve()
    .then(confirmInput(requestPage));
} else {
  driver.quit();
}

function goTo (page) {
  return () => {
    return new Promise ((resolve, reject) => {
      switch (page) {
        case 'login':
          Promise.resolve()
            .then(toLoginPage)
            .then(() => {
              resolve();
            });
          break;
        case 'auth-regist':
          Promise.resolve()
            .then(toAuthRegistPage)
            .then(() => {
              resolve();
            });
          break;
        case 'auth-regist-confirm':
          Promise.resolve()
            .then(toAuthRegistPage)
            .then(authRegist)
            .then(() => {
              resolve();
            });
          break;
        case 'auth-password_request':
          Promise.resolve()
            .then(goTo('login'))
            .then(toPasswordRequest)
            .then(() => {
              resolve();
            });
          break;
        case 'mypage':
          Promise.resolve()
            .then(toLoginPage)
            .then(login)
            .then(() => {
              resolve();
            });
          break;
        case 'consumer-edit':
          Promise.resolve()
            .then(goTo('mypage'))
            .then(() => {
              scrollToTarget('main a[href$="/ec/consumer/edit"]', () => {
                $(By.css('main a[href$="/ec/consumer/edit"]')).click();
                resolve();
              });
            });
          break;
        case 'consumer-address-list':
          Promise.resolve()
            .then(goTo('mypage'))
            .then(() => {
              scrollToTarget('main a[href$="/ec/consumer/address/list"]', () => {
                $(By.css('main a[href$="/ec/consumer/address/list"]')).click();
                  driver.wait(webdriver.until.elementLocated(By.css('a[href$="/ec/consumer/address/add"]')), timeoutMSec)
                    .then(() => {
                      resolve();
                    });
                });
            });
          break;
        case 'consumer-address-add':
          goTo('consumer-address-list', () => {
            $(By.css('a[href$="/ec/consumer/address/add"]')).click();
            driver.wait(webdriver.until.elementLocated(By.id('form1')), timeoutMSec)
              .then(() => {
                resolve();
              });
          });
          break;
        case 'consumer-address-edit':
          goTo('consumer-address-list', () => {
            $(By.css('a[href*="/ec/consumer/edit/"]')).click();
            driver.wait(webdriver.until.elementLocated(By.id('form1')), timeoutMSec)
              .then(() => {
                resolve();
              });
          });
          break;
        case 'product':
          if (process.argv[3]) {
            if (isNaN(process.argv[3])) {
              Promise.resolve()
                .then(goToProductDetail(PRODUCT_ID))
                .then(() => {
                  resolve();
                });
            } else {
              Promise.resolve()
                .then(goToProductDetail(process.argv[3]))
                .then(() => {
                  resolve();
                });
            }
          } else {
            Promise.resolve()
              .then(goToProductDetail(PRODUCT_ID))
              .then(() => {
                resolve();
              });
          }
          break;
        case 'cart':
          Promise.resolve()
            .then(goToProductDetail(PRODUCT_ID))
            .then(selectSku)
            .then(cartin)
            .then(() => {
              resolve();
            });
          break;
        case 'cart-ship':
          Promise.resolve()
            .then(goTo('cart'))
            .then(toOrderFlow)
            .then(login)
            .then(() => {
              resolve();
            });
          break;
        case 'cart-addition':
          Promise.resolve()
            .then(goTo('cart-ship'))
            .then(selectDestination)
            .then(() => {
              resolve();
            });
          break;
        case 'cart-payment':
          Promise.resolve()
            .then(goTo('cart-addition'))
            .then(selectDeliveryTime)
            .then(() => {
              resolve();
            });
          break;
        case 'cart-confirm':
          Promise.resolve()
            .then(goTo('cart-payment'))
            .then(selectPaymentMethod)
            .then(() => {
              resolve();
            });
          break;
        case 'cart-card':
          Promise.resolve()
            .then(goTo('cart-confirm'))
            .then(toOrder)
            .then(() => {
              resolve();
            });
          break;
        case 'admin':
          Promise.resolve()
            .then(toAdmin)
            .then(() => {
              resolve();
            });
          break;
        case 'admin-order':
          Promise.resolve()
            .then(toAdmin)
            .then(toAdminOrder)
            .then(() => {
              resolve();
            });
          break;
        default:
          driver.quit();
      }
    });
  }
}

function confirmInput (page) {
  return () => {
    return new Promise ((resolve, reject) => {
      switch (page) {
        case 'auth-regist':
          Promise.resolve()
            .then(toAuthRegistPage)
            .then(authRegist)
            .then(() => {
              resolve();
            });
          break;
        case 'consumer-address-add':
          Promise.resolve()
            .then(goTo('consumer-address-list'))
            .then(() => {
              return new Promise ((resolve, reject) => {
                $(By.css('a[href$="/ec/consumer/address/add"]')).click();
                driver.wait(webdriver.until.elementLocated(By.id('form1')), timeoutMSec)
                  .then(() => {
                    inputAddress('ec_client_shipment_type', () => {
                      driver.executeScript("window.scrollBy(0, 100)");
                      $(By.id('form1')).findElement(By.css('button[type="submit"]')).click();
                      driver.wait(webdriver.until.elementLocated(By.css('a[href$="/ec/consumer/address/add')), timeoutMSec)
                        .then(() => {
                          resolve();
                        });
                    });
                  });
              });
            });
            break;
          case 'auth-password_request':
            Promise.resolve()
              .then(goTo('auth-password_request'))
              .then(confirmPasswordRequest)
              .then(() => {
                resolve();
              });
          break;
      }
    });
  }
}

function scrollToTarget (targetSelector, onScroll) {
  driver.executeScript(`
    var anchorLinkElement = document.querySelector('${ targetSelector }');
    console.log(anchorLinkElement);
    var rect = anchorLinkElement.getBoundingClientRect();
    var elemtop = rect.top + window.pageYOffset;
    window.scrollTo(0, elemtop - 200);
  `).then(() => {
    if (typeof onScroll === 'function') {
      onScroll();
    }
  });
}

function goToProductDetail (ID) {
  return () => {
    return new Promise ((resolve, reject) => {
      $(By.css(`a[href$="/product/${ ID }/"]`)).click()
        .then(() => {
          driver.wait(webdriver.until.elementLocated(By.name('product_sku_id')), timeoutMSec)
          .then(() => {
            resolve();
          });
        })
        .catch(() => {
          driver.executeScript(`
            location.href = '${ URL }product/${ ID }/';
          `).then(() => {
            driver.wait(webdriver.until.elementLocated(By.name('product_sku_id')), timeoutMSec)
            .then(() => {
              resolve();
            });
          });
        });
    });
  }
}

function selectSku () {
  return new Promise ((resolve, reject) => {
    $(By.className('js-lc--sku1'))
      .then($sku1 => {
        $sku1.click();
        $(By.className('js-lc--sku2'))
          .then($sku2 => {
            $sku2.click();
            resolve();
          })
          .catch(() => {
            resolve();
          });
      })
      .catch(() => {
        resolve();
      });
  });
}

function cartin () {
  return new Promise ((resolve, reject) => {
    $(By.className('js-lc--cartin'))
      .then($cartin => {
        $cartin.click();
        driver.wait(webdriver.until.elementLocated(By.css('form[action$="/ec/cart/ship"]')), timeoutMSec)
        .then(() => {
          resolve();
        });
      })
      .catch(() => {
        reject();
      });
  });
}

function toOrderFlow() {
  return new Promise ((resolve, reject) => {
    $(By.className('js-lc--submit'))
      .then($submit => {
        $submit.click();
        driver.wait(webdriver.until.elementLocated(By.name('_username')), timeoutMSec)
          .then(() => {
            driver.getCurrentUrl().then(function (url) {
              if (url.endsWith('/ec/cart/ship')) {
                resolve();
              }
            });
          });
      });
  });
}

function toLoginPage () {
  return new Promise ((resolve, reject) => {
    $(By.css('a[href$="/auth/login"]')).click()
      .then(() => {
        driver.wait(webdriver.until.elementLocated(By.name('_username')), timeoutMSec)
          .then(() => {
            resolve();
          });
      })
      .catch(() => {
        driver.executeScript(`
          location.href = '${ URL }auth/login';
        `).then(() => {
          driver.wait(webdriver.until.elementLocated(By.name('_username')), timeoutMSec)
            .then(() => {
              resolve();
            });
        });
      });
  });
}

function login () {
  return new Promise ((resolve, reject) => {
    $(By.name('_username')).sendKeys(ACCOUNT.email);
    $(By.name('_password')).sendKeys(ACCOUNT.password);
    driver.executeScript("window.scrollBy(0, 100)");
    $(By.css('form[action$="/auth/login_check"]')).findElement(By.css('button[type="submit"]')).click();
    driver.wait(webdriver.until.elementLocated(By.name('consumer_address_id')), timeoutMSec)
      .then(() => {
        resolve();
      })
      .catch(() => {

      });
    driver.wait(webdriver.until.elementLocated(By.className('lc-mypageNavi')), timeoutMSec)
      .then(() => {
        resolve();
      })
      .catch(() => {
        
      });
  });
}

function toAuthRegistPage () {
  return new Promise ((resolve, reject) => {
    $(By.css('a[href$="/auth/regist"]')).click()
      .then(() => {
        driver.wait(webdriver.until.elementLocated(By.name(authRegistName + '[last_name]')), timeoutMSec)
          .then(() => {
            resolve();
          });
      })
      .catch(() => {
        driver.executeScript(`
          location.href = '${ URL }auth/regist';
        `).then(() => {
          driver.wait(webdriver.until.elementLocated(By.name(authRegistName + '[last_name]')), timeoutMSec)
            .then(() => {
              resolve();
            });
        });
      });
  });
}

function authRegist () {
  return new Promise ((resolve, reject) => {
    inputAddress('application_frontend_consumer_type', () => {
      driver.executeScript("window.scrollBy(0, 100)");
      driver.executeScript(`
        var currencyOptions = document.getElementsByName('${ authRegistName }[currency]')[0].children;
        for(var i = 0; i < currencyOptions.length; i++) {
          currencyOptions[i].selected = (currencyOptions[i].textContent == '${ ACCOUNT.language }')
        }
      `);
      driver.executeScript(`
        var languageOptions = document.getElementsByName('${ authRegistName }[language]')[0].children;
        for(var i = 0; i < languageOptions.length; i++) {
          languageOptions[i].selected = (languageOptions[i].value == '${ ACCOUNT.language }')
        }
      `);
      $(By.name(authRegistName + '[password][first]')).sendKeys(ACCOUNT.password);
      $(By.name(authRegistName + '[password][second]')).sendKeys(ACCOUNT.password);
      $(By.xpath("//label[@for='checkbox_1']")).click();

      $(By.name('form1')).findElement(By.css('button[type="submit"]')).click();
      driver.wait(webdriver.until.elementLocated(By.css('form[action$="/auth/regist/complete"]')), timeoutMSec)
        .then(() => {
          resolve();
        });
    });
  });
}

function authRegistConfirm () {
  return new Promise ((resolve, reject) => {
    $(By.css('form[action$="/auth/regist/complete"]')).findElement(By.css('button[type="submit"]')).click();
    driver.wait(webdriver.until.elementLocated(By.name('consumer_address_id')), timeoutMSec)
      .then(() => {
        if (typeof onAuthRegistComplete === 'function') {
          resolve();
        }
      });
  });
}

function selectDestination () {
  return new Promise ((resolve, reject) => {
    $(By.css('#form button:not([type="button"])')).click();
    driver.wait(webdriver.until.elementLocated(By.css('*[name^="delivery_day["]')), timeoutMSec)
      .then(() => {
        resolve();
      });
  });
}

function selectDeliveryTime () {
  return new Promise ((resolve, reject) => {
    $(By.css('select[name^="delivery_day["]'))
      .then(() => {
        driver.executeScript(`
          var deliveryDayOptions = document.querySelector('select[name^="delivery_day["]')[0].children;
          for(var i = 0; i < deliveryDayOptions.length; i++) {
            deliveryDayOptions[i].selected = i === 1;
          }
        `);
      })
      .catch(() => {

      });
    $(By.css('select[name^="delivery_time["]'))
      .then(() => {
        driver.executeScript(`
          var deliveryTimeOptions = document.querySelector('select[name^="delivery_time["]')[0].children;
          for(var i = 0; i < deliveryTimeOptions.length; i++) {
            deliveryTimeOptions[i].selected = i === 1;
          }
        `);
      })
      .catch(() => {

      });
    driver.executeScript("window.scrollBy(0, 100)");
    $(By.css('#form1 button:not([type="button"])')).click();
    driver.wait(webdriver.until.elementLocated(By.name('payment')), timeoutMSec)
      .then(() => {
        resolve();
      });
  });
}

function selectPaymentMethod () {
  return new Promise ((resolve, reject) => {
    const selectedPaymentMethodID = (() => {
      let selectedPaymentMethodID = 'credit';
      process.argv.forEach(arg => {
        if (arg in PAYMENT_METHOD_IDS) {
          selectedPaymentMethodID = arg; 
        }
      });
      return selectedPaymentMethodID;
    })();
    driver.executeScript(`
      var paymentOptions = document.getElementsByName('payment')[0].children;
      for(var i = 0; i < paymentOptions.length; i++) {
        paymentOptions[i].selected = (paymentOptions[i].textContent == '${ selectedPaymentMethodID }')
      }
    `);
    $(By.name('message')).sendKeys('テストです。');
    $(By.css('#form1 button:not([type="button"])')).click();
    driver.wait(webdriver.until.elementLocated(By.className('lc-table--numbers')), timeoutMSec)
      .then(() => {
        resolve();
      });
  });
}

function toOrder () {
  return new Promise ((resolve, reject) => {
    $(By.css('#form1 button:not([type="button"])')).click();
    driver.wait(webdriver.until.elementLocated(By.name('ec_client_card_type[_token]')), timeoutMSec)
      .then(() => {
        resolve();
      });
  });
}

function inputCardInfo () {
  return new Promise ((resolve, reject) => {
    const cardName = 'ec_client_card_type';
    $(By.name(cardName + '[cardno]')).sendKeys(CARD.cardno);
    $(By.name(cardName + '[csc]')).sendKeys(CARD.csc);
    driver.executeScript(`
      var expMmOptions = document.getElementsByName('${ cardName }[exp_mm]')[0].children;
      for(var i = 0; i < expMmOptions.length; i++) {
        expMmOptions[i].selected = expMmOptions[i].value === '${ CARD.exp_mm }';
      }
    `);
    driver.executeScript(`
      var expYyOptions = document.getElementsByName('${ cardName }[exp_yy]')[0].children;
      for(var i = 0; i < expYyOptions.length; i++) {
        expYyOptions[i].selected = expYyOptions[i].value === '${ CARD.exp_yy }';
      }
    `);
    $(By.name(cardName + '[cardname]')).sendKeys(CARD.cardname);
    driver.executeScript(`
      var paymodeOptions = document.getElementsByName('${ cardName }[paymode]')[0].children;
      for(var i = 0; i < paymodeOptions.length; i++) {
        paymodeOptions[i].selected = paymodeOptions[i].value === '${ CARD.paymode }';
      }
    `);
    driver.executeScript("window.scrollBy(0, 100)");
    $(By.className('js-lc--submit')).click();
    resolve();
  });
}

function inputAddress(name, onComplete) {
  $(By.name(name + '[last_name]')).sendKeys(ACCOUNT.last_name);
  $(By.name(name + '[first_name]')).sendKeys(ACCOUNT.first_name);
  $(By.name(name + '[country]')).click();
  $(By.name(name + '[country]')).findElement(By.xpath(`//option[text()='${ ACCOUNT.country }']`)).click();
  driver.executeScript("document.getElementsByName('" + name + "[birthday]')[0].value = '" + ACCOUNT.birthday + "';");
  if (ACCOUNT.country == 'Japan') {
    driver.executeScript("window.scrollBy(0, 100)");
    driver.wait(webdriver.until.elementLocated(By.css('.js-lc-selectAddressChina[style*="none"]')), timeoutMSec)
    driver.executeScript("window.scrollBy(0, 100)");
    driver.wait(webdriver.until.elementLocated(By.css('.js-lc--telJp:not([style*="none"])')), timeoutMSec)
      .then(() => {
        $(By.name(name + '[tel1]')).sendKeys(ACCOUNT.tel[0]);
        $(By.name(name + '[tel2]')).sendKeys(ACCOUNT.tel[1]);
        $(By.name(name + '[tel3]')).sendKeys(ACCOUNT.tel[2]);
        $(By.name(name + '[email]')).sendKeys(ACCOUNT.email);
        $(By.name(name + '[zipcode1]')).sendKeys(ACCOUNT.zip[0]);
        $(By.name(name + '[zipcode2]')).sendKeys(ACCOUNT.zip[1]);
        driver.executeScript("window.scrollBy(0, 100)");
        $(By.name(name + '[street]')).sendKeys(ACCOUNT.street);
        if (typeof onComplete === 'function') {
          onComplete();
        }
      });
  } else {
    $(By.name(name + '[tel]')).sendKeys(ACCOUNT.tel);
    $(By.name(name + '[email]')).sendKeys(ACCOUNT.email);
    if (ACCOUNT.country == 'China') {
      driver.executeScript("window.scrollBy(0, 100)");
      driver.wait(webdriver.until.elementLocated(By.css('.js-lc-selectAddressChina[style*="none"]')), timeoutMSec)
        .then(() => {
          $(By.className('js-lc-selectAddressChina')).click();
          $(By.xpath(`//li[@data-value='${ ACCOUNT.province }']`)).click();
          driver.wait(webdriver.until.elementLocated(By.xpath(`//li[@data-value='${ ACCOUNT.area }']`)), timeoutMSec)
            .then(() => {
              $(By.xpath(`//li[@data-value='${ ACCOUNT.area }']`)).click();
              $(By.name(name + '[street]')).sendKeys(ACCOUNT.street);
              if (typeof onComplete === 'function') {
                onComplete();
              }
            });
        });
    } else if (ACCOUNT.country == 'Taiwan') {
      driver.executeScript("window.scrollBy(0, 100)");
      driver.wait(webdriver.until.elementLocated(By.css('.js-lc--cityTw:not([style*="none"])')), timeoutMSec)
        .then(() => {
          driver.executeScript(`
            var taiwanCityOptions = document.getElementsByClassName('js-lc-selectAddressTaiwanCity')[0].children;
            for(var i = 0; i < taiwanCityOptions.length; i++) {
              taiwanCityOptions[i].selected = (taiwanCityOptions[i].textContent == '${ ACCOUNT.province }');
              var e = document.createEvent('HTMLEvents');
              e.initEvent('change', true, true);
              taiwanCityOptions[i].dispatchEvent(e);
            }
          `);
        });
        driver.wait(webdriver.until.elementLocated(By.css('.js-lc-selectAddressTaiwanArea > option')), timeoutMSec)
          .then(() => {
            driver.executeScript(`
              var taiwanAreaOptions = document.getElementsByClassName('js-lc-selectAddressTaiwanArea')[0].children;
              for(var i = 0; i < taiwanAreaOptions.length; i++) {
                taiwanAreaOptions[i].selected = (taiwanAreaOptions[i].textContent == '${ ACCOUNT.area }');
                var e = document.createEvent('HTMLEvents');
                e.initEvent('change', true, true);
                taiwanAreaOptions[i].dispatchEvent(e);
              }
            `);
            $(By.name(name + '[street]')).sendKeys(ACCOUNT.street);
            if (typeof onComplete === 'function') {
              onComplete();
            }
          });
    } else {
      if (ACCOUNT.zip) {
        $(By.name(name + '[zipcode]')).sendKeys(ACCOUNT.zip);
      }
      $(By.name(name + '[locality]')).sendKeys(ACCOUNT.province + ACCOUNT.area);
      $(By.name(name + '[street]')).sendKeys(ACCOUNT.street);
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }
}

function toPasswordRequest () {
  return new Promise ((resolve, reject) => {
    driver.executeScript("window.scrollBy(0, 100)");
    $(By.css('a[href$="/auth/password_request"]')).click();
    driver.wait(webdriver.until.elementLocated(By.name('application_frontend_consumer_password_request_type[username]')), timeoutMSec)
      .then(() => {
        resolve();
      });
  });
}

function confirmPasswordRequest () {
  return new Promise ((resolve, reject) => {
    $(By.name('application_frontend_consumer_password_request_type[username]')).sendKeys(ACCOUNT.email);
    $(By.css('#form1 button:not([type="button"])')).click();
    driver.wait(webdriver.until.elementLocated(By.css('.lc-contentSection a[href="/"]')), timeoutMSec)
      .then(() => {
        resolve();
      });
  });
}

function toAdmin () {
  return new Promise ((resolve, reject) => {
    driver.executeScript(`
      location.href = '${ URL_ADMIN }';
    `).then(() => {
      driver.wait(webdriver.until.elementLocated(By.name('_username')), timeoutMSec)
        .then(() => {
          console.log('_username');
          $(By.name('_username')).sendKeys(ADMIN_USER.name);
          $(By.name('_password')).sendKeys(ADMIN_USER.password);
          $(By.name('login')).click();
          driver.wait(webdriver.until.elementLocated(By.id('spNav')), timeoutMSec)
            .then(() => {
              console.log('spNav');
              resolve();
            });
        })
        .catch(() => {
          resolve();
        });
    });
  });
}

function toAdminOrder () {
  return new Promise ((resolve, reject) => {
    $(By.css('a$="/admin/ec/order"')).click();
    driver.wait(webdriver.until.elementLocated(By.css('a$="/admin/ec/order?status=pending_del"')), timeoutMSec)
      .then(() => {
        resolve();
      });
  });
}