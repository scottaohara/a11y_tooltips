'use strict';

if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

var util = {
  keyCodes: {
    ESC: 27
  },

  generateID: function ( base ) {
    return base + Math.floor(Math.random() * 999);
  }
};


(function ( w, doc, undefined ) {
  /**
   * ARIA Tooltips
   * ...
   *
   * Author: Scott O'Hara
   * Version: 0.1.0
   * License:
   */
  var tipOptions = {
    baseID: 'tt_',
    tipAttr: 'data-tooltip-tip',
    tipSelector: '[data-tooltip-tip]',
    triggerSelector: '[data-tooltip-trigger]',
    dynamicTipAttr: 'data-tooltip-generate',
    fetchTipAttr: 'data-tooltip-fetch',
    tipClass: 'tooltip',
    consoleWarn: 'Missing tip...'
  };


  var ARIAtip = function ( inst, options ) {
    var el = inst;
    var elID;
    var elTip;
    var elTipId;
    var elTrigger;
    var _options = Object.assign(tipOptions, options);
    var tipVisible;

    var init = function () {
      var self = this;
      elID = el.id || util.generateID(_options.baseID);
      elTrigger = el.querySelector(_options.triggerSelector);

      /**
       * Check to see if there is a tip within the component.
       * If not, either fetch it, generate it, or someone forgot...
       */
      if ( !el.querySelector(_options.tipSelector) ) {
        if ( el.hasAttribute(_options.fetchTipAttr) ) {
          fetchTip();
        }
        else if ( el.hasAttribute(_options.dynamicTipAttr) ) {
          generateTip();
        }
        else {
          // nothing left to do, no tip found.
          console.warn(_options.dynamicTipAttr)
          return false;
        }
      }

      /**
       * By this point the tip will be created,
       * so now it can be set to the var and
       * the remaining functions can be run.
       */
      elTip = el.querySelector(_options.tipSelector);

      setupTip();
      setupTrigger();
      attachEvents();
    };


    /**
     * Function to pull the contents of an identified element
     * elsewhere in the DOM into the tooltip component.
     */
    var fetchTip = function () {
      var source = doc.getElementById(el.getAttribute(_options.fetchTipAttr));
      var newTip = doc.createElement('span');
      // tooltips should be text strings. so if someone
      // points to a complex markup pattern then
      // the child elements will be dropped.
      newTip.innerHTML = source.innerText;
      newTip.setAttribute(_options.tipAttr, '')
      source.parentNode.removeChild(source);

      el.appendChild(newTip);
    }; // fetchTip()


    /**
     * Create a custom tooltip from the title attribute
     * of the child of the tooltip component, or create
     * the tooltip based on the contents of the
     * component wrapper's data attribute.
     */
    var generateTip = function () {
      var source;

      if ( el.getAttribute(_options.dynamicTipAttr) === '' ) {
        if ( elTrigger.title ) {
          source = elTrigger.title;
        }
        else {
          console.warn(_options.consoleWarn);
          return false;
        }
      }
      else {
        source = el.getAttribute(_options.dynamicTipAttr);
      }

      var newTip = doc.createElement('span');
      newTip.innerHTML = source;
      newTip.setAttribute(_options.tipAttr, '');

      el.appendChild(newTip);
    }; // generateTip()


    /**
     * Once the custom tooltip element has been created,
     * then setupTip can run, adding the ID, class for styling,
     * and role attribute.
     */
    var setupTip = function () {
      elTipId = elTip.id || elID + '_tip';
      if ( !elTip.id ) {
        elTip.id = elTipId;
      }
      elTip.setAttribute('role', 'tooltip');
      elTip.classList.add('tooltip');
    }; // setupTip()


    /**
     * The element that trigger's the tooltip should
     * have an aria-describedby attribute to point to the
     * tooltip contents.  If it had a title attribute,
     * that should be removed so as to not have duplicate
     * or conflicting descriptions / tooltips.
     */
    var setupTrigger = function () {
      if ( !elTrigger.hasAttribute('aria-describedby') ) {
        elTrigger.setAttribute('aria-describedby', elTipId);
      }

      // You can't have both a native description and a custom one.
      elTrigger.removeAttribute('title');
    }; // setupTip()


    /**
     * If when a tooltip is invoked, but would be positioned
     * outside of the bounds of the viewport, then this
     * function should catch that and modify the CSS to
     * reposition in an attempt to mitigate the tooltip
     * not being seen.
     */
    var updatePosition = function () {
      var bounding = elTip.getBoundingClientRect();

      /**
       * TODO
       */
    }; // updatePosition()


    var showTip = function () {
      // tipVisible = true;
      el.classList.add(_options.tipClass + '--show');
      doc.addEventListener('keydown', escTip, false);
    };

    var hideTip = function () {
      // tipVisible = false;
      el.classList.remove(_options.tipClass + '--show');
      el.classList.remove(_options.tipClass + '--closed');
      doc.removeEventListener('keydown', escTip);
    };

    var suppressTip = function () {
      el.classList.add(_options.tipClass + '--closed');
    };

    var escTip = function ( e ) {
      var keyCode = e.keyCode || e.which;

      switch ( keyCode ) {
        case util.keyCodes.ESC:
          e.preventDefault();
          hideTip();
          suppressTip(); // quickly hide and keep hidden
          break;

        default:
          break;
      }
    };


    var attachEvents = function () {
      elTrigger.addEventListener('mouseover', showTip, false);
      elTrigger.addEventListener('focus', showTip, false);

      el.addEventListener('mouseout', hideTip, false);
      elTrigger.addEventListener('blur', hideTip, false);

      elTrigger.addEventListener('keydown', escTip, false);
    }; // attachEvents()


    init.call(this);

    return this;
  };


  w.ARIAtip = ARIAtip;
})( window, document );
