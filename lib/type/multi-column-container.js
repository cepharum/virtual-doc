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
const VerticalFlowContainer = require( "./vertical-flow-container" );

/**
 * Implements container element with content flowing from top to bottom in one
 * or more columns.
 */
class MultiColumnContainer extends BlockElement {
	/**
	 * Adds another column.
	 *
	 * @param {VerticalFlowContainer|int} insertBefore index of column or
	 *        reference on column becoming successor of inserted one, null is
	 *        for appending column
	 * @return {VerticalFlowContainer} created and added column
	 */
	addColumn( insertBefore = null ) {
		const { content } = this;
		const numColumns = content.length;
		let _index = -1;


		if ( insertBefore instanceof VerticalFlowContainer ) {
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


		const column = new VerticalFlowContainer( this );

		content.splice( _index, 0, column );

		return column;
	}

	/**
	 * Removes selected column from container returning reference on removed
	 * column element.
	 *
	 * @param {VerticalFlowContainer|int} column reference on column element or index of column element to remove
	 * @return {VerticalFlowContainer} removed column element
	 * @throws Error on invalid selection of a column element
	 */
	removeColumn( column ) {
		const { content } = this;
		const numColumns = content.length;

		if ( column instanceof VerticalFlowContainer ) {
			for ( let i = 0; i < numColumns; i++ ) {
				if ( content[i] === column ) {
					content.splice( i, 1 );
					return column;
				}
			}

			throw new TypeError( "column not found in container" );
		}

		const _index = parseInt( column );
		if ( _index > -1 && _index < numColumns ) {
			const removedColumn = content[_index];

			content.splice( _index, 1 );

			return removedColumn;
		}

		throw new TypeError( "invalid index for selecting column to remove" );
	}
}

module.exports = MultiColumnContainer;
