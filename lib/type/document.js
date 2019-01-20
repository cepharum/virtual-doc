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

const Page = require( "./page" );

/**
 * Implements representation of single document consisting of pages.
 */
class Document {
	/** */
	constructor() {
		Object.defineProperties( this, {
			/**
			 * Exposes list of document's pages.
			 *
			 * @name Document#pages
			 * @property {Page[]}
			 * @readonly
			 */
			pages: { value: [] },
		} );
	}

	/**
	 * Adds another page to the document.
	 *
	 * @param {Page|int} insertBefore index of page or reference on page to become
	 *        successor of inserted one, null is for appending new page
	 * @return {Page} created and added page
	 */
	addPage( insertBefore = null ) {
		const { pages } = this;
		const numPages = pages.length;
		let _index = -1;


		if ( insertBefore instanceof Page ) {
			for ( let i = 0; i < numPages; i++ ) {
				if ( pages[i] === insertBefore ) {
					_index = i;
					break;
				}
			}
		} else if ( insertBefore == null ) {
			_index = numPages;
		} else if ( !isNaN( insertBefore ) ) {
			_index = Math.max( 0, Math.min( numPages - 1, parseInt( insertBefore ) ) );
		}

		if ( _index < 0 ) {
			throw new Error( "invalid reference/index for inserting page" );
		}


		const page = new Page( this );

		pages.splice( _index, 0, page );

		return page;
	}

	/**
	 * Removes selected page from document returning reference on removed page.
	 *
	 * @param {Page|int} page reference on page or index of page to remove
	 * @return {Page} removed page
	 * @throws Error on invalid selection of a page
	 */
	removePage( page ) {
		const { pages } = this;
		const numPages = pages.length;

		if ( page instanceof Page ) {
			for ( let i = 0; i < numPages; i++ ) {
				if ( pages[i] === page ) {
					pages.splice( i, 1 );
					return page;
				}
			}

			throw new TypeError( "page not found in current document" );
		}

		const _index = parseInt( page );
		if ( _index > -1 && _index < numPages ) {
			const removedPage = pages[_index];

			pages.splice( _index, 1 );

			return removedPage;
		}

		throw new TypeError( "invalid index for selecting page to remove" );
	}
}

module.exports = Document;

