'use strict';

const joi = require('joi');
const hljs = require('highlight.js');
const {registerSection} = require('../section');
const utils = requier('../utils');

const schema = joi.object().keys({
    id: joi.string().required(),
    code: joi.string()
});

export class LiveCode {
    constructor( {id, code}) {
        this.id = id; this.code = code;
        this.type = 'live-code';
    }
}

registerSection( 'live-code', schema, LiveCode);