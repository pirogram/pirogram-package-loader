'use strict';

const joi = require('joi');
const utils = require('./utils');
const glob = require( 'glob' );
const path = require( 'path' );

const _sections = {};

export function registerSection( type, schema, klass) {
    _sections[type] = {schema, klass};
}

export function loadSection( data) {
    const {klass, schema} = _sections[ data.type];
    if( !klass) {
        throw {
            name: 'SectionTypeError',
            message: `Section type ${data.type} not found.\n${data}`
        }
    }

    const {err, value} = joi.validate( data, schema, {allowUnknown: true});
    if( err) {
        throw {
            name: 'SectionSchemaError',
            message: `Error in section schema validation ${err}.\n${data}`
        }
    }

    return new klass(data);
}

glob.sync( './sections/*.js' ).forEach( function( file ) {
    require( path.resolve( file ) );
});