/**
 * ページスクロールの対象要素
 * @type {String}
 */

userAgent = window.navigator.userAgent.toLowerCase();
appVersion = window.navigator.appVersion.toLowerCase();
scrollBody = (userAgent.indexOf('msie') > -1 || userAgent.indexOf('trident') > -1 || userAgent.indexOf('firefox') > -1 ) ? 'html' : 'body';
/*　chrome61以上　*/
if (userAgent.indexOf('chrome') > -1 && userAgent.indexOf('edge') == -1) {
  var chromeVersion = appVersion.match(/chrome\/.* /);
  chromeVersion = chromeVersion[0].replace('chrome/', '').replace(' ', '');
  chromeVersion = Number(chromeVersion.split('.')[0]);
  if (chromeVersion >= 61) {
    scrollBody = 'html';
  }
}

/**
 * LaunchCart言語対応キーワード検索
 * @param {Object} options                                 オプション
 * @param {Object}   options.selector                      - セレクター
 * @param {Object}     options.selector.result             - 結果表示のセレクター
 * @param {String}       options.selector.result.title     -- 検索タイトル
 * @param {String}       options.selector.result.container -- 検索結果
 * @param {String}       options.selector.result.number    -- 件数
 * @param {String}       options.selector.result.start     -- 表示しているアイテムの最初の番号
 * @param {String}       options.selector.result.end       -- 表示しているアイテムの最後の番号
 * @param {Object}     options.selector.pager              - ページャ
 * @param {Object}   options.template                      テンプレートの参照先セレクター
 * @param {String}     options.template.searchResultTitle  - 検索結果のタイトル
 * @param {String}     options.template.searchResultsItem  - 検索結果
 * @param {String}     options.template.searchResultEmpty  - 検索結果が0だったときの表示
 * @param {Object}     options.template.pager              - ページャ
 * @param {String}       options.template.pager.item       -- 通常のボタン
 * @param {String}       options.template.pager.current    -- 選択中のボタン
 * @param {String}       options.template.pager.prev       -- 前へのボタン
 * @param {String}       options.template.pager.next       -- 次へのボタン
 * @param {Function}   options.onChangeSort                -- ソート変更時に実行
 */
