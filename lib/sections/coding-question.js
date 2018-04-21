'use strict';

const joi = require('joi');
const hljs = require('highlight.js');
const {registerSection} = require('../section');
const utils = requier('../utils');

const schema = joi.object().keys({
    id: joi.string().required(),
    question: joi.string().required(),
    code: joi.string(),
    solution: joi.string().required(),
    tests: joi.string()
});

export class CodingQuestion {
    constructor( {id, question, code, solution, tests}) {
        this.id = id; this.code = code; this.solution = solution;
        this.question = question; this.questionHtml = utils.markdownToHtml( question);
        this.tests = _.pull( tests.split(/\r?\n/), '');
        this.testsHtml = this.tests.map( (test, index) => {
            return hljs.highlight('python', test, true);
        })
        this.type = 'coding-question';
    }
}

registerSection( 'coding-question', schema, CodingQuestion);