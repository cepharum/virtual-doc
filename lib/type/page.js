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

const BlockElement = require( "./block-element" );

/**
 * Provides description of a single page of document.
 */
class Page extends BlockElement {
	/**
	 * @param {Document} document reference on document this page belongs to
	 * @param {Page} template master page serving as a template of current page
	 */
	constructor( document, template = null ) {
		if ( !( document instanceof require( "./document" ) ) ) {
			throw new TypeError( "invalid document" );
		}

		if ( template != null && !( template instanceof Page ) ) {
			throw new TypeError( "invalid page template" );
		}

		super( null );

		let header = null;
		let footer = null;

		Object.defineProperties( this, {
			/**
			 * Exposes document this page belongs to.
			 *
			 * @name Page#document
			 * @property {Document}
			 * @readonly
			 */
			document: { value: document },

			/**
			 * Exposes page serving as template of current page.
			 *
			 * @name Page#template
			 * @property {Page}
			 * @readonly
			 */
			template: { value: template },

			/**
			 * Refers to container with elements to be displayed in header of
			 * page.
			 *
			 * @name Page#header
			 * @property {BlockElement}
			 * @readonly
			 */
			header: {
				get: () => header || ( template && template.header ) || null,
				set: element => {
					if ( !( element instanceof BlockElement ) ) {
						throw new TypeError( "invalid block element" );
					}

					if ( header ) {
						throw new TypeError( "replacing header rejected" );
					}

					header = element;
				},
			},

			/**
			 * Refers to container with elements to be displayed in footer of
			 * page.
			 *
			 * @name Page#footer
			 * @property {BlockElement}
			 * @readonly
			 */
			footer: {
				get: () => footer || ( template && template.footer ) || null,
				set: element => {
					if ( !( element instanceof BlockElement ) ) {
						throw new TypeError( "invalid block element" );
					}

					if ( footer ) {
						throw new TypeError( "replacing footer rejected" );
					}

					footer = element;
				},
			},
		} );
	}
}

module.exports = Page;
