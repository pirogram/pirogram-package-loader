'use strict';

const path = require('path');
const yaml = require('js-yaml');
const utils = require('./utils');
const {cleanSection} = require('./section');
const _ = require('lodash');
const hash = require('object-hash');

async function loadTopicFromFile( p, filePath) {
    const filenameRegex = /\/\d*-?([-\w]+)\.md$/;
    let content, docs;

    try {
        content = await utils.loadFileContent( filePath);
    } catch( e) {
        throw `In package at ${p.meta.dirPath}, failed to load topic from file ${filePath}.\n${e.message}`;
    }

    try {
        docs = yaml.safeLoadAll( content);
    } catch( e) {
        throw `In package at ${p.meta.dirPath}, failed to load topic from file ${filePath}.\n${e.message}`;
    }

    const data = {meta: docs[0], sections: docs.slice(1)};
    data.meta.filePath = filePath;

    if( !data.meta.code) {
        const match = filenameRegex.exec(filePath);
        data.meta.code = match ? match[1] : null;
    }
    data.meta.id = data.meta.id || data.meta.code;

    data.meta.title = data.meta.title || _.startCase( data.meta.code.toLowerCase());

    data.sections = _.filter( data.sections, (s) => { return s != null;}).map((s,i) => {
        if( typeof( s) == "string") {
            s = {type: "markdown", text: s};
        }

        if( !s.type) {
            throw `In package at ${p.meta.dirPath}, error in topic ${filePath}. Following section has a missing type.\n${s}`;
        }
        
        s.id = s.id ? s.id.toString() : hash(s);
        return s;
    });

    if( !data.meta.code || data.meta.code.length < 3 || data.meta.code.length > 256 
        || !data.meta.code.match(/^[a-zA-Z0-9_-]+$/)) {
        throw `In package at ${p.meta.dirPath}, error in topic ${filePath}. Topic code in must be present, it should be between 3-256 character long and it can have only alphanumeric characters with underscore (_) and dash (-).`;
    } else if( !data.meta.title || data.meta.title.length < 3 || data.meta.title.length > 256) {
        throw `In package at ${p.meta.dirPath}, error in topic ${filePath}. Topic title in package.yaml must be present, it should be between 3-256 character long.`;
    }

    return data;
}

async function loadPackageYaml( dirPath) {
    let content, data;

    try {
        content = await utils.loadFileContent( path.join(dirPath, 'package.yaml'));
    } catch(e) {
        throw `Error in loading package.yaml for package in directory ${dirPath}\n${e.message}`; 
    }

    try {
        data = yaml.safeLoad( content);
    } catch( e) {
        throw `Error in loading package.yaml content from ${dirPath}\n${e.message}`;
    }

    data.status = data.status || 'live';

    let err;
    if( !data.code || data.code.length < 3 || data.code.length > 256 || !data.code.match(/^[a-zA-Z0-9_-]+$/)) {
        err = `Error in ${dirPath}. Package code in package.yaml must be present, it should be between 3-256 character long and it can have only alphanumeric characters with underscore (_) and dash (-).`;
    } else if( !data.title || data.title.length < 3 || data.title.length > 256) {
        err = `Error in ${dirPath}. Package title in package.yaml must be present, it should be between 3-256 character long.`;
    } else if( !data.description) {
        err = `Error in ${dirPath}. Package description in package.yaml must be present.`;
    } else if( data.files && (!Array.isArray( data.files))) {
        err = `Error in ${dirPath}. 'files' must be a list of file paths.`;
    } else if( data.status != 'live' && data.status != 'draft') {
        err = `Error in ${dirPath}. 'status' must be live or draft.`;
    }

    if( err) { throw err; }

    return data;
}

async function inferTopicFiles( dirPath) {
    return await utils.glob( path.join( dirPath, "topics", "*.md"));
}

async function loadPackage( dirPath) {
    let p = {meta: { dirPath, topicCount: 0, exampleCount: 0, exerciseCount: 0}};

    _.merge(p.meta, await loadPackageYaml(dirPath));

    if( !p.meta.files) {
        p.meta.files = await inferTopicFiles( dirPath);
    }

    if( !p.meta.files || !p.meta.files.length) {
        throw `Error in ${dirPath}. Did not find any topics in the package.`
    }

    p.topics = await Promise.all( p.meta.files.map( async (filePath, index) => {
        return await loadTopicFromFile( p, filePath);
    }));

    p.topics.map( (topic, i) => {
        topic.meta.exampleCount = 0;
        topic.meta.exerciseCount = 0;

        topic.sections.map( (section, j) => {
            try {
                cleanSection( p, topic, section);
                if( section.type == 'live-code') topic.meta.exampleCount += 1;
                else if( section.type != 'markdown') topic.meta.exerciseCount += 1;
            } catch(e) {
                throw `Error in package ${p.meta.code}, topic ${topic.meta.code}, section:\n${section}\n${e.message}`;
            }
        });

        p.meta.exampleCount += topic.meta.exampleCount;
        p.meta.exerciseCount += topic.meta.exerciseCount;
        p.meta.topicCount += 1;
    });

    return p;
}

module.exports = {loadPackage};
