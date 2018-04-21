'use strict';

const joi = require('joi');
const {registerSection} = require('../section');
const utils = requier('../utils');

const schema = joi.object().keys({
    text: joi.string().required()
});

class Markdown {
    constructor( {text}) {
        this.text = text; this.html = utils.markdownToHtml( text);
        this.type = 'markdown';
    }
}

registerSection( 'markdown', schema, Markdown);

module.exports = Markdown;
