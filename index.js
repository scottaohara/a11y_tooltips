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
   * Widget to reveal a short description, or
   * the element's accessible name on hover/focus.
   *
   * Author: Scott O'Hara
   * Version: 1.0.0
   * License: MIT
   */

  var tipConfig = {
    baseID: 'tt_',

    tipWrapperClass: 'tooltip',
    tipContentClass: 'tooltip__content',

    tipTypeAttr: 'data-tooltip',
    tipSourceAttr: 'data-tooltip-source',
    tipContentAttr: 'data-tooltip-content',

    tipSelector: '[data-tooltip-tip]',
    triggerSelector: '[data-tooltip-trigger]'
  };

  /**
   * typeSelector should accept values
   * - empty string = describedby
   * - label
   *     - display aria-label content
   *     - if aria-labelledby must add aria-hidden
   */

  var ARIAtip = function ( inst, options ) {
    var el = inst;
    var elID;
    var elTip;
    var elTipID;
    var elTrigger;
    var tipContent;
    var tipType;
    var _options = Object.assign(tipConfig, options);


    /**
     * Initiate the
     */
    var init = function () {
      // if an element has an ID, use that as the
      // basis for the tooltip's ID. Or, generate one.
      elID = el.id || util.generateID(_options.baseID);
      // the element that will trigger the tooltip on hover or focus.
      elTrigger = el.querySelector(_options.triggerSelector);
      // base the tip's ID off from the element's tip
      elTipID = elID + '_tip';
      // determine the type of tip
      tipType = tipType();
      // retrieve the content for the tip (flatted text string)
      tipContent = getTipContent();
      // create the tip
      createTip();
      // add/modify the necessary attributes of the trigger.
      setupTrigger();
      // Attach the various events to the triggers
      attachEvents();
    };


    /**
     * A tooltip can either provide a description to
     * the element that it is associated with, or it
     * can provide a means to visually display the element's
     * accessible name.
     */
    var tipType = function () {
      if ( el.getAttribute(_options.tipTypeAttr) === 'label' ) {
        return 'label';
      }
      else {
        return 'description';
      }
    };


    /**
     * The content of a tooltip can come from different sources
     * so as to allow for fallback content in case this script
     * cannot run.
     *
     * A tip could be sourced from an element in the DOM via
     * the attribute data-tooltip-tip (a child of the widget),
     * or an ID referenced from data-tooltip-source (does not
     * have to be a child of the widget),
     * the trigger's title or aria-label attribute
     */
    var getTipContent = function () {
      var toReturn; // text string to return
      var tipAttrContent = el.getAttribute(_options.tipContentAttr);
      var tipAriaLabel = elTrigger.getAttribute('aria-label');
      var widgetChild = el.querySelector(_options.tipSelector);
      var externalSource = el.getAttribute(_options.tipSourceAttr);

      if ( tipAttrContent ) {
        toReturn = tipAttrContent;
      }
      else if ( externalSource ) {
        var sourceEl = doc.getElementById(externalSource);
        toReturn = sourceEl.textContent;
        sourceEl.parentNode.removeChild(sourceEl);
      }
      else if ( widgetChild ) {
        toReturn = widgetChild.textContent;
        widgetChild.parentNode.removeChild(widgetChild);
      }
      else if ( tipAriaLabel && tipType === 'label' ) {
        toReturn = tipAriaLabel;
        elTrigger.removeAttribute('aria-label');
      }
      else if ( elTrigger.title ) {
        toReturn = elTrigger.title;
      }

      // an element cannot have both a custom tooltip
      // and a tooltip from a title attribute.  So no
      // matter what, remove the title attribute.
      elTrigger.removeAttribute('title');

      return toReturn;
    };

    /**
     * Create the necessary tooltip components for each
     * instance of the widget.
     */
    var createTip = function () {
      var tipOuter = doc.createElement('span');
      var tipInner = doc.createElement('span');

      tipOuter.classList.add(_options.tipWrapperClass);
      tipInner.classList.add(_options.tipContentClass);
      tipInner.textContent = tipContent;
      tipInner.id = elTipID;

      if ( tipType !== 'label') {
        tipInner.setAttribute('role', 'tooltip');
      }
      else {
        tipInner.setAttribute('aria-hidden', 'true');
      }

      tipOuter.appendChild(tipInner);
      el.appendChild(tipOuter);
    };

    /**
     * Ensure the tooltip trigger has the appropriate
     * attributes on it, and that they point to the
     * correct IDs.
     */
    var setupTrigger = function () {
      if ( tipType === 'label' ) {
        elTrigger.setAttribute('aria-labelledby', elTipID);
      }
      else {
        elTrigger.setAttribute('aria-describedby', elTipID);
      }
    };

    /**
     * Check the current viewport to determine if the tooltip
     * will be revealed outside of the current viewport's bounds.
     * If so, try to reposition to ensure it's within.
     */
    var checkPositioning = function () {
      // TODO
    };

    /**
     * Add class to show tooltip.
     * Checks positioning to help ensure within viewport.
     * Adds global event to escape tip.
     */
    var showTip = function () {
      el.classList.add(_options.tipWrapperClass + '--show');
      // checkPositioning();
      doc.addEventListener('keydown', globalEscape, false);
      doc.addEventListener('touchend', hideTip, false);
    };

    /**
     * Removes classes for show and/or suppressed tip.
     * Removes classes for positioning.
     * Removes global event to escape tip.
     */
    var hideTip = function () {
      el.classList.remove(_options.tipWrapperClass + '--show');
      el.classList.remove(_options.tipWrapperClass + '--suppress');
      // resetPositioning();
      doc.removeEventListener('keydown', globalEscape);
      doc.addEventListener('touchend', hideTip);
    };

    /**
     * forces dismiss, ensure tip cannot be re-shown.
     * until user purposefully moves away from tip.
     */
    var suppressTip = function () {
      el.classList.add(_options.tipWrapperClass + '--suppress');
    };

    /**
     * Global event to allow the ESC key to close
     * an invoked tooltip, regardless of where focus/hover
     * is in the DOM.
     *
     * Calls both hideTip and suppressTip functions to help
     * better replicate native tooltip suppression behavior.
     */
    var globalEscape = function ( e ) {
      var keyCode = e.keyCode || e.which;

      switch ( keyCode ) {
        case util.keyCodes.ESC:
          e.preventDefault();
          hideTip();
          suppressTip();
          break;

        default:
          break;
      }
    };

    var attachEvents = function () {
      elTrigger.addEventListener('mouseenter', showTip, false);
      elTrigger.addEventListener('focus', showTip, false);

      el.addEventListener('mouseleave', hideTip, false);
      elTrigger.addEventListener('blur', hideTip, false);

      elTrigger.addEventListener('keydown', globalEscape, false);
    };


    init.call(this);
    return this;
  }; // ARIAtip

  w.ARIAtip = ARIAtip;
})( window, document );
