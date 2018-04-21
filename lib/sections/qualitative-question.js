'use strict';

const joi = require('joi');
const {registerSection} = require('../section');
const utils = requier('../utils');

const schema = joi.object().keys({
    id: joi.string().required(),
    question: joi.string().required()
});

export class QualitativeQuestion {
    constructor( {id, question}) {
        this.id = id; this.question = question; this.questionHtml = utils.markdownToHtml( question);
        this.type = 'qualitative-question';
    }
}

registerSection( 'qualitative-question', schema, QualitativeQuestion);