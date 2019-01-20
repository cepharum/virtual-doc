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

const EventListener = require( "./event-listener" );

/**
 * Implements common behaviour of elements that can be part of a document's page.
 */
class Element extends EventListener {
	/**
	 * @param {?Element} parent reference on element containing this one
	 */
	constructor( parent = null ) {
		const Page = require( "./page" );

		if ( parent != null && !( parent instanceof Element ) ) {
			throw new TypeError( "invalid parent" );
		}

		super();

		Object.defineProperties( this, {
			/**
			 * Exposes element this one is contained in.
			 *
			 * @name Element#parent
			 * @property {Element}
			 * @readonly
			 */
			parent: { value: parent instanceof Element ? parent : null },

			/**
			 * Exposes page this element belongs to mediately or immediately.
			 *
			 * @name Element#page
			 * @property {Page}
			 * @readonly
			 */
			page: { value: parent == null ? null : parent instanceof Page ? parent : parent.page },

			/**
			 * Lists elements contained in current element.
			 *
			 * @name Element#content
			 * @property {Element[]}
			 * @readonly
			 */
			content: { value: [] },
		} );
	}

	/** @inheritDoc */
	dispatch( name, ...args ) {
		if ( !super.dispatch( name, ...args ) ) {
			if ( this.parent ) {
				return this.parent.dispatch( name, ...args );
			}

			return false;
		}

		return true;
	}

	/**
	 * Finds child element in content selected by its reference or by its index
	 * in content of current container.
	 *
	 * @param {int|Element} child index of element or reference on element to be selected in content
	 * @return {?Element} reference on found element, null if missing element
	 */
	findChild( child ) {
		const { content } = this;
		const numChildren = content.length;

		if ( child instanceof Element ) {
			for ( let i = 0; i < numChildren; i++ ) {
				if ( child === content[i] ) {
					return child;
				}
			}

			return null;
		}

		const _index = parseInt( child );
		if ( _index > -1 && _index < numChildren ) {
			return content[_index];
		}

		return null;
	}

	/**
	 * Adds element as children of current one.
	 *
	 * @param {Element} element element to be added, omit for creating new one
	 * @param {Element|int} insertBefore reference on element or index of element becoming successor of inserted one, omit for appending
	 * @return {Element} added element
	 */
	addElement( element = null, insertBefore = null ) {
		const _element = element == null ? new this.constructor( this ) : element;

		if ( !( _element instanceof Element ) ) {
			throw new TypeError( "invalid element" );
		}

		if ( _element.parent !== this ) {
			throw new TypeError( "element isn't subordinated to current one" );
		}


		const { content } = this;
		const numColumns = content.length;
		let _index = -1;


		if ( insertBefore instanceof require( "./vertical-flow-container" ) ) {
			for ( let i = 0; i < numColumns; i++ ) {
				if ( content[i] === insertBefore ) {
					_index = i;
					break;
				}
			}
		} else if ( insertBefore == null ) {
			_index = numColumns;
		} else if ( !isNaN( insertBefore ) ) {
			_index = Math.max( 0, Math.min( numColumns - 1, parseInt( insertBefore ) ) );
		}

		if ( _index < 0 ) {
			throw new Error( "invalid reference/index for inserting column" );
		}


		content.splice( _index, 0, _element );

		return _element;
	}
}

module.exports = Element;
