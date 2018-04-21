'use strict';

const joi = require('joi');
const hljs = require('highlight.js');
const {registerSection} = require('../section');
const utils = requier('../utils');

const schema = joi.object().keys({
    id: joi.string().required(),
    question: joi.string().required(),
    code: joi.string(),
    solution: joi.string(),
    blanks: joi.array().items( joi.object().keys({
        label: joi.string().required(),
        answer: joi.string().required()
    }))
});

export class FillInTheBlankQuestion {
    constructor( {id, question, code, solution, blanks}) {
        this.id = id; this.question = question; this.questionHtml = utils.markdownToHtml( question);
        this.code = code; this.solution = solution; 
        this.solutionHtml = this.solution ? hljs.highlight('python', this.solution, true) : null;
        this.blanks = blanks;
        this.type = 'fill-in-the-blank-question';
    }
}

registerSection( 'fill-in-the-blank-question', schema, FillInTheBlankQuestion);