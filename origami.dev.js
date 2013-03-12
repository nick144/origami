/*!
 * Origami jQuery plugin
 *
 * GitHub Repository: https://github.com/digital-telepathy/origami
 * @author digital-telepathy
 * 
 * Copyright (C) 2013 digital-telepathy  (email : support@digital-telepathy.com)
 * 
 * Permission is hereby granted, free of charge, to any person obtaining
 * a copy of this software and associated documentation files (the
 * "Software"), to deal in the Software without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so, subject to
 * the following conditions:
 * 
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
var Origami = function( el, params ) {
    // Is the interface device interacting
    this._interacting = false;
    this._interactingOffset = {
        top: -1,
        left: -1
    };

    // Dimensions of the Origami element
    this.dimensions = {
        width: -1,
        outerWidth: -1,
        height: -1,
        outerHeight: -1
    };

    // Cached elements
    this.elements = {};

    // Hover state
    this.hovering = false;

    // Open state
    this.isOpen = false;

    // Class namespace
    this.namespace = "origami";

    // Offset relative to the body (used for touch events)
    this.offset = {
        left: -1,
        top: -1
    };

    // Default options
    this.options = {
        method: 'css',          // Method for animation (css|animate)
        kami: '>.kami',         // Origami page elements selector (defaults to child .kami elements)
        speed: 350,             // Animation speed in milliseconds
        touch: false            // Enable touch support
    };

    // Selectors for elements used by this Class instance
    this.selectors = {
        body: 'body',
        window: window
    };

    this.initialize( el, params );
};
( function( $, window, undefined ) {
    // ----------------------------------------------------------
    // A short snippet for detecting versions of IE in JavaScript
    // without resorting to user-agent sniffing
    // ----------------------------------------------------------
    // If you're not in IE (or IE version is less than 5) then:
    //     ie === undefined
    // If you're in IE (>=5) then you can determine which version:
    //     ie === 7; // IE7
    // Thus, to detect IE:
    //     if (ie) {}
    // And to detect the version:
    //     ie === 6 // IE6
    //     ie > 7 // IE8, IE9 ...
    //     ie < 9 // Anything less than IE9
    // ----------------------------------------------------------

    // UPDATE: Now using Live NodeList idea from @jdalton

    var ie = (function(){
        var undef,
            v = 3,
            div = document.createElement('div'),
            all = div.getElementsByTagName('i');
        while (
            div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
        );
        return v > 4 ? v : undef;
    }());

    /**
     * Bind all events related to this Origami
     */
    Origami.prototype._bindEvents = function() {
        var self = this;


        this.elements.origami.on( 'mouseenter mouseleave', function( event ) {
            self.hover( event );
        } );

        this.elements.origami.on( 'click', function() {
            if( !self._interactionMoving ) {
                self.toggle();
            }

            self._interacting = false;
            self._interactionMoving = false;
        } );

        if( window.addEventListener ) {
            this.elements.origami[0].addEventListener( 'touchstart', function( event ) {
                self._touchStart( event );
            }, false );
            this.elements.origami[0].addEventListener( 'touchmove', function( event ) {
                self._touchMove( event );
            }, false );
            this.elements.origami[0].addEventListener( 'touchend', function( event ) {
                self._touchEnd( event );
            }, false );
        }
    };

    /**
     * Build elements and structures related to this Origami
     */
    Origami.prototype._build = function() {
        var self = this;

        this.elements.kami.each( function( ind ) {
            var $kami = self.elements.kami.eq( ind );

            // Wrapper
            $kami.wrap( '<div class="kami-wrapper" />' );
            var $wrapper = $kami.parent();
                $kami.data( '$wrapper', $wrapper );

            // Peek element
            var $peek = $kami.clone().appendTo( $wrapper );
                $kami.data( '$peek', $peek );
                $peek.addClass( 'kami-peek' );

            // Shadow on hover
            var $shadow = $( '<span class="kami-shadow" />' ).appendTo( $peek );
                $kami.data( '$shadow', $shadow );

            // Peek wrapper
            $peek.wrap( '<div class="kami-peek-mask" />' )
            var $peekMask = $peek.parent();
                $kami.data( '$peekMask', $peekMask );

            // Kami wrapper
            $kami.wrap( '<div class="kami-mask" />' )
            var $kamiMask = $kami.parent();
                $kami.data( '$kamiMask', $kamiMask );

            if( ind == 0 ) $wrapper.addClass( 'on-top' );

            $wrapper.css( $.extend( {
                zIndex: ( self.elements.kami.length - ind ) * 10
            }, self._prefixCSS( {
                perspective: ( self.elements.origami.width() * 4 ) + "px"
            } ) ) );

            $peekMask.add( $kamiMask ).css( self._prefixCSS( {
                'backface-visibility': 'hidden',
                'transform-style': 'preserve-3d',
                'transform-origin': '0 0'
            } ) );

            $kamiMask.css( self._prefixCSS( {
                transform: 'rotateY(' + ( ind == 0 ? 0 : 90 ) + 'deg)',
                'transform-origin': '100% 0'
            } ) );

            $shadow.css( self._prefixCSS( {
                transition: 'opacity ' + self.options.speed + 'ms linear'
            } ) );
        } );

        this.offset = this.elements.origami.offset();
        this.dimensions = {
            width: this.elements.origami.width(),
            outerWidth: this.elements.origami.outerWidth(),
            height: this.elements.origami.height(),
            outerHeight: this.elements.origami.outerHeight()
        };
    };

    Origami.prototype._getElements = function() {
        var self = this;

        $.each( this.selectors, function( key, value ) {
            if( $.isPlainObject( value ) ) {
                self.elements[key] = self.elements[key] || {};
                $.each( value, function( key2, value2 ) {
                    self.elements[key][key2] = $( value2 );
                } );
            } else {
                self.elements[key] = $( value );
            }
        } );

        this.elements.kami = $( this.options.kami, this.elements.origami );
    };

    /**
     * Get the "Kami" page and its associated elements
     *
     * Gets the "Kami" requested and returns an object with its associated mask,
     * page jQuery extended self and shadow.
     *
     * @param integer ind The zero-index of the "Kami" requested
     *
     * @return object
     */
    Origami.prototype._getKami = function( ind ) {
        var kami = {
            kami: this.elements.kami.eq( ind )
        };

        kami.wrapper = kami.kami.data( '$wrapper' );
        kami.kamiMask = kami.kami.data( '$kamiMask' );
        kami.peekMask = kami.kami.data( '$peekMask' );
        kami.shadow = kami.kami.data( '$shadow' );

        return kami;
    };

    /**
     * Detect CSS feature
     * 
     * Checks to see if the requested CSS feature is available in the current browser.
     * 
     * @param string featurename The name of the feature to detect. Example: "transition"
     * 
     * @return boolean
     */
    Origami.prototype._hasCSSFeature = function( featurename ) {
        var feature = false,
            domPrefixes = 'Webkit Moz ms O Khtml'.split( ' ' ),
            elm = document.createElement( 'div' ),
            featurenameCapital = null;

        featurename = featurename.toLowerCase();

        if( elm.style[featurename] ) { feature = true; } 

        if( feature === false ) {
            featurenameCapital = featurename.charAt( 0 ).toUpperCase() + featurename.substr( 1 );
            for( var i = 0; i < domPrefixes.length; i++ ) {
                if( elm.style[domPrefixes[i] + featurenameCapital] !== undefined ) {
                  feature = true;
                  break;
                }
            }
        }

        return feature; 
    };

    /**
     * Method for doing actions passed to an instance
     *
     * Takes multiple arguments:
     *
     * @param action string The action to run
     * @param args mixed Optional arguments which may or may not be required by a method
     */
    Origami.prototype._run = function() {
        var arguments_array = [];
        for( var i = 0; i < arguments.length; i++ ) {
            arguments_array.push( arguments[i] );
        }

        var action = arguments_array[0];
        var args = arguments_array.length > 1 ? arguments_array.slice( 1 ) : [];

        if( typeof( this[action] ) == 'function' ) {
            return this[action].apply( this, args );
        } else if( typeof( this[action] ) != 'undefined' ) {
            return this[action];
        }
    };

    /**
     * Build an object of browser prefixed CSS3 properties
     * 
     * Pass in the un-prefixed CSS3 property to apply (e.x. transition) and the
     * value to set to build an object of CSS properties that can be applied with
     * the jQuery .css() command.
     * 
     * @param {Object} properties Un-prefixed CSS3 property to set
     * @param {Boolean} prefixValue Set to boolean(true) to prefix the value as well
     * 
     * @return {Object} Object of prefixed CSS properties to be applied with $.css()
     */
    Origami.prototype._prefixCSS = function( properties, prefixValue ) {
        var prefixValue = prefixValue || false;
        var prefixes = ['moz', 'ms', 'o', 'webkit'];

        if( ie && ie < 9 ) return properties;
        
        for( var property in properties ) {
            var value = properties[property];
            
            for( var p in prefixes ) {
                valuePrefix = prefixValue ? '-' + prefixes[p] + '-' : "";
                properties['-' + prefixes[p] + '-' + property] = valuePrefix + value;
            }
        }
        
        return properties;
    };

    /**
     * Stop touch interacting with slider
     *
     * Fire on "mouseup" or "touchend" events to stop the drag interaction
     *
     * @param object event The event being fired
     */
    Origami.prototype._touchEnd = function( event ) {
        if( this.options.touch === false ) return false;

        this._interacting = false;
        this._interactingOffset.end = this._touchOffset( event );

        if( this._interactionMoving ) {
            var breach = Math.abs( this._interactingOffset.left / this.dimensions.outerWidth ) >= 0.33;

            if( breach && this.isOpen ) {
                this.close( 0 );
            } else if( breach && !this.isOpen ){
                this.open( 0 );
            } else if( !breach && this.isOpen ) {
                this.open( 0 );
            } else if( !breach && !this.isOpen ) {
                this.close( 0 );
            }
        }
    };

    /**
     * Touch interacting with origami
     *
     * Fire on "mousemove" or "touchmove" events to drag the kami of the origami
     *
     * @param object event The event being fired
     */
    Origami.prototype._touchMove = function( event ) {
        if( this.options.touch === false ) return false;

        if( this._interacting ) {
            event.preventDefault();

            this._interactionMoving = true;

            var offset = this._touchOffset( event ),
                self = this;

            this._interactingOffset.top = offset.top - this._interactingOffset.start.top;
            this._interactingOffset.left = offset.left - this._interactingOffset.start.left;

            this.elements.kami.each( function( ind ) {
                var kami = self._getKami( ind );
                var ratio = ( offset.left - self.offset.left ) / self.dimensions.outerWidth;

                kami.wrapper.css( 'z-index', ( ( ratio <= 0.5 ) ? ( ind + 1 ) : ( self.elements.kami.length - ind ) ) * 10 );

                if( ind == 0 ) {
                    kami.peekMask.css( self._prefixCSS( {
                        transform: 'rotateY(' + Math.max( -90, Math.min( ( ( ratio * 180 ) - 180 ), 0 ) ) + 'deg)'
                    } ) );
                    kami.shadow.css( 'opacity', ( ( 1 - ratio ) / 4 ) );
                }
                if( ind == 1 ) {
                    kami.kamiMask.css( self._prefixCSS( {
                        transform: 'rotateY(' + Math.max( Math.min( ( ratio * 180 ), 90 ), 0 ) + 'deg)'
                    } ) );
                }
            } );
        }
    };

    /**
     * Touch Event Offset
     *
     * Returns the top and left offset of a "touch" or drag interaction on the
     * slider element. Automatically determines what event type is being triggered.
     * Returns an object with "top" and "left" values in integer format
     *
     * @param object event The event being fired
     *
     * @return object
     */
    Origami.prototype._touchOffset = function( event ) {
        var offset = {
            top: -1,
            left: -1
        };

        if( event.touches ) {
            if( event.touches.length ) {
                if( event.touches[0].pageY ) offset.top = event.touches[0].pageY;
                if( event.touches[0].pageX ) offset.left = event.touches[0].pageX;
            }
        } else {
            offset.top = event.screenY;
            offset.left = event.screenX;
        }

        return offset;
    };

    /**
     * Start touch interaction with origami
     *
     * Fire on "mousedown" or "touchstart" events to start dragging the the kami of the origami
     *
     * @param object event The event being fired
     */
    Origami.prototype._touchStart = function( event ) {
        var self = this;

        if( this.options.touch === false ) return false;

        this._interacting = true;
        this._interactionMoving = false;

        var offset = this._touchOffset( event );

        this._interactingOffset = {
            top: offset.top,
            left: offset.left,
            start: {
                top: offset.top,
                left: offset.left
            }
        };

        this.elements.kami.each( function( ind ) {
            var kami = self._getKami( ind );

            kami.peekMask.add( kami.kamiMask ).add( kami.shadow ).css( self._prefixCSS( {
                transition: 'transform 0ms linear'
            }, true ) );
            kami.wrapper.css( self._prefixCSS( {
                transition: 'z-index 0ms 0ms linear'
            } ) );
        } );
    };

    // Open an Origami element
    Origami.prototype.close = function( timeOffset ) {
        var self = this;

        // Time offset when moving from an angle greater than 90deg
        var timeOffset = timeOffset || ( self.options.speed / 3 ) * 2;

        this.isOpen = false;

        this.elements.origami.removeClass( 'open hover' );

        this.elements.kami.eq(0).data( '$wrapper' ).show();

        this.elements.kami.each( function( ind ) {
            var kami = self._getKami( ind );

            kami.wrapper.css( $.extend( self._prefixCSS( {
                transition: "z-index 0s " + timeOffset + "ms"
            } ), {
                zIndex: ( self.elements.kami.length - ind ) * 10
            } ) );

            if( ind == 1 ) {
                kami.kamiMask.css( $.extend( self._prefixCSS( {
                    transition: 'transform ' + timeOffset + 'ms 0ms linear'
                }, true ),
                self._prefixCSS( {
                    transform: 'rotateY(90deg)'
                } ) ) );
            }

            kami.peekMask.css( $.extend( self._prefixCSS( {
                transition: 'transform ' + ( self.options.speed - timeOffset ) + 'ms ' + timeOffset + 'ms linear'
            }, true ),
            self._prefixCSS( {
                transform: 'rotateY(0deg)'
            } ) ) );
        } );

        // Shadow CSS
        this.elements.kami.eq(0).data( '$shadow' ).css( $.extend( this._prefixCSS( {
            transition: 'opacity ' + ( self.options.speed - timeOffset ) + 'ms ' + timeOffset + 'ms linear'
        } ), {
            opacity: 0
        } ) );

        // JavaScript fallback for older browsers
        if( this.options.method == 'animate' ) {
            this.elements.kami.each( function( ind ) {
                var kami = self._getKami( ind );

                kami.wrapper.css( {
                    opacity: ind%2
                } ).animate( {
                    opacity: ( ind + 1 )%2,
                    zIndex: ( self.elements.kami.length - ind ) * 10
                }, self.options.speed );
            } );
        }

        setTimeout( function() {
            self._interacting = false;
        }, this.options.speed - timeOffset );
    };

    // Hover over an Origami element
    Origami.prototype.hover = function( event ) {
        if( this.isOpen || this._interacting ) return false;

        this.elements.origami.removeClass( 'hover' );

        if( event != undefined && event.type == 'mouseenter' ) {
            this.elements.origami.addClass( 'hover' );
        }

        this.hovering = this.elements.origami.hasClass( 'hover' );
        var css = {};

        // Peek CSS
        if( this.hovering ) {
            css = $.extend( this._prefixCSS( {
                'transition': 'transform ' + ( this.options.speed / 3 ) + 'ms linear'
            }, true ),
            this._prefixCSS( {
                'transform': 'rotateY(-30deg)'
            } ) );
        } else {
            css = $.extend( this._prefixCSS( {
                'transition': 'transform ' + this.options.speed + 'ms linear'
            }, true ),
            this._prefixCSS( {
                'transform': 'rotateY(0deg)'
            } ) );
        }
        this.elements.kami.eq(0).data( '$peekMask' ).css( css );

        // Shadow CSS
        var shadowCSS = {};
        if( this.hovering ) {
            shadowCSS = $.extend( {
                opacity: 0.1
            }, this._prefixCSS( {
                transition: "opacity " + ( this.options.speed / 3 ) + "ms linear"
            } ) );
        } else {
            shadowCSS = $.extend( {
                opacity: 0
            }, this._prefixCSS( {
                transition: "opacity " + this.options.speed + "ms linear"
            } ) );
        }
        this.elements.kami.eq(0).data( '$shadow' ).css( shadowCSS );
    };

    /**
     * Initialize Class Instance
     *
     * @param {Object} DOM element to build this Class Instance off of
     */
    Origami.prototype.initialize = function( el ){
        // Merge options for this instance with defaults
        this.options = $.extend( this.options, arguments[1][0] || {}, $( el ).data() );

        // Fall back to jQuery Animation if the browser doesn't support CSS Transitions
        if( !this._hasCSSFeature( 'animation' ) ) {
            this.options.method = "animate";
        }

        // Include el in the selectors for caching
        this.selectors.origami = el;

        this._getElements();

        // Build elements
        this._build();

        // Bind events
        this._bindEvents();
    };

    // Open an Origami element
    Origami.prototype.open = function( timeOffset ) {
        var self = this;

        // Time offset when moving from an angle greater than 90deg
        var timeOffset = timeOffset || ( self.options.speed / 3 ) * 2;

        this.isOpen = true;

        this.elements.origami.removeClass('hover').addClass( 'open' );

        this.elements.kami.each( function( ind ) {
            var kami = self._getKami( ind );

            kami.wrapper.css( $.extend( self._prefixCSS( {
                transition: "z-index 0s " + timeOffset + "ms"
            } ), {
                zIndex: ( ind + 1 ) * 10
            } ) );


            if( ind == 0 ) {
                kami.peekMask.css( $.extend( self._prefixCSS( {
                    transition: 'transform ' + timeOffset + 'ms 0ms linear'
                }, true ),
                self._prefixCSS( {
                    transform: 'rotateY(-90deg)'
                } ) ) );
            }

            kami.kamiMask.css( $.extend( self._prefixCSS( {
                transition: 'transform ' + self.options.speed + 'ms ' + timeOffset + 'ms ease-out'
            }, true ),
            self._prefixCSS( {
                transform: 'rotateY(0deg)'
            } ) ) );
        } );

        // Shadow CSS
        this.elements.kami.eq(0).data( '$shadow' ).css( $.extend( {
            opacity: 0.25
        }, this._prefixCSS( {
            transition: "opacity " + timeOffset + "ms 0ms linear"
        } ) ) );

        // JavaScript fallback for older browsers
        if( this.options.method == 'animate' ) {
            this.elements.kami.each( function( ind ) {
                var kami = self._getKami( ind );

                kami.wrapper.css( {
                    opacity: ( ind + 1 )%2
                } ).animate( {
                    opacity: ind%2,
                    zIndex: ( ind + 1 ) * 10
                }, self.options.speed );
            } );
        }
    };

    /**
     * Set or get an option value
     *
     * Sets the requested instance's option to a particular value. If no value is
     * passed it just returns the current option's value. Always returns the set
     * value of the requested option.
     *
     * @param string key The option key to get or set
     * @param mixed val Optional value to set the option to
     *
     * @return mixed
     */
    Origami.prototype.option = function( key, val ) {
        if( val != undefined )
            this.options[key] = val;

        return this.options[key];
    };

    // Toggle open/close status of Origami element
    Origami.prototype.toggle = function() {
        if( this.isOpen ) {
            this.close();
        } else {
            this.open();
        }
    };

    $.extend( $.fn, {
        origami: function(){
            var options = action = arguments;
            var _return = this;

            this.each( function( ind ) {
                // Look up if an instance already exists
                var _Origami = $.data( this, 'Origami' );

                // Else create one and store it
                if( !_Origami ) {
                    _Origami = new Origami( this, options );
                    $.data( this, 'Origami', _Origami );
                }

                // Act upon it
                if( action.length > 0 ) {
                    var _do = _Origami._run.apply( _Origami, action );
                    if( typeof( _do ) != 'undefined' ) {
                        _return = _do;
                    }
                }
            } );

            return _return;
        }
    });
} )( jQuery, window, null );