var LcMultiLangSearch = function (options) {
  /**
   * コンストラクタ
   * @param {Object} default                       コンストラクタのデフォルト値
   * @param {String} keyword                       フォームに入力された検索キーワード
   * @param {Array}  keywords                      検索用に変換された検索キーワード
   * @param {String} lang                          対象言語の言語コード
   * @param {Array}  searchedKeys                  検索対象のキー
   * @param {Number} ajaxItemMax                   ajaxで一度に取得するアイテム件数の上限
   * @param {Array}  machedItems                   検索結果のリスト
   * @param {Number} itemRequestCount              検索対象のリクエスト回数
   * @param {Number} targetItemsCount              検索対象のアイテム数
   * @param {Number} acquiredItemsCount            取得済みの検索対象のアイテム数
   * @param {Number} viewedItemsCount              表示済みのアイテム数
   * @param {Object} pagerInfo                     ページャの情報
   * @param {Number}   pagerInfo.limit             - 1ページのアイテム表示数上限
   * @param {Number}   pagerInfo.current           - 表示中のページ
   * @param {Object} sort                          並び替え
   * @param {Object}   sort.order                  - 並び替えの順番(ASC or DESC)
   * @param {Object}   sort.key                    - 並び替えの対象キー
   * @param {Object} selector                      セレクター
   * @param {Object}   selector.result             - 結果表示のセレクター
   * @param {String}     selector.result.title     -- 検索タイトル
   * @param {String}     selector.result.container -- 検索結果
   * @param {String}     selector.result.number    -- 件数
   * @param {String}     selector.result.start     -- 表示しているアイテムの最初の番号
   * @param {String}     selector.result.end       -- 表示しているアイテムの最後の番号
   * @param {Object}   selector.pager              - ページャ
   * @param {Object} template                      テンプレート
   * @param {String}   template.searchResultTitle  - 検索結果のタイトル
   * @param {String}   template.searchResultsItem  - 検索結果のアイテムのテンプレート
   * @param {String}   template.template.searchResultEmpty  - 検索結果が0だったときの表示
   * @param {Object}   template.pager              - ページャのテンプレート
   * @param {String}     template.pager.item       -- 通常のボタン
   * @param {String}     template.pager.current    -- 選択中のボタン
   * @param {String}     template.pager.prev       -- 前へのボタン
   * @param {String}     template.pager.next       -- 次へのボタン
   * @param {Object} options                       初期設定
   * @param {Object} callback                      コールバック関数
   * @param {Function} callback.onPopState         - ポップステートが呼び出されたときに実行
   */
  this.default = {
    keyword: '',
    keywords:[],
    lang: '',
    searchedKeys: [],
    ajaxItemMax: 100,
    machedItems: [],
    itemRequestCount: 0,
    targetItemsCount: 0,
    acquiredItemsCount: 0,
    viewedItemsCount: 0,
    pagerInfo: {
      limit: 30,
      current: 1
    },
    sort: {
      order: 'DESC',
      key: 'releasedAt'
    },
    selector: {
      result: {
        title: '.js-searchTitle',
        container: '.js-seaarchResults',
        count: '.js-searchResultsNumber',
        start: '.js-searchResultsStart',
        end: '.js-searchResultsEnd'
      },
      pager: '.js-searchPager'
    },
    template: {
      searchResultTitle: 'Search Results of "{$ keywords $}"',
      searchResultsItem: '<li class="js-sesarchPager__item"><a href="{$ url $}"><figure class="js-sesarchPager__figure"><img src="{$ image $}"></figure><h3 class="js-sesarchPager__name">{$ name $}</h3><p class="js-sesarchPager__category">{$ category $}</p><p class="js-sesarchPager__price">{$ unit_front $}{$ price $}{$ unit_back $}</p></a>',
      searchResultsItem: '<p>No result is found.</p>',
      pager: {
        item: '<a href="{$ url $}">{$ number $}</a>',
        current: '<strong>{$ number $}</strong>',
        prev: '<a href="{$ url $}">&lt;</a>',
        next: '<a href="{$ url $}">&gt;</a>',
        first: '<a href="{$ url $}">&laquo;</a>',
        last: '<a href="{$ url $}">&raquo;</a>'
      }
    },
  }
  this.keyword = '';
  this.keywords = [];
  this.lang = this.default.lang;
  this.searchedKeys = [];
  this.ajaxItemMax = this.ajaxItemMax;
  this.machedItems = [];
  this.itemRequestCount = this.default.itemRequestCount;
  this.targetItemsCount = this.default.targetItemsCount;
  this.acquiredItemsCount = this.default.acquiredItemsCount;
  this.viewedItemsCount = this.default.viewedItemsCount;
  this.pagerInfo = {};
  this.sort = {};
  this.selector = {};
  this.template = {};
  this.options = options ? options : {};
  this.callback = {
    onPopState: options.onPopState
  };
}

