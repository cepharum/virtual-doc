/**
 * (c) 2019 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2019 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

/**
 * Maps aliases of properties into names either alias applies for.
 *
 * @type {object<string,string>}
 */
const Aliases = {
	"box-sizing": "boxSizing",
	"margin-top": "marginTop",
	"margin-right": "marginRight",
	"margin-bottom": "marginBottom",
	"margin-left": "marginLeft",
	"padding-top": "paddingTop",
	"padding-right": "paddingRight",
	"padding-bottom": "paddingBottom",
	"padding-left": "paddingLeft",
	"border-width": "borderWidth",
	"border-top-width": "borderTopWidth",
	"border-right-width": "borderRightWidth",
	"border-bottom-width": "borderBottomWidth",
	"border-left-width": "borderLeftWidth",
};

/**
 * Maps names of properties into either property's priority on processing it.
 *
 * @type {object<string,int>}
 */
const Priorities = {
	// implicitly deriving values often depends on current sizing model, so
	// process this one first
	boxSizing: 2,

	// process width/height before left/top/bottom/right so the latter might
	// change the former
	width: 1,
	height: 1,
};

/**
 * Provides highest priority used in @see Priorities.
 *
 * @type {number}
 */
const HighestPriority = 2;



/**
 * Implements representation of rectangular box model.
 */
