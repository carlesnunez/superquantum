(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
/*!
 * Platform.js v1.3.0 <http://mths.be/platform>
 * Copyright 2010-2014 John-David Dalton <http://allyoucanleet.com/>
 * Available under MIT license <http://mths.be/mit>
 */
;(function() {
  'use strict';

  /** Used to determine if values are of the language type `Object` */
  var objectTypes = {
    'function': true,
    'object': true
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Backup possible global object */
  var oldRoot = root;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = freeExports && freeModule && typeof global == 'object' && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal || freeGlobal.self === freeGlobal)) {
    root = freeGlobal;
  }

  /**
   * Used as the maximum length of an array-like object.
   * See the [ES6 spec](http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
   * for more details.
   */
  var maxSafeInteger = Math.pow(2, 53) - 1;

  /** Opera regexp */
  var reOpera = /\bOpera/;

  /** Possible global object */
  var thisBinding = this;

  /** Used for native method references */
  var objectProto = Object.prototype;

  /** Used to check for own properties of an object */
  var hasOwnProperty = objectProto.hasOwnProperty;

  /** Used to resolve the internal `[[Class]]` of values */
  var toString = objectProto.toString;

  /*--------------------------------------------------------------------------*/

  /**
   * Capitalizes a string value.
   *
   * @private
   * @param {string} string The string to capitalize.
   * @returns {string} The capitalized string.
   */
  function capitalize(string) {
    string = String(string);
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  /**
   * A utility function to clean up the OS name.
   *
   * @private
   * @param {string} os The OS name to clean up.
   * @param {string} [pattern] A `RegExp` pattern matching the OS name.
   * @param {string} [label] A label for the OS.
   */
  function cleanupOS(os, pattern, label) {
    // platform tokens defined at
    // http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    // http://web.archive.org/web/20081122053950/http://msdn.microsoft.com/en-us/library/ms537503(VS.85).aspx
    var data = {
      '6.4':  '10',
      '6.3':  '8.1',
      '6.2':  '8',
      '6.1':  'Server 2008 R2 / 7',
      '6.0':  'Server 2008 / Vista',
      '5.2':  'Server 2003 / XP 64-bit',
      '5.1':  'XP',
      '5.01': '2000 SP1',
      '5.0':  '2000',
      '4.0':  'NT',
      '4.90': 'ME'
    };
    // detect Windows version from platform tokens
    if (pattern && label && /^Win/i.test(os) &&
        (data = data[0/*Opera 9.25 fix*/, /[\d.]+$/.exec(os)])) {
      os = 'Windows ' + data;
    }
    // correct character case and cleanup
    os = String(os);

    if (pattern && label) {
      os = os.replace(RegExp(pattern, 'i'), label);
    }

    os = format(
      os.replace(/ ce$/i, ' CE')
        .replace(/\bhpw/i, 'web')
        .replace(/\bMacintosh\b/, 'Mac OS')
        .replace(/_PowerPC\b/i, ' OS')
        .replace(/\b(OS X) [^ \d]+/i, '$1')
        .replace(/\bMac (OS X)\b/, '$1')
        .replace(/\/(\d)/, ' $1')
        .replace(/_/g, '.')
        .replace(/(?: BePC|[ .]*fc[ \d.]+)$/i, '')
        .replace(/\bx86\.64\b/gi, 'x86_64')
        .replace(/\b(Windows Phone) OS\b/, '$1')
        .split(' on ')[0]
    );

    return os;
  }

  /**
   * An iteration utility for arrays and objects.
   *
   * @private
   * @param {Array|Object} object The object to iterate over.
   * @param {Function} callback The function called per iteration.
   */
  function each(object, callback) {
    var index = -1,
        length = object ? object.length : 0;

    if (typeof length == 'number' && length > -1 && length <= maxSafeInteger) {
      while (++index < length) {
        callback(object[index], index, object);
      }
    } else {
      forOwn(object, callback);
    }
  }

  /**
   * Trim and conditionally capitalize string values.
   *
   * @private
   * @param {string} string The string to format.
   * @returns {string} The formatted string.
   */
  function format(string) {
    string = trim(string);
    return /^(?:webOS|i(?:OS|P))/.test(string)
      ? string
      : capitalize(string);
  }

  /**
   * Iterates over an object's own properties, executing the `callback` for each.
   *
   * @private
   * @param {Object} object The object to iterate over.
   * @param {Function} callback The function executed per own property.
   */
  function forOwn(object, callback) {
    for (var key in object) {
      if (hasOwnProperty.call(object, key)) {
        callback(object[key], key, object);
      }
    }
  }

  /**
   * Gets the internal `[[Class]]` of a value.
   *
   * @private
   * @param {*} value The value.
   * @returns {string} The `[[Class]]`.
   */
  function getClassOf(value) {
    return value == null
      ? capitalize(value)
      : toString.call(value).slice(8, -1);
  }

  /**
   * Host objects can return type values that are different from their actual
   * data type. The objects we are concerned with usually return non-primitive
   * types of "object", "function", or "unknown".
   *
   * @private
   * @param {*} object The owner of the property.
   * @param {string} property The property to check.
   * @returns {boolean} Returns `true` if the property value is a non-primitive, else `false`.
   */
  function isHostType(object, property) {
    var type = object != null ? typeof object[property] : 'number';
    return !/^(?:boolean|number|string|undefined)$/.test(type) &&
      (type == 'object' ? !!object[property] : true);
  }

  /**
   * Prepares a string for use in a `RegExp` by making hyphens and spaces optional.
   *
   * @private
   * @param {string} string The string to qualify.
   * @returns {string} The qualified string.
   */
  function qualify(string) {
    return String(string).replace(/([ -])(?!$)/g, '$1?');
  }

  /**
   * A bare-bones `Array#reduce` like utility function.
   *
   * @private
   * @param {Array} array The array to iterate over.
   * @param {Function} callback The function called per iteration.
   * @returns {*} The accumulated result.
   */
  function reduce(array, callback) {
    var accumulator = null;
    each(array, function(value, index) {
      accumulator = callback(accumulator, value, index, array);
    });
    return accumulator;
  }

  /**
   * Removes leading and trailing whitespace from a string.
   *
   * @private
   * @param {string} string The string to trim.
   * @returns {string} The trimmed string.
   */
  function trim(string) {
    return String(string).replace(/^ +| +$/g, '');
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Creates a new platform object.
   *
   * @memberOf platform
   * @param {Object|string} [ua=navigator.userAgent] The user agent string or
   *  context object.
   * @returns {Object} A platform object.
   */
  function parse(ua) {

    /** The environment context object */
    var context = root;

    /** Used to flag when a custom context is provided */
    var isCustomContext = ua && typeof ua == 'object' && getClassOf(ua) != 'String';

    // juggle arguments
    if (isCustomContext) {
      context = ua;
      ua = null;
    }

    /** Browser navigator object */
    var nav = context.navigator || {};

    /** Browser user agent string */
    var userAgent = nav.userAgent || '';

    ua || (ua = userAgent);

    /** Used to flag when `thisBinding` is the [ModuleScope] */
    var isModuleScope = isCustomContext || thisBinding == oldRoot;

    /** Used to detect if browser is like Chrome */
    var likeChrome = isCustomContext
      ? !!nav.likeChrome
      : /\bChrome\b/.test(ua) && !/internal|\n/i.test(toString.toString());

    /** Internal `[[Class]]` value shortcuts */
    var objectClass = 'Object',
        airRuntimeClass = isCustomContext ? objectClass : 'ScriptBridgingProxyObject',
        enviroClass = isCustomContext ? objectClass : 'Environment',
        javaClass = (isCustomContext && context.java) ? 'JavaPackage' : getClassOf(context.java),
        phantomClass = isCustomContext ? objectClass : 'RuntimeObject';

    /** Detect Java environment */
    var java = /\bJava/.test(javaClass) && context.java;

    /** Detect Rhino */
    var rhino = java && getClassOf(context.environment) == enviroClass;

    /** A character to represent alpha */
    var alpha = java ? 'a' : '\u03b1';

    /** A character to represent beta */
    var beta = java ? 'b' : '\u03b2';

    /** Browser document object */
    var doc = context.document || {};

    /**
     * Detect Opera browser (Presto-based)
     * http://www.howtocreate.co.uk/operaStuff/operaObject.html
     * http://dev.opera.com/articles/view/opera-mini-web-content-authoring-guidelines/#operamini
     */
    var opera = context.operamini || context.opera;

    /** Opera `[[Class]]` */
    var operaClass = reOpera.test(operaClass = (isCustomContext && opera) ? opera['[[Class]]'] : getClassOf(opera))
      ? operaClass
      : (opera = null);

    /*------------------------------------------------------------------------*/

    /** Temporary variable used over the script's lifetime */
    var data;

    /** The CPU architecture */
    var arch = ua;

    /** Platform description array */
    var description = [];

    /** Platform alpha/beta indicator */
    var prerelease = null;

    /** A flag to indicate that environment features should be used to resolve the platform */
    var useFeatures = ua == userAgent;

    /** The browser/environment version */
    var version = useFeatures && opera && typeof opera.version == 'function' && opera.version();

    /** A flag to indicate if the OS ends with "/ Version" */
    var isSpecialCasedOS;

    /* Detectable layout engines (order is important) */
    var layout = getLayout([
      'Trident',
      { 'label': 'WebKit', 'pattern': 'AppleWebKit' },
      'iCab',
      'Presto',
      'NetFront',
      'Tasman',
      'KHTML',
      'Gecko'
    ]);

    /* Detectable browser names (order is important) */
    var name = getName([
      'Adobe AIR',
      'Arora',
      'Avant Browser',
      'Breach',
      'Camino',
      'Epiphany',
      'Fennec',
      'Flock',
      'Galeon',
      'GreenBrowser',
      'iCab',
      'Iceweasel',
      { 'label': 'SRWare Iron', 'pattern': 'Iron' },
      'K-Meleon',
      'Konqueror',
      'Lunascape',
      'Maxthon',
      'Midori',
      'Nook Browser',
      'PhantomJS',
      'Raven',
      'Rekonq',
      'RockMelt',
      'SeaMonkey',
      { 'label': 'Silk', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Sleipnir',
      'SlimBrowser',
      'Sunrise',
      'Swiftfox',
      'WebPositive',
      'Opera Mini',
      { 'label': 'Opera Mini', 'pattern': 'OPiOS' },
      'Opera',
      { 'label': 'Opera', 'pattern': 'OPR' },
      'Chrome',
      { 'label': 'Chrome Mobile', 'pattern': '(?:CriOS|CrMo)' },
      { 'label': 'Firefox', 'pattern': '(?:Firefox|Minefield)' },
      { 'label': 'IE', 'pattern': 'IEMobile' },
      { 'label': 'IE', 'pattern': 'MSIE' },
      'Safari'
    ]);

    /* Detectable products (order is important) */
    var product = getProduct([
      { 'label': 'BlackBerry', 'pattern': 'BB10' },
      'BlackBerry',
      { 'label': 'Galaxy S', 'pattern': 'GT-I9000' },
      { 'label': 'Galaxy S2', 'pattern': 'GT-I9100' },
      { 'label': 'Galaxy S3', 'pattern': 'GT-I9300' },
      { 'label': 'Galaxy S4', 'pattern': 'GT-I9500' },
      'Google TV',
      'Lumia',
      'iPad',
      'iPod',
      'iPhone',
      'Kindle',
      { 'label': 'Kindle Fire', 'pattern': '(?:Cloud9|Silk-Accelerated)' },
      'Nook',
      'PlayBook',
      'PlayStation 4',
      'PlayStation 3',
      'PlayStation Vita',
      'TouchPad',
      'Transformer',
      { 'label': 'Wii U', 'pattern': 'WiiU' },
      'Wii',
      'Xbox One',
      { 'label': 'Xbox 360', 'pattern': 'Xbox' },
      'Xoom'
    ]);

    /* Detectable manufacturers */
    var manufacturer = getManufacturer({
      'Apple': { 'iPad': 1, 'iPhone': 1, 'iPod': 1 },
      'Amazon': { 'Kindle': 1, 'Kindle Fire': 1 },
      'Asus': { 'Transformer': 1 },
      'Barnes & Noble': { 'Nook': 1 },
      'BlackBerry': { 'PlayBook': 1 },
      'Google': { 'Google TV': 1 },
      'HP': { 'TouchPad': 1 },
      'HTC': {},
      'LG': {},
      'Microsoft': { 'Xbox': 1, 'Xbox One': 1 },
      'Motorola': { 'Xoom': 1 },
      'Nintendo': { 'Wii U': 1,  'Wii': 1 },
      'Nokia': { 'Lumia': 1 },
      'Samsung': { 'Galaxy S': 1, 'Galaxy S2': 1, 'Galaxy S3': 1, 'Galaxy S4': 1 },
      'Sony': { 'PlayStation 4': 1, 'PlayStation 3': 1, 'PlayStation Vita': 1 }
    });

    /* Detectable OSes (order is important) */
    var os = getOS([
      'Windows Phone ',
      'Android',
      'CentOS',
      'Debian',
      'Fedora',
      'FreeBSD',
      'Gentoo',
      'Haiku',
      'Kubuntu',
      'Linux Mint',
      'Red Hat',
      'SuSE',
      'Ubuntu',
      'Xubuntu',
      'Cygwin',
      'Symbian OS',
      'hpwOS',
      'webOS ',
      'webOS',
      'Tablet OS',
      'Linux',
      'Mac OS X',
      'Macintosh',
      'Mac',
      'Windows 98;',
      'Windows '
    ]);

    /*------------------------------------------------------------------------*/

    /**
     * Picks the layout engine from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected layout engine.
     */
    function getLayout(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the manufacturer from an array of guesses.
     *
     * @private
     * @param {Array} guesses An object of guesses.
     * @returns {null|string} The detected manufacturer.
     */
    function getManufacturer(guesses) {
      return reduce(guesses, function(result, value, key) {
        // lookup the manufacturer by product or scan the UA for the manufacturer
        return result || (
          value[product] ||
          value[0/*Opera 9.25 fix*/, /^[a-z]+(?: +[a-z]+\b)*/i.exec(product)] ||
          RegExp('\\b' + qualify(key) + '(?:\\b|\\w*\\d)', 'i').exec(ua)
        ) && key;
      });
    }

    /**
     * Picks the browser name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected browser name.
     */
    function getName(guesses) {
      return reduce(guesses, function(result, guess) {
        return result || RegExp('\\b' + (
          guess.pattern || qualify(guess)
        ) + '\\b', 'i').exec(ua) && (guess.label || guess);
      });
    }

    /**
     * Picks the OS name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected OS name.
     */
    function getOS(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + '(?:/[\\d.]+|[ \\w.]*)', 'i').exec(ua)
            )) {
          result = cleanupOS(result, pattern, guess.label || guess);
        }
        return result;
      });
    }

    /**
     * Picks the product name from an array of guesses.
     *
     * @private
     * @param {Array} guesses An array of guesses.
     * @returns {null|string} The detected product name.
     */
    function getProduct(guesses) {
      return reduce(guesses, function(result, guess) {
        var pattern = guess.pattern || qualify(guess);
        if (!result && (result =
              RegExp('\\b' + pattern + ' *\\d+[.\\w_]*', 'i').exec(ua) ||
              RegExp('\\b' + pattern + '(?:; *(?:[a-z]+[_-])?[a-z]+\\d+|[^ ();-]*)', 'i').exec(ua)
            )) {
          // split by forward slash and append product version if needed
          if ((result = String((guess.label && !RegExp(pattern, 'i').test(guess.label)) ? guess.label : result).split('/'))[1] && !/[\d.]+/.test(result[0])) {
            result[0] += ' ' + result[1];
          }
          // correct character case and cleanup
          guess = guess.label || guess;
          result = format(result[0]
            .replace(RegExp(pattern, 'i'), guess)
            .replace(RegExp('; *(?:' + guess + '[_-])?', 'i'), ' ')
            .replace(RegExp('(' + guess + ')[-_.]?(\\w)', 'i'), '$1 $2'));
        }
        return result;
      });
    }

    /**
     * Resolves the version using an array of UA patterns.
     *
     * @private
     * @param {Array} patterns An array of UA patterns.
     * @returns {null|string} The detected version.
     */
    function getVersion(patterns) {
      return reduce(patterns, function(result, pattern) {
        return result || (RegExp(pattern +
          '(?:-[\\d.]+/|(?: for [\\w-]+)?[ /-])([\\d.]+[^ ();/_-]*)', 'i').exec(ua) || 0)[1] || null;
      });
    }

    /**
     * Returns `platform.description` when the platform object is coerced to a string.
     *
     * @name toString
     * @memberOf platform
     * @returns {string} Returns `platform.description` if available, else an empty string.
     */
    function toStringPlatform() {
      return this.description || '';
    }

    /*------------------------------------------------------------------------*/

    // convert layout to an array so we can add extra details
    layout && (layout = [layout]);

    // detect product names that contain their manufacturer's name
    if (manufacturer && !product) {
      product = getProduct([manufacturer]);
    }
    // clean up Google TV
    if ((data = /\bGoogle TV\b/.exec(product))) {
      product = data[0];
    }
    // detect simulators
    if (/\bSimulator\b/i.test(ua)) {
      product = (product ? product + ' ' : '') + 'Simulator';
    }
    // detect Opera Mini 8+ running in Turbo/Uncompressed mode on iOS
    if (name == 'Opera Mini' && /\bOPiOS\b/.test(ua)) {
      description.push('running in Turbo/Uncompressed mode');
    }
    // detect iOS
    if (/^iP/.test(product)) {
      name || (name = 'Safari');
      os = 'iOS' + ((data = / OS ([\d_]+)/i.exec(ua))
        ? ' ' + data[1].replace(/_/g, '.')
        : '');
    }
    // detect Kubuntu
    else if (name == 'Konqueror' && !/buntu/i.test(os)) {
      os = 'Kubuntu';
    }
    // detect Android browsers
    else if (manufacturer && manufacturer != 'Google' &&
        ((/Chrome/.test(name) && !/\bMobile Safari\b/i.test(ua)) || /\bVita\b/.test(product))) {
      name = 'Android Browser';
      os = /\bAndroid\b/.test(os) ? os : 'Android';
    }
    // detect false positives for Firefox/Safari
    else if (!name || (data = !/\bMinefield\b|\(Android;/i.test(ua) && /\b(?:Firefox|Safari)\b/.exec(name))) {
      // escape the `/` for Firefox 1
      if (name && !product && /[\/,]|^[^(]+?\)/.test(ua.slice(ua.indexOf(data + '/') + 8))) {
        // clear name of false positives
        name = null;
      }
      // reassign a generic name
      if ((data = product || manufacturer || os) &&
          (product || manufacturer || /\b(?:Android|Symbian OS|Tablet OS|webOS)\b/.test(os))) {
        name = /[a-z]+(?: Hat)?/i.exec(/\bAndroid\b/.test(os) ? os : data) + ' Browser';
      }
    }
    // detect Firefox OS
    if ((data = /\((Mobile|Tablet).*?Firefox\b/i.exec(ua)) && data[1]) {
      os = 'Firefox OS';
      if (!product) {
        product = data[1];
      }
    }
    // detect non-Opera versions (order is important)
    if (!version) {
      version = getVersion([
        '(?:Cloud9|CriOS|CrMo|IEMobile|Iron|Opera ?Mini|OPiOS|OPR|Raven|Silk(?!/[\\d.]+$))',
        'Version',
        qualify(name),
        '(?:Firefox|Minefield|NetFront)'
      ]);
    }
    // detect stubborn layout engines
    if (layout == 'iCab' && parseFloat(version) > 3) {
      layout = ['WebKit'];
    } else if (
        layout != 'Trident' &&
        (data =
          /\bOpera\b/.test(name) && (/\bOPR\b/.test(ua) ? 'Blink' : 'Presto') ||
          /\b(?:Midori|Nook|Safari)\b/i.test(ua) && 'WebKit' ||
          !layout && /\bMSIE\b/i.test(ua) && (os == 'Mac OS' ? 'Tasman' : 'Trident')
        )
    ) {
      layout = [data];
    }
    // detect NetFront on PlayStation
    else if (/\bPlayStation\b(?! Vita\b)/i.test(name) && layout == 'WebKit') {
      layout = ['NetFront'];
    }
    // detect Windows Phone 7 desktop mode
    if (name == 'IE' && (data = (/; *(?:XBLWP|ZuneWP)(\d+)/i.exec(ua) || 0)[1])) {
      name += ' Mobile';
      os = 'Windows Phone ' + (/\+$/.test(data) ? data : data + '.x');
      description.unshift('desktop mode');
    }
    // detect Windows Phone 8+ desktop mode
    else if (/\bWPDesktop\b/i.test(ua)) {
      name = 'IE Mobile';
      os = 'Windows Phone 8+';
      description.unshift('desktop mode');
      version || (version = (/\brv:([\d.]+)/.exec(ua) || 0)[1]);
    }
    // detect IE 11 and above
    else if (name != 'IE' && layout == 'Trident' && (data = /\brv:([\d.]+)/.exec(ua))) {
      if (!/\bWPDesktop\b/i.test(ua)) {
        if (name) {
          description.push('identifying as ' + name + (version ? ' ' + version : ''));
        }
        name = 'IE';
      }
      version = data[1];
    }
    // detect IE Tech Preview
    else if ((name == 'Chrome' || name != 'IE') && (data = /\bEdge\/([\d.]+)/.exec(ua))) {
      name = 'IE';
      version = data[1];
      layout = ['Trident'];
      description.unshift('platform preview');
    }
    // leverage environment features
    if (useFeatures) {
      // detect server-side environments
      // Rhino has a global function while others have a global object
      if (isHostType(context, 'global')) {
        if (java) {
          data = java.lang.System;
          arch = data.getProperty('os.arch');
          os = os || data.getProperty('os.name') + ' ' + data.getProperty('os.version');
        }
        if (isModuleScope && isHostType(context, 'system') && (data = [context.system])[0]) {
          os || (os = data[0].os || null);
          try {
            data[1] = context.require('ringo/engine').version;
            version = data[1].join('.');
            name = 'RingoJS';
          } catch(e) {
            if (data[0].global.system == context.system) {
              name = 'Narwhal';
            }
          }
        }
        else if (typeof context.process == 'object' && (data = context.process)) {
          name = 'Node.js';
          arch = data.arch;
          os = data.platform;
          version = /[\d.]+/.exec(data.version)[0];
        }
        else if (rhino) {
          name = 'Rhino';
        }
      }
      // detect Adobe AIR
      else if (getClassOf((data = context.runtime)) == airRuntimeClass) {
        name = 'Adobe AIR';
        os = data.flash.system.Capabilities.os;
      }
      // detect PhantomJS
      else if (getClassOf((data = context.phantom)) == phantomClass) {
        name = 'PhantomJS';
        version = (data = data.version || null) && (data.major + '.' + data.minor + '.' + data.patch);
      }
      // detect IE compatibility modes
      else if (typeof doc.documentMode == 'number' && (data = /\bTrident\/(\d+)/i.exec(ua))) {
        // we're in compatibility mode when the Trident version + 4 doesn't
        // equal the document mode
        version = [version, doc.documentMode];
        if ((data = +data[1] + 4) != version[1]) {
          description.push('IE ' + version[1] + ' mode');
          layout && (layout[1] = '');
          version[1] = data;
        }
        version = name == 'IE' ? String(version[1].toFixed(1)) : version[0];
      }
      os = os && format(os);
    }
    // detect prerelease phases
    if (version && (data =
          /(?:[ab]|dp|pre|[ab]\d+pre)(?:\d+\+?)?$/i.exec(version) ||
          /(?:alpha|beta)(?: ?\d)?/i.exec(ua + ';' + (useFeatures && nav.appMinorVersion)) ||
          /\bMinefield\b/i.test(ua) && 'a'
        )) {
      prerelease = /b/i.test(data) ? 'beta' : 'alpha';
      version = version.replace(RegExp(data + '\\+?$'), '') +
        (prerelease == 'beta' ? beta : alpha) + (/\d+\+?/.exec(data) || '');
    }
    // detect Firefox Mobile
    if (name == 'Fennec' || name == 'Firefox' && /\b(?:Android|Firefox OS)\b/.test(os)) {
      name = 'Firefox Mobile';
    }
    // obscure Maxthon's unreliable version
    else if (name == 'Maxthon' && version) {
      version = version.replace(/\.[\d.]+/, '.x');
    }
    // detect Silk desktop/accelerated modes
    else if (name == 'Silk') {
      if (!/\bMobi/i.test(ua)) {
        os = 'Android';
        description.unshift('desktop mode');
      }
      if (/Accelerated *= *true/i.test(ua)) {
        description.unshift('accelerated');
      }
    }
    // detect Xbox 360 and Xbox One
    else if (/\bXbox\b/i.test(product)) {
      os = null;
      if (product == 'Xbox 360' && /\bIEMobile\b/.test(ua)) {
        description.unshift('mobile mode');
      }
    }
    // add mobile postfix
    else if ((/^(?:Chrome|IE|Opera)$/.test(name) || name && !product && !/Browser|Mobi/.test(name)) &&
        (os == 'Windows CE' || /Mobi/i.test(ua))) {
      name += ' Mobile';
    }
    // detect IE platform preview
    else if (name == 'IE' && useFeatures && context.external === null) {
      description.unshift('platform preview');
    }
    // detect BlackBerry OS version
    // http://docs.blackberry.com/en/developers/deliverables/18169/HTTP_headers_sent_by_BB_Browser_1234911_11.jsp
    else if ((/\bBlackBerry\b/.test(product) || /\bBB10\b/.test(ua)) && (data =
          (RegExp(product.replace(/ +/g, ' *') + '/([.\\d]+)', 'i').exec(ua) || 0)[1] ||
          version
        )) {
      data = [data, /BB10/.test(ua)];
      os = (data[1] ? (product = null, manufacturer = 'BlackBerry') : 'Device Software') + ' ' + data[0];
      version = null;
    }
    // detect Opera identifying/masking itself as another browser
    // http://www.opera.com/support/kb/view/843/
    else if (this != forOwn && (
          product != 'Wii' && (
            (useFeatures && opera) ||
            (/Opera/.test(name) && /\b(?:MSIE|Firefox)\b/i.test(ua)) ||
            (name == 'Firefox' && /\bOS X (?:\d+\.){2,}/.test(os)) ||
            (name == 'IE' && (
              (os && !/^Win/.test(os) && version > 5.5) ||
              /\bWindows XP\b/.test(os) && version > 8 ||
              version == 8 && !/\bTrident\b/.test(ua)
            ))
          )
        ) && !reOpera.test((data = parse.call(forOwn, ua.replace(reOpera, '') + ';'))) && data.name) {

      // when "indentifying", the UA contains both Opera and the other browser's name
      data = 'ing as ' + data.name + ((data = data.version) ? ' ' + data : '');
      if (reOpera.test(name)) {
        if (/\bIE\b/.test(data) && os == 'Mac OS') {
          os = null;
        }
        data = 'identify' + data;
      }
      // when "masking", the UA contains only the other browser's name
      else {
        data = 'mask' + data;
        if (operaClass) {
          name = format(operaClass.replace(/([a-z])([A-Z])/g, '$1 $2'));
        } else {
          name = 'Opera';
        }
        if (/\bIE\b/.test(data)) {
          os = null;
        }
        if (!useFeatures) {
          version = null;
        }
      }
      layout = ['Presto'];
      description.push(data);
    }
    // detect WebKit Nightly and approximate Chrome/Safari versions
    if ((data = (/\bAppleWebKit\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
      // correct build for numeric comparison
      // (e.g. "532.5" becomes "532.05")
      data = [parseFloat(data.replace(/\.(\d)$/, '.0$1')), data];
      // nightly builds are postfixed with a `+`
      if (name == 'Safari' && data[1].slice(-1) == '+') {
        name = 'WebKit Nightly';
        prerelease = 'alpha';
        version = data[1].slice(0, -1);
      }
      // clear incorrect browser versions
      else if (version == data[1] ||
          version == (data[2] = (/\bSafari\/([\d.]+\+?)/i.exec(ua) || 0)[1])) {
        version = null;
      }
      // use the full Chrome version when available
      data[1] = (/\bChrome\/([\d.]+)/i.exec(ua) || 0)[1];
      // detect Blink layout engine
      if (data[0] == 537.36 && data[2] == 537.36 && parseFloat(data[1]) >= 28 && name != 'IE') {
        layout = ['Blink'];
      }
      // detect JavaScriptCore
      // http://stackoverflow.com/questions/6768474/how-can-i-detect-which-javascript-engine-v8-or-jsc-is-used-at-runtime-in-androi
      if (!useFeatures || (!likeChrome && !data[1])) {
        layout && (layout[1] = 'like Safari');
        data = (data = data[0], data < 400 ? 1 : data < 500 ? 2 : data < 526 ? 3 : data < 533 ? 4 : data < 534 ? '4+' : data < 535 ? 5 : data < 537 ? 6 : data < 538 ? 7 : data < 601 ? 8 : '8');
      } else {
        layout && (layout[1] = 'like Chrome');
        data = data[1] || (data = data[0], data < 530 ? 1 : data < 532 ? 2 : data < 532.05 ? 3 : data < 533 ? 4 : data < 534.03 ? 5 : data < 534.07 ? 6 : data < 534.10 ? 7 : data < 534.13 ? 8 : data < 534.16 ? 9 : data < 534.24 ? 10 : data < 534.30 ? 11 : data < 535.01 ? 12 : data < 535.02 ? '13+' : data < 535.07 ? 15 : data < 535.11 ? 16 : data < 535.19 ? 17 : data < 536.05 ? 18 : data < 536.10 ? 19 : data < 537.01 ? 20 : data < 537.11 ? '21+' : data < 537.13 ? 23 : data < 537.18 ? 24 : data < 537.24 ? 25 : data < 537.36 ? 26 : layout != 'Blink' ? '27' : '28');
      }
      // add the postfix of ".x" or "+" for approximate versions
      layout && (layout[1] += ' ' + (data += typeof data == 'number' ? '.x' : /[.+]/.test(data) ? '' : '+'));
      // obscure version for some Safari 1-2 releases
      if (name == 'Safari' && (!version || parseInt(version) > 45)) {
        version = data;
      }
    }
    // detect Opera desktop modes
    if (name == 'Opera' &&  (data = /\bzbov|zvav$/.exec(os))) {
      name += ' ';
      description.unshift('desktop mode');
      if (data == 'zvav') {
        name += 'Mini';
        version = null;
      } else {
        name += 'Mobile';
      }
      os = os.replace(RegExp(' *' + data + '$'), '');
    }
    // detect Chrome desktop mode
    else if (name == 'Safari' && /\bChrome\b/.exec(layout && layout[1])) {
      description.unshift('desktop mode');
      name = 'Chrome Mobile';
      version = null;

      if (/\bOS X\b/.test(os)) {
        manufacturer = 'Apple';
        os = 'iOS 4.3+';
      } else {
        os = null;
      }
    }
    // strip incorrect OS versions
    if (version && version.indexOf((data = /[\d.]+$/.exec(os))) == 0 &&
        ua.indexOf('/' + data + '-') > -1) {
      os = trim(os.replace(data, ''));
    }
    // add layout engine
    if (layout && !/\b(?:Avant|Nook)\b/.test(name) && (
        /Browser|Lunascape|Maxthon/.test(name) ||
        /^(?:Adobe|Arora|Breach|Midori|Opera|Phantom|Rekonq|Rock|Sleipnir|Web)/.test(name) && layout[1])) {
      // don't add layout details to description if they are falsey
      (data = layout[layout.length - 1]) && description.push(data);
    }
    // combine contextual information
    if (description.length) {
      description = ['(' + description.join('; ') + ')'];
    }
    // append manufacturer
    if (manufacturer && product && product.indexOf(manufacturer) < 0) {
      description.push('on ' + manufacturer);
    }
    // append product
    if (product) {
      description.push((/^on /.test(description[description.length -1]) ? '' : 'on ') + product);
    }
    // parse OS into an object
    if (os) {
      data = / ([\d.+]+)$/.exec(os);
      isSpecialCasedOS = data && os.charAt(os.length - data[0].length - 1) == '/';
      os = {
        'architecture': 32,
        'family': (data && !isSpecialCasedOS) ? os.replace(data[0], '') : os,
        'version': data ? data[1] : null,
        'toString': function() {
          var version = this.version;
          return this.family + ((version && !isSpecialCasedOS) ? ' ' + version : '') + (this.architecture == 64 ? ' 64-bit' : '');
        }
      };
    }
    // add browser/OS architecture
    if ((data = /\b(?:AMD|IA|Win|WOW|x86_|x)64\b/i.exec(arch)) && !/\bi686\b/i.test(arch)) {
      if (os) {
        os.architecture = 64;
        os.family = os.family.replace(RegExp(' *' + data), '');
      }
      if (
          name && (/\bWOW64\b/i.test(ua) ||
          (useFeatures && /\w(?:86|32)$/.test(nav.cpuClass || nav.platform) && !/\bWin64; x64\b/i.test(ua)))
      ) {
        description.unshift('32-bit');
      }
    }

    ua || (ua = null);

    /*------------------------------------------------------------------------*/

    /**
     * The platform object.
     *
     * @name platform
     * @type Object
     */
    var platform = {};

    /**
     * The platform description.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.description = ua;

    /**
     * The name of the browser's layout engine.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.layout = layout && layout[0];

    /**
     * The name of the product's manufacturer.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.manufacturer = manufacturer;

    /**
     * The name of the browser/environment.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.name = name;

    /**
     * The alpha/beta release indicator.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.prerelease = prerelease;

    /**
     * The name of the product hosting the browser.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.product = product;

    /**
     * The browser's user agent string.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.ua = ua;

    /**
     * The browser/environment version.
     *
     * @memberOf platform
     * @type string|null
     */
    platform.version = name && version;

    /**
     * The name of the operating system.
     *
     * @memberOf platform
     * @type Object
     */
    platform.os = os || {

      /**
       * The CPU architecture the OS is built for.
       *
       * @memberOf platform.os
       * @type number|null
       */
      'architecture': null,

      /**
       * The family of the OS.
       *
       * Common values include:
       * "Windows", "Windows Server 2008 R2 / 7", "Windows Server 2008 / Vista",
       * "Windows XP", "OS X", "Ubuntu", "Debian", "Fedora", "Red Hat", "SuSE",
       * "Android", "iOS" and "Windows Phone"
       *
       * @memberOf platform.os
       * @type string|null
       */
      'family': null,

      /**
       * The version of the OS.
       *
       * @memberOf platform.os
       * @type string|null
       */
      'version': null,

      /**
       * Returns the OS string.
       *
       * @memberOf platform.os
       * @returns {string} The OS string.
       */
      'toString': function() { return 'null'; }
    };

    platform.parse = parse;
    platform.toString = toStringPlatform;

    if (platform.version) {
      description.unshift(version);
    }
    if (platform.name) {
      description.unshift(name);
    }
    if (os && name && !(os == String(os).split(' ')[0] && (os == name.split(' ')[0] || product))) {
      description.push(product ? '(' + os + ')' : 'on ' + os);
    }
    if (description.length) {
      platform.description = description.join(' ');
    }
    return platform;
  }

  /*--------------------------------------------------------------------------*/

  // export platform
  // some AMD build optimizers, like r.js, check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // define as an anonymous module so, through path mapping, it can be aliased
    define(function() {
      return parse();
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Narwhal, Node.js, Rhino -require, or RingoJS
    forOwn(parse(), function(value, key) {
      freeExports[key] = value;
    });
  }
  // in a browser or Rhino
  else {
    root.platform = parse();
  }
}.call(this));

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],2:[function(require,module,exports){
(function (global){
var Event,
    Sister = require('sister');

Event = function Event (config) {
    var event,
        lastEnd,
        eventEmitter;

    if (!(this instanceof Event)) {
        return new Event(config);
    }

    eventEmitter = Sister();

    event = this;
    event.on = eventEmitter.on;

    config = config || {};

    /**
     * @var {Number} Number of iterations the subject of interval inspection must not mutate to fire "orientationchangeend".
     */
    config.noChangeCountToEnd = config.noChangeCountToEnd || 100;
    /**
     * @var {Number} Number of milliseconds after which fire the "orientationchangeend" if interval inspection did not do it before.
     */
    config.noEndTimeout = 1000 || config.noEndTimeout;
    /**
     * @var {Boolean} Enables logging of the events.
     */
    config.debug = config.debug || false;

    global
        .addEventListener('orientationchange', function () {
            var interval,
                timeout,
                end,
                lastInnerWidth,
                lastInnerHeight,
                noChangeCount;

            end = function (dispatchEvent) {
                clearInterval(interval);
                clearTimeout(timeout);

                interval = null;
                timeout = null;

                if (dispatchEvent) {
                    eventEmitter.trigger('orientationchangeend');
                }
            };

            // If there is a series of orientationchange events fired one after another,
            // where n event orientationchangeend event has not been fired before the n+2 orientationchange,
            // then orientationchangeend will fire only for the last orientationchange event in the series.
            if (lastEnd) {
                lastEnd(false);
            }

            lastEnd = end;

            interval = setInterval(function () {
                if (global.innerWidth === lastInnerWidth && global.innerHeight === lastInnerHeight) {
                    noChangeCount++;

                    if (noChangeCount === config.noChangeCountToEnd) {
                        if (config.debug) {
                            console.debug('setInterval');
                        }

                        end(true);
                    }
                } else {
                    lastInnerWidth = global.innerWidth;
                    lastInnerHeight = global.innerHeight;
                    noChangeCount = 0;
                }
            });
            timeout = setTimeout(function () {
                if (config.debug) {
                    console.debug('setTimeout');
                }

                end(true);
            }, config.noEndTimeout);
        });
}

global.gajus = global.gajus || {};
global.gajus.orientationchangeend = Event;

module.exports = Event;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"sister":3}],3:[function(require,module,exports){
(function (global){
/**
* @link https://github.com/gajus/sister for the canonical source repository
* @license https://github.com/gajus/sister/blob/master/LICENSE BSD 3-Clause
*/
function Sister () {
    var sister = {},
        events = {};

    /**
     * @name handler
     * @function
     * @param {Object} data Event data.
     */

    /**
     * @param {String} name Event name.
     * @param {handler} handler
     * @return {listener}
     */
    sister.on = function (name, handler) {
        var listener = {name: name, handler: handler};
        events[name] = events[name] || [];
        events[name].unshift(listener);
        return listener;
    };

    /**
     * @param {listener}
     */
    sister.off = function (listener) {
        var index = events[listener.name].indexOf(listener);

        if (index != -1) {
            events[listener.name].splice(index, 1);
        }
    };

    /**
     * @param {String} name Event name.
     * @param {Object} data Event data.
     */
    sister.trigger = function (name, data) {
        var listeners = events[name],
            i;

        if (listeners) {
            i = listeners.length;
            while (i--) {
                listeners[i].handler(data);
            }
        }
    };

    return sister;
}

global.gajus = global.gajus || {};
global.gajus.Sister = Sister;

module.exports = Sister;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
(function (global){
'use strict';

/* global global, document */

var Scream,
    Sister = require('sister'),
    OCE = require('orientationchangeend')();

Scream = function Scream (config) {
    var scream,
        eventEmitter;

    if (!(this instanceof Scream)) {
        return new Scream(config);
    }

    scream = this;

    eventEmitter = Sister();

    config = config || {};

    config.width = config.width || {};

    if (!config.width.portrait) {
        config.width.portrait = global.screen.width;
    }

    if (!config.width.landscape) {
        config.width.landscape = global.screen.width;
    }

    /**
     * Viewport width relative to the device orientation.
     *
     * @return {Number}
     */
    scream.getViewportWidth = function () {
        return config.width[scream.getOrientation()];
    };

    /**
     * Viewport height relative to the device orientation and to scale with the viewport width.
     *
     * @return {Number}
     */
    scream.getViewportHeight = function () {
        return Math.round(scream.getScreenHeight() / scream.getScale());
    };

    /**
     * The ratio between screen width and viewport width.
     *
     * @return {Number}
     */
    scream.getScale = function () {
        return scream.getScreenWidth() / scream.getViewportWidth();
    };

    /**
     * @return {String} portrait|landscape
     */
    scream.getOrientation = function () {
        return global.orientation === 0 || global.orientation === 180 ? 'portrait' : 'landscape';
    };

    /**
     * Screen width relative to the device orientation.
     *
     * @return {Number}
     */
    scream.getScreenWidth = function () {
        return global.screen[scream.getOrientation() === 'portrait' ? 'width' : 'height'];
    };

    /**
     * Screen width relative to the device orientation.
     *
     * @return {Number}
     */
    scream.getScreenHeight = function () {
        return global.screen[scream.getOrientation() === 'portrait' ? 'height' : 'width'];
    };

    /**
     * Generates a viewport tag reflecting the content width relative to the device orientation
     * and scale required to fit the content in the viewport.
     *
     * Appends the tag to the document.head and removes the preceding additions.
     */
    scream._updateViewport = function () {
        var oldViewport,
            viewport,
            width,
            scale,
            content;

        width = scream.getViewportWidth();
        scale = scream.getScale();

        content =
             'width=' + width +
            ', initial-scale=' + scale +
            ', minimum-scale=' + scale +
            ', maximum-scale=' + scale +
            ', user-scalable=0';

        viewport = document.createElement('meta');
        viewport.name = 'viewport';
        viewport.content = content;

        oldViewport = global.document.head.querySelector('meta[name="viewport"]');

        if (oldViewport) {
            oldViewport.parentNode.removeChild(oldViewport);
        }

        global.document.head.appendChild(viewport);
    };

    /**
     * Uses static device environment variables (screen.width, screen.height, devicePixelRatio) to recognize device spec.
     *
     * @return {Array} spec
     * @return {Number} spec[0] window.innerWidth when device is in a portrait orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[1] window.innerHeight when device is in a portrait orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[2] window.innerWidth when device is in a landscape orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[3] window.innerHeight when device is in a landscape orientation, scale 0.25 and page is the minimal view
     * @return {Number} spec[4] screen.width
     * @return {Number} spec[5] screen.height
     * @return {Number} spec[6] devicePixelRatio
     * @return {String} spec[7] name
     */
    scream._deviceSpec = function () {
        var specs,
            spec,
            i;

        specs = [
            [1280, 1762, 1920, 1280, 320, 480, 2, 'iPhone 4'],
            [1280, 2114, 2272, 1280, 320, 568, 2, 'iPhone 5 or 5s'],
            [1500, 2510, 2668, 1500, 375, 667, 2, 'iPhone 6'],
            [1656, 2785, 2944, 1656, 414, 736, 3, 'iPhone 6 plus'],
            [3072, 3936, 4096, 2912, 768, 1024, 1, 'iPad 2'],
            [3072, 3938, 4096, 2914, 768, 1024, 2, 'iPad Air or Retina']
        ];

        i = specs.length;

        while (i--) {
            if (global.screen.width === specs[i][4] &&
                global.screen.height === specs[i][5] &&
                global.devicePixelRatio === specs[i][6]) {
                spec = specs[i];

                break;
            }
        }

        return spec;
    };

    /**
     * Returns height of the usable viewport in the minimal view relative to the current viewport width.
     *
     * This method will work with iOS8 only.
     *
     * @see http://stackoverflow.com/questions/26827822/how-is-the-window-innerheight-derived-of-the-minimal-view/26827842
     * @see http://stackoverflow.com/questions/26801943/how-to-get-the-window-size-of-fullscream-view-when-not-in-fullscream
     * @return {Number}
     */
    scream._getMinimalViewHeight = function () {
        var spec,
            height,
            orientation = scream.getOrientation();

        spec = scream._deviceSpec();

        if (!spec) {
            throw new Error('Not a known iOS device. If you are using an iOS device, report it to https://github.com/gajus/scream/issues/1.');
        }

        if (orientation === 'portrait') {
            height = Math.round(scream.getViewportWidth() * spec[1] / spec[0]);
        } else {
            height = Math.round(scream.getViewportWidth() * spec[3] / spec[2]);
        }

        return height;
    };

    /**
     * Returns dimensions of the usable viewport in the minimal view relative to the current viewport width and orientation.
     *
     * @return {Object} dimensions
     * @return {Number} dimensions.width
     * @return {Number} dimensions.height
     */
    scream.getMinimalViewSize = function () {
        var width = scream.getViewportWidth(),
            height = scream._getMinimalViewHeight();

        return {
            width: width,
            height: height
        };
    };

    /**
     * Returns true if screen is in "minimal" UI.
     *
     * iOS 8 has removed the minimal-ui viewport property.
     * Nevertheless, user can enter minimal-ui using touch-drag-down gesture.
     * This method is used to detect if user is in minimal-ui view.
     *
     * In case of orientation change, the state of the view can be accurately
     * determined only after orientationchangeend event.
     *
     * @return {Boolean}
     */
    scream.isMinimalView = function () {
        // It is enough to check the height, because the viewport is based on width.
        return global.innerHeight === scream.getMinimalViewSize().height;
    };

    /**
     * Detect when view changes from full to minimal and vice-versa.
     */
    scream._detectViewChange = function () {
        var lastView;

        // This method will only with iOS 8.
        // Overwrite the event handler to prevent an error.
        if (!scream._deviceSpec()) {
            console.log('View change detection has been disabled. Unrecognized device. If you are using an iOS device, report it to https://github.com/gajus/scream/issues/1.');

            return function () {};
        }

        return function () {
            var currentView = scream.isMinimalView() ? 'minimal' : 'full';

            if (lastView !== currentView) {
                eventEmitter.trigger('viewchange', {
                    viewName: currentView
                });

                lastView = currentView;
            }
        };
    };

    scream._detectViewChange = scream._detectViewChange();

    scream._setupDOMEventListeners = function () {
        var isOrientationChanging;

        // Media matcher is the first to pick up the orientation change.
        global
            .matchMedia('(orientation: portrait)')
            .addListener(function () {
                isOrientationChanging = true;
            });

        OCE.on('orientationchangeend', function () {
            isOrientationChanging = false;

            scream._updateViewport();
            scream._detectViewChange();

            eventEmitter.trigger('orientationchangeend');
        });

        global.addEventListener('orientationchange', function () {
            scream._updateViewport();
        });

        global.addEventListener('resize', function () {
            if (!isOrientationChanging) {
                scream._detectViewChange();
            }
        });

        // iPhone 6 plus does not trigger resize event when leaving the minimal-ui in the landscape orientation.
        global.addEventListener('scroll', function () {
            if (!isOrientationChanging) {
                scream._detectViewChange();
            }
        });

        setTimeout(function () {
            scream._detectViewChange();
        });
    };

    scream._updateViewport();
    scream._setupDOMEventListeners();

    scream.on = eventEmitter.on;
};

global.gajus = global.gajus || {};
global.gajus.Scream = Scream;

module.exports = Scream;

}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"orientationchangeend":2,"sister":3}],5:[function(require,module,exports){
var powerups = require('./powerups');

module.exports = {
    assets: {
        atlas: [
            {
                name: 'chest',
                png: 'assets/sprites/chest.png',
                json: 'assets/sprites/chest.json'
            },
            {
                name: 'spaceship',
                png: 'assets/images/spaceship.png',
                json: 'assets/images/spaceship.json'
            },
            {
                name: 'playBtn',
                png: 'assets/images/playBtn.png',
                json: 'assets/images/playBtn.json'
            },
            {
                name: 'creditsBtn',
                png: 'assets/images/credits.png',
                json: 'assets/images/credits.json'
            },
            {
                name: 'achievementsBtn',
                png: 'assets/images/achievements.png',
                json: 'assets/images/achievements.json'
            },
            {
                name: 'soundButton',
                png: 'assets/images/audio.png',
                json: 'assets/images/audio.json'
            },
            {
                name: 'soundButton',
                png: 'assets/sprites/character/heads_boy.png',
                json: 'assets/sprites/character/heads_boy.json'
            },
            {
                name: 'electro',
                png: 'assets/images/electrobullet.png',
                json: 'assets/images/electrobullet.json'
            },
            {
                name: 'heads_man',
                png: 'assets/sprites/character/head_man.png',
                json: 'assets/sprites/character/head_man.json'
            },
            {
                name: 'heads_woman',
                png: 'assets/sprites/character/girl_head.png',
                json: 'assets/sprites/character/girl_head.json'
            },
            {
                name: 'body_man',
                png: 'assets/sprites/character/anim_man.png',
                json: 'assets/sprites/character/anim_man.json'
            },
            {
                name: 'body_woman',
                png: 'assets/sprites/character/anim_woman.png',
                json: 'assets/sprites/character/anim_woman.json'
            },
            {
                name: 'newLvlBtn',
                png: 'assets/sprites/newlvl_button.png',
                json: 'assets/sprites/newlvl_button.json'
            },
            {

                name: 'platform_anim',
                png: 'assets/sprites/starting_platform.png',
                json: 'assets/sprites/starting_platform.json'
            },
            {
                name: 'menuButtonGameOver',
                png: 'assets/images/menuButtonGameOver.png',
                json: 'assets/images/menuButtonGameOver.json'
            },
            {
                name: 'replayButtonGameOver',
                png: 'assets/images/replayButtonGameOver.png',
                json: 'assets/images/replayButtonGameOver.json'
            },
            {
                name: 'incubatorButtonGameOver',
                png: 'assets/images/incubatorButtonGameOver.png',
                json: 'assets/images/incubatorButtonGameOver.json'
            },
            {
                name: 'deadAnimation',
                png: 'assets/images/dead_anim.png',
                json: 'assets/images/dead_anim.json'
            },
            {
                name: 'monster1',
                png: 'assets/sprites/enemies/monster1.png',
                json: 'assets/sprites/enemies/monster1.json'
            },
            {
                name: 'monster2',
                png: 'assets/sprites/enemies/monster2.png',
                json: 'assets/sprites/enemies/monster2.json'
            },
            {
                name: 'coinRewards',
                png: 'assets/sprites/coin.png',
                json: 'assets/sprites/coin.json'
            },
            {
                name: 'reload',
                png: 'assets/images/reload.png',
                json: 'assets/images/reload.json'
            },
            {
                name: 'title',
                png: 'assets/images/title_anim.png',
                json: 'assets/images/title_anim.json'
            }

        ],
        fonts: [],
        images: [
            {
                name: 'bgPowerup',
                path: 'assets/images/porwerup_bg.png'
            },
            {
                name: 'creditsBG',
                path: 'assets/images/creditsBG.png'
            },
            {
                name: 'bullet',
                path: 'assets/images/bullet5.png'
            },
            {
                name: 'explosion',
                path: 'assets/images/explosion.png'
            },
            {
                name: 'lifebar',
                path: 'assets/images/hud/life_bar.png'
            },
            {
                name: 'shieldbar',
                path: 'assets/images/hud/shield_bar.png'
            },
            {
                name: 'hudBG',
                path: 'assets/images/hud/hud_bg.png'
            },
            {
                name: 'coinsHud',
                path: 'assets/images/hud/coin_hud.png'
            },
            {
                name: 'heart_hud',
                path: 'assets/images/hud/powerups/heart_hud.png'
            },
            {
                name: 'shield_hud',
                path: 'assets/images/hud/powerups/shield_hud.png'
            },
            {
                name: 'weaponspeed_hud',
                path: 'assets/images/hud/powerups/weaponspeed_hud.png'
            },
            {
                name: 'moreammo_hud',
                path: 'assets/images/hud/powerups/moreammo_hud.png'
            },
            {
                name: 'speed_hud',
                path: 'assets/images/hud/powerups/speed_hud.png'
            },
            {
                name: 'weapondamage_hud',
                path: 'assets/images/hud/powerups/weapondamage_hud.png'
            },
            {
                name: 'electroGunHud',
                path: 'assets/images/hud/weapons/electroGunHud.png'
            },
            {
                name: 'threeGunHud',
                path: 'assets/images/hud/weapons/revolverHud.png'
            },
            {
                name: 'shotgunHud',
                path: 'assets/images/hud/weapons/electroGunHud.png'
            },
            {
                name: 'superSpryGunHud',
                path: 'assets/images/hud/weapons/revolverHud.png'
            },
            {
                name: 'machineGunHud',
                path: 'assets/images/hud/weapons/electroGunHud.png'
            },
            {
                name: 'revolverHud',
                path: 'assets/images/hud/weapons/revolverHud.png'
            },
            {
                name: 'menuButton',
                path: 'assets/images/menu.png'
            },
            {
                name: 'playButton',
                path: 'assets/images/playBtn.png'
            },
            {
                name: 'player',
                path: 'assets/images/moco.png'
            },
            {
                name: 'trap',
                path: 'assets/images/trap1.png'
            },
            {
                name: 'bgStars1',
                path: 'assets/images/bg-stars1.png'
            },
            {
                name: 'bgStars2',
                path: 'assets/images/bg-stars2.png'
            },
            {
                name: 'planet1',
                path: 'assets/images/planet.png'
            },
            {
                name: 'planet2',
                path: 'assets/images/ring.png'
            },
            {
                name: 'teleport',
                path: 'assets/images/teleport.png'
            },
            {
                name: 'electro_gun',
                path: 'assets/images/item_weapon.png'
            },
            {
                name: 'bgGameOver',
                path: 'assets/images/bgGameOver.png'
            },
            {
                name: 'ammo',
                path: 'assets/images/ammo.png'
            },
            {
                name: 'electrogun',
                path: 'assets/images/guns/electrogun.png'
            },
            {
                name: 'machinegun',
                path: 'assets/images/guns/machinegun.png'
            },
            {
                name: 'pistol',
                path: 'assets/images/guns/pistol.png'
            },
            {
                name: 'revolver',
                path: 'assets/images/guns/revolver.png'
            },
            {
                name: 'shotgun',
                path: 'assets/images/guns/shotgun.png'
            },
            {
                name: 'supersprygun',
                path: 'assets/images/guns/spraygun.png'
            },
            {
                name: 'threegun',
                path: 'assets/images/guns/3shoot.png'
            },
            {
                name: 'bulletmachinegun',
                path: 'assets/images/bullets/bulletmachinegun.png'
            },
            {
                name: 'bulletpistol',
                path: 'assets/images/bullets/bulletpistol.png'
            },
            {
                name: 'bulletrevolver',
                path: 'assets/images/bullets/bulletrevolver.png'
            },
            {
                name: 'bulletshotgun',
                path: 'assets/images/bullets/bulletshotgun.png'
            },
            {
                name: 'bulletspray',
                path: 'assets/images/bullets/bulletspray.png'
            },
            {
                name: 'live_box',
                path: 'assets/images/live_box.png'
            },
            {
                name: 'electrogunFloor',
                path: 'assets/images/guns/electrogunarm.png'
            },
            {
                name: 'machinegunFloor',
                path: 'assets/images/guns/machinegunarm.png'
            },
            {
                name: 'pistolFloor',
                path: 'assets/images/guns/pistolarm.png'
            },
            {
                name: 'revolverFloor',
                path: 'assets/images/guns/revolverarm.png'
            },
            {
                name: 'superSpryGunFloor',
                path: 'assets/images/guns/spraygunarm.png'
            },
            {
                name: 'threeGunFloor',
                path: 'assets/images/guns/3shootarm.png'
            },
            {
                name: 'shotgunFloor',
                path: 'assets/images/guns/shotgunarm.png'
            },
            {
                name: 'snakeBullet',
                path: 'assets/images/snakeBullet.png'
            }


        ],

        sounds: [
            {id: 'select', path: 'assets/sounds/selectbtn.mp3'},
            {id: 'electro', path: 'assets/sounds/electro.mp3'},
            {id: 'normalBall', path: 'assets/sounds/bomb.mp3'},
            {id: 'menuSong', path: 'assets/sounds/menusong.mp3'},
            {id: 'playSong1', path: 'assets/sounds/game1.mp3'},
            {id: 'selectClick', path: 'assets/sounds/selectClick.mp3'}
        ],
        spritesheets: [
            {
                'name': 'player',
                path: 'assets/images/moco.png',
                width: 32,
                height: 32
            }
        ]
    },
    game: {
        // 16:9
        width: 960,
        height: 720,
        wrapperDiv: 'content'
    },

    hud: {
        offsetX: 20, offsetY: 20,
        coins: {
            asset: "coinsHud",
            x: 22,
            y: 120
        }
    },
    character: {
        spriteName: 'body_',
        width: 60,
        heigth: 20,
        offsetX: 5,
        offsetY: 44,
        health: 10,
        speed: 250,
        sandSpeed: 62.5,
        scale: 1,
        body: {
            spriteName  : 'body',
            x: 0,
            y: 0
        },
        head: {
            spriteName: 'heads_',
            frame: '0',
            totalHeads: 9,
            totalHeads: 9,
            x: 0,
            y: 0
        },
        animations: [
            {
                name: 'idle',
                sequence: [0],
                fps: 12,
                loop: true
            },
            {
                name: 'move',
                sequence: [1, 2, 3, 4, 5, 6],
                fps: 12,
                loop: true
            },
            {
                name: 'dead',
                sequence: [0],
                fps: 12,
                loop: false
            },
            {
                name: 'hurt',
                sequence: [0],
                fps: 12,
                loop: false
            }
        ]
    },
    chest: {
        xOffset: 20,
        yOffsset: 0,
        spriteName: 'chest',
        openFrame: 'chest0003.png',
        closeFrame: 'chest0000.png'
    },
    enemies: [
        {
            name: 'snake',
            spriteName: 'monster1',
            frame: '1_monster',
            health: 1,
            speed: 50,
            scale: 1,
            radius: 300,
            shotRadius: 450,
            bulletSpeed: 300,
            fireRate: 2000,
            damage: 1,
            weight: {
                x: 1,
                y: 1
            },
            level: 1,
            body: {
                width: 20,
                heigth: 10,
                offsetX: 0,
                offsetY: 16
            },
            animations: [
                {

                    name: 'idle',
                    sequence: [0],
                    fps: 12,
                    loop: true
                },
                {
                    name: 'move',
                    sequence: [0, 1, 2],
                    fps: 12,
                    loop: true
                },
                {
                    name: 'attack',
                    sequence: [3, 4, 5, 6],
                    fps: 12,
                    loop: true
                }
            ]
        },
        {
            name: 'scorpion',
            spriteName: 'monster2',
            frame: '2_monster',
            health: 2,
            speed: 100,
            scale: 1,
            radius: 300,
            shotRadius: 450,
            bulletSpeed: 300,
            fireRate: 600,
            damage: 2,
            weight: {
                x: -1,
                y: -1
            },
            level: 2,
            body: {
                width: 20,
                heigth: 10,
                offsetX: 0,
                offsetY: 16
            },
            animations: [
                {

                    name: 'idle',
                    sequence: [0],
                    fps: 12,
                    loop: true
                },
                {
                    name: 'move',
                    sequence: [0, 1, 2],
                    fps: 12,
                    loop: true
                },
                {
                    name: 'attack',
                    sequence: [3, 4, 5, 6],
                    fps: 12,
                    loop: true
                }
            ]
        }
    ],

    gameOver: {
        background: {
            x: 0,
            y: 0
        },
        menuButton: {
            anchorX: 0.5,
            anchorY: 0.5,

            y: 550
        },
        replayButton: {
            anchorX: 0.5,
            anchorY: 0.5,
            y: 500
        },
        incubatorButton: {
            anchorX: 0.5,
            anchorY: 0.5,

            y: 450
        }
    },
    trap: {
        width: 128,
        height: 128,
        spriteName: 'trap'
    },
    teleport: {
        spriteName: 'teleport'
    },
    weapons: {
        pistol: {
            speed: 900,
            asset: "",
            nextFire: 0,
            fireRate: 50,
            bulletCounter: 0,
            totalBullets: 500,
            bulletsPerCharger: 100,
            gunName: "Revolver",
            name: "revolverHud",
            maxObjects: 64,
            bulletAsset: 'bulletpistol',
            damage: 1,
            oneShootPerClick: true,
            sprite: "pistol",
            floorSprite: "pistolFloor"
        },
        revolver: {
            speed: 700,
            asset: "",
            nextFire: 0,
            fireRate: 400,
            bulletCounter: 0,
            totalBullets: 100,
            bulletsPerCharger: 20,
            gunName: "Revolver",
            name: "revolverHud",
            maxObjects: 64,
            bulletAsset: 'bulletrevolver',
            damage: 5,
            oneShootPerClick: true,
            sprite: "revolver",
            floorSprite: "revolverFloor"
        },
        machineGun: {
            speed: 800,
            asset: "",
            nextFire: 0,
            fireRate: 120,
            bulletCounter: 0,
            totalBullets: 500,
            bulletsPerCharger: 100,
            gunName: "MachineGun",
            name: "machineGunHud",
            maxObjects: 64,
            bulletAsset: 'bulletspray',
            damage: 3,
            oneShootPerClick: false,
            sprite: "machinegun",
            floorSprite: "machinegunFloor"
        },
        superSpryGun: {
            speed: 900,
            asset: "",
            nextFire: 0,
            fireRate: 80,
            bulletCounter: 0,
            totalBullets: 100,
            bulletsPerCharger: 100,
            gunName: "SuperSpryGun",
            name: "superSpryGunHud",
            maxObjects: 5000,
            bulletAsset: 'bulletspray',
            damage: 1,
            oneShootPerClick: false,
            sprite: "supersprygun",
            floorSprite: "superSpryGunFloor"
        },
        shotgun: {
            speed: 800,
            asset: "",
            nextFire: 0,
            fireRate: 1000,
            bulletCounter: 0,
            totalBullets: 100,
            bulletsPerCharger: 20,
            gunName: "Shotgun",
            name: "shotgunHud",
            maxObjects: 20,
            bulletAsset: 'bulletshotgun',
            damage: 10,
            oneShootPerClick: true,
            sprite: "shotgun",
            floorSprite: "shotgunFloor"
        },
        threeGun: {
            speed: 800,
            asset: "",
            nextFire: 0,
            fireRate: 1000,
            bulletCounter: 0,
            totalBullets: 250,
            bulletsPerCharger: 50,
            gunName: "ThreeGun",
            name: "threeGunHud",
            maxObjects: 64,
            bulletAsset: 'bulletspray',
            damage: 3,
            oneShootPerClick: false,
            sprite: "threegun",
            floorSprite: "threeGunFloor"
        },
        electroGun: {
            speed: 100,
            asset: "",
            nextFire: 0,
            fireRate: 800,
            bulletCounter: 0,
            totalBullets: 5,
            bulletsPerCharger: 1,
            gunName: "ElectroGun",
            name: "electroGunHud",
            maxObjects: 20,
            bulletAsset: 'bullet',
            damage: 20,
            oneShootPerClick: false,
            sprite: "electrogun",
            floorSprite: "electrogunFloor"
        }
    },
    powerups: powerups,
    firstDataGameState: {
        life: 100,
        shield: 1,
        currentLevel: 1,
        powerUps: {
            health: 0,
            shield: 0,
            firerate: 0,
            ammunition: 0,
            speed: 0,
            damage: 0
        }
    },
    challengeSystem: {
        levelStep: 2,
        initialEnemies: 15,
        enemiesIncrement: 5,
        enemySpeedIncrementFactor: 1.1,
        enemyLiveIncrementFactor: 1.1,
        enemyDamageIncrementFactor: 1.1
    }
};
},{"./powerups":6}],6:[function(require,module,exports){
module.exports = {
	spriteNameBtn: 'newLvlBtn',
	btnAnimation: [
		{name: 'idle', sequence: [0], fps: 12, loop: false},
		{name: 'select', sequence: [1], fps: 12, loop: false},
		{name: 'pulse', sequence: [2], fps: 12, loop: false}
	],
	list: [
		{
    	id: 'health', 
    	incremental: 20,
    	x: 90,
    	y: 583,
        hud:{
            x:900,
            y:10,
            asset: 'heart_hud'
        }
    },
    {
        id: 'shield',
        incremental: 1,
        x: 220,
        y: 583,
        hud:{
            x:900,
            y:60,
            asset: 'shield_hud'
        }
    },
    {
    	id: 'firerate',
    	incremental: 20,
        x: 355,
    	y: 583,
        hud:{
            x:900,
            y:110,
            asset: 'weaponspeed_hud'
        }
    }, 
    {
    	id: 'ammunition',
    	incremental: 20,
        x: 490,
    	y: 583,
        hud:{
            x:900,
            y:160,
            asset: 'moreammo_hud'
        }
    },
    {
        id: 'speed',
        incremental: 30,
        x: 630,
        y: 583,
        hud:{
            x:900,
            y:210,
            asset: 'speed_hud'
        }
    },
    {
    	id: 'damage',
    	incremental: 20,
    	x: 750,
    	y: 583,
        hud:{
            x:900,
            y:260,
            asset: 'weapondamage_hud'
        }
    }
	]
};
},{}],7:[function(require,module,exports){
'use strict';

var BootState = require('./states/boot'),
    MenuState = require('./states/menu'),
    PlayState = require('./states/play'),
    PreloadState = require('./states/preload'),
    PowerupState = require('./states/powerup'),
    CreditsState = require('./states/credits'),
    config = require('../game/config/game'),
    game;

window.onload = function () {
    game = new Phaser.Game(config.game.width, config.game.height, Phaser.AUTO, config.game.wrapperDiv);
    game.config = config;

    game.state.add('boot', BootState);
    game.state.add('menu', MenuState);
    game.state.add('play', PlayState);
    game.state.add('preload', PreloadState);
    game.state.add('powerup', PowerupState);
    game.state.add('credits', CreditsState);
    game.state.start('boot');

    if (!game.events) game.events = {};
};

},{"../game/config/game":5,"./states/boot":42,"./states/credits":43,"./states/menu":44,"./states/play":45,"./states/powerup":46,"./states/preload":47}],8:[function(require,module,exports){
var SmallBall = require('./weaponManager/bullets/smallBall');
var BigBall = require('./weaponManager/bullets/bigBall');
var Electro = require('./weaponManager/bullets/electro');

var Weapons = {
    pistol: {weapon: require('./weaponManager/weapons/pistol.js'), bullet: SmallBall},
    revolver: {weapon: require('./weaponManager/weapons/revolver.js'), bullet: SmallBall},
    shotgun: {weapon: require('./weaponManager/weapons/ShotGun.js'), bullet: SmallBall},
    machineGun: {weapon: require('./weaponManager/weapons/MachineGun.js'), bullet: SmallBall},
    threeGun: {weapon: require('./weaponManager/weapons/ThreeGun'), bullet: SmallBall},
    superSpryGun: {weapon: require('./weaponManager/weapons/SuperSpryGun.js'), bullet: SmallBall},
    electroGun: {weapon: require('./weaponManager/weapons/ElectroGun.js'), bullet: Electro}
};


var dispatcher = require('../modules/Dispatcher');
var gameData = require('../modules/game-data');
var utils = require('./Utils');

var Character = function Character(x, y, gender, game) {
    var self = this;
    var config = game.config.character;
    self.isDead = false;
    self.sex = gender;

    //Chapu dedicada a Xavi y carles
    game.character  = this;

    Phaser.Sprite.call(this, game, x, y, config.spriteName + gender);
    var initBody = function initBody() {
        self.x = x;
        self.y = y;

        self.anchor.set(0.5, 0.5);
        self.scale.set(config.scale, config.scale);
        self.game.physics.arcade.enable(self);

        if (gameData.powerUps.shield > 0) {
            gameData.powerUps.shield = 0;
            gameData.shield++;
        }

        gameData.life = utils.increasePercentage(gameData.life, gameData.powerUps.health);
        self.speed = utils.increasePercentage(config.speed, gameData.powerUps.speed);
        self.shield = gameData.shield;

        self.moveUp = false;
        self.moveDown = false;
        self.moveLeft = false;
        self.moveRight = false;
        self.isDead = false;
        self.canMove = false;
        self.canHurt = true;

        self.alpha = 0;

        var tween = self.game.add.tween(self)
            .to({alpha: 1}, 1000);

        tween.onComplete.add(function(){
            self.canMove = true;
        });

        window.setTimeout(function () {
            tween.start();
        }, 300);

        self.game.camera.follow(self);
        self.body.setSize(config.width, config.heigth, config.offsetX, config.offsetY);
    };

    var initHair = function initHair() {
        !gameData.gender ? (self.mascWom = config.head.spriteName + gender) : self.mascWom = gameData.gender;
        !gameData.headNum ? (self.headNum = utils.randomNumber(0, config.head.totalHeads - 1)) : self.headNum = gameData.headNum;
        self.head = self.game.add.sprite(config.head.x, config.head.y, self.mascWom, self.headNum);
        self.addChild(self.head);
        self.head.anchor.set(0.5, 0.5);
    };

    var initReload = function initReload() {
        self.reload = self.game.add.sprite(0, -50, 'reload');
        self.addChild(self.head);
        self.reload.animations.add('start');
        self.reload.animations.play('start', 6, true);
        self.reload.visible = 0;
    };

    var initControl = function initControl() {
        self.controller = {
            upKey: self.game.input.keyboard.addKey(Phaser.Keyboard.W),
            downKey: self.game.input.keyboard.addKey(Phaser.Keyboard.S),
            leftKey: self.game.input.keyboard.addKey(Phaser.Keyboard.A),
            rightKey: self.game.input.keyboard.addKey(Phaser.Keyboard.D),
            reloadKey: self.game.input.keyboard.addKey(Phaser.Keyboard.R),
            shootKey: self.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR),
            collectChestKey: self.game.input.keyboard.addKey(Phaser.Keyboard.C),
            changeWeaponKey: self.game.input.keyboard.addKey(Phaser.Keyboard.Q)
        };
    };

    var initKeyUps = function initKeyUps() {
        self.controller.upKey.onUp.add(stopUp);
        self.controller.downKey.onUp.add(stopDown);
        self.controller.leftKey.onUp.add(stopLeft);
        self.controller.rightKey.onUp.add(stopRight);
    };

    var initSignals = function initSignals() {
        self.game.events.changeWeapon = new Phaser.Signal();
        self.game.events.characterDamage = new Phaser.Signal();
        self.game.events.setCollideCharacter = new Phaser.Signal();
        self.controller.collectChestKey.onUp = new Phaser.Signal();
        self.game.events.reloadGun = new Phaser.Signal();
    };

    var initWeapons = function initWeapons() {
        self.activeWeapon = 0;
        self.weapons = [
            new Weapons.pistol.weapon(self.game, Weapons.pistol.bullet, self),
            new Weapons.pistol.weapon(self.game, Weapons.pistol.bullet, self)
        ];

        self.weapons[self.activeWeapon].gunSprite.visible = true;
        gameData.currentWeapons = self.weapons;
    };

    var pickUpGun = function pickUpGun(gunName) {
        self.weapons[self.activeWeapon].visible = false;
        self.weapons[self.activeWeapon].gunSprite.visible = false;
        delete self.weapons[self.activeWeapon];
        self.weapons[self.activeWeapon] = new Weapons[gunName].weapon(self.game, Weapons[gunName].bullet, self);
        self.weapons[self.activeWeapon].visible = true;
        self.weapons[self.activeWeapon].gunSprite.visible = true;
    };

    var initAnimations = function initAnimations() {
        self.deadAnimation = self.game.add.sprite(x, y, 'deadAnimation');
        self.deadAnimation.anchor.set(0.5);
        self.deadAnimation.alpha = 0;
        var animation = self.deadAnimation.animations.add('deadAnimation');
        animation.onComplete.add(function() {
            dispatcher.dispatch('showGameOver');
        });

        for (var i = 0, len = config.animations.length; i < len; i++) {
            self.animations.add(config.animations[i].name, config.animations[i].sequence, config.animations[i].fps, config.animations[i].loop);
        }

        self.animations.getAnimation('hurt').onComplete.add(function () {
            self.animations.play('idle');
        });

        self.animations.play('idle');
    };

    var passToIdle = function passToIdle() {
        self.animations.stop('move');
        self.animations.play('idle');
    };

    var stopVelocityY = function stopVelocityY() {
        self.body.velocity.y = 0;
    };

    var stopVelocityX = function stopVelocityX() {
        self.body.velocity.x = 0;
    };

    var stopUp = function stopUp() {
        self.moveUp = false;
        stopVelocityY();
        if (!self.moveUp && !self.moveDown && !self.moveLeft && !self.moveRight && !self.isDead) {
            passToIdle();
        }
    };

    var stopDown = function stopDown() {
        self.moveDown = false;
        stopVelocityY();
        if (!self.moveUp && !self.moveDown && !self.moveLeft && !self.moveRight && !self.isDead) {
            passToIdle();
        }
    };

    var stopLeft = function stopLeft() {
        self.moveLeft = false;
        stopVelocityX();
        if (!self.moveUp && !self.moveDown && !self.moveLeft && !self.moveRight && !self.isDead) {
            passToIdle();
        }
    };

    var stopRight = function stopRight() {
        self.moveRight = false;
        stopVelocityX();
        if (!self.moveUp && !self.moveDown && !self.moveLeft && !self.moveRight && !self.isDead) {
            passToIdle();
        }
    };

    var setCollideCharacter = function setCollideCharacter(element) {
        self.game.physics.arcade.collide(self, element);
    };

    var changeWeapon = function changeWeapon() {
        if (self.weapons.length < 2) {
            return;
        }
        self.weapons[self.activeWeapon].shootDisabled && (self.weapons[self.activeWeapon].shootDisabled = false);
        self.weapons[self.activeWeapon].gunSprite.visible = false;
        self.weapons[self.activeWeapon].visible = false;
        self.activeWeapon = self.activeWeapon === 1 ? 0 : 1;
        self.weapons[self.activeWeapon].gunSprite.visible = true;
        self.weapons[self.activeWeapon].visible = true;
        self.game.events.changeWeapon.dispatch();
        gameData.currentWeapons = self.weapons;
    };

    var tryToCollectChest = function tryToCollectChest() {
        self.game.events.collectChest.dispatch(self.x, self.y);
    };

    var shoot = function shoot() {
        self.weapons[self.activeWeapon].fire(self);
    };

    var reload = function reload() {
        self.game.events.reloadGun.dispatch(self.weapons[self.activeWeapon].gunName);
    };

    var shootingState = function shootingState() {
        self.shooting = !self.shooting;
        self.weapons[self.activeWeapon].shootDisabled && (self.weapons[self.activeWeapon].shootDisabled = false);
    };

    var speedState = function speedState(currentSpeed) {
        if (currentSpeed === 'trap') {
            self.speed = config.sandSpeed;
        } else {
            self.speed = config.speed;
        }
    };

    var hurtTween = this.game.add.tween(this)
        .to({alpha: 0.3}, 10)
        .to({alpha: 0.3}, 100)
        .to({alpha: 1}, 10)
        .to({alpha: 1}, 100)
        .to({alpha: 0.3}, 10)
        .to({alpha: 0.3}, 100)
        .to({alpha: 1}, 10)
        .to({alpha: 1}, 100)
        .to({alpha: 0.3}, 10)
        .to({alpha: 0.3}, 100)
        .to({alpha: 1}, 10);

    hurtTween.onComplete.add(function() {
        self.canHurt = true;
    });

    var checkBullet = function checkBullet(bullet) {
        if (self.canHurt) {
            self.game.physics.arcade.collide(self, bullet, function(character, bullet) {
                bullet.exists = false;
                self.canHurt = false;
                hurtTween.start();
                if (gameData.shield > 0) {
                    gameData.shield--;
                } else {
                    gameData.life -= (bullet.damage || 1);
                }
            });
        }
    };

    var initSignalCallbacks = function initSignalCallbaks() {
        self.game.events.setCollideCharacter.add(setCollideCharacter);
        self.controller.collectChestKey.onUp.add(tryToCollectChest);
        self.controller.shootKey.onDown.add(shoot);
        self.controller.reloadKey.onDown.add(reload);
        self.controller.changeWeaponKey.onDown.add(changeWeapon);
        self.game.input.onDown.add(shootingState);
        self.game.input.onUp.add(shootingState);
        dispatcher.listen("characterVelChanged", speedState);
        dispatcher.listen('checkCollideWithEnemyBullet', checkBullet);
        dispatcher.listen("pickUpGun", pickUpGun);
    };

    initControl();
    initSignals();
    initBody();
    initHair();
    initWeapons();
    initKeyUps();
    initSignalCallbacks();
    initAnimations();
    initReload();


    this.game.camera.follow(this);
    this.game.add.existing(this);

    var kill = function kill() {
        self.alpha = 0;
        self.deadAnimation.alpha = 1;
        self.deadAnimation.x = self.x;
        self.deadAnimation.y = self.y;
        self.deadAnimation.animations.play('deadAnimation', 6);
        self.isDead = true;
        self.body.velocity.x = 0;
        self.body.velocity.y = 0;
        self.animations.stop();
    };

    var moveVelocityLeft = function moveVelocityLeft() {
        self.body.velocity.x = -self.speed;
    };

    var moveVelocityRight = function moveVelocityRight() {
        self.body.velocity.x = self.speed;
    };

    var moveVelocityUp = function moveVelocityUp() {
        self.body.velocity.y = -self.speed;
    };

    var moveVelocityDown = function moveVelocityDown() {
        self.body.velocity.y = self.speed;
    };

    this.update = function update() {
        var isAlive = gameData.life > 0,
            isLookingAtLeft = this.game.input.mousePointer.worldX < this.x,
            isMovingUp = this.controller.upKey.isDown,
            isMovingDown = this.controller.downKey.isDown,
            isMovingLeft = this.controller.leftKey.isDown,
            isMovingRight = this.controller.rightKey.isDown,
            isNotAnimating = !this.animations.getAnimation('move').isPlaying && !this.animations.getAnimation('hurt').isPlaying;

        if (isAlive) {
            if(self.weapons[self.activeWeapon].bulletsPerCharger - self.weapons[self.activeWeapon].bulletCounter <= 0) {
                self.reload.x = this.x - 70;
                self.reload.y = this.y - 90;
                self.reload.visible = 1;
            } else {
                self.reload.visible = 0;
            }

            if (gameData.enemies > 0) {
                if (isLookingAtLeft) {
                    this.scale.x = -config.scale;
                    self.weapons[self.activeWeapon].gunSprite.scale.x = -config.scale;
                    self.weapons[self.activeWeapon].gunSprite.scale.y = -config.scale;
                } else {
                    this.scale.x = config.scale;
                    self.weapons[self.activeWeapon].gunSprite.scale.x = config.scale;
                    self.weapons[self.activeWeapon].gunSprite.scale.y = config.scale;
                }

                if (isMovingUp) {
                    moveVelocityUp();
                    this.moveUp = true;
                    isNotAnimating && this.animations.play('move');
                } else if (isMovingDown) {
                    moveVelocityDown();
                    this.moveDown = true;
                    isNotAnimating && this.animations.play('move');
                }
                if (isMovingLeft) {
                    moveVelocityLeft();
                    this.moveLeft = true;
                    isNotAnimating && this.animations.play('move');
                } else if (isMovingRight) {
                    moveVelocityRight();
                    this.moveRight = true;
                    isNotAnimating && this.animations.play('move');
                }
            }
        } else if (!this.isDead) {
            self.reload.visible = 0;
            kill();
        }

        if (self.shooting && !self.weapons[self.activeWeapon].shootDisabled) {
            self.weapons[self.activeWeapon].fire(self);
            self.weapons[self.activeWeapon].oneShootPerClick && (self.weapons[self.activeWeapon].shootDisabled = true);

        }
    };

};

Character.prototype = Object.create(Phaser.Sprite.prototype);
Character.prototype.constructor = Character;

module.exports = Character;

},{"../modules/Dispatcher":9,"../modules/game-data":19,"./Utils":12,"./weaponManager/bullets/bigBall":31,"./weaponManager/bullets/electro":32,"./weaponManager/bullets/smallBall":33,"./weaponManager/weapons/ElectroGun.js":35,"./weaponManager/weapons/MachineGun.js":36,"./weaponManager/weapons/ShotGun.js":37,"./weaponManager/weapons/SuperSpryGun.js":38,"./weaponManager/weapons/ThreeGun":39,"./weaponManager/weapons/pistol.js":40,"./weaponManager/weapons/revolver.js":41}],9:[function(require,module,exports){
'use strict';

var events = require('./events');

function Dispatcher(){
  this.events = {};
}

Dispatcher.prototype = {
  init: function init(){
    for (var i= 0, eL = events.length; i < eL; i++){
      this.events[events[i]] = new Phaser.Signal();
    }
  },

  listen: function listen(eventName, callback){
    this.events[eventName].add(callback);
  },

  remove: function remove(eventName, callback){
    this.events[eventName].remove(callback);
  },

  dispatch: function dispatch(eventName, args){
    this.events[eventName].dispatch(args);
  },
  reset: function reset(){
    this.events = {};
  }

};

var dispatcher = new Dispatcher();
//dispatcher.init();

module.exports = dispatcher;

},{"./events":18}],10:[function(require,module,exports){
'use strict';

var storedData = require('./StoredData');
var dispatcher = require('./Dispatcher');

var GameOver = function GameOver(game) {
    Phaser.Group.call(this, game, game.world, 'gameOver', false, true, Phaser.Physics.ARCADE);
    this.game = game;

    var self = this;

    // TODO Refactor calls
    this.clickMenuButton = function clickMenuButton() {
        //this.updateStoredData();
        dispatcher.dispatch('resetGameData');
        dispatcher.reset();
        this.game.state.start('menu');
    };

    this.clickPlayButton = function clickPlayButton() {
        //this.updateStoredData();
        dispatcher.dispatch('resetGameData');
        dispatcher.reset();
        this.game.state.start('play');
    };
    this.clickPowerUpButton = function clickPowerUpButton() {
        dispatcher.dispatch('resetGameData');
        dispatcher.reset();
        this.game.state.start('powerup');
    };

    this.updateStoredData = function updateStoredData() {
        storedData.saveLocalStorage();
    };

    this.show = function show(){
        bgGameOver.visible = true;
        menuButton.visible = true;
        replayButton.visible = true;
        incubatorButton.visible = true;
    };

    var configGameOver = this.game.config.gameOver;

    var bgGameOver = this.game.add.sprite(configGameOver.background.x, configGameOver.background.y, 'bgGameOver');
    bgGameOver.inputEnabled = true;
    bgGameOver.fixedToCamera = true;
    bgGameOver.visible = false;

    var menuButton = this.game.add.button(this.game.width/2, configGameOver.menuButton.y, 'menuButtonGameOver', this.clickMenuButton, this, 'gameover_buttons0005', 'gameover_buttons0004', 'gameover_buttons0004', 'gameover_buttons0004');
    menuButton.anchor.setTo(configGameOver.menuButton.anchorX, configGameOver.menuButton.anchorY);
    menuButton.inputEnabled = true;
    menuButton.fixedToCamera = true;
    menuButton.visible = false;

    var replayButton = this.game.add.button(this.game.width/2, configGameOver.replayButton.y, 'replayButtonGameOver', this.clickPlayButton, this, 'gameover_buttons0003', 'gameover_buttons0002', 'gameover_buttons0002', 'gameover_buttons0002');
    replayButton.anchor.setTo(configGameOver.replayButton.anchorX, configGameOver.replayButton.anchorX);
    replayButton.inputEnabled = true;
    replayButton.fixedToCamera = true;
    replayButton.visible = false;

    var incubatorButton = this.game.add.button(this.game.width/2, configGameOver.incubatorButton.y, 'incubatorButtonGameOver', this.clickPowerUpButton, this, 'gameover_buttons0001', 'gameover_buttons0000', 'gameover_buttons0000', 'gameover_buttons0000');
    incubatorButton.anchor.setTo(configGameOver.incubatorButton.anchorX, configGameOver.incubatorButton.anchorX);
    incubatorButton.inputEnabled = true;
    incubatorButton.fixedToCamera = true;
    incubatorButton.visible = false;

    var initListeners = function initListeners(){
      dispatcher.listen('showGameOver', function(){
          self.show();
      });
    };

    initListeners();
};


GameOver.prototype = Object.create(Phaser.Group.prototype);
GameOver.prototype.constructor = GameOver;

module.exports = GameOver;
},{"./Dispatcher":9,"./StoredData":11}],11:[function(require,module,exports){
'use strict';

var gameData = require('./game-data');

function StoredData(){}

StoredData.prototype = {

  saveLocalStorage: function saveLocalStorage(){
    var colKeys = Object.keys(gameData);
    for (var i = 0, cL = colKeys.length; i < cL; i++){
      var prop = colKeys[i];
      localStorage.setItem(prop, gameData[prop]);
    }
  },
  getLocalStorage: function getLocalStorage(){
    for (var i = 0, lsL = localStorage.length; i < lsL; i++){
      var key = localStorage.key(i);
      gameData[key] = localStorage.getItem(key);
    }
  }
};

var storedData = new StoredData();

module.exports = storedData;

},{"./game-data":19}],12:[function(require,module,exports){
'use strict';

function Utils(){
    this.randomNumber = function (from, to){
        return Math.floor((Math.random() * to) + from);
    };

    this.increasePercentage = function increasePercentage(base, increase) {
        return ((100 +  increase) * base)/100;
    };
}

module.exports = new Utils();
},{}],13:[function(require,module,exports){
'use strict';

function Assets(game) {
  this.game = game;
}

Assets.prototype = {
  load: function (assetsObj, callback){
    for (var key in assetsObj) {
      if (assetsObj.hasOwnProperty(key)) {
        for ( var i = 0, assetsL = assetsObj[key].length; i < assetsL; i++ ) {
          if (key === 'atlas') {
            this.game.load.atlasJSONHash(assetsObj[key][i].name, assetsObj[key][i].png, assetsObj[key][i].json);
          } else if (key === 'fonts') {
            this.game.load.text(assetsObj[key][i].name, assetsObj[key][i].path);
          } else if (key === 'images') {
            this.game.load.image(assetsObj[key][i].name, assetsObj[key][i].path);
          } else if (key === 'sounds'){
            this.game.load.audio(assetsObj[key][i].id, assetsObj[key][i].path);
          } else {
            this.game.load.spritesheet(assetsObj[key][i].name, assetsObj[key][i].path, assetsObj[key][i].width, assetsObj[key][i].height);
          }
        }
      }
    }

    callback();
  }
};

module.exports = Assets;


},{}],14:[function(require,module,exports){
'use strict';
var gameData = require('../../modules/game-data');
var dispatcher = require('../../modules/Dispatcher');
function Chest(x, y, game, collideSignal, collectSignal) {
    var config = game.config.chest,
        isOpen = false;
    var self = this;

    this.game = game;
    this.chest = this.game.add.sprite(x, y, config.spriteName, config.closeFrame);
    this.game.physics.arcade.enable(this.chest);
    this.chest.body.immovable = true;

    var showWeapon = function showWeapon() {
        self.chest.visible = false;
        self.chest.body.destroy();
        var number = Math.floor(((Math.random() * 100) + 1) - 1);
     if (number <= 40) {
            self.weaponName = 'revolver';
        } else if (number > 45 && number <= 65) {
            self.weaponName = 'shotgun';
        } else if (number > 65 && number <= 85) {
            self.weaponName = 'threeGun';
        } else if (number > 85 && number <= 95) {
            self.weaponName = 'machineGun';
        } else if (number > 95) {
            self.weaponName = 'superSpryGun';
        }
        self.weapon = self.game.add.sprite(x, y, game.config.weapons[self.weaponName].floorSprite);
        self.game.physics.arcade.enable(self.weapon);
        self.weapon.body.immovable = true;
    };

    collideSignal.add(function setCollideChest(element) {
        this.game.physics.arcade.collide(this.chest, element);
        if (self.weapon) {
            this.game.physics.arcade.collide(self.weapon, element);

        }
    }, this);

    collectSignal.add(function setCollideChest(charX, charY) {
        if (!isOpen && ((Math.abs(charX - this.chest.x) < this.chest.width + config.xOffset) && (Math.abs(charY - this.chest.y) < this.chest.height + config.yOffsset))) {
            this.chest.frameName = config.openFrame;
            isOpen = true;
            window.setTimeout(function () {
                showWeapon();
            }, 1000);
        }else if(this.weapon && ((Math.abs(charX - this.weapon.x) < this.weapon.width + 30) && (Math.abs(charY - this.weapon.y) < this.weapon.height + 30))){
            self.weapon.visible = false;
            self.weapon.body.destroy();
            dispatcher.dispatch('pickUpGun', this.weaponName);
        }

    }, this);


}

module.exports = Chest;
},{"../../modules/Dispatcher":9,"../../modules/game-data":19}],15:[function(require,module,exports){
'use strict';
var EnemyBullet = require('./EnemyBullet');

var EnemiesBulletsController = function (game) {
    Phaser.Group.call(this, game, game.world, 'Revolver', false, true, Phaser.Physics.ARCADE);

    

    for (var i = 0; i < 64; i++)
    {
        this.add(new EnemyBullet(game, 'snakeBullet'), true);
    }

    this.game.events.enemyFires = new Phaser.Signal();
    this.game.events.enemyFires.add(this.fire, this);

    return this;
};

EnemiesBulletsController.prototype = Object.create(Phaser.Group.prototype);
EnemiesBulletsController.prototype.constructor = EnemiesBulletsController;

EnemiesBulletsController.prototype.fire = function (source, angle, speed, damage) {
    var x = source.x + 10;
    var y = source.y + 10;
    var bullet = this.getFirstExists(false);
    bullet && (bullet.damage = damage);
    bullet && bullet.fire(x, y, angle, speed);
};

module.exports = EnemiesBulletsController;

},{"./EnemyBullet":16}],16:[function(require,module,exports){
var dispatcher = require('../Dispatcher');

var EnemyBullet = function (game, key) {
    var self = this;
    Phaser.Sprite.call(this, game, 0, 0, key);

    this.texture.baseTexture.scaleMode = PIXI.scaleModes.NEAREST;

    this.anchor.set(0.5);

    this.checkWorldBounds = true;
    this.outOfBoundsKill = true;
    this.exists = false;

    this.game.physics.arcade.enable(this);
    this.tracking = false;
    this.scaleSpeed = 0;

    var deleteEnemyBullet = function deleteEnemyBullet(){
        self.exists = false;
    };

    this.game.events.setCollideEnemyBullet.add(function setCollideEnemyBullet(element) {
        this.game.physics.arcade.collide(this, element, deleteEnemyBullet);
    }, this);

};

EnemyBullet.prototype = Object.create(Phaser.Sprite.prototype);
EnemyBullet.prototype.constructor = EnemyBullet;

EnemyBullet.prototype.fire = function (x, y, angle, speed) {
    this.reset(x, y);
    this.scale.set(1);

    this.body.velocity.x = speed * Math.cos(angle);
    this.body.velocity.y = speed * Math.sin(angle);
    this.rotation = angle;
};

EnemyBullet.prototype.update = function update() {
    if (this.exists) {
        dispatcher.dispatch('checkCollideWithEnemyBullet', this);      
    }
};

module.exports = EnemyBullet;
},{"../Dispatcher":9}],17:[function(require,module,exports){
var dispatcher = require('../Dispatcher');
var gameData = require('../game-data');

'use strict';

const IDLE = 'IDLE';
const MOVING = 'MOVING';
const SHOTING = 'SHOTING';

var Enemy = function Enemy(params) {
	Phaser.Sprite.call(this, params.game, 0, 0, params.config.spriteName);

	var config = params.config,
		self = this;

    self.deadAnimation = self.game.add.sprite(this.x, this.y, 'deadAnimation');
    self.deadAnimation.anchor.set(0.5);
    self.deadAnimation.alpha = 0;
    var animation = self.deadAnimation.animations.add('deadAnimation');


    var defaultBehavior = function defaultBehavior(x, y) {
		var newState = '';

		var distance = function distance(x0, y0, x1, y1) {
			var dx = x0 - x1,
				dy = y0 - y1;
			return Math.sqrt(dx * dx + dy * dy);
		}

		var move = function move(x, y) {
			var dx = self.speed * config.weight.x,
				dy = self.speed * config.weight.y;

			self.body.velocity.x = (self.x < x) * dx - (self.x > x) * dx;
			self.body.velocity.y = (self.y < y) * dy - (self.y > y) * dy;
		};

		var halt = function halt() {
			self.body.velocity.x = 0;
			self.body.velocity.y = 0;
		};

		var shot = function shot(x, y) {
			if (self.game.time.time >= self.nextFire) {
				var dx = x - self.x,
					dy = y - self.y,
					angle = Math.atan2(dy, dx);

				if (angle < 0) {
					angle += 2 * Math.PI;						
				}

				self.game.events.enemyFires.dispatch({x: self.x, y: self.y}, angle, self.bulletSpeed, self.damage);
				if (config.name === 'scorpion') {
					var delta = Math.PI / 5;

					self.game.events.enemyFires.dispatch({x: self.x, y: self.y}, angle - delta, self.bulletSpeed, self.damage);
					self.game.events.enemyFires.dispatch({x: self.x, y: self.y}, angle + delta, self.bulletSpeed, self.damage);
				}
				self.nextFire = self.game.time.time + self.fireRate;
			}

			halt();
		}

		var d = distance(this.x, this.y, x, y);

		if (config.radius < config.shotRadius) {
			if (d <= config.radius) {
				move(x, y);
				newState = MOVING;
			} else if (d <= config.shotRadius) {
				shot(x, y);
				newState = SHOTING;
			} else {
				halt();
				newState = IDLE;
			}
		} else if (config.radius > config.shotRadius) {
			if (d <= config.shotRadius) {
				shot(x, y);
				newState = SHOTING; 
			} else if (d <= config.radius) {
				move(x, y);
				newState = MOVING;
			} else {
				halt();
				newState = IDLE;
			}
		}
		
		return newState;
	};

	this.behavior = params.behavior || defaultBehavior;

	this.anchor.set(0.5, 0.5);
	this.scale.set(config.scale, config.scale);
	this.game.physics.arcade.enable(this);
	this.body.setSize(this.width, this.height);

	// Init animations
	for (var i = 0; i < config.animations.length; i++) {
		this.animations.add(config.animations[i].name, config.animations[i].sequence, config.animations[i].fps, config.animations[i].loop);
	};

	this.state = IDLE;
	this.nextFire = 0;
    this.bulletSpeed = config.bulletSpeed;
    this.fireRate = config.fireRate;
    this.damage = config.damage * Math.pow(this.game.config.challengeSystem.enemyDamageIncrementFactor, params.level - 1);
    this.health = config.health * Math.pow(this.game.config.challengeSystem.enemyLiveIncrementFactor, params.level - 1);
    this.speed = config.speed * Math.pow(this.game.config.challengeSystem.enemySpeedIncrementFactor, params.level - 1)
    this.damageTween = this.game.add.tween(this)
        .to({alpha: 0.3}, 50)
        .to({alpha: 1}, 50);

	// Collition managers
	var setCollideEnemies = function setCollideEnemies(element) {
        self.game.physics.arcade.collide(self, element);
    };
	this.game.events.setCollideEnemies.add(setCollideEnemies, this);

	var checkCollideWithCharacterBullet = function checkCollideWithCharacterBullet(bullet) {
        self.game.physics.arcade.collide(self, bullet, function(body, bullet) {
        	bullet.exists = false;
        	self.health -= (bullet.damage || 1);
            self.damageTween.start();

            if (self.health <= 0) {
        		self.die();
        	}
        });
    };
    dispatcher.listen('checkCollideWithCharacterBullet', checkCollideWithCharacterBullet);

    var reactToHero = function reactToHero(hero) {
    	var newState = this.behavior(hero.x, hero.y);

    	this.scale.x = this.x < hero.x ? -1 : 1;

    	if (newState !== this.state) {
    		this.state = newState;

    		if (this.state === IDLE) {
				this.animations.play('idle');
			} else if (this.state === MOVING) {
				this.animations.play('move');
			} else if (this.state === SHOTING) {
				this.animations.play('attack');
			}
    	} 
	};

	this.game.events.heroIsMoving.add(reactToHero, this);

	this.die = function die() {
        this.deadAnimation.alpha = 1;
        animation.play(12);
		gameData.enemies--;
	    this.game.events.setCollideEnemies.remove(setCollideEnemies, this);
		this.game.events.heroIsMoving.remove(reactToHero, this);
    	dispatcher.remove('checkCollideWithCharacterBullet', checkCollideWithCharacterBullet);
		dispatcher.dispatch('createPowerUp', {x: this.x, y: this.y});

	   	this.destroy();
	};

    this.update = function update() {
        this.deadAnimation.x = this.x;
        this.deadAnimation.y = this.y;
    };

	this.animations.play('idle');

	//this.deadSprite = new Phaser.Sprite(this.game, 0, 0, params.config.spriteName, 0);
	//this.deadSprite.body = new Phaser.Physics.Arcade.Body(this);
};

Enemy.prototype = Object.create(Phaser.Sprite.prototype);
Enemy.prototype.constructor = Enemy;

module.exports = Enemy;

},{"../Dispatcher":9,"../game-data":19}],18:[function(require,module,exports){
module.exports = [
    // Events
    "setTrapCollision",
    "setRewardCollision",
    "characterVelChanged",
    "checkCollideWithCharacterBullet",
    "checkCollideWithEnemyBullet",
    "pickUpGun",
    "showGameOver",
    "gameOver",
    "testToKill",
    "resetGameData",
    "createPowerUp"
];

},{}],19:[function(require,module,exports){
'use strict';

module.exports = {
    gameStarted: false,
    currentLevel: 1,
    currentCoins: 0,
    life: 100,
    shield: 0,
    gender: false,
    headNum: false,
    sex: false,
    powerUps: {
        health: 0,
        shield: 0,
        firerate: 0,
        ammunition: 0,
        speed: 0,
        damage: 0
    }
};
},{}],20:[function(require,module,exports){
var Enemy = require('../enemies/enemy');
var gameData = require('../game-data');
var utils = require('../utils');

var EnemiesGenerator = function EnemiesGenerator(game) {
    const NORMAL_CELL = 6;
    const NORMAL_CELL_2 = 5;

	var game = game;

	this.enemies = [];

	this.generate = function generate(map, level, hero) {
		var count = 0;

		var getFilterFunction = function getFilterFunction(level) {
			return function (obj) {
				return true; //obj.level <= level;
			};
		};

		var getValidEnemy = function getValidEnemy() {
			var validEnemies = game.config.enemies.filter(getFilterFunction(level)),
				kind;

			if (validEnemies.length > 0) {
				var kindIndex = game.rnd.between(0, validEnemies.length - 1);
					
				kind = validEnemies[kindIndex];
			} else {
				kind = undefined;
			}

			return kind;
		};

		var generateEnemy = function generateEnemy(map, kind, level) {
	        var dummy = new Enemy({game: game, level: level, config:kind}),
	        	occupied,
	        	tile = {},
	        	visited = [],
	        	col, 
	        	row;

	        occupied = true;

	        while (occupied) {
	       		row = game.rnd.between(0, map.height - 1);
	       		col = game.rnd.between(0, map.width - 1);

	       		tile = map.getTile(col, row, 0, true);
	       		occupied = (tile.index !== NORMAL_CELL && tile.index !== NORMAL_CELL_2 ) || visited[row * map.width + col];
	        }

	        visited[row * map.width + col] = true;

	        dummy.x = tile.x * map.tileWidth + map.tileWidth / 2;
	        dummy.y = tile.y * map.tileHeight + map.tileHeight / 2;
	        this.enemies.push(dummy);

	        game.world.add(dummy);
		};

		// ******************************
		this.enemies = [];

		var minEnemies = game.config.challengeSystem.initialEnemies + game.config.challengeSystem.enemiesIncrement * (level - 1),
			maxEnemies = game.config.challengeSystem.initialEnemies + game.config.challengeSystem.enemiesIncrement * level,
			totalEnemies = game.rnd.between(minEnemies, maxEnemies);

		for(var i = 0; i < totalEnemies; i++) {
			var kind = getValidEnemy();

			generateEnemy(map, kind, level);
		}

		// while (level>0) {
		// 	var kind = getValidEnemy();

		// 	if (kind) {
		// 		generateEnemy(map, kind, hero);
		// 		level -= kind.level;
		// 		count++;
		// 	} else {
		// 		level = 0;
		// 	}		
		// }
		console.log('Enemigos generados', level, totalEnemies);
		gameData.enemies = totalEnemies;
	};
};

module.exports = EnemiesGenerator;

},{"../enemies/enemy":17,"../game-data":19,"../utils":28}],21:[function(require,module,exports){
module.exports = function MapRandomGenerator(width, height) {

    var createMap = function createMap(width, height) {
            //Blocked Cells
            const BLOCK_CELL = 2;
            const BLOCK_CELL_UP = 4;
            const BLOCK_CELL_LEFT = 15;
            const BLOCK_CELL_RIGHT = 7;
            const BLOCK_CELL_UP_DOWN = 12;
            const BLOCK_CELL_UP_CORNER = 11;
            const BLOCK_CELL_UP_CORNER_LEFT = 16;
            const BLOCK_CELL_UP_CORNER_RIGTH = 13;


            const NORMAL_CELL = 6;
            const NORMAL_CELL_2 = 5;
            const CHEST_CELL = 17;
            const CEILING_CELL = 1;
            const TRAP_CELL = 10;


            var map = [];
            var mapPerRows = [];
            /*****FUNCTIONS*****/
            /**
             *  Check if the cell is avaiable to set specific state (floor or trap)
             * @returns Boolean
             */
            var checkPossibleCell = function checkPossibleCell(x, y, isTrap) {
                var isTrap = isTrap || false;
                var cellToCompare = NORMAL_CELL;
                var isBlocked = false;
                if (isTrap) {
                    cellToCompare = TRAP_CELL;
                    if (mapPerRows[y][x] === BLOCK_CELL) {
                        isBlocked = true;
                    }
                }
                //Conditions
                var isFirstRow = (y === 0),
                    isLastRow = (y === height - 1),
                    isFirstColumn = (x === 0),
                    isLastColumn = ( x === width - 1),
                    isCellUnavaiable = (mapPerRows[y][x] === undefined || mapPerRows[y][x] === null),
                    isCellUsed = (mapPerRows[y][x] === cellToCompare);

                //Result
                var isCellPossible;

                if (isFirstColumn || isFirstRow || isLastRow || isLastColumn || isCellUnavaiable || isCellUsed || isBlocked) {
                    isCellPossible = false;
                } else {
                    isCellPossible = true;
                }
                return isCellPossible;
            }

            /*****END FUNCTIONS*****/

            /*****CREATE FIRST PART OF MAP, ALL BLOCKED*****/
            for (var i = 0; i < height; i++) {
                var row = [];
                for (var j = 0; j < width; j++) {
                    row.push(BLOCK_CELL);
                }
                mapPerRows.push(row);
            }
            /*****END CREATE FIRST PART OF MAP, ALL BLOCKED*****/

            /*******CREATE FLOOR CELLS*******/
            //The creation will start in the center of map
            var y = Math.round(height / 2) - 1;
            var x = Math.round(width / 2) - 1;
            var maxActiveCells = Math.round((height * width) / 3);
            //First cell will be floor
            mapPerRows[y][x] = NORMAL_CELL;


            var cellAcum = 0;
            var cellAcumCol = [];
            while (cellAcum < maxActiveCells) {
                var possibleDirectionsAvaiables = [];
                var cellChosen;

                //Check Left
                if (checkPossibleCell(x - 1, y)) {
                    possibleDirectionsAvaiables.push({
                        'x': x - 1,
                        'y': y,
                    });
                }
                //Check Right
                if (checkPossibleCell(x + 1, y)) {
                    possibleDirectionsAvaiables.push({
                        'x': x + 1,
                        'y': y,
                    });
                }
                //Check Down
                if (checkPossibleCell(x, y - 1)) {
                    possibleDirectionsAvaiables.push({
                        'x': x,
                        'y': y - 1,
                    });
                }
                //Check Up
                if (checkPossibleCell(x, y + 1)) {
                    possibleDirectionsAvaiables.push({
                        'x': x,
                        'y': y + 1,
                    });
                }

                cellChosen = possibleDirectionsAvaiables[Math.floor(((Math.random() * possibleDirectionsAvaiables.length) + 1) - 1)];
                if (cellChosen) {
                    x = cellChosen.x;
                    y = cellChosen.y;
                    cellAcumCol.push(cellChosen);
                    mapPerRows[y][x] = NORMAL_CELL
                    cellAcum++;
                } else {
                    var lastCell = cellAcumCol.pop();
                    x = lastCell.x;
                    y = lastCell.y;
                }

            }


            //Create chest and ceiling
            for (var y = 1; y < mapPerRows.length - 1; y++) {
                for (var x = 1; x < mapPerRows[y].length - 1; x++) {
                    var isClosedLeft = ((mapPerRows[y][x - 1] === BLOCK_CELL || mapPerRows[y][x - 1] === CEILING_CELL )
                    && (mapPerRows[y - 1][x] === BLOCK_CELL || mapPerRows[y - 1][x] === CEILING_CELL )
                    && (mapPerRows[y + 1][x] === BLOCK_CELL || mapPerRows[y + 1][x] === CEILING_CELL ));

                    var isClosedRigth = ((mapPerRows[y][x + 1] === BLOCK_CELL || mapPerRows[y][x + 1] === CEILING_CELL )
                    && (mapPerRows[y - 1][x] === BLOCK_CELL || mapPerRows[y - 1][x] === CEILING_CELL )
                    && (mapPerRows[y + 1][x] === BLOCK_CELL || mapPerRows[y + 1][x] === CEILING_CELL ));

                    var isClosedDown = ((mapPerRows[y][x - 1] === BLOCK_CELL || mapPerRows[y][x - 1] === CEILING_CELL )
                    && (mapPerRows[y][x + 1] === BLOCK_CELL || mapPerRows[y][x + 1] === CEILING_CELL )
                    && (mapPerRows[y + 1][x] === BLOCK_CELL || mapPerRows[y + 1][x] === CEILING_CELL ));

                    var isClosedUp = ((mapPerRows[y][x - 1] === BLOCK_CELL || mapPerRows[y][x - 1] === CEILING_CELL )
                    && (mapPerRows[y][x + 1] === BLOCK_CELL || mapPerRows[y][x + 1] === CEILING_CELL )
                    && (mapPerRows[y - 1][x] === BLOCK_CELL || mapPerRows[y - 1][x] === CEILING_CELL ));

                    if (mapPerRows[y][x] === NORMAL_CELL) {
                        if (isClosedLeft || isClosedRigth || isClosedDown || isClosedUp) {
                            //CHEST
                            mapPerRows[y][x] = CHEST_CELL;
                        } else {
                            var pos = Math.floor(((Math.random() * 25) + 1) - 1);
                            if (pos === 1) {
                                mapPerRows[y][x] = CHEST_CELL;
                            }
                        }
                    } else if (isClosedLeft && isClosedRigth && isClosedDown && isClosedUp) {
                        //TEJADO
                        mapPerRows[y][x] = CEILING_CELL;
                    }
                }
            }

            //creado trampas
            var trampArray = [];
            for (var y = 0; y < mapPerRows.length; y++) {
                for (var x = 0; x < mapPerRows[y].length; x++) {
                    if (mapPerRows[y][x] === NORMAL_CELL) {
                        var pos = Math.floor(((Math.random() * 100) + 1) - 1);
                        if (pos === 1) {
                            mapPerRows[y][x] = TRAP_CELL;
                            trampArray.push({'x': x, 'y': y});
                        }
                    }
                }
            }

            for (var i = 0; i < trampArray.length; i++) {
                for (var j = 0; j < 3; j++) {
                    possibleDirectionsAvaiables = [];
                    var x = trampArray[i].x;
                    var y = trampArray[i].y;
                    var pos = Math.floor(((Math.random() * 4) + 1) - 1);
                    if (pos <= 1 && mapPerRows[y][x] === TRAP_CELL) {
                        //Check Left
                        if (checkPossibleCell(x - 1, y, true)) {
                            possibleDirectionsAvaiables.push({
                                'x': x - 1,
                                'y': y,
                            });
                        }
                        //Check Right
                        if (checkPossibleCell(x + 1, y, true)) {
                            possibleDirectionsAvaiables.push({
                                'x': x + 1,
                                'y': y,
                            });
                        }
                        //Check Down
                        if (checkPossibleCell(x, y - 1, true)) {
                            possibleDirectionsAvaiables.push({
                                'x': x,
                                'y': y - 1,
                            });
                        }
                        //Check Up
                        if (checkPossibleCell(x, y + 1, true)) {
                            possibleDirectionsAvaiables.push({
                                'x': x,
                                'y': y + 1,
                            });
                        }

                        cellChosen = possibleDirectionsAvaiables[Math.floor(((Math.random() * possibleDirectionsAvaiables.length) + 1) - 1)];
                        if (cellChosen) {
                            x = cellChosen.x;
                            y = cellChosen.y;
                            cellAcumCol.push(cellChosen);
                            mapPerRows[y][x] = TRAP_CELL
                            cellAcum++;
                        }

                    }
                }

            }


            //Put Platform
            var platformPosition;
            for (var y = 0; y < mapPerRows.length; y++) {
                for (var x = 0; x < mapPerRows[y].length; x++) {
                    if (mapPerRows[y][x] === NORMAL_CELL && !platformPosition) {
                        if (mapPerRows[y][x + 1] === NORMAL_CELL) {
                            platformPosition = {
                                'x': x,
                                'y': y
                            }
                        }
                    }

                }
            }

            var isBlockedCell = function isBlockedCell(cellState) {
                var isBlocked = false;
                if (cellState === BLOCK_CELL
                    || cellState === BLOCK_CELL_LEFT
                    || cellState === BLOCK_CELL_RIGHT
                    || cellState === BLOCK_CELL_UP
                    || cellState === CEILING_CELL
                    || cellState === BLOCK_CELL_UP_DOWN
                    || cellState === BLOCK_CELL_UP_CORNER
                    || cellState === BLOCK_CELL_UP_CORNER_RIGTH
                    || cellState === BLOCK_CELL_UP_CORNER_LEFT

                ) {
                    isBlocked = true;
                }
                return isBlocked;
            }

            //improve map block design
            for (var y = 0; y < mapPerRows.length; y++) {
                for (var x = 0; x < mapPerRows[y].length; x++) {
                    if (mapPerRows[y][x] === BLOCK_CELL) {
                        var cellUp = mapPerRows[y - 1] && mapPerRows[y - 1][x] && isBlockedCell(mapPerRows[y - 1][x]);
                        var cellDown = mapPerRows[y + 1] && mapPerRows[y + 1][x] && isBlockedCell(mapPerRows[y + 1][x]);
                        var cellRigth = mapPerRows[y] && mapPerRows[y][x + 1] && isBlockedCell(mapPerRows[y][x + 1]);
                        var cellLeft = mapPerRows[y] && mapPerRows[y][x - 1] && isBlockedCell(mapPerRows[y][x - 1]);
                        if (cellRigth && cellLeft && cellDown) {
                            mapPerRows[y][x] = BLOCK_CELL_UP;
                        } else if (cellLeft && cellUp && cellDown) {
                            mapPerRows[y][x] = BLOCK_CELL_RIGHT;
                        } else if (cellRigth && cellUp && cellDown) {
                            mapPerRows[y][x] = BLOCK_CELL_LEFT;
                        } else if (cellUp && cellDown && !cellRigth && !cellLeft) {
                            mapPerRows[y][x] = BLOCK_CELL_UP_DOWN;
                        } else if (!cellUp && cellDown && !cellRigth && !cellLeft) {
                            mapPerRows[y][x] = BLOCK_CELL_UP_CORNER;
                        } else if (!cellUp && cellDown && !cellRigth && cellLeft) {
                            mapPerRows[y][x] = BLOCK_CELL_UP_CORNER_RIGTH;
                        } else if (!cellUp && cellDown && cellRigth && !cellLeft) {
                            mapPerRows[y][x] = BLOCK_CELL_UP_CORNER_LEFT;
                        }
                    }

                }
            }


            //Final Map
            for (var i = 0; i < mapPerRows.length; i++) {
                map = map.concat(mapPerRows[i]);
            }

            //Random Floor

            for (var i = 0; i < map.length; i++) {
                if (map[i] === NORMAL_CELL) {
                    var pos = Math.floor(((Math.random() * 10) + 1) - 1);
                    if (pos === 1) {
                        map[i] = NORMAL_CELL_2;
                    }
                }
            }


            return {
                'mapData': map,
                'mapPlatform': platformPosition
            };
        }
        ;

    var map = createMap(width, height);


//Object
    var mapTile = {
        "height": height,
        "layers": [
            {
                "data": map.mapData,
                "height": height,
                "name": "Tile Layer 1",
                "opacity": 1,
                "type": "tilelayer",
                "visible": false,
                "width": width,
                "x": 0,
                "y": 0
            }],
        "orientation": "orthogonal",
        "properties": {},
        "tileheight": 128,
        "tilesets": [
            {
                "firstgid": 1,
                "image": "tiles2.png",
                "imageheight": 640,
                "imagewidth": 512,
                "margin": 0,
                "name": "tiles",
                "properties": {},
                "spacing": 0,
                "tileheight": 128,
                "tilewidth": 128
            }],
        "tilewidth": 128,
        "version": 1,
        "width": width
    }

//Final object to return;
    var mapInfo = {
        'mapTile': mapTile,
        'mapPlatform': map.mapPlatform

    }

    return mapInfo;

}

},{}],22:[function(require,module,exports){
'use strict';

var gameData = require('../game-data');

var Hud = function (game, config) {
    Phaser.Group.call(this, game, game.world, 'Hud', false, true, Phaser.Physics.ARCADE);
    var x = game.camera.position.x - (960 / 2),
        y = game.camera.position.y - (720 / 2),
        powerups = game.config.powerups.list,
        weapons = game.character.weapons,
        coins = game.config.hud.coins,
        self = this;

    //Esto es el background de shield
    this.bg = game.add.sprite(x + game.config.hud.offsetX, y + game.config.hud.offsetY, "hudBG");
    this.bg.fixedToCamera = true;

    this.progress = {};
    this.powerUps = {};
    this.weapons = {};
    this.sealtCol = [];

    var checkSealtVisibility = function checkSealtVisibility() {
        for (var i = 0; i < 5; i++) {
            self.sealtCol[i].visible = (gameData.shield >= (i + 1));
        }
    }

    config.map(function (item) {
        //Config
        if (item.id === 'life') {
            self.progress[item.id] = game.add.sprite(
                x + game.config.hud.offsetX + item.data.x,
                y + game.config.hud.offsetY + item.data.y,
                item.assetName
            );
            self.progress[item.id].value = item.value;
            self.progress[item.id].fixedToCamera = true;
        } else {
            for (var i = 0; i < 5; i++) {
                var currentSeat = game.add.sprite(
                    x + game.config.hud.offsetX + item.data.x + (i * 22),
                    y + game.config.hud.offsetY + item.data.y + 31,
                    item.assetName
                );
                currentSeat.value = item.value;
                currentSeat.fixedToCamera = true;

                self.sealtCol.push(currentSeat);
            }
        }
    });

    checkSealtVisibility();

    var test = function test (){
        powerups.map(function (item) {
            self.powerUps[item.id] = game.add.sprite(item.hud.x, item.hud.y, item.hud.asset);
            self.powerUps[item.id].value = gameData.powerUps[item.id];
            self.powerUps[item.id].fixedToCamera = true;
            if (self.powerUps[item.id].value > 0){
                self.powerUps[item.id].alpha = 1;
            }else{
                self.powerUps[item.id].alpha = 0.5;
            }


        });
    }
    test();


    //Todo
    /* var weaponsPos = [{x: 28, y: 88}, {x: 140, y: 88}]

     for (var i = 0, item; i <= 1; i++) {
     item = weapons[i];
     self.weapons[item.name] = game.add.sprite(weaponsPos[i].x, weaponsPos[i].y, item.name);
     self.weapons[item.name].fixedToCamera = true;
     self.weapons[item.name].value = item.maxBullets;
     }*/

    this.coins = game.add.sprite(coins.x, coins.y, coins.asset);
    this.coins.value = gameData.currentCoins;

    this.titleCoins = self.game.add.bitmapText(coins.x + 60, coins.y + 25, 'medium', "" + gameData.currentCoins);
    this.titleCoins.anchor.set(0.5);
    this.titleCoins.fixedToCamera = true;

    this.coins.fixedToCamera = true;

    game.hud = this;
    window.myGame = game;

    this.updateValues = function updateValues() {
        var healthWidth = (210 * gameData.life) / game.config.firstDataGameState.life;
        this.progress.life.width = healthWidth;

        this.titleCoins.text = "" + gameData.currentCoins;
        checkSealtVisibility();
    };

    return this;
};

Hud.prototype = Object.create(Phaser.Group.prototype);
Hud.prototype.constructor = Hud;
Hud.prototype.increment = function (id, value, type) {
};
Hud.prototype.anim = function (id, value, type) {
    console.log("anim", args);
};


module.exports = Hud;
},{"../game-data":19}],23:[function(require,module,exports){
'use strict';

var gameData = require('../game-data');

var Platform = function Platform(game) {
    Phaser.Sprite.call(this, game, 0, 0, 'exitPlatform');
    this.game.add.existing(this);
    this.x = this.game.character.x;
    this.y = this.game.character.y;
    this.anchor.x = 0.5;
    this.anchor.y = 0.9;
    this.alpha = 0;

    var isShown = false;

    var animation = this.animations.add('start');
    animation.onComplete.add(function () {
        setTimeout(function() {
            gameData.headNum = game.character.headNum;
            gameData.gender = game.character.mascWom;
            gameData.sex = game.character.sex;
            gameData.currentLevel++;
            game.state.start('powerup');
        }, 400);

    });

    var tween = this.game.add.tween(this)
        .from({y: this.y - 500}, 1000, Phaser.Easing.Cubic.InOut);

    tween.onComplete.add(function() {
       animation.play('start', 6);
    });


    this.update = function update () {
        this.x = this.game.character.x;
        this.y = this.game.character.y;
        if(gameData.enemies <= 0 && !isShown) {
            isShown = true;
            this.alpha = 1;
            tween.start();

        }
    };
};


Platform.prototype = Object.create(Phaser.Sprite.prototype);
Platform.prototype.constructor = Platform;

module.exports = Platform;

},{"../game-data":19}],24:[function(require,module,exports){
'use strict';
var Platform = function Platform(params) {
    Phaser.Sprite.call(this, params.game, params.x, params.y -20, 'platform_anim');
    this.game.add.existing(this);

    var animation = this.animations.add('start', [0,1,2,3,4,5,6,7,8,9,10,11], 12);
    animation.onComplete.add(function () {

    });
    animation.play('start');
};


Platform.prototype = Object.create(Phaser.Sprite.prototype);
Platform.prototype.constructor = Platform;

module.exports = Platform;

},{}],25:[function(require,module,exports){
var gameData = require('../game-data');

var Powerup = function Powerup(params) {
	this.game = params.game;

	Phaser.Group.call(this, params.game, params.game.world, params.configPowerup);

	var self = this,
		  config = params.configPowerup;
	
	this.x = config.x;
	this.y = config.y;

	var callbackclickeBtn = function callbackclickeBtn(){
        gameData.powerUps[config.id] += config.incremental;
        self.game.state.start('play');
	};

	var initButton = function initButton(){
		self.btn = self.game.add.button(0, 0, self.game.config.powerups.spriteNameBtn, callbackclickeBtn, self, 1, 0, 0, 0, self);
	};

	var initNum = function initNum(){
        var style = { font: "bold 32px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
        self.num = self.game.add.text(58, -50, gameData.powerUps[config.id].toString(), style, self);
	};

	initButton();
	initNum();

};
Powerup.prototype = Object.create(Phaser.Group.prototype);
Powerup.prototype.constructor = Powerup;

module.exports = Powerup;
},{"../game-data":19}],26:[function(require,module,exports){
var dispatcher = require('../Dispatcher');
var gameData = require('../game-data');
var utils = require('../Utils');
'use strict';

var RewardsController = function RewardsController(params) {
    this.awarsPendingToCollect = [];
    this.game = params.game;
    var self = this;
    var createReward = function createReward(awardPos) {
        var reward;
        var type;
        var rewardIndex = (utils.randomNumber(1, 100));
        if (rewardIndex <= 20) {
            reward = self.game.add.sprite(awardPos.x, awardPos.y, 'live_box');
            type = 'live_box';
        } else if (rewardIndex > 20 && rewardIndex <= 60) {
            reward = self.game.add.sprite(awardPos.x, awardPos.y, 'coinRewards', 1);
            type = 'coinRewards';
        } else if (rewardIndex > 60) {
            reward = self.game.add.sprite(awardPos.x, awardPos.y, 'ammo');
            type = 'ammo';
        }
        self.awarsPendingToCollect.push({sprite:reward, type:type});
    }

    var checkPowerUp = function checkPowerUp(awardPos) {
        var existsArm = (utils.randomNumber(1, 100) > 60);
        if (existsArm) {
            createReward(awardPos);
        }
    };

    var checkRewardUp = function checkRewardUp(character) {
        for (var i = 0; i < self.awarsPendingToCollect.length; i++) {
            var currentReward = self.awarsPendingToCollect[i];
            if (currentReward.sprite.overlap(character)) {
                switch (currentReward.type){
                    case 'live_box':
                        gameData.life = self.game.config.firstDataGameState.life;
                        break;
                    case 'ammo':
                        character.weapons[character.activeWeapon].totalBullets = character.weapons[character.activeWeapon].totalBullets + character.weapons[character.activeWeapon].bulletsPerCharger;
                        break;
                    case 'coinRewards':
                        gameData.currentCoins = gameData.currentCoins + 25;
                        break
                }
                currentReward.sprite.visible = false;
                self.awarsPendingToCollect.splice(i, 1);
            }
        }

    };


    var initListeners = function initListeners() {
        dispatcher.listen("createPowerUp", checkPowerUp);
        dispatcher.listen("setRewardCollision", checkRewardUp);
    }

    initListeners();

};

module.exports = RewardsController;
},{"../Dispatcher":9,"../Utils":12,"../game-data":19}],27:[function(require,module,exports){
'use strict';
var dispatcher = require('../../modules/Dispatcher');
var Trap = function Trap(params) {
    Phaser.Sprite.call(this, params.game, params.x, params.y, params.game.config.trap.spriteName);
    var self = this;
    var hasBeenCollision = false;

    var onTrapCollision = function onTrapCollision(character) {
        if (self.overlap(character)) {
            if ((Math.abs(self.y - character.y)) < character.height && (Math.abs(character.y - self.y)) < character.height) {
                hasBeenCollision = true;
                dispatcher.dispatch('characterVelChanged', 'trap');
            }
        } else {
            if (hasBeenCollision) {
                hasBeenCollision = false;
                dispatcher.dispatch('characterVelChanged', 'normal');
            }
        }
    };

    var addListeners = function addListeners() {
        dispatcher.listen("setTrapCollision", onTrapCollision)
    };

    addListeners();

    this.game.add.existing(this);
};


Trap.prototype = Object.create(Phaser.Sprite.prototype);
Trap.prototype.constructor = Trap;

module.exports = Trap;

},{"../../modules/Dispatcher":9}],28:[function(require,module,exports){
module.exports=require(12)
},{}],29:[function(require,module,exports){
var scream = require('scream'),
	platform = require('platform'),
	brim = require('../../plugins/brim'),
	theGame = null,
	checkiOS = function () {
		//cached result
		var isIOS = platform.os.family === 'iOS' && parseInt(platform.os.version, 10) >= 8;
		checkiOS = function () {
			return isIOS;
		};
		return isIOS;
	},
	goFull = function goFull() {
		if (!theGame.scale.isFullScreen && !checkiOS()) {
			theGame.scale.startFullScreen(false, false);
		}
	},
	viewport = {
		isStarted: false,
		start: function (game) {
			if (this.isStarted) {
				return;
			}
			var scr = scream({}),
				warning = document.getElementById('portraitWarning'),
				content = document.getElementById('content'),
				managePortraitWarning = function managePortraitWarning() {
					//console.log('turn!');
					if (warning && content && !game.device.desktop) {
						console.log(scr.getOrientation());
						var isLandscape = scr.getOrientation() === 'portrait';
						warning.style.display = isLandscape ? 'none' : 'block';
						content.style.display = isLandscape ? 'block' : 'none';
					}
				};

			this.isStarted = true;
			theGame = game;
			game.scale.fullScreenScaleMode = Phaser.ScaleManager.SHOW_ALL;
			game.scale.refresh();
			if (!game.device.desktop){
				game.input.onDown.add(goFull, this);
			}

			scr.on('orientationchangeend', function () {
				managePortraitWarning();
			});

			managePortraitWarning();

			if (checkiOS()) {
				var bri = brim({
					viewport: scr
				});

				bri.on('viewchange', function (e) {
					document.body.className = e.viewName;
					console.log(document.body.className);

				});
			}
		}
	};

module.exports = viewport;

},{"../../plugins/brim":48,"platform":1,"scream":4}],30:[function(require,module,exports){
var Dispatcher = require('../Dispatcher');

var Bullet = function (game, key) {
    var self = this;
    Phaser.Sprite.call(this, game, 0, 0, key);
    this.anchor.set(0.5);

    var init = function init(){
        self.checkWorldBounds = true;
        self.outOfBoundsKill = true;
        self.exists = false;
        self.game.physics.arcade.enable(self);
        self.destroyOnCollision = true;
        Dispatcher.listen('testToKill', function(damage){
            if(self.exists) {
                self.damage = damage;
                Dispatcher.dispatch('checkCollideWithCharacterBullet', self);
            }
        });
    };

    this.initCallbacks = function initCallbacks() {
        this.game.events.setCollideEnemyBullet.add(function setCollideEnemyBullet(element) {
            if(this.destroyOnCollision){
                this.game.physics.arcade.collide(this, element, deleteBullet);
            }
        }, this);
    };

    var deleteBullet = function deleteBullet(){
        if(self.destroyOnCollision){
            self.exists = false;
        }
    };

    init();
    this.initCallbacks();
};

Bullet.prototype = Object.create(Phaser.Sprite.prototype);
Bullet.prototype.constructor = Bullet;

module.exports = Bullet;
},{"../Dispatcher":9}],31:[function(require,module,exports){
var Bullet = require('../bullet');

var BigBall = function (game, key) {
    Bullet.call(this, game, key);
};

BigBall.prototype = Object.create(Bullet.prototype);
BigBall.prototype.constructor = BigBall;

BigBall.prototype.fire = function (source, angle, target, speed) {
    this.reset(source.x, source.y);
    this.scale.set(1);

    this.game.physics.arcade.velocityFromAngle(angle*57, speed, this.body.velocity);
    this.rotation = angle;
    //this.rotation = this.game.physics.arcade.moveToPointer(this, speed, target);
};


module.exports = BigBall;
},{"../bullet":30}],32:[function(require,module,exports){
var Bullet = require('../bullet');

var Electro = function (game) {
    Bullet.call(this, game, 'electro');
    var self = this;
    this.fixedWidth = this.body.width;
    this.fixedHeight = this.body.height;
    this.destroyOnCollision = true;
    this.song = this.game.add.sound('electro', 0.2);
    /*this.explosion = this.game.add.sprite(this.x, this.y, 'explosion', null);
    this.explosion.checkWorldBounds = true;
    this.explosion.outOfBoundsKill = true;
    this.explosion.alpha = 0;
    this.explosion.anchor.x = 0.5;
    this.explosion.anchor.y = 0.5;
    this.explosion.tween = this.game.add.tween(this.explosion).from({alpha: 0}).to({alpha: 1 }, 1000, Phaser.Easing.Linear.In);
    this.explosion.tween.onComplete.add(function(){
        this.explosion.alpha = 0;
    }, this);
    */

    //this.game.physics.arcade.enable(this.explosion);
};

Electro.prototype = Object.create(Bullet.prototype);
Electro.prototype.constructor = Electro;

Electro.prototype.fire = function (source, angle, target, speed) {
    var self = this;
    this.reset(source.x, source.y);
    //this.explosion.reset(source.x, source.y);
    this.scale.set(1);
    this.song.play();
    this.animations.add('start', [0,1,2,3,4]);
    this.animations.play('start', 12, true);
    /*setInterval(function(){
    self.explosion.tween.start();
        self.body.setSize(this.fixedWidth * 3.7, this.fixedHeight * 3.7, self.x, self.y);
    }, 1000);*/
    this.game.physics.arcade.velocityFromAngle(angle * 57, speed, this.body.velocity);
    //this.game.physics.arcade.velocityFromAngle(angle * 57, speed, this.explosion.body.velocity);
    this.rotation = angle;
    //this.rotation = this.game.physics.arcade.moveToPointer(this, speed, target);
};


module.exports = Electro;
},{"../bullet":30}],33:[function(require,module,exports){
var Bullet = require('../bullet');
var SmallBall = function (game, key) {
    Bullet.call(this, game, key);
    this.song = this.game.add.sound('normalBall', 0.2);
};

SmallBall.prototype = Object.create(Bullet.prototype);
SmallBall.prototype.constructor = SmallBall;

SmallBall.prototype.fire = function (source, angle, target, speed) {
    this.reset(source.x, source.y);
    this.scale.set(1);
    this.song.play();
    this.game.physics.arcade.velocityFromAngle(angle*57, speed, this.body.velocity);
    this.rotation = angle;
    //this.rotation = this.game.physics.arcade.moveToPointer(this, speed, target);
};

SmallBall.prototype.update = function update() {
    if (this.exists) {
        Dispatcher.dispatch('checkCollideWithCharacterBullet', this);
    }
}

module.exports = SmallBall;
},{"../bullet":30}],34:[function(require,module,exports){
'use strict';
var utils = require('../Utils');
var gameData = require('../game-data');

var Weapon = function (game, config, bullet, body) {
    Phaser.Group.call(this, game, game.world, config.name, false, true, Phaser.Physics.ARCADE);
    var self = this;


    var init = function init(){
        self.game.events.setCollideBullet = new Phaser.Signal();
        self.nextFire = config.nextFire;
        self.speed = config.speed;
        self.fireRate = utils.increasePercentage(config.fireRate, gameData.powerUps.firerate);
        self.bulletCounter = config.bulletCounter;
        self.bulletsPerCharger = config.bulletsPerCharger
        self.totalBullets = utils.increasePercentage(config.totalBullets, gameData.powerUps.ammunition);
        self.totalBullets = self.totalBullets - self.bulletsPerCharger
        self.gunName = config.gunName;
        self.oneShootPerClick = config.oneShootPerClick;
        self.shootDisabled = false;
        self.bulletType = bullet;
        self.damage = utils.increasePercentage(config.damage, gameData.powerUps.damage);
        self.gunSprite = self.game.add.sprite(0, 0, config.sprite);
        body.addChild(self.gunSprite);
        self.gunSprite.visible = false;
        self.gunSprite.anchor.y = 0.5;

        self.update = function update(){
            self.gunSprite.angle = this.game.physics.arcade.angleToPointer(body)*57;
            if(self.gunSprite.angle > -90 && self.gunSprite.angle < 90) {
            } else {
                self.gunSprite.angle = -self.gunSprite.angle;

            }
        }

    };

    var buildBullets = function buildBullets(){
        for (var i = 0; i < config.maxObjects; i++)
        {
            self.add(new self.bulletType(game, config.bulletAsset), true);
        }
    };

    var initCallbacks = function initCallbacks(){
        self.game.events.reloadGun.add(function reloadGun(gunName) {
            if(self.gunName === gunName && (self.totalBullets > 0)){
                console.log('totalbullets', self.totalBullets);
                self.bulletCounter = 0;
                self.totalBullets = self.totalBullets - self.bulletsPerCharger
            }
        });
    };

    init();
    buildBullets();
    initCallbacks();
};

Weapon.prototype = Object.create(Phaser.Group.prototype);
Weapon.prototype.constructor = Weapon;
module.exports = Weapon;
},{"../Utils":12,"../game-data":19}],35:[function(require,module,exports){
var Weapon = require('../weapon.js');

var ElectroGun = function (game, bullet, body) {
    Weapon.call(this, game, game.config.weapons.electroGun, bullet, body);
};

ElectroGun.prototype = Object.create(Weapon.prototype);
ElectroGun.prototype.constructor = Weapon;

ElectroGun.prototype.fire = function (source, target, speed) {
    if (this.game.time.time < this.nextFire) { return; }
    var myTarget = target || this.game.input.activePointer;
    var mySpeed = speed || this.speed;

    var angle = this.game.physics.arcade.angleToPointer(source);

    if(this.bulletCounter < this.bulletsPerCharger){
        this.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        this.nextFire = this.game.time.time + this.fireRate;
        this.bulletCounter++;
    }
};
module.exports = ElectroGun;
},{"../weapon.js":34}],36:[function(require,module,exports){
var Weapon = require('../weapon.js');

var ShotGun = function (game, bullet, body) {
    Weapon.call(this, game, game.config.weapons.machineGun, bullet, body);
};

ShotGun.prototype = Object.create(Weapon.prototype);
ShotGun.prototype.constructor = Weapon;
ShotGun.prototype.fire = function (source, target, speed) {
    if (this.game.time.time < this.nextFire) { return; }
    var x = source.x + 10;
    var y = source.y + 10;
    var myTarget = target || this.game.input.activePointer;
    var mySpeed = speed || this.speed;

    var angle = this.game.physics.arcade.angleToPointer(source);

    if((this.bulletCounter < this.bulletsPerCharger)){
        this.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        this.nextFire = this.game.time.time + this.fireRate;
        this.bulletCounter++;
    }
};
module.exports = ShotGun;
},{"../weapon.js":34}],37:[function(require,module,exports){
var Weapon = require('../weapon.js');

var ShotGun = function (game, bullet, body) {
    Weapon.call(this, game, game.config.weapons.shotgun, bullet, body);

};

ShotGun.prototype = Object.create(Weapon.prototype);ShotGun.prototype.constructor = Weapon;
ShotGun.prototype.fire = function (source, target, speed) {
    if (this.game.time.time < this.nextFire) { return; }
    var x = source.x + 10;
    var y = source.y + 10;
    var myTarget = target || this.game.input.activePointer;
    var mySpeed = speed || this.speed;

    var angle = this.game.physics.arcade.angleToPointer(source);

    if(this.bulletCounter < this.bulletsPerCharger){
        this.getFirstExists(false).fire(source, angle + 0.2, myTarget, mySpeed, 0, 0);
        this.getFirstExists(false).fire(source, angle - 0.2, myTarget, mySpeed, 0, 0);
        this.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        this.nextFire = this.game.time.time + this.fireRate;
        this.bulletCounter = this.bulletCounter + 3;
    }
};
module.exports = ShotGun;
},{"../weapon.js":34}],38:[function(require,module,exports){
var Weapon = require('../weapon.js');
var Utils = require('../../Utils.js');

var SuperSpryGun = function (game, bullet, body) {
    Weapon.call(this, game, game.config.weapons.superSpryGun, bullet, body);
};

SuperSpryGun.prototype = Object.create(Weapon.prototype);
SuperSpryGun.prototype.constructor = Weapon;
SuperSpryGun.prototype.fire = function (source, target, speed) {
    if (this.game.time.time < this.nextFire) { return; }
    var x = source.x + 10;
    var y = source.y + 10;
    var myTarget = target || this.game.input.activePointer;
    var mySpeed = speed || this.speed;

    var angle = this.game.physics.arcade.angleToPointer(source);
    var randomNumber = function (from, to){
        return Math.floor((Math.random() * to) + from);
    };
    if(this.bulletCounter < this.bulletsPerCharger){
        this.getFirstExists(false).fire(source, angle + (randomNumber(-20, 20)/57), myTarget, mySpeed, 0, 0);
        this.getFirstExists(false).fire(source, angle + (randomNumber(-20, 20)/57), myTarget, mySpeed, 0, 0);
        this.getFirstExists(false).fire(source, angle - (randomNumber(-20, 20)/57), myTarget, mySpeed, 0, 0);
        this.getFirstExists(false).fire(source, angle - (randomNumber(-20, 20)/57), myTarget, mySpeed, 0, 0);
        this.nextFire = this.game.time.time + this.fireRate;
        this.bulletCounter = this.bulletCounter + 4;
    }
};
module.exports = SuperSpryGun;
},{"../../Utils.js":12,"../weapon.js":34}],39:[function(require,module,exports){
var Weapon = require('../weapon.js');

var ThreeGun = function (game, bullet, body) {
    Weapon.call(this, game, game.config.weapons.threeGun, bullet, body);
};

ThreeGun.prototype = Object.create(Weapon.prototype);
ThreeGun.prototype.constructor = Weapon;
ThreeGun.prototype.fire = function (source, target, speed) {

    if (this.game.time.time < this.nextFire) {
        return;
    }


    var myTarget = target || this.game.input.activePointer;
    var mySpeed = speed || this.speed;

    var angle = this.game.physics.arcade.angleToPointer(source);

    if (this.bulletCounter < this.bulletsPerCharger) {
        var self = this;

       setTimeout(function(){
            self.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        }, 100);
        setTimeout(function(){
            self.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        }, 200);
        setTimeout(function(){
            self.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        }, 300);

        this.nextFire = this.game.time.time + this.fireRate;
        this.bulletCounter = this.bulletCounter + 3;
    }
};
module.exports = ThreeGun;
},{"../weapon.js":34}],40:[function(require,module,exports){
var Weapon = require('../weapon.js');

var Revolver = function (game, bullet, body) {
    Weapon.call(this, game, game.config.weapons.pistol, bullet, body);
};

Revolver.prototype = Object.create(Weapon.prototype);
Revolver.prototype.constructor = Weapon;

Revolver.prototype.fire = function (source, target, speed) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 10;
    var y = source.y + 10;
    var myTarget = target || this.game.input.activePointer;
    var mySpeed = speed || this.speed;

    var angle = this.game.physics.arcade.angleToPointer(source);

        this.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        this.nextFire = this.game.time.time + this.fireRate;

};
module.exports = Revolver;
},{"../weapon.js":34}],41:[function(require,module,exports){
var Weapon = require('../weapon.js');

var Revolver = function (game, bullet, body) {
    Weapon.call(this, game, game.config.weapons.revolver, bullet, body);
};

Revolver.prototype = Object.create(Weapon.prototype);
Revolver.prototype.constructor = Weapon;

Revolver.prototype.fire = function (source, target, speed) {

    if (this.game.time.time < this.nextFire) { return; }

    var x = source.x + 10;
    var y = source.y + 10;
    var myTarget = target || this.game.input.activePointer;
    var mySpeed = speed || this.speed;

    var angle = this.game.physics.arcade.angleToPointer(source);

    if(this.bulletCounter < this.bulletsPerCharger){
        this.getFirstExists(false).fire(source, angle, myTarget, mySpeed, 0, 0);
        this.nextFire = this.game.time.time + this.fireRate;
        this.bulletCounter++;
    }

};
module.exports = Revolver;
},{"../weapon.js":34}],42:[function(require,module,exports){
'use strict';



function Boot() {
}

Boot.prototype = {
    preload: function(){
        this.game.load.image('loading_bg', 'assets/images/loading_bg.png');
        this.game.load.image('loading_bar', 'assets/images/loading_bar.png');
    },
    create: function () {
        this.game.plugins.screenShake = this.game.plugins.add(Phaser.Plugin.ScreenShake);
        this.game.plugins.screenShake.setup({
            shakeX: true,
            shakeY: true
        });

        this.game.stage.disableVisibilityChange = false;
        this.game.input.maxPointers = 1;

        if (this.game.device.desktop) {
            this.scale.scaleMode = Phaser.ScaleManager.NO_SCALE;
        } else {
            this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
            this.game.scale.pageAlignVertically = true;
            this.game.scale.pageAlignHorizontally = true;
        }
        //this.game.sound.mute = 1;
        this.game.state.start('preload');
    }
};

module.exports = Boot;

},{}],43:[function(require,module,exports){
'use strict';

var Assets = require('../modules/assets');

function Preload() {
    this.ready = false;
}

Preload.prototype = {
    create: function () {
        this.game.add.sprite(0, 0, 'creditsBG');
        this.clickMenuButton = function () {
            this.game.state.start('menu');
        };
        var menuButton = this.game.add.button(this.game.world.centerX, 700, 'menuButtonGameOver', this.clickMenuButton, this, 'gameover_buttons0005', 'gameover_buttons0004', 'gameover_buttons0004', 'gameover_buttons0004');
        menuButton.anchor.setTo(0.5);
        menuButton.inputEnabled = true;

    }
};

module.exports = Preload;

},{"../modules/assets":13}],44:[function(require,module,exports){
'use strict';
var viewport = require('../modules/viewport'),
    gameData = require('../modules/game-data');

function Menu() {
}

Menu.prototype = {
    create: function () {
        var self = this;
        this.game.camera.setPosition(0, 0);
        this.game.camera.x = 0;
        var graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0x180d22, 1);
        var bgColor = graphics.drawRect(0, 0, this.game.width, this.game.height);

        this.backgroundStars1 = this.game.add.sprite(0, 0, 'bgStars1');
        this.backgroundStars2 = this.game.add.sprite(0, 0, 'bgStars2');
        this.backgroundStars2.alpha = 0.2;

        this.game.add.tween(this.backgroundStars1)
            .to({alpha: 0.2}, 4000, Phaser.Easing.Linear.None, true, 0, -1, true);
        this.game.add.tween(this.backgroundStars2)
            .to({alpha: 1}, 4000, Phaser.Easing.Linear.None, true, 0, -1, true);


        this.planet1 = this.game.add.sprite(500, 350, 'planet1');
        this.planet1.anchor.set(0.5);
        this.planet2 = this.game.add.sprite(500, 350, 'planet2');
        this.planet2.anchor.set(0.5);


        var tween = this.game.add.tween(this.planet1)
            .to({x: 505}, 3000)
            .to({y: 355}, 3000)
            .to({x: 500}, 3000)
            .to({y: 350}, 3000);

        tween.onComplete.add(function() {
           tween.start()
        });
        tween.start();

        var tween2 = this.game.add.tween(this.planet2)
            .to({x: 495}, 3000)
            .to({y: 345}, 3000)
            .to({x: 500}, 3000)
            .to({y: 350}, 3000);

        tween2.onComplete.add(function() {
            tween2.start();
        });
        tween2.start();

        this.spaceship = this.game.add.sprite(450, 300, 'spaceship');
        this.spaceship.alpha = 0;
        this.spaceship.anchor.set(0.5);

        var tweenSpaceship = this.game.add.tween(this.spaceship)
            .to({y: 305}, 1000, Phaser.Easing.Linear.None, false, 0, -1, true);

        var animation = this.spaceship.animations.add('start');
        animation.onComplete.add(function() {
            tweenSpaceship.start();
            playTween.start();
            soundTween.start();

            self.game.time.events.add(150, function() {
                creditsTween.start();
            }, self);
            self.game.time.events.add(300, function() {
                achievementsTween.start();
            }, self);
        });

        var animateSpaceship = function animateSpaceship() {
            self.spaceship.alpha = 1;
            animation.play('start', 6);
        };

        this.game.time.events.add(Phaser.Timer.SECOND * 1, animateSpaceship, this);

        var clickPlay = function clickPlay() {
            selectClick.play();
            music.stop();
            self.game.state.start('play');
        };

        var clickAchievements = function clickAchievements() {
            selectClick.play();

            self.game.state.start('powerup');
        };

        var clickCredits = function clickCredits() {
            selectClick.play();
            self.game.state.start('credits');
        };
        var disableSound = function disableSound() {
            self.game.sound.mute = true;
            self.soundButtonInactive.alpha = 1;
            self.soundButtonInactive.inputEnabled = true;
            self.soundButtonActive.alpha = 0;
            self.soundButtonActive.inputEnabled = false;
        };
        var enableSound = function enableSound() {
            self.game.sound.mute = false;
            self.soundButtonInactive.inputEnabled = false;
            self.soundButtonInactive.alpha = 0;
            self.soundButtonActive.inputEnabled = true;
            self.soundButtonActive.alpha = 1;
        };

        var selectSound = this.game.add.audio('select');
        var selectClick = this.game.add.audio('selectClick');

        this.playButton = this.game.add.button(1140, 400, 'playBtn', clickPlay, this, 'play1', 'play2', 'play2', 'play2');
        this.playButton.anchor.setTo(0.5, 0.5);
        this.playButton.inputEnabled = true;
        var playTween = this.game.add.tween(this.playButton)
            .to({x: 750}, 600, Phaser.Easing.Cubic.InOut);

        this.playButton.onInputOver.add(function() {
           selectSound.play();
        });


        this.creditsButton = this.game.add.button(1140, 450, 'creditsBtn', clickCredits, this, 'credits1', 'credits2', 'credits2', 'credits2');
        this.creditsButton.anchor.setTo(0.5, 0.5);
        this.creditsButton.inputEnabled = true;
        var creditsTween = this.game.add.tween(this.creditsButton)
            .to({x: 750}, 600, Phaser.Easing.Cubic.InOut);

        this.creditsButton.onInputOver.add(function() {
            selectSound.play();
        });

        var clickIncubator = function clickIncubator() {
            this.game.state.start('incubator');
        };

        var incubatorButton = this.game.add.button(1140, 500, 'incubatorButtonGameOver', clickIncubator, this, 'gameover_buttons0001', 'gameover_buttons0000', 'gameover_buttons0000', 'gameover_buttons0000');
        incubatorButton.anchor.setTo(0.5, 0.5);
        incubatorButton.inputEnabled = true;

        var achievementsTween = this.game.add.tween(incubatorButton)
            .to({x: 750}, 600, Phaser.Easing.Cubic.InOut);

        incubatorButton.onInputOver.add(function() {
            selectSound.play();
        });

        this.soundButtonActive = this.game.add.button(850, 650, 'soundButton', disableSound, this, 'audioButton1a', 'audioButton1b', 'audioButton1b', 'audioButton1b');
        this.soundButtonActive.anchor.setTo(0.5, 0.5);
        this.soundButtonActive.inputEnabled = true;
        this.soundButtonActive.alpha = 0;
        var soundTween = this.game.add.tween(this.soundButtonActive)
            .to({alpha: 1}, 600, Phaser.Easing.Cubic.InOut);

        this.soundButtonInactive = this.game.add.button(850, 650, 'soundButton', enableSound, this, 'audioButton2a', 'audioButton2b', 'audioButton2b', 'audioButton2b');
        this.soundButtonInactive.anchor.setTo(0.5, 0.5);
        this.soundButtonInactive.inputEnabled = false;
        this.soundButtonInactive.alpha = 0;

        if(gameData.gameStarted === false) {
            gameData.gameStarted = true;
        }

        var music = this.game.add.sound('menuSong', 0.7, true);
       music.play();
       self.game.sound.mute = true;


        this.title = this.game.add.sprite(this.game.world.centerX + 170, 50, 'title');
        this.title.anchor.x = 0.5;

        this.title.alpha = 1;
        var tweenTitle = this.game.add.tween(this.title)
            .to({y: 60}, 1000, Phaser.Easing.Linear.None, true, 0, -1, true);

   /*     var titleAnimation = this.title.animations.add('start');
        setInterval(function() {
            titleAnimation.play('start', 6);
        }, 5000);*/

    }
};

module.exports = Menu;

},{"../modules/game-data":19,"../modules/viewport":29}],45:[function(require,module,exports){
'use strict';
var gameData = require('../modules/game-data');
var Character = require('../modules/Character');
var Chest = require('../modules/chest/Chest');
var Trap = require('../modules/trap/Trap');
var Platform = require('../modules/platform/Platform');
var ExitPlatform = require('../modules/platform/ExitPlatform');
var mapRandomGenerator = require('../modules/generator/MapRandomGenerator');
var EnemiesGenerator = require('../modules/generator/EnemiesGenerator');
var EnemiesBulletsController = require('../modules/enemies/EnemiesBulletsController');
var RewardsController = require('../modules/rewards/RewardsController');
var dispatcher = require('../modules/Dispatcher');
var Hud = require('../modules/hud/hud');
var utils = require('../modules/Utils');

var GameOver = require('../modules/GameOver');

var width = utils.randomNumber(10, 25);
var heigth = utils.randomNumber(10, 25);

function Play() {
}

Play.prototype = {
    preload: function () {
        this.mapInfo = mapRandomGenerator(width, heigth);
        var enemiesGenerator = EnemiesGenerator();

        this.load.tilemap('map', null, this.mapInfo.mapTile, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'assets/tiles/tileset' + utils.randomNumber(1,4) + '.png');
    },
    create: function () {
        var self = this;
        var resetGameData = function resetGameData(){
            var data = self.game.config.firstDataGameState;
            gameData.life = data.life;
            gameData.shield = data.shield;
            gameData.currentLevel = data.currentLevel;
            gameData.powerUps.health = data.powerUps.health;
            gameData.powerUps.shield = data.powerUps.shield;
            gameData.powerUps.firerate = data.powerUps.firerate;
            gameData.powerUps.ammunition = data.powerUps.ammunition;
            gameData.powerUps.speed = data.powerUps.speed;
            gameData.powerUps.damage = data.powerUps.damage;
        };

        dispatcher.init();

        var style = {font: '65px Arial', fill: '#000000', align: 'center'},
            mapWidth = width * 128,
            mapHeigth = heigth * 128;

        this.map = this.add.tilemap('map');
        this.chests = [];
        this.tramps = [];

        this.map.addTilesetImage('tiles', 'tiles');

        this.layer = this.map.createLayer('Tile Layer 1');

        this.map.setCollision(2, true, this.layer);
        this.map.setCollision(4, true, this.layer);
        this.map.setCollision(15, true, this.layer);
        this.map.setCollision(7, true, this.layer);
        this.map.setCollision(12, true, this.layer);
        this.map.setCollision(11, true, this.layer);
        this.map.setCollision(16, true, this.layer);
        this.map.setCollision(13, true, this.layer);


        this.platformPosition = this.map.getTile(this.mapInfo.mapPlatform.x, this.mapInfo.mapPlatform.y, this.layer);

        var collideChestSignal = this.game.events.setCollideChest = new Phaser.Signal();
        var collectChestSignal = this.game.events.collectChest = new Phaser.Signal();
        this.game.events.setCollideEnemies = new Phaser.Signal();
        this.game.events.setCollideEnemyBullet = new Phaser.Signal();
        this.game.events.heroIsMoving = new Phaser.Signal();
        this.game.events.gameOver = new Phaser.Signal();

        this.map.forEach(function (tile) {
            if (tile.index === 17) {
                this.chests.push(new Chest(tile.worldX, tile.worldY, this.game, collideChestSignal, collectChestSignal));
            } else if (tile.index === 10) {
                this.tramps.push(new Trap({x: tile.worldX, y: tile.worldY, game: this.game}));
            }
        }, this);

        this.platform = new Platform({x: this.platformPosition.worldX, y: this.platformPosition.worldY, game: this.game});


        this.rewardsCrontroller = new RewardsController({game: this.game})

        // Enemies bullets controller
        this.enemiesBulletsController = new EnemiesBulletsController(this.game);

        // enemies
        this.enemiesGenerator = new EnemiesGenerator(this.game);

        this.enemiesGenerator.generate(this.map, gameData.currentLevel, this.character);
        var randomSex = utils.randomNumber(1,2) === 1 ? 'man' : 'woman';
        var sex;
        !gameData.sex ? sex = randomSex : sex = gameData.sex;
        this.character = new Character(this.platformPosition.worldX + 108, this.platformPosition.worldY - 3, sex, this.game);

        this.game.world.setBounds(0, 0, mapWidth, mapHeigth);

        this.hud = new Hud(this.game, [
            {id: 'life', value:50, assetName: 'lifebar',  data: {x:2, y:2}},
            {id: 'shieldbar', value:60, assetName: 'shieldbar', data: {x:3, y:0}}
        ]);

        var gameOver = new GameOver(this.game);

        var music = this.game.add.sound('playSong1', 0.4, true);
        music.play();

        var initListeners = function initListeners(){
            dispatcher.listen('resetGameData', resetGameData);
        };

        var exitPlatform = new ExitPlatform(this.game);

        initListeners();
    },
    update: function () {
        this.game.events.setCollideChest.dispatch(this.character);
        this.game.events.setCollideCharacter.dispatch(this.layer);
        this.game.events.setCollideBullet.dispatch(this.layer);
        this.game.events.setCollideEnemies.dispatch(this.layer);
        this.game.events.setCollideEnemyBullet.dispatch(this.layer);

        this.game.physics.arcade.collide(this, this.game.layer);

        dispatcher.dispatch("setTrapCollision", this.character);
        dispatcher.dispatch("testToKill", this.character.weapons[this.character.activeWeapon].damage);
        dispatcher.dispatch("setRewardCollision", this.character);

        this.game.events.heroIsMoving.dispatch(this.character);

        this.hud.updateValues();
    }
};

module.exports = Play;

},{"../modules/Character":8,"../modules/Dispatcher":9,"../modules/GameOver":10,"../modules/Utils":12,"../modules/chest/Chest":14,"../modules/enemies/EnemiesBulletsController":15,"../modules/game-data":19,"../modules/generator/EnemiesGenerator":20,"../modules/generator/MapRandomGenerator":21,"../modules/hud/hud":22,"../modules/platform/ExitPlatform":23,"../modules/platform/Platform":24,"../modules/rewards/RewardsController":26,"../modules/trap/Trap":27}],46:[function(require,module,exports){
'use strict';
var gameData = require('../modules/game-data');
var Powerup = require('../modules/powerups/Powerup');


function Powerups() {
}

Powerups.prototype = {
    create: function () {
        var self = this,
            config = this.game.config.powerup;
        this.bg = this.game.add.sprite(0,0, 'bgPowerup');

        this.game.camera.setPosition(0, 0);
        this.game.camera.x = 0;
        var graphics = this.game.add.graphics(0, 0);
        graphics.beginFill(0x180d22, 1);

        var initTexts = function initTexts(){
            self.title = self.game.add.bitmapText(self.game.world.centerX, 50, 'title', 'LEVEL ' + gameData.currentLevel);
            self.title.anchor.set(0.5);

            self.title = self.game.add.bitmapText(self.game.world.centerX, 210, 'big', 'SUCCESS');
            self.title.anchor.set(0.5);

            self.title = self.game.add.bitmapText(self.game.world.centerX, 480, 'medium', 'SELECT A POWER UP');
            self.title.anchor.set(0.5);
        };

        this.powerupTypes = this.game.config.powerups.list;
        this.powerups = [];

       for (var i = 0, len = this.powerupTypes.length; i < len; i++) {
           var powerup = new Powerup({game: self.game, configPowerup: this.powerupTypes[i]});
       }

        initTexts();
    }
};

module.exports = Powerups;

},{"../modules/game-data":19,"../modules/powerups/Powerup":25}],47:[function(require,module,exports){
'use strict';

var Assets = require('../modules/assets');

function Preload() {
    this.ready = false;
}

Preload.prototype = {
    preload: function () {
        this.game.add.sprite(0, 0, 'loading_bg');
        this.loadingBar = this.game.add.sprite(0, 0, 'loading_bar');

        this.game.load.bitmapFont('big', 'assets/fonts/big.png', 'assets/fonts/big.fnt');
        this.game.load.bitmapFont('small', 'assets/fonts/small.png', 'assets/fonts/small.fnt');
        this.game.load.bitmapFont('medium', 'assets/fonts/medium.png', 'assets/fonts/medium.fnt');
        this.game.load.bitmapFont('title', 'assets/fonts/title.png', 'assets/fonts/title.fnt');
        this.game.load.atlasJSONHash('exitPlatform', 'assets/images/end_platform.png', 'assets/images/end_platform.json');

        this.load.setPreloadSprite(this.loadingBar, 0);

        var self = this;
        var assets = new Assets(this.game);
        assets.load(this.game.config.assets, function(){
            self.onLoadComplete();
        });
    },
    create: function () {
    },
    update: function () {
        if (!!this.ready) {
            this.game.state.start('menu');
        }
    },
    onLoadComplete: function () {
        this.ready = true;
    }
};

module.exports = Preload;

},{"../modules/assets":13}],48:[function(require,module,exports){
(function (global){
/** MODIFIED TO WORK PROPERLY. IF YOU NEED TO UPDATE THIS LIBRARY PLEASE
 * CHECK OUT THE DIFFERENCES PREVIOUSLY.
 * @version 1.0.11
 * @link https://github.com/gajus/brim for the canonical source repository
 * @license https://github.com/gajus/brim/blob/master/LICENSE BSD 3-Clause
 */
/**
* @link https://github.com/gajus/sister for the canonical source repository
* @license https://github.com/gajus/sister/blob/master/LICENSE BSD 3-Clause
*/
function Sister () {
    var sister = {},
        events = {};

    /**
     * @name handler
     * @function
     * @param {Object} data Event data.
     */

    /**
     * @param {String} name Event name.
     * @param {handler} handler
     * @return {listener}
     */
    sister.on = function (name, handler) {
        var listener = {name: name, handler: handler};
        events[name] = events[name] || [];
        events[name].unshift(listener);
        return listener;
    };

    /**
     * @param {listener}
     */
    sister.off = function (listener) {
        var index = events[listener.name].indexOf(listener);

        if (index != -1) {
            events[listener.name].splice(index, 1);
        }
    };

    /**
     * @param {String} name Event name.
     * @param {Object} data Event data.
     */
    sister.trigger = function (name, data) {
        var listeners = events[name],
            i;

        if (listeners) {
            i = listeners.length;
            while (i--) {
                listeners[i].handler(data);
            }
        }
    };

    return sister;
}

global.gajus = global.gajus || {};
global.gajus.Sister = Sister;


var Brim;

Brim = function Brim (config) {
    var brim,
        player = {},
        viewport,
        eventEmitter;
    
    if (!(this instanceof Brim)) {
        return new Brim(config);
    }

    brim = this;

    if (!config.viewport || !(config.viewport instanceof gajus.Scream)) {
        throw new Error('Configuration property "viewport" must be an instance of Scream.');
    }

    viewport = config.viewport;

    /**
     *
     */
    brim._setupDOMEventListeners = function () {
        viewport.on('orientationchangeend', function () {
            brim._treadmill();
            brim._main();
            brim._mask();
        });

        viewport.on('viewchange', function (e) {
            brim._main();
            brim._mask();

            eventEmitter.trigger('viewchange', e);
        });

        brim._main();
        brim._mask();

        // Disable window scrolling when in minimal view.
        // @see http://stackoverflow.com/a/26853900/368691
        (function () {
            var firstMove;

            global.document.addEventListener('touchstart', function (e) {
                firstMove = true;
            });

            global.document.addEventListener('touchmove', function (e) {
                if (viewport.isMinimalView() && firstMove) {
                    e.preventDefault();
                }

                firstMove = false;
            });
        } ());
    };

    /**
     * Setting the offset ensures that "resize" event is triggered upon loading the page.
     * A large (somewhat arbitrary) offset ensures that the page view does not change after device orientation.
     *
     * @see http://stackoverflow.com/questions/26784456/how-to-get-window-height-when-in-fullscreen
     */
    brim._treadmill = function () {
        global.scrollTo(0, 1000);
    };

    /**
     * Sets the dimensions and position of the drag mask player. The mask is an overlay on top
     * of the treadmill and the main content.
     *
     * The mask is visible when view is full.
     */
    brim._mask = function () {
        if (viewport.isMinimalView()) {
            player.mask.style.display = 'none';
        } else {
            player.mask.style.display = 'block';
            brim._setMaskSize();
            brim._repaintElement(player.mask);
            setTimeout(function(){
                if(player.mask.style.width != global.innerWidth + 'px'){
                    brim._setMaskSize();
                }
            },100);
        }
    };
    
    brim._setMaskSize = function(){
            player.mask.style.width = global.innerWidth + 'px';
            player.mask.style.height = (global.innerHeight * 2) + 'px';
    };

    /**
     * Sets the dimensions and position of the main player.
     *
     * The main element remains visible beneath the mask.
     */
    brim._main = function () {
        //player.main.style.width = global.innerWidth + 'px';
        //player.main.style.height = global.innerHeight + 'px';
        //brim._repaintElement(player.main);
    };

    /**
     * @return {HTMLElement}
     */
    brim._makeTreadmill = function () {
        var treadmill = document.querySelector('#brim-treadmill');

        if (treadmill) {
            throw new Error('There is an existing treadmill element.');
        }

        treadmill = document.createElement('div');
        treadmill.id = 'brim-treadmill';

        document.body.appendChild(treadmill);

        treadmill.style.visibility = 'hidden';
        treadmill.style.position = 'relative';
        treadmill.style.zIndex = 10;
        treadmill.style.left = 0;

        // Why make it such a large number?
        // Huge body height makes the size and position of the scrollbar fixed.
        treadmill.style.width = '1px';
        treadmill.style.height = '9999999999999999px';

        return treadmill;
    };

    /**
     *
     */
    brim._makeMask = function () {
        var mask = document.querySelector('#brim-mask');

        if (!mask) {
            throw new Error('Mask element does not exist.');
        }

        mask.style.position = 'fixed';
        mask.style.zIndex = 30;

        mask.style.top = 0;
        mask.style.left = 0;

        return mask;
    };

    /**
     *
     */
    brim._makeMain = function () {
        var main = document.querySelector('#brim-main');

        if (!main) {
            throw new Error('Main element does not exist.');
        }

        main.style.position = 'fixed';
        main.style.zIndex = 20;

        main.style.top = 0;
        main.style.left = 0;

        main.style.overflowY = 'visible';
        main.style.webkitOverflowScrolling = 'touch';

        return main;
    };

    brim._makeDOM = function () {
        player.treadmill = brim._makeTreadmill();
        player.mask = brim._makeMask();
        player.main = brim._makeMain();
    };

    /**
     * Fixed element is not visible outside of the chrome of the pre touch-drag state.
     * See ./.readme/element-fixed-bug.png as a reminder of the bug.
     *
     * @see http://stackoverflow.com/questions/3485365/how-can-i-force-webkit-to-redraw-repaint-to-propagate-style-changes?lq=1
     */
    brim._repaintElement = function (element) {
        // element.style.webkitTransform = 'translateZ(0)';
        // element.style.display = 'none';
        // element.offsetHeight;
        // element.style.display = 'block';
    };

    eventEmitter = Sister();

    brim.on = eventEmitter.on;

    brim._makeDOM();

    brim._setupDOMEventListeners();
};

global.gajus = global.gajus || {};
global.gajus.Brim = Brim;

module.exports = Brim;
}).call(this,typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[7])