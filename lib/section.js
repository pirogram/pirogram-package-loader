'use strict';

const utils = require('./utils');
const hljs = require('highlight');

const cleaners = {};

function categorizationQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true) : '';
    section.categories = section.categories || _.values( section.mappings);

    return section;
}

function codingQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true) : '';
    section.tests = _.pull( section.tests.split(/\r?\n/), '');
    section.testsHtml = section.tests.map( (test, index) => {
        return hljs.highlight('python', test, true);
    });

    return section;
}

function fillInTheBlankQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true) : '';
}

function liveCodeCleaner( p, topic, section) {
    return section;
}

function markdownCleaner( p, topic, section) {
    section.html = utils.markdownToHtml( section.markdown);
}

function multipleChoiceQuestionCleaner( p, topic, section) {
    section.questionHtml = section.question ?  utils.markdownToHtml( section.question) : '';
    section.solutionHtml = section.solution ? hljs.highlight('python', section.solution, true) : '';

    section.correctIds = [];
    const options = section.options.map((option, index) => {
        const o = {id: index.toString(), text: option.text, html: utils.markdownToHtml(option.text)};
        if( option.correct) this.correctIds.push( index.toString());

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
cleaners['fill-in-the-blank-question'] = fillInTheBlankQuestionCleaner;
cleaners['live-code'] = liveCodeCleaner;
cleaners['markdown'] = markdownCleaner;
cleaners['multiple-choice-question'] = multipleChoiceQuestionCleaner;
cleaners['qualitative-question'] = qualitativeQuestionCleaner;

function cleanSection( p, topic, section) {
    cleaner = cleaners[ section.type];
    if( !cleaner) {
        throw `Error in package at ${p.meta.dirPath}, topic ${topic.meta.filePath}. Unknown section of type ${section.type}.`
    }

    return cleaner(p, topic, section);
}

module.exports = {cleanSection};