class BoxModel {
	/**
	 * @param {BoxModel} context refers to box model this one is relative to.
	 */
	constructor( context = null ) {
		if ( context != null && !( context instanceof BoxModel ) ) {
			throw new TypeError( "invalid context" );
		}

		/**
		 * Describes actual styling.
		 *
		 * @type {object}
		 * @private
		 */
		const _actual = {
			x: 0,
			y: 0,
			width: null,
			height: null,
		};

		/**
		 * Stores description of desired styling.
		 *
		 * @type {object}
		 * @private
		 */
		const _style = {
			position: "static",
			sizing: "content",

			// translations of position
			left: null,
			top: null,
			right: null,
			bottom: null,

			// inner dimensions of box available for content
			width: null,
			height: null,

			// extents of required distance to neighbouring elements on either
			// edge of box
			margin: {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			},

			// extents, color and style of borders on either edge of box
			border: {
				top: {
					width: 0,
					style: "solid",
					color: null,
				},
				left: {
					width: 0,
					style: "solid",
					color: null,
				},
				right: {
					width: 0,
					style: "solid",
					color: null,
				},
				bottom: {
					width: 0,
					style: "solid",
					color: null,
				},
			},

			// extents of distance between border and content on either edge of
			// box
			padding: {
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
			},
		};

		const parse = this.constructor.parseExtent;


		/* eslint-disable lines-around-comment */
		const properties = {
			/**
			 * Provides current box model's context.
			 *
			 * The context is used for deriving information e.g. on converting
			 * local extents into global ones and vice versa.
			 *
			 * @name BoxModel#context
			 * @property {BoxModel}
			 * @readonly
			 */
			context: { value: context || null, },

			// --- desired values ---

			/**
			 * Selects mode of positioning this element in context of its parent.
			 *
			 * @name BoxModel#position
			 * @property {string}
			 */
			position: {
				get: () => _style.position,
				set: value => {
					const _value = value == null ? "static" : String( value ).trim();

					switch ( _value ) {
						case "static" :
						case "relative" :
						case "absolute" :
							break;

						default :
							throw new TypeError( "invalid position mode" );
					}

					_style.position = _value;
				},
				enumerable: true,
			},
			/**
			 * Manages sizing mode affecting how width and height values are
			 * calculated.
			 *
			 * @name BoxModel#boxSizing
			 * @property {string}
			 */
			boxSizing: {
				get: () => _style.sizing,
				set: value => {
					const _value = value == null ? "" : String( value ).trim().toLowerCase().replace( /(?:-box|Box)$/, "" );

					switch ( _value ) {
						case "content" :
						case "padding" :
						case "border" :
							_style.sizing = _value;
							break;

						default :
							throw new TypeError( "invalid box-sizing mode" );
					}
				},
				enumerable: true,
			},

			/**
			 * Manages _desired_ offset of current instance from top edge of its
			 * context box.
			 *
			 * @name BoxModel#top
			 * @property {(number|string)}
			 */
			top: {
				get: () => ( _style.top == null ? "auto" : _style.top ),
				set: value => {
					_style.top = parse( value );

					if ( _style.top != null && _style.bottom != null && context ) {
						_style.height = context.contentBoxHeight - _style.top - _style.bottom;
						switch ( _style.sizing ) {
							case "content" :
								_style.height -= _style.padding.top + _style.padding.bottom;
							// falls through
							case "padding" :
								_style.height -= _style.border.top.width + _style.border.bottom.width;
						}
					}
				},
				enumerable: true,
			},
			/**
			 * Manages _desired_ offset of current instance from right edge of
			 * its context box.
			 *
			 * @name BoxModel#right
			 * @property {(number|string)}
			 */
			right: {
				get: () => ( _style.right == null ? "auto" : _style.right ),
				set: value => {
					_style.right = parse( value );

					if ( _style.right != null && _style.left != null && context ) {
						_style.width = context.contentBoxWidth - _style.left - _style.right;
						switch ( _style.sizing ) {
							case "content" :
								_style.width -= _style.padding.left + _style.padding.right;
							// falls through
							case "padding" :
								_style.width -= _style.border.left.width + _style.border.right.width;
						}
					}
				},
				enumerable: true,
			},
			/**
			 * Manages _desired_ offset of current instance from bottom edge of
			 * its context box.
			 *
			 * @name BoxModel#bottom
			 * @property {(number|string)}
			 */
			bottom: {
				get: () => ( _style.bottom == null ? "auto" : _style.bottom ),
				set: value => {
					_style.bottom = parse( value );

					if ( _style.bottom != null && _style.top != null && context ) {
						_style.height = context.contentBoxHeight - _style.top - _style.bottom;
						switch ( _style.sizing ) {
							case "content" :
								_style.height -= _style.padding.top + _style.padding.bottom;
							// falls through
							case "padding" :
								_style.height -= _style.border.top.width + _style.border.bottom.width;
						}
					}
				},
				enumerable: true,
			},
			/**
			 * Manages _desired_ offset of current instance from left edge of its
			 * context box.
			 *
			 * @name BoxModel#left
			 * @property {(number|string)}
			 */
			left: {
				get: () => ( _style.left == null ? "auto" : _style.left ),
				set: value => {
					_style.left = parse( value );

					if ( _style.left != null && _style.right != null && context ) {
						_style.width = context.contentBoxWidth - _style.left - _style.right;
						switch ( _style.sizing ) {
							case "content" :
								_style.width -= _style.padding.left + _style.padding.right;
							// falls through
							case "padding" :
								_style.width -= _style.border.left.width + _style.border.right.width;
						}
					}
				},
				enumerable: true,
			},

			/**
			 * Provides width of box in points (1/72 inch) according to current
			 * box sizing mode.
			 *
			 * @name BoxModel#width
			 * @property {?(number|string)}
			 */
			width: {
				get: () => ( _style.width == null ? "auto" : _style.width ),
				set: value => {
					_style.width = parse( value, {
						throwNegative: true
					} );

					if ( _style.width != null && _style.left != null && _style.right != null ) {
						_style.right = null;
					}
				},
				enumerable: true,
			},
			/**
			 * Provides height of box in points (1/72 inch) according to current
			 * box sizing mode.
			 *
			 * @name BoxModel#height
			 * @property {?(number|string)}
			 */
			height: {
				get: () => ( _style.height == null ? "auto" : _style.height ),
				set: value => {
					_style.height = parse( value, {
						throwNegative: true
					} );

					if ( _style.height != null && _style.top != null && _style.bottom != null ) {
						_style.bottom = null;
					}
				},
				enumerable: true,
			},

			/**
			 * Manages margin to apply between left edge of this box any closest
			 * box to the west in points (1/72 inch).
			 *
			 * @name BoxModel#marginLeft
			 * @property {number|string}
			 */
			marginLeft: {
				get: () => _style.margin.left,
				set: value => {
					_style.margin.left = parse( value, {
						throwNegative: true
					} );
				},
				enumerable: true,
			},
			/**
			 * Manages margin to apply between right edge of this box any closest
			 * box to the east in points (1/72 inch).
			 *
			 * @name BoxModel#marginRight
			 * @property {number|string}
			 */
			marginRight: {
				get: () => _style.margin.right,
				set: value => {
					_style.margin.right = parse( value, {
						throwNegative: true
					} );
				},
				enumerable: true,
			},
			/**
			 * Manages margin to apply between top edge of this box any closest
			 * box to the north in points (1/72 inch).
			 *
			 * @name BoxModel#marginTop
			 * @property {number|string}
			 */
			marginTop: {
				get: () => _style.margin.top,
				set: value => {
					_style.margin.top = parse( value, {
						throwNegative: true
					} );
				},
				enumerable: true,
			},
			/**
			 * Manages margin to apply between bottom edge of this box any closest
			 * box to the south in points (1/72 inch).
			 *
			 * @name BoxModel#marginBottom
			 * @property {number|string}
			 */
			marginBottom: {
				get: () => _style.margin.bottom,
				set: value => {
					_style.margin.bottom = parse( value, {
						throwNegative: true
					} );
				},
				enumerable: true,
			},
			/**
			 * Provides combined access on margins to either edge of the box.
			 *
			 * @name BoxModel#margin
			 * @property {string}
			 */
			margin: {
				get: () => {
					const { margin } = _style;
					return [ margin.top, margin.right, margin.bottom, margin.left ].join( " " );
				},
				set: value => {
					const { margin } = _style;

					const _values = String( value ).trim().split( /\s+/ );
					switch ( _values.length ) {
						case 1 :
							margin.left = margin.right = margin.top = margin.botton = parse( _values[0], { throwNegative: true } );
							break;

						case 2 :
							margin.top = margin.botton = parse( _values[0], { throwNegative: true } );
							margin.left = margin.right = parse( _values[1], { throwNegative: true } );
							break;

						case 3 :
							margin.top = parse( _values[0], { throwNegative: true } );
							margin.left = margin.right = parse( _values[1], { throwNegative: true } );
							margin.botton = parse( _values[2], { throwNegative: true } );
							break;

						case 4 :
							margin.top = parse( _values[0], { throwNegative: true } );
							margin.right = parse( _values[1], { throwNegative: true } );
							margin.botton = parse( _values[2], { throwNegative: true } );
							margin.left = parse( _values[3], { throwNegative: true } );
							break;

						default :
							throw new TypeError( "invalid number of values on margin" );
					}
				},
				enumerable: true,
			},

			/**
			 * Manages padding to apply between left edge of content and its
			 * left-edge border in points (1/72 inch).
			 *
			 * @name BoxModel#paddingLeft
			 * @property {number|string}
			 */
			paddingLeft: {
				get: () => _style.padding.left,
				set: value => {
					_style.padding.left = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Manages padding to apply between right edge of content and its
			 * right-edge border in points (1/72 inch).
			 *
			 * @name BoxModel#paddingRight
			 * @property {number|string}
			 */
			paddingRight: {
				get: () => _style.padding.right,
				set: value => {
					_style.padding.right = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Manages padding to apply between top edge of content and its
			 * top-edge border in points (1/72 inch).
			 *
			 * @name BoxModel#paddingTop
			 * @property {number|string}
			 */
			paddingTop: {
				get: () => _style.padding.top,
				set: value => {
					_style.padding.top = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Manages padding to apply between bottom edge of content and its
			 * bottom-edge border in points (1/72 inch).
			 *
			 * @name BoxModel#paddingBottom
			 * @property {number|string}
			 */
			paddingBottom: {
				get: () => _style.padding.bottom,
				set: value => {
					_style.padding.bottom = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Provides combined access on paddings to either edge of the box.
			 *
			 * @name BoxModel#padding
			 * @property {string}
			 */
			padding: {
				get: () => {
					const { padding } = _style;
					return [ padding.top, padding.right, padding.bottom, padding.left ].join( " " );
				},
				set: value => {
					const { padding } = _style;

					const _values = String( value ).trim().split( /\s+/ );
					switch ( _values.length ) {
						case 1 :
							padding.left = padding.right = padding.top = padding.botton = parse( _values[0], { throwNegative: true } );
							break;

						case 2 :
							padding.top = padding.botton = parse( _values[0], { throwNegative: true } );
							padding.left = padding.right = parse( _values[1], { throwNegative: true } );
							break;

						case 3 :
							padding.top = parse( _values[0], { throwNegative: true } );
							padding.left = padding.right = parse( _values[1], { throwNegative: true } );
							padding.botton = parse( _values[2], { throwNegative: true } );
							break;

						case 4 :
							padding.top = parse( _values[0], { throwNegative: true } );
							padding.right = parse( _values[1], { throwNegative: true } );
							padding.botton = parse( _values[2], { throwNegative: true } );
							padding.left = parse( _values[3], { throwNegative: true } );
							break;

						default :
							throw new TypeError( "invalid number of values on padding" );
					}
				},
				enumerable: true,
			},

			/**
			 * Manages width of left border in points (1/72 inch).
			 *
			 * @name BoxModel#borderLeftWidth
			 * @property {number|string}
			 */
			borderLeftWidth: {
				get: () => _style.border.left.width,
				set: value => {
					_style.border.left.width = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Manages width of right border in points (1/72 inch).
			 *
			 * @name BoxModel#borderRightWidth
			 * @property {number|string}
			 */
			borderRightWidth: {
				get: () => _style.border.right.width,
				set: value => {
					_style.border.right.width = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Manages width of top border in points (1/72 inch).
			 *
			 * @name BoxModel#borderTopWidth
			 * @property {number|string}
			 */
			borderTopWidth: {
				get: () => _style.border.top.width,
				set: value => {
					_style.border.top.width = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Manages width of bottom border in points (1/72 inch).
			 *
			 * @name BoxModel#borderBottomWidth
			 * @property {number|string}
			 */
			borderBottomWidth: {
				get: () => _style.border.bottom.width,
				set: value => {
					_style.border.bottom.width = parse( value, { throwNegative: true } );
				},
				enumerable: true,
			},
			/**
			 * Provides combined access on widths of borders to either edge of
			 * the box.
			 *
			 * @name BoxModel#borderWidth
			 * @property {string}
			 */
			borderWidth: {
				get: () => {
					const { border } = _style;
					return [ border.top.width, border.right.width, border.bottom.width, border.left.width ].join( " " );
				},
				set: value => {
					const { border } = _style;

					const _values = String( value ).trim().split( /\s+/ );
					switch ( _values.length ) {
						case 1 :
							border.left.width = border.right.width = border.top.width = border.bottom.width = parse( _values[0], { throwNegative: true } );
							break;

						case 2 :
							border.top.width = border.bottom.width = parse( _values[0], { throwNegative: true } );
							border.left.width = border.right.width = parse( _values[1], { throwNegative: true } );
							break;

						case 3 :
							border.top.width = parse( _values[0], { throwNegative: true } );
							border.left.width = border.right.width = parse( _values[1], { throwNegative: true } );
							border.bottom.width = parse( _values[2], { throwNegative: true } );
							break;

						case 4 :
							border.top.width = parse( _values[0], { throwNegative: true } );
							border.right.width = parse( _values[1], { throwNegative: true } );
							border.bottom.width = parse( _values[2], { throwNegative: true } );
							border.left.width = parse( _values[3], { throwNegative: true } );
							break;

						default :
							throw new TypeError( "invalid number of values on border-width" );
					}
				},
				enumerable: true,
			},

			// --- derived and/or actual values ---

			/**
			 * Derives abscissa of top-left corner of border box.
			 *
			 * @name BoxModel#borderBoxLeft
			 * @property {number}
			 */
			borderBoxLeft: {
				get: () => _actual.x,
				set: value => {
					_actual.x = parse( value );
				},
			},
			/**
			 * Derives ordinate of top-left corner of border box.
			 *
			 * @name BoxModel#borderBoxTop
			 * @property {number}
			 */
			borderBoxTop: {
				get: () => _actual.y,
				set: value => {
					_actual.y = parse( value );
				},
			},
			/**
			 * Provides horizontal offset of left edge in points (1/72 inch)
			 * from left edge of farthest context.
			 *
			 * @name BoxModel#borderBoxAbsoluteLeft
			 * @property {number|string}
			 */
			borderBoxAbsoluteLeft: {
				get: () => ( ( context && context.borderBoxAbsoluteLeft ) || 0 ) + _actual.x,
				set: value => {
					_actual.x = parse( value ) - ( ( context && context.borderBoxAbsoluteLeft ) || 0 );
				},
			},
			/**
			 * Provides vertical offset of top edge in points (1/72 inch) from
			 * top edge of outermost containing box.
			 *
			 * @name BoxModel#borderBoxAbsoluteTop
			 * @property {number|string}
			 */
			borderBoxAbsoluteTop: {
				get: () => ( ( context && context.borderBoxAbsoluteTop ) || 0 ) + _actual.y,
				set: value => {
					_actual.y = parse( value ) - ( ( context && context.borderBoxAbsoluteTop ) || 0 );
				},
			},
			/**
			 * Derives width in points of box including its padding and borders
			 * on left/right edge of box.
			 *
			 * @name BoxModel#borderBoxWidth
			 * @property {number}
			 * @readonly
			 */
			borderBoxWidth: {
				get: () => {
					const { width } = _style;

					if ( width == null ) {
						return context ? context.contentBoxWidth : Infinity;
					}

					const { border, padding } = _style;

					return border.left.width + padding.left + width + padding.right + border.right.width;
				},
			},
			/**
			 * Derives height in points of box including its padding and borders
			 * on top/bottom edge of box.
			 *
			 * @name BoxModel#borderBoxHeight
			 * @property {number}
			 * @readonly
			 */
			borderBoxHeight: {
				get: () => {
					const { height } = _style;

					if ( height == null ) {
						return context ? context.contentBoxHeight : Infinity;
					}

					const { border, padding } = _style;

					return border.top.width + padding.top + height.requested + padding.bottom + border.bottom.width;
				},
			},

			/**
			 * Derives distance between left edges of border box and padding box.
			 *
			 * @name BoxModel#paddingBoxLocalLeft
			 * @property {number}
			 * @readonly
			 */
			paddingBoxLocalLeft: {
				get: () => _actual.x + _style.border.left.width,
			},
			/**
			 * Derives distance between top edges of border box and padding box.
			 *
			 * @name BoxModel#paddingBoxLocalTop
			 * @property {number}
			 * @readonly
			 */
			paddingBoxLocalTop: {
				get: () => _actual.y + _style.border.top.width,
			},
			/**
			 * Derives width in points of box including its padding on
			 * left/right edge of box.
			 *
			 * @name BoxModel#paddingBoxWidth
			 * @property {number}
			 * @readonly
			 */
			paddingBoxWidth: {
				get: () => {
					const { width } = _style;

					if ( width == null ) {
						if ( !context ) {
							return Infinity;
						}

						const { border } = _style;

						return context.contentBoxWidth - border.left.width - border.right.width;
					}

					const { padding } = _style;

					return padding.left + width + padding.right;
				},
			},
			/**
			 * Derives height in points of box including its padding on
			 * top/bottom edge of box.
			 *
			 * @name BoxModel#paddingBoxHeight
			 * @property {number}
			 * @readonly
			 */
			paddingBoxHeight: {
				get: () => {
					const { height } = _style;

					if ( height == null ) {
						if ( !context ) {
							return Infinity;
						}

						const { border } = _style;

						return context.contentBoxHeight - border.top.width - border.bottom.width;
					}

					const { padding } = _style;

					return padding.top + height + padding.bottom;
				},
			},

			/**
			 * Derives distance between left edges of border box and padding box.
			 *
			 * @name BoxModel#contentBoxLocalLeft
			 * @property {number}
			 * @readonly
			 */
			contentBoxLocalLeft: {
				get: () => _actual.x + _style.border.left.width + _style.padding.left,
			},
			/**
			 * Derives distance between top edges of border box and padding box.
			 *
			 * @name BoxModel#contentBoxLocalTop
			 * @property {number}
			 * @readonly
			 */
			contentBoxLocalTop: {
				get: () => _actual.y + _style.border.top.width + _style.padding.top,
			},
			/**
			 * Derives width in points of box excluding its padding and border
			 * on left/right edge of box.
			 *
			 * @name BoxModel#contentBoxWidth
			 * @property {number}
			 * @readonly
			 */
			contentBoxWidth: {
				get: () => {
					const { width } = _style;

					if ( width == null ) {
						if ( !context ) {
							return Infinity;
						}

						const { border, padding } = _style;

						return context.contentBoxWidth - border.left.width - border.right.width - padding.left - padding.right;
					}

					return width;
				},
			},
			/**
			 * Derives height in points of box excluding its padding and border
			 * on top/bottom edge of box.
			 *
			 * @name BoxModel#contentBoxHeight
			 * @property {number}
			 * @readonly
			 */
			contentBoxHeight: {
				get: () => {
					const { height } = _style;

					if ( height == null ) {
						if ( !context ) {
							return Infinity;
						}

						const { border, padding } = _style;

						return context.contentBoxHeight - border.top.width - border.bottom.width - padding.top - padding.bottom;
					}

					return height;
				},
			},
		};
		/* eslint-enable lines-around-comment */

		// expose all properties
		Object.defineProperties( this, properties );
	}

	/**
	 * Parse value describing single extent.
	 *
	 * @param {string|number} input raw extent information to be parsed
	 * @param {boolean} throwInvalid set true to throw in case of parsed value is invalid or NaN
	 * @param {boolean} throwNegative set true to throw in case of parsed value is negative
	 * @return {number} extracted extent measure in pt (1/72 inch), might be NaN
	 */
	static parseExtent( input, { throwInvalid = true, throwNegative = false } = {} ) {
		let value = NaN;

		switch ( typeof input ) {
			case "number" :
				value = input;
				break;

			case "string" : {
				const match = /^\s*(?:([+-]?\s*(?:\d*[,.])?\d+)\s*(cm|pt|mm|m)?|(auto))\s*$/i.exec( input );
				if ( match ) {
					if ( match[3] ) {
						return null;
					}

					const _value = parseFloat( match[1].replace( /,/, "." ).replace( /\s+/g, "" ) );

					switch ( ( match[2] || "" ).toLowerCase() ) {
						case "" :
						case "pt" :
							value = _value;
							break;

						case "cm" :
							value = _value / 2.54 * 72;
							break;

						case "mm" :
							value = _value / 25.4 * 72;
							break;

						case "m" :
							value = _value / 0.0254 * 72;
							break;
					}
				}
			}
		}

		if ( throwInvalid && isNaN( value ) ) {
			throw new TypeError( `invalid extent value: ${value}` );
		}

		if ( throwNegative && value < 0 ) {
			throw new TypeError( `width mustn't be negative` );
		}

		return value;
	}

	/**
	 * Parses string containing CSS-like set of properties into object for
	 * further processing.
	 *
	 * @param {string} string rendered set of CSS-like properties
	 * @returns {object} properties parsed into object
	 */
	static parse( string ) {
		const props = string.replace( /\/\*[\s\S]*\*\//g, " " ).replace( /\/\/.*/g, "" ).split( /;/ );
		const numProps = props.length;
		const parsed = {};

		for ( let i = 0; i < numProps; i++ ) {
			const match = /^\s*([a-z-]+)\s*:\s*(.+)\s*$/.exec( props[i] );
			if ( match ) {
				parsed[match[1].indexOf( "-" ) > -1 ? match[1].toLowerCase() : match[1]] = match[2];
			}
		}

		return parsed;
	}

	/**
	 * Applies provided style definitions.
	 *
 	 * @param {string|object} source description of properties to initialize created box model with
	 * @returns {void}
	 */
	apply( source ) {
		const _source = typeof source === "string" ? this.parse( source ) : source;
		if ( _source && typeof _source !== "object" ) {
			throw new TypeError( "invalid source" );
		}

		const names = Object.keys( _source );
		const numNames = names.length;

		for ( let priority = HighestPriority; priority >= 0; priority-- ) {
			for ( let i = 0; i < numNames; i++ ) {
				const name = names[i];
				const _name = Aliases[name] || name;

				if ( ( Priorities[_name] || 0 ) === priority ) {
					if ( this.propertyIsEnumerable( _name ) ) {
						this[_name] = _source[name];
					}
				}
			}
		}
	}

	/**
	 * Creates instance of BoxModel optionally initialized from provided source.
	 *
	 * @param {?BoxModel} context box model instance used as context for relative extents
	 * @param {string|object} source description of properties to initialize created box model with
	 * @return {BoxModel} created box model
	 */
	static create( context, source = null ) {
		const instance = new this( context );

		if ( source ) {
			instance.apply( source );
		}

		return instance;
	}
}

module.exports = BoxModel;
