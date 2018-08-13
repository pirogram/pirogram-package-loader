'use strict';

const utils = require('./utils');
const hljs = require('highlight.js');
const _ = require('lodash');

const cleaners = {};

function categorizationQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true).value : '';
    section.categories = section.categories || _.values( section.mappings);
    section.categories = section.categories.map((c, i) => c.toString());

    return section;
}

function codingQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true).value : '';
    section.tests = _.pull( section.tests.split(/\r?\n/), '');
    section.testsHtml = section.tests.map( (test, index) => {
        return hljs.highlight('python', test, true).value;
    });

    return section;
}

function testlessCodingQuestionCleaner(p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';

    return section;
}

function fillInTheBlankQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true).value : '';
    section.blanks.map( (blank, i) => { blank.answer = blank.answer.toString(); });
}

function liveCodeCleaner( p, topic, section) {
    section.code = code.replace(/\n+$/gi, '');
    return section;
}

function markdownCleaner( p, topic, section) {
    section.html = utils.markdownToHtml( section.text);
}

function multipleChoiceQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true).value : '';

    section.correctIds = [];
    const options = section.options.map((option, index) => {
        const o = {id: index.toString(), text: option.text, html: utils.markdownToHtml(option.text)};
        if( option.correct) section.correctIds.push( index.toString());

        return o;
    });

    section.options = options;

    return section;
}

function qualitativeQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';

    return section;
}

cleaners['categorization-question'] = categorizationQuestionCleaner;
cleaners['coding-question'] = codingQuestionCleaner;
cleaners['testless-coding-question'] = testlessCodingQuestionCleaner;
cleaners['fill-in-the-blank-question'] = fillInTheBlankQuestionCleaner;
cleaners['live-code'] = liveCodeCleaner;
cleaners['markdown'] = markdownCleaner;
cleaners['multiple-choice-question'] = multipleChoiceQuestionCleaner;
cleaners['qualitative-question'] = qualitativeQuestionCleaner;

function cleanSection( p, topic, section) {
    const cleaner = cleaners[ section.type];
    if( !cleaner) {
        throw `Error in package at ${p.meta.dirPath}, topic ${topic.meta.filePath}. Unknown section of type ${section.type}.`
    }

    section = cleaner(p, topic, section);

    return section;
}

module.exports = {cleanSection};