LcMultiLangSearch.prototype = {

  /**
   * 初期実行
   */
  init: function () {
    var _this = this;

    // 初期値の設定
    _this.keywords = _this.cloneJSON(_this.default.keywords);
    _this.searchedKeys = _this.cloneJSON(_this.default.searchedKeys);
    _this.machedItems = _this.cloneJSON(_this.default.machedItems);
    _this.pagerInfo = _this.cloneJSON(_this.default.pagerInfo);
    _this.sort = _this.cloneJSON(_this.default.sort);
    _this.selector = ('selector' in _this.options) ? {
      result: ('result' in _this.options.selector) ? {
        title: _this.options.selector.result.title ? _this.options.selector.result.title : _this.default.selector.result.title,
        container: _this.options.selector.result.container ?_this.options.selector.result.container : _this.default.selector.result.container,
        count: _this.options.selector.result.count ? _this.options.selector.result.count : _this.default.selector.result.count,
        start: _this.options.selector.result.start ? _this.options.selector.result.start : _this.default.selector.result.start,
        end: _this.options.selector.result.end ? _this.options.selector.result.end : _this.default.selector.result.end
      } : _this.default.cloneJSON(_this.default.selector.result),
      pager: _this.options.selector.pager ? _this.options.selector.pager : _this.default.selector.pager
    } : _this.default.cloneJSON(_this.default.selector);
    _this.template = ('template' in _this.options) ? {
      searchResultTitle: typeof _this.options.template.searchResultTitle !== 'undefiled' ? $(_this.options.template.searchResultTitle).text() : _this.default.template.searchResultTitle,
      searchResultsItem: typeof _this.options.template.searchResultsItem !== 'undefiled' ? $(_this.options.template.searchResultsItem).text() : _this.default.template.searchResultsItem,
      searchResultEmpty: typeof _this.options.template.searchResultEmpty !== 'undefiled' ? $(_this.options.template.searchResultEmpty).text() : _this.default.template.searchResultEmpty,
      pager: ('pager' in _this.options.template) ? {
        item: typeof _this.options.template.pager.item !== 'undefiled' ? $(_this.options.template.pager.item).text() : _this.options.template.pager.item,
        current: typeof _this.options.template.pager.current !== 'undefiled' ? $(_this.options.template.pager.current).text() : _this.options.template.pager.current,
        prev: typeof _this.options.template.pager.prev !== 'undefiled' ? $(_this.options.template.pager.prev).text() : _this.options.template.pager.prev,
        next: typeof _this.options.template.pager.next !== 'undefiled' ? $(_this.options.template.pager.next).text() : _this.options.template.pager.next,
        first: typeof _this.options.template.pager.first !== 'undefiled' ? $(_this.options.template.pager.first).text() : _this.options.template.pager.first,
        last: typeof _this.options.template.pager.last !== 'undefiled' ? $(_this.options.template.pager.last).text() :_this.options.template.pager.last
      } : _this.default.cloneJSON(_this.default.template.pager)
    } : _this.default.cloneJSON(_this.default.template);
    _this.options = null; // 初期設定を開放

    var state = {
      'targetPageUrl': location.href
    }
    history.replaceState(state, '', location.href);

    // popstate 時のデータ更新
    window.onpopstate = function (e) {
      var params = _this.getUrlParams(e.state.targetPageUrl);
      var keyword = '';
      if (params) {
        keyword = 's' in params ? decodeURI(String(params.s).replace(/\+/g, ' ')) : _this.default.keyword;
        _this.pagerInfo.limit = 'limit' in params ? Number(params.limit) : _this.default.pagerInfo.limit;
        _this.pagerInfo.current = 'page' in params ? Number(params.page) : _this.default.pagerInfo.current;
        _this.sort.order = 'sort_order' in params ? params.sort_order : _this.default.sort.order;
        _this.sort.key = 'sort_key' in params ? params.sort_key : _this.default.sort.key;
      } else {
        _this.pagerInfo.limit = _this.default.pagerInfo.limit;
        _this.pagerInfo.current = _this.default.pagerInfo.current;
        _this.sort.order = _this.default.sort.order;
        _this.sort.key = _this.default.sort.key;
      }
      if (keyword != _this.keyword) {
        _this.go({
          keyword: keyword,
          lang: _this.lang,
          searchedKeys: _this.cloneJSON(_this.searchedKeys),
          ajaxItemMax: _this.ajaxItemMax,
          pagerInfo: _this.cloneJSON(_this.pagerInfo),
          isPopstate: true
        });
        $(_this.selector.result.title).html(_this.setItemValues(_this.template.searchResultTitle, {
          keyword: _this.keyword ? _this.keyword : false,
          no_keyword: _this.keyword ? false : true,
        }));
      }
      $(scrollBody).animate({
        scrollTop: 0
      }, 500, function () {
        _this.sortItems();
        _this.setResultItems(true);
        _this.setPagination();
        _this.callback.onPopState(_this);
      });
    }
    
    // ページャのイベント設定
    $(document).on('click', '.js-pager__item', function () {
      _this.pagerInfo.current = $(this).data('page');
      _this.changePagination();
      return false;
    });
    $(document).on('click', '.js-pager__prev', function () {
      _this.pagerInfo.current--;
      _this.changePagination();
      return false;
    });
    $(document).on('click', '.js-pager__next', function () {
      _this.pagerInfo.current++;
      _this.changePagination();
      return false;
    });
    $(document).on('click', '.js-pager__first', function () {
      _this.pagerInfo.current = 1;
      _this.changePagination();
      return false;
    });
    $(document).on('click', '.js-pager__last', function () {
      _this.pagerInfo.current = _this.getPagesNumber();
      _this.changePagination();
      return false;
    });
  },

  /**
   * 実行
   * @param {Object}  args              オプション
   * @param {String}    args.keyword      - 検索キーワード（スペース区切り）
   * @param {String}    args.lang         - 対象言語の言語コード
   * @param {Array}     args.searchedKeys - 検索対象のキー
   * @param {Number}    args.ajaxItemMax  - ajaxで一度に取得するアイテム件数の上限
   * @param {Object}    args.pagerInfo    - ページャの情報（パラメータはコンストラクタのpagerInfoと同じ）
   * @param {Object}    args.sort         - 並び替え（パラメータはコンストラクタのpagerInfoと同じ）
   * @param {Boolean}   args.isPopstate   - ポップステートからの実行のときはtrue
   * @param {Boolean}   args.isInit       - 初回実行のときはtrue
   */
  go: function (args) {
    var _this = this;
    _this.keywords = args.keyword ? _this.initKeyword(args.keyword) : _this.cloneJSON(_this.default.keywords);
    _this.lang = args.lang ? args.lang : _this.default.lang;
    _this.searchedKeys = args.searchedKeys ? args.searchedKeys : _this.default.cloneJSON(_this.default.searchedKeys);
    _this.ajaxItemMax = args.ajaxItemMax ? args.ajaxItemMax : _this.default.ajaxItemMax;
    if ('pagerInfo' in args) {
      _this.pagerInfo = {
        limit: args.pagerInfo.limit ? args.pagerInfo.limit : _this.default.pagerInfo.limit,
        current: args.pagerInfo.current ? args.pagerInfo.current : _this.default.pagerInfo.current
      }
    }
    if ('sort' in args) {
      _this.sort = {
        order: args.sort.order ? args.sort.order : _this.default.sort.order,
        key: args.sort.key ? args.sort.key : _this.default.sort.key
      }
    }
    _this.ajaxItemMax = args.ajaxItemMax ? args.ajaxItemMax : 100;
    if (_this.keyword != args.keyword) {
      _this.keyword =  args.keyword ? args.keyword : _this.default.keyword;
      if (!args.isPopstate && !args.isInit) {
        _this.setUrlParams();
      }
    } else {
      _this.keyword =  args.keyword ? args.keyword : _this.default.keyword;
    }
    $('.loading').addClass('is-active');
    var asyncLoop = function () {
      _this.getTargetItems()
        .done(function () {
          $('.js-searchCount').text(_this.machedItems.length);
          if (_this.acquiredItemsCount < _this.targetItemsCount) {
            _this.setResultItems();
            asyncLoop();
          } else {
            _this.setResultItems();
            $('.loading').removeClass('is-active');
            asyncLoop = null;
          }
        })
        .fail(function () {
          alert('通信エラーが発生しました。環境を変えて再度検索してください');
        });
    }
    $(_this.selector.result.title).html(_this.setItemValues(_this.template.searchResultTitle, {
      keyword: _this.keyword ? _this.sanitaize(_this.keyword) : false,
      no_keyword: _this.keyword ? false : true,
    }));
    _this.resetResults();
    asyncLoop();
  },

  /**
   * 検索データをリセット
   */
  resetResults: function () {
    var _this = this;
    _this.machedItems = _this.cloneJSON(_this.default.machedItems);
    _this.itemRequestCount = _this.default.itemRequestCount;
    _this.targetItemsCount = _this.default.targetItemsCount;
    _this.acquiredItemsCount = _this.default.acquiredItemsCount;
    _this.viewedItemsCount = _this.default.viewedItemsCount;
  },

  /**
   * 検索結果を表示
   * @param {Boolean} isForce アイテム取得数によらず、強制的に結果を入れ替える
   */
  setResultItems: function (isForce) {
    var _this = this;
    var searchResults = '';
    if (_this.machedItems.length) {
      if (isForce) {
        _this.viewedItemsCount = 0;
      }
      for (var i = _this.viewedItemsCount; i < _this.machedItems.length; i++) {
        var items = {
          url: _this.machedItems[i].url,
          image: _this.machedItems[i].image,
          name: _this.machedItems[i].name,
          category: _this.machedItems[i].categories[0].name,
          price: _this.machedItems[i].price,
          base_price: _this.machedItems[i].base_price,
          unit_front: _this.machedItems[i].unit_front
        }
        searchResults += _this.setItemValues(_this.template.searchResultsItem, items);
      }
      if (_this.viewedItemsCount == 0 || isForce) {
        $(_this.selector.result.container).html(searchResults);
      } else {
        $(_this.selector.result.container).append(searchResults);
      }
    } else {
      $(_this.selector.result.container).html(_this.template.searchResultEmpty);
    }
    _this.viewedItemsCount = _this.machedItems.length;
    _this.setPagination();
  },

  /**
   * ページネーションを設定
   */
  setPagination: function () {
    var _this = this;
    var start = (_this.pagerInfo.current - 1) * _this.pagerInfo.limit;
    var end = start + (_this.pagerInfo.limit - 1);
    var $items = $(_this.selector.result.container).children();
    if (end + 1 > $items.length) {
      end = $items.length - 1;
    }
    for (var i = 0; i < $items.length; i++) {
      if (i >= start && i <= end) {
        $items.eq(i).show();
      } else {
        $items.eq(i).hide();
      }
    }
    $(_this.selector.result.start).text(end != -1 ? start + 1 : 0);
    $(_this.selector.result.end).text(end + 1);
    _this.setPager();
  },

  /**
   * ページャを設定
   */
  setPager: function () {
    var _this = this;
    var pages = _this.getPagesNumber();
    var $pager = $(_this.selector.pager);
    var pathname = location.pathname;
    $pager.empty();
    if (pages == 1) {
      $pager.hide();
    } else {
      $pager.show();
    }
    if (_this.pagerInfo.current > 1) {
      var $first = $(_this.setItemValues(_this.template.pager.first, {
        url: pathname + '?' + _this.getSerializedUrlParams({ page: 1 })
      }));
      $pager.append($first);
      $first.addClass('js-pager__first');
      var $prev = $(_this.setItemValues(_this.template.pager.prev, {
        url: pathname + '?' + _this.getSerializedUrlParams({ page: _this.pagerInfo.current - 1 })
      }));
      $pager.append($prev);
      $prev.addClass('js-pager__prev');
    }
    for (var i = 1; i <= pages; i++) {
      if (i == _this.pagerInfo.current) {
        var $item = $(_this.setItemValues(_this.template.pager.current, {
          number: i,
          url: pathname + '?' + _this.getSerializedUrlParams({ page: i })
        }));
        $pager.append($item);
        $item.addClass('js-pager__current');
      } else {
        var $item = $(_this.setItemValues(_this.template.pager.item, {
          number: i,
          url: pathname + '?' + _this.getSerializedUrlParams({ page: i })
        }));
        $pager.append($item);
        $item
          .addClass('js-pager__item')
          .data('page', i);
      }
    }
    if (_this.pagerInfo.current < pages) {
      var $next = $(_this.setItemValues(_this.template.pager.next, {
        url: pathname + '?' + _this.getSerializedUrlParams({ page: _this.pagerInfo.current + 1 })
      }));
      $pager.append($next);
      $next.addClass('js-pager__next');
      var $last = $(_this.setItemValues(_this.template.pager.last, {
        url: pathname + '?' + _this.getSerializedUrlParams({ page: _this.pagerInfo.page })
      }));
      $pager.append($last);
      $last.addClass('js-pager__last');
    }

  },

  /**
   * ページ数を返す
   * @return {Number} ページ数
   */
  getPagesNumber: function () {
    var _this = this;
    return Math.ceil(_this.machedItems.length / _this.pagerInfo.limit);
  },

  /**
   * ページネーションの切り替えを実行
   */
  changePagination: function () {
    var _this = this;
    _this.setUrlParams();
    $(scrollBody).animate({
      scrollTop: 0
    }, 500, function () {
      _this.setPagination();
    });
  },

  /**
   * URLのパラメータを設定
   */
  setUrlParams: function () {
    var _this = this;
    var params = '?' +  _this.getSerializedUrlParams();
    var state = { 'targetPageUrl': location.pathname + params };
    history.pushState(state, '', location.pathname + params);
  },

  /**
   * URLのパラメータを取得
   * @param  {String}     url パラメータを取り出す
   * @return {Boolean|Object} URLパラメータをkey:valueのオブジェクトで返す。パラメータがないときは false
   */
  getUrlParams: function (url) {
    var search = url.split('?')[1];
    if (!search) {
      return false;
    }
    var params = {};
    search = search.split('&');
    for (var i = 0; i < search.length; i++) {
      var param = search[i].split('=');
      params[param[0]] = param[1];
    }
    return params;
  },

  /**
   * URLパラメータを取得
   * @param  {Object} customizedParam パラメータを調整して取得する場合は、調整するパラメータのキーと値をを連想配列で指定
   * @return {String} URLパラメータ
   */
  getSerializedUrlParams: function (customizedParam) {
    var _this = this;
    customizedParam = customizedParam ? customizedParam : {};
    var params = {
      s: ('s' in customizedParam) ? customizedParam.s : _this.keyword,
      limit: ('limit' in customizedParam) ? customizedParam.limit : _this.pagerInfo.limit,
      page: ('page' in customizedParam) ? customizedParam.page : _this.pagerInfo.current,
      sort_order: ('sort_order' in customizedParam) ? customizedParam.sort_order : _this.sort.order,
      sort_key:('sort_key' in customizedParam) ? customizedParam.sort_key : _this.sort.key
    };
    return $.param(params);
  },

  /**
   * 検索対象のアイテムを取得
   * @return {Promise} プロミスメソッド(jQuery版)
   */
  getTargetItems: function () {
    var _this = this;
    var d = new $.Deferred;
    $.ajax({
      url: '/search',
      method: 'GET',
      data: {
        range: (_this.itemRequestCount * _this.ajaxItemMax + 1) + '-' + (_this.itemRequestCount + 1) * _this.ajaxItemMax,
        lang: _this.lang
      },
      dataType: 'json'
    }).done(function (data) {
      if (data.status == 'ok') {
        _this.itemRequestCount++;
        if (_this.itemRequestCount == 1) {
          _this.targetItemsCount = data.products_count;
        }
        _this.acquiredItemsCount += data.products.length;
        _this.searchItems(data.products, function () {
          d.resolve();
        });
      }
    }).fail(function(jqXHR, textStatus, errorThrown) {
      console.error(textStatus + ': ' + errorThrown);
      d.rejected();
    });
    return d.promise();
  },
  
  /**
   * 検索対象のアイテムを取得
   * @return {Promise} プロミスメソッド(jQuery版)
   */
  searchItems: function (items, callback) {
    var _this = this;
    for (var i = 0; i < items.length; i++) {
      var machedKeywordsCount = 0;
      for (var ii = 0; ii < _this.keywords.length; ii++) {
        searchKeysLoop:
        for (var iii = 0; iii < _this.searchedKeys.length; iii++) {
          var key = _this.searchedKeys[iii];
          if (typeof items[i][key] == 'string') {
            if (_this.convertString(items[i][key].replace(/<("[^"]*"|'[^']*'|[^'">])*>/g,'')).indexOf(_this.keywords[ii]) > -1) {
              machedKeywordsCount++;
              break searchKeysLoop;
            }
          } else {
            for (key2 in items[i][key]) {
              if (_this.convertString(items[i][key][key2].name).indexOf(_this.keywords[ii]) > -1) {
                machedKeywordsCount++;
                break searchKeysLoop;
              }
            }
          }
        }
      }
      if (machedKeywordsCount == _this.keywords.length) {
        _this.machedItems.push(_this.cloneJSON(items[i]));
      }
    }
    items = null;
    _this.sortItems();
    callback();
  },

  /**
   * 検索結果の並び替え
   */
  sortItems: function () {
    var _this = this;
    var orderSign = _this.sort.order == 'DESC' ? -1 : 1;
    _this.machedItems.sort(function (a, b) {
      if (_this.sort.key == 'price') {
        return (Number(String(a.price).replace(',', '')) - Number(String(b.price).replace(',', ''))) * orderSign;
      } else if (_this.sort.key == 'releasedAt') {
        return (Date.parse(a.releasedAt) - Date.parse(b.releasedAt)) * orderSign;
      } else {
        return String(a[_this.sort.key]).localeCompare(b[_this.sort.key]) * orderSign;
      }
    });
  },

  /**
   * キーワードの初期設定
   *    スペース区切りによる配列化
   *    文字列を揃える（全角英数 => 半角英数, 半角カナ => 全角カナ, カタカナ => ひらがな）
   * @param  {String}  keyword
   * @return {Array}   設定されたキーワードの配列
   */
  initKeyword (keyword) {
    var _this = this;
    var keywords = keyword.replace(/　/g," ").split(' ');
    for (var i = 0; i < keywords.length; i++) {
      keywords[i] = _this.convertString(keywords[i]);
    }
    return keywords;
  },

  /**
   * 文字列を揃える
   *    https://github.com/niwaringo/moji を利用
   * @param  {String}  str 文字列を揃える
   * @return {String} 文字列を揃える
   */
  convertString (str) {
    str = str.toLowerCase();
    return moji(str).convert('ZEtoHE').convert('HKtoZK').convert('KKtoHG').toString();
  },
  
  /**
  * - テンプレートの {$ キー $} にアイテムの値を置換
  * - テンプレートの {¥ if: キー ¥}{¥ endif ¥}で囲まれた箇所を
  *     値が true のときは表示、false のときは非表示
  * @param  {String} template アイテムのテンプレート
  * @param  {Object} item     アイテムのデータ
  * @return {String}          実際の値が入ったアイテムの文字列
  */
  setItemValues (template, item) {
    for(var key in item) {
      template = template.replace(new RegExp("\\{\\$ *" + key + " *\\$\\}", "g"), item[key]);
      template = template.replace(
        new RegExp("\\{\\¥ *if: *" + key + " *\\¥\\}[\\s\\S]*?\\{\\¥ *endif *\\¥\\}", "g"),
        function (match) {
          return item[key] ? match.replace(new RegExp("\\{\\¥ *if: *" + key + " *\\¥\\}", "g"), '').replace(/\{\¥ *endif *\¥\}/, '') : '';
        }
      )
    }
    template = template.replace(/\{\$.*?\$\}/g, "").replace(/\{\¥ *if:[\s\S]*?endif *\¥\}/g, "");
    return template;
  },

  /**
   * JSONとして配列もしくはオブジェクトをクローン
   * @param  {Array|Object} obj クローンしたい配列もしくはオブジェクト
   * @return {Array|Object} JSONとしてクローンされた配列もしくはオブジェクト
   */
  cloneJSON: function (obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * 文字列をサニタイジングして返します
   * @param  {String} str サニタイジングしたい文字列
   * @return {String} サニタイジングされた文字列
   */
  sanitaize: function (str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  },

}