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
    options: joi.array().items( joi.object().keys({
        text: joi.string().required(),
        correct: joi.boolean()
    }))
});

export class MultipleChoiceQuestion {
    constructor( {id, question, code, solution, options}) {
        this.id = id; this.question = question; this.questionHtml = utils.markdownToHtml( question);
        this.code = code; this.solution = solution; 
        this.solutionHtml = this.solution ? hljs.highlight('python', this.solution, true) : null;
        this.correctIds = []; this.options = [];
        this.type = 'multiple-choice-question';

        options.map((option, index) => {
            this.options.push( {id: index.toString(), text: option.text, html: utils.markdownToHtml(option.text)});
            if( option.correct) this.correctIds.push( index.toString());
        })
    }
}

registerSection( 'multiple-choice-question', schema, MultipleChoiceQuestion);