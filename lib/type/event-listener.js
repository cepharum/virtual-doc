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
 * Implements basic behaviour of an object receiving events to be dispatched to
 * registered listener callbacks.
 */
class EventListener {
	/** */
	constructor() {
		Object.defineProperties( this, {
			/**
			 * Lists callbacks per name of event to be invoked whenever an event
			 * matching by name is dispatched.
			 *
			 * @name EventListener#_listeners
			 * @property {object<string,function[]>}
			 * @readonly
			 * @protected
			 */
			_listeners: { value: {} },
		} );
	}

	/**
	 * Registers callback to be invoked each time dispatching named event on
	 * current object.
	 *
	 * @param {string} name name of event to be listening for
	 * @param {function(...*):boolean} callback callback invoked when named event is dispatched
	 * @return {function(): void} callback to invoke for removing registered listener
	 */
	on( name, callback ) {
		if ( typeof callback !== "function" ) {
			throw new TypeError( "invalid callback" );
		}

		const { _listeners } = this;

		if ( !_listeners.hasOwnProperty( name ) ) {
			_listeners[name] = [];
		}

		const handlers = _listeners[name];

		if ( handlers.indexOf( callback ) < 0 ) {
			handlers.push( callback );
		}

		return () => this.off( name, callback );
	}

	/**
	 * Registers callback to be invoked once next time dispatching named event
	 * on current object.
	 *
	 * @param {string} name name of event to be listening for
	 * @param {function(...*):boolean} callback callback invoked when named event is dispatched next time
	 * @return {function(): void} callback to invoke for removing registered listener
	 */
	once( name, callback ) {
		const remover = this.on( name, ( ...args ) => {
			const result = callback( ...args );

			remover();

			return result;
		} );

		return remover;
	}

	/**
	 * Removes all or just one previously registered listener for a named event.
	 *
	 * @param {string} name name of event
	 * @param {function(...*):boolean} callback listener callback to be removed explicitly
	 * @return {void}
	 */
	off( name, callback = null ) {
		const { _listeners } = this;

		if ( _listeners.hasOwnProperty( name ) ) {
			const handlers = _listeners[name];

			if ( callback ) {
				const index = handlers.indexOf( callback );
				if ( index > -1 ) {
					handlers.splice( index, 1 );
				}
			} else {
				handlers.splice( 0, handlers.length );
			}
		}
	}

	/**
	 * Dispatches named event customized with given arguments in context of
	 * current instance.
	 *
	 * @param {string} name name of event to dispatch
	 * @param {*} args arguments customizing dispatched event
	 * @returns {boolean} true if dispatching has been cancelled by a listener, false otherwise
	 */
	dispatch( name, ...args ) {
		const handlers = this._listeners[name];

		if ( Array.isArray( handlers ) ) {
			const numHandlers = handlers.length;

			for ( let i = 0; i < numHandlers; i++ ) {
				if ( handlers[i]( ...args ) === false ) {
					return true;
				}
			}
		}

		return false;
	}
}

module.exports = EventListener;
