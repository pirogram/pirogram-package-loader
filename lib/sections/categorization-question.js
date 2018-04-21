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
    categories: joi.array().items( joi.string()),
    mappings: joi.object()
});

export class CategorizationQuestion {
    constructor( {id, question, code, solution, categories, mappings}) {
        this.id = id; this.question = question; this.questionHtml = utils.markdownToHtml( question);
        this.code = code; this.solution = solution; 
        this.solutionHtml = this.solution ? hljs.highlight('python', this.solution, true) : null;
        this.mappings = mappings; this.categories = categories || _.values( mappings);
        this.type = 'categorization-question';
    }
}

registerSection( 'qualitative-question', schema, CategorizationQuestion);