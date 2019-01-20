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

const { describe, it } = require( "mocha" );
const Should = require( "should" );

const { type: { BoxModel } } = require( "../../" );


const FirstClassProperties = [
	"top", "left", "right", "bottom",
	"borderBoxLeft", "borderBoxTop", "borderBoxAbsoluteLeft", "borderBoxAbsoluteTop",
	"width", "height",
	"paddingLeft", "paddingRight", "paddingTop", "paddingBottom",
	"marginLeft", "marginRight", "marginTop", "marginBottom",
	"borderLeftWidth", "borderRightWidth", "borderTopWidth", "borderBottomWidth",
];

const Values = [
	{ pt: 72, cm: 2.54, mm: 25.4, m: 0.0254 },
	{ pt: 7.2, cm: 0.254, mm: 2.54, m: 0.00254 },
];



describe( "Type BoxModel", () => {
	describe( "can be instantiated", () => {
		it( "w/o any arguments", () => {
			( () => new BoxModel() ).should.not.throw();
		} );

		it( "with another BoxModel instance as parent, only", () => {
			( () => new BoxModel( false ) ).should.throw();
			( () => new BoxModel( "" ) ).should.throw();
			( () => new BoxModel( 0 ) ).should.throw();
			( () => new BoxModel( {} ) ).should.throw();
			( () => new BoxModel( {
				width: 100,
				height: 100
			} ) ).should.throw();
			( () => new BoxModel( [] ) ).should.throw();

			( () => new BoxModel( new BoxModel() ) ).should.not.throw();
		} );

		it( "with a second BoxModel instance passed to be its context, only", () => {
			( () => new BoxModel( false ) ).should.throw();
			( () => new BoxModel( "" ) ).should.throw();
			( () => new BoxModel( 0 ) ).should.throw();
			( () => new BoxModel( {} ) ).should.throw();
			( () => new BoxModel( {
				width: 100,
				height: 100
			} ) ).should.throw();
			( () => new BoxModel( [] ) ).should.throw();

			( () => new BoxModel( new BoxModel() ) ).should.not.throw();
		} );
	} );

	describe( "exposes its context which", () => {
		it( "is missing by default, thus exposing `null` reference", () => {
			Should( new BoxModel().context ).be.null();
		} );

		it( "is identical to the reference provided on instantiating", () => {
			const context = new BoxModel();

			new BoxModel( context ).context.should.be.equal( context );
		} );

		it( "is identical to the reference provided on using static `create()` method", () => {
			const context = new BoxModel();

			BoxModel.create( context ).context.should.be.equal( context );
		} );
	} );

	describe( "internally manages extents in unit pt (1/72 inch) while accepting values in unit", () => {
		it( "_none_", () => {
			const instance = new BoxModel();

			for ( const name of FirstClassProperties ) {
				for ( const value of Values ) {
					instance[name] = value.pt;
					instance[name].should.be.Number().which.is.equal( value.pt );

					instance[name] = `${value.pt}`;
					instance[name].should.be.Number().which.is.equal( value.pt );

					instance[name] = ` \t\n\r \t${value.pt} \t\n `;
					instance[name].should.be.Number().which.is.equal( value.pt );
				}
			}
		} );

		it( "pt", () => {
			const instance = new BoxModel();

			for ( const name of FirstClassProperties ) {
				for ( const value of Values ) {
					instance[name] = `${value.pt}pt`;
					instance[name].should.be.Number().which.is.equal( value.pt );

					instance[name] = ` \r\n\t ${value.pt}\n pt \r `;
					instance[name].should.be.Number().which.is.equal( value.pt );
				}
			}
		} );

		it( "mm", () => {
			const instance = new BoxModel();

			for ( const name of FirstClassProperties ) {
				for ( const value of Values ) {
					instance[name] = `${value.mm}mm`;
					instance[name].should.be.Number().which.is.equal( value.pt );

					instance[name] = ` \r\n\t ${value.mm}\n mm \r `;
					instance[name].should.be.Number().which.is.equal( value.pt );
				}
			}
		} );

		it( "cm", () => {
			const instance = new BoxModel();

			for ( const name of FirstClassProperties ) {
				for ( const value of Values ) {
					instance[name] = `${value.cm}cm`;
					instance[name].should.be.Number().which.is.equal( value.pt );

					instance[name] = ` \r\n\t ${value.cm}\n cm \r `;
					instance[name].should.be.Number().which.is.equal( value.pt );
				}
			}
		} );

		it( "m", () => {
			const instance = new BoxModel();

			for ( const name of FirstClassProperties ) {
				for ( const value of Values ) {
					instance[name] = `${value.m}m`;
					instance[name].should.be.Number().which.is.equal( value.pt );

					instance[name] = ` \r\n\t ${value.m}\n m \r `;
					instance[name].should.be.Number().which.is.equal( value.pt );
				}
			}
		} );
	} );

	describe( "supports box sizing models which", () => {
		it( "is `content` by default", () => {
			new BoxModel().boxSizing.should.be.String().which.is.equal( "content" );
		} );

		it( "can be changed to `padding`", () => {
			const model = new BoxModel();
			model.boxSizing = "padding";
			model.boxSizing.should.be.String().which.is.equal( "padding" );
		} );

		it( "can be changed to `border`", () => {
			const model = new BoxModel();
			model.boxSizing = "border";
			model.boxSizing.should.be.String().which.is.equal( "border" );
		} );

		it( "can be _changed_ to `content`", () => {
			let model;

			model = new BoxModel();
			model.boxSizing = "content";
			model.boxSizing.should.be.String().which.is.equal( "content" );

			model = new BoxModel();
			model.boxSizing.should.be.String().which.is.equal( "content" );
		} );

		it( "can be changed over and over again", () => {
			const model = new BoxModel();

			model.boxSizing = "padding";
			model.boxSizing.should.be.String().which.is.equal( "padding" );

			model.boxSizing = "border";
			model.boxSizing.should.be.String().which.is.equal( "border" );

			model.boxSizing = "content";
			model.boxSizing.should.be.String().which.is.equal( "content" );

			model.boxSizing = "border";
			model.boxSizing.should.be.String().which.is.equal( "border" );
		} );
	} );
} );
