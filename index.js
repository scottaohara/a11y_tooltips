;(function ( w, doc, undefined ) {
  'use strict';

  /**
   * Local object for method references
   * and define script meta-data
   */
  var ARIAtips = {};
  w.ARIAtips   = ARIAtips;

  ARIAtips.NS       = 'ARIAtips';
  ARIAtips.AUTHOR   = 'Scott O\'Hara';
  ARIAtips.VERSION  = '0.1.0';
  ARIAtips.LICENSE  = '';

  var idCounter     = 0;
  var body          = doc.getElementsByTagName('BODY')[0];

  var activeTip     = false;

  var positionClasses = ['tooltip--reveal', 'tooltip--push-up', 'tooltip--push-left', 'tooltip--push-right', 'tooltip--push-down'];
  var svgClass = 'tooltip__svg';
  var tipTriggerIcon = '<svg xmlns="http://www.w3.org/2000/svg" focusable="false" class="' + svgClass + '" role="img" viewBox="4 4 158 158"><path fill-rule="evenodd" d="M78.283 74.37c1.165-2.992-.33-4.49-1.661-4.49-6.146 0-14.12 14.48-17.105 14.48-1.165 0-2.161-1.168-2.161-2.166 0-2.997 7.307-9.984 9.468-12.149 6.643-6.325 15.281-11.151 24.914-11.151 7.143 0 14.785 4.325 8.804 20.474L88.583 111.82c-.996 2.496-2.82 6.661-2.82 9.322 0 1.163.659 2.33 1.989 2.33 4.981 0 14.12-14.148 16.446-14.148.83 0 1.99.998 1.99 2.496 0 4.826-19.431 25.466-36.207 25.466-5.982 0-10.134-2.827-10.134-9.151 0-7.989 5.647-21.637 6.813-24.469L78.283 74.37zm8.968-32.788c0-7.322 6.312-13.312 13.62-13.312 6.646 0 11.463 4.49 11.463 11.316 0 7.658-6.311 13.317-13.784 13.317-6.813.001-11.299-4.494-11.299-11.321zM6.91 85.31c0-43.277 35.208-78.485 78.484-78.485s78.484 35.208 78.484 78.485c0 43.276-35.208 78.484-78.484 78.484S6.91 128.586 6.91 85.31zm3.029 39.776C3.649 113.202.085 99.665.085 85.31.085 38.27 38.354 0 85.395 0s85.31 38.27 85.31 85.31c0 47.039-38.27 85.309-85.31 85.309-28.694 0-54.125-14.239-69.597-36.023-.552-.779-5.13-7.755-5.859-9.51z"/></svg>';

  /**
   * Global Create
   *
   * This function validates that the minimum required markup
   * is present to create the ARIA widget(s).
   * Any additional markup elements or attributes that
   * do not exist in the found required markup patterns
   * will be generated via this function.
   */
  ARIAtips.create = function () {
    var self;
    var widget = doc.querySelectorAll('[data-tooltip]');
    var tipClass;
    var tipCustomClass;
    var tipID;
    var tipTrigger;
    var i;

    // Increment generated ID counter
    idCounter += 1;

    /**
     * Loop through all instances of the widget selector.
     * Add appropriate attributes and other setup functions
     * to enhance the base markup into the expected pattern
     * for the widget.
     */
    for ( i = 0; i < widget.length; i++ ) {
      self = widget[i];

      // If no ID, assign one and keep track of it
      if ( !self.hasAttribute('id') ) {
        self.id = 'tt_' + idCounter + '-' + i;
      }
      tipID = self.id;

      /**
       * To allow authors to customize the classes used
       * within the tooltip widget, a custom class can be
       * set to override the default 'tooltip' class.
       */
      tipCustomClass = self.getAttribute('data-tooltip-class');
      if ( tipCustomClass ) {
        tipClass = tipCustomClass;
      }
      else {
        tipClass = 'tooltip';
      }

      /**
       * Setup or generate the DOM element that will
       * serve as the 'tip'.
       */
      ARIAtips.setupTipContent( self, tipClass );

      /**
       * Setup or generate the DOM element that will act
       * as the trigger to revealing the 'tip'.
       */
      ARIAtips.setupTipTrigger( self, tipID, tipClass );

      /**
       * Once all triggers are in place, gather and
       * then enable them by removing hidden or disabled
       * attributes that may be there for no JS situations.
       */
      tipTrigger = self.querySelector('[data-tooltip-trigger]');
      tipTrigger.removeAttribute('hidden');
      tipTrigger.removeAttribute('disabled');

      /**
       * Events
       */
      doc.addEventListener('keyup', ARIAtips.keyEvents, false);

      if ( self.getAttribute('data-tooltip') === 'toggle' ) {
        tipTrigger.addEventListener('click', ARIAtips.toggleTip, false);
      }
      else {
        tipTrigger.addEventListener('focus', ARIAtips.overTip.bind(null, tipID + '_tip'), false);
        tipTrigger.addEventListener('blur', ARIAtips.outTip.bind(null, tipID + '_tip'), false);
      }

      tipTrigger.addEventListener('mouseover', ARIAtips.overTip.bind(null, tipID + '_tip'), false);
      tipTrigger.addEventListener('mouseout', ARIAtips.outTip.bind(null, tipID + '_tip'), false);
    } // for
  }; // ARIAtips.create


  ARIAtips.setupTipContent = function ( el, tipClass ) {
    // Get the content that will be revealed as the visible/announced
    // tooltip, referred to here on out as "tipContent".
    // If there is no preset element for the tipContent, set as false
    var tipContent = el.querySelector('[data-tooltip-tip]');
    var getTipContent = el.getAttribute('data-tooltip-content') || null;

    // If the tipContent is false, then either a tip wasn't set,
    // or it should be pulled from a data attribute.
    if ( tipContent ) {
      // There can only be one tip, and it should be assumed that
      // if a data-tooltip-content is set, it means that when JS is
      // enabled, this tip should take precedent, and the text in the DOM
      // is for fallback purposes.
      if ( getTipContent ) {
        tipContent.innerHTML = getTipContent;
      }
    }
    else if ( getTipContent ) {
      // if a tip is set by a data- attribute, then
      // then it will need to be added to the DOM.
      var addTip = doc.createElement('span');
      addTip.setAttribute('data-tooltip-tip', '');
      addTip.innerHTML = getTipContent;

      el.appendChild(addTip, el);

      // Now that the tip exists, it can now be set to
      // the tipContent var
      tipContent = el.querySelector('[data-tooltip-tip]');
    }
    else {
      console.error(el.id + ' is missing a tip...');
    }

    /**
     * Once all tips are in place, finish setup
     */
    if ( tipContent ) {
      /**
       * If a tooltip contains one of the following elements, then it
       * is not a tooltip, but should be treated as a toggle tip.
       */
      var failSafes = tipContent.querySelectorAll('h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'button', 'a[href]', '[tabindex]:not([tabindex="-1"])', 'input', 'textarea', 'select', 'video', 'audio');
      var i;

      for ( i = 0; i <= failSafes.length; i++ ) {
        if ( failSafes[i] ) {
          el.setAttribute('data-tooltip', 'toggle');
        }
      }

      if ( el.getAttribute('data-tooltip') !== 'toggle' ) {
        // A toggle tip is not a true tooltip, so it doesn't get the role.
        tipContent.setAttribute('role', 'tooltip');
      }
      tipContent.id = el.id + '_tip';
      tipContent.classList.add(tipClass);
    }
  }; // ARIAtips.setupTipContent


  ARIAtips.setupTipTrigger = function ( el, tipID, tipClass ) {
    var tipTriggerSelector = el.querySelector('[data-tooltip-trigger]');
    var tipTriggerPlacer = el.querySelector('[data-tooltip-place-trigger]');

    /**
     * If no element is designated as the trigger for the tooltip,
     * then one must be generated. In such a situation it will
     * default to be a toggle button that reveals a "tooltip" as
     * the only safe assumption in this situation is that
     * the tip is meant to provide contextual information for an
     * element that may or may not even be within the scope of
     * this widget.
     */
    if ( !tipTriggerSelector ) {
      var triggerLabel = 'More Info';
      var newTrigger = doc.createElement('button');
      newTrigger.setAttribute('type', 'button');
      newTrigger.setAttribute('data-tooltip-trigger', '');
      newTrigger.classList.add('tooltip__toggle-btn');

      el.setAttribute('data-tooltip', 'toggle');

      /**
       * Use an icon for the visual representation of the
       * tooltip trigger, and provide an accessible name
       * that is either the default value, or set by the author.
       */
      if ( el.getAttribute('data-tooltip-label') &&
           el.getAttribute('data-tooltip-label') !== '' ) {
        triggerLabel = el.getAttribute('data-tooltip-label');
      }
      newTrigger.innerHTML = tipTriggerIcon;

      /**
       * Place the new trigger in a standard location, or one
       * set by the author
       */
      if ( tipTriggerPlacer ) {
        if ( tipTriggerPlacer.getAttribute('data-tooltip-place-trigger') === 'first' ) {
          tipTriggerPlacer.insertBefore(newTrigger, tipTriggerPlacer.firstChild);
        }
        else {
          tipTriggerPlacer.appendChild(newTrigger, tipTriggerPlacer);
        }
      }
      else {
        el.insertBefore(newTrigger, el.firstChild);
      }

      // Once all generated triggers are in place,
      // look for the SVG within the button, and add
      // the accessible name to it.
      el.querySelector('.' + svgClass).setAttribute('aria-label', triggerLabel);

      tipTriggerSelector  = el.querySelector('[data-tooltip-trigger]');
    }

    /**
     * Now that all possible toggle triggers are in place,
     * apply additional ARIA & data attributes for associating
     * the trigger with the 'tip'
     */
    if ( el.getAttribute('data-tooltip') === 'toggle' ||
         tipTriggerSelector.getAttribute('data-tooltip-trigger') === 'toggle') {
      tipTriggerSelector.setAttribute('aria-expanded', 'false');
      tipTriggerSelector.setAttribute('aria-controls', tipID + '_tip');
    }
    else {
      tipTriggerSelector.setAttribute('data-tooltip-tip-id', tipID + '_tip');
    }

    /**
     * If a tip had a author set ID prior to the  function running,
     * it may have gotten overwritten.
     * If a trigger (form control, link, button, etc) had a manually
     * set aria-describedby that was pointing to the previous ID, then
     * it'll need to be updated to the dynamic ID.
     *
     * If a non-toggle tip had no aria-describedby set, then it will
     * need to have one.
     */
    if ( tipTriggerSelector.hasAttribute('aria-describedby') ||
         el.getAttribute('data-tooltip') !== 'toggle'
        ) {
      tipTriggerSelector.setAttribute('aria-describedby', tipID + '_tip');
    }
  }; // ARIAtips.setupTipTrigger


  ARIAtips.keyEvents = function ( e ) {
    var keyCode = e.keyCode || e.which;
    var TAB = 9;
    var ESC = 27;
    var ENTER = 13;
    var SPACE = 32;

    switch ( keyCode ) {
      case ESC:
        // Find any revealed or expanded tooltip and remove
        // the class to hide it/them
        var revealed = doc.querySelector('.tooltip--reveal');
        var expanded = doc.querySelector('.tooltip--expanded');

        // Combine these 2 ifs into 1?
        if ( revealed ) {
          revealed.classList.remove('tooltip--reveal');
        }

        if ( expanded ) {
          expanded.classList.remove('tooltip--expanded');
        }

        if ( activeTip !== false) {
          var activeTrigger = doc.querySelector('[aria-controls="' + activeTip + '"]');
          activeTrigger.setAttribute('aria-expanded', 'false');
          activeTrigger.focus();

          activeTip = false;
          return activeTip;
        }
      break;
    }

    if ( activeTip !== false) {
      switch ( keyCode ) {
        case TAB:
          var tipTrigger = doc.querySelector('[aria-controls="' + activeTip + '"]');
          var activeWidget = doc.getElementById(activeTip);

          if ( e.target !== tipTrigger ) {

            if ( !activeWidget.contains(e.target) ) {
              tipTrigger.setAttribute('aria-expanded', 'false');
              activeWidget.classList.remove('tooltip--expanded');

              activeTip = false;
              return activeTip;
            }
          }
        break;
      }
    }

    if ( e.target.getAttribute('data-tooltip-trigger') === 'toggle' ) {
      switch ( keyCode ) {
        case ENTER:
        case SPACE:
          e.preventDefault();
          e.target.click();
        break;
      }
    }
  }; // ARIAtips.keyEvents


  ARIAtips.toggleTip = function ( e ) {
    e.preventDefault();
    e.target.focus();
    var tipTarget = doc.getElementById(this.getAttribute('aria-controls'));

    if ( this.getAttribute('aria-expanded') === 'true' ) {
      /**
       * after the target toggle tooltip has been opened, need
       * to close any other opened toggle tooltips that might
       * have been previously opened, but were not closed
       * due to a user navigating by virtual cursor, rather than
       * TAB key
       */
      this.setAttribute('aria-expanded', 'false');
      tipTarget.classList.remove('tooltip--expanded', positionClasses);
      activeTip = false;
    }
    else {
      this.setAttribute('aria-expanded', 'true');
      activeTip = tipTarget.id;
      tipTarget.tabIndex = '-1';
      requestAnimationFrame(function () { // lol safari + vo
        tipTarget.focus();
      });

      tipTarget.classList.add('tooltip--expanded');
      tipTarget.classList.remove('tooltip--reveal');

      ARIAtips.positionCheck( doc.getElementById(activeTip) );
    }

    doc.addEventListener('click', ARIAtips.outsideClick.bind(null), false);

    return activeTip;
  }


  ARIAtips.overTip = function ( tipID ) {
    /**
     * Perform a check to see if there are any currently opened
     * tooltips, if so, close them.
     */
    var opened = doc.querySelectorAll('.tooltip--reveal');

    if ( opened.length !== 0 ) {
      for ( var i = 0; opened.length <= 0; i++ ) {
        opened[i].classList.remove('tooltip--reveal');
      }
    }

    var currentTip = doc.getElementById(tipID);
    // Reveal the tooltip that should now be visible
    // Don't need to do this if a toggle tip is already expanded
    if ( !currentTip.classList.contains('tooltip--expanded') ) {
      currentTip.classList.add('tooltip--reveal');
    }

    ARIAtips.positionCheck( currentTip );
  }; // ARIAtips.overTip


  ARIAtips.outTip = function ( tipID ) {
    var currentTip = doc.getElementById(tipID);

    // As long as a tooltip/toggle tip hasn't been 'expanded',
    // remove any reveal/positioning classes to return it to
    // its default state.
    if ( !currentTip.classList.contains('tooltip--expanded') ) {
      currentTip.classList.remove('tooltip--reveal', positionClasses);
    }
  }; // ARIAtips.outTip


  ARIAtips.outsideClick = function ( e ) {
    if ( activeTip !== false ) {
      var currentWidget = doc.getElementById(activeTip);
      var tipTrigger = doc.querySelector('[aria-controls="' + activeTip + '"]');

      if ( !currentWidget.contains(e.target) && e.target !== tipTrigger ) {
        tipTrigger.setAttribute('aria-expanded', false);
        currentWidget.classList.remove('tooltip--expanded');

        doc.removeEventListener('click', ARIAtips.outsideClick.bind(null), false);

        activeTip = false;
        return activeTip;
      }
    }
  } // ARIAtips.outsideClick


  /**
   * Tooltips should be positioned in a way where they won't be
   * cut off by a small viewport, or positioned above/below a fold
   * if at all possible.
   *
   * This function makes their positioning a bit smarter based
   * on the available browser viewport.
   */
  ARIAtips.positionCheck = function ( currentTip ) {
    var bounding = currentTip.getBoundingClientRect();

    if ( bounding.bottom > 0 ) {
      currentTip.classList.add('tooltip--push-up');
    }

    if ( bounding.top < 0 ) {
      currentTip.classList.add('tooltip--push-down');
    }

    if ( bounding.left < 0 ) {
      currentTip.classList.add('tooltip--push-left');
    }

    if ( bounding.right > w.innerWidth ) {
      currentTip.classList.add('tooltip--push-right');
    }
  };


  /**
   * Initialize Tooltip Functions
   * if expanding this script, place any other
   * initialize functions within here.
   */
  ARIAtips.init = function () {
    ARIAtips.create();
  };

  /**
   * Go go JavaScript
   */
  ARIAtips.init();

})( window, document );
