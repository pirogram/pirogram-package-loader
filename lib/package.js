'use strict';

const path = require('path');
const yaml = require('js-yaml');
const utils = require('./utils');
const {cleanSection} = require('./section');
const _ = require('lodash');

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
        const match = filenameRegex.exec(file);
        data.meta.code = match ? match[1] : null;
    }

    data.meta.title = data.meta.title || _.startCase( data.meta.code.toLowerCase());

    data.sections = _.filter( data.sections, (s) => { return s != null;}).map((s,i) => {
        if( typeof( s) == "string") {
            s = {type: "markdown", text: s};
        }

        if( !s.type) {
            throw `In package at ${p.meta.dirPath}, error in topic ${filePath}. Following section has a missing type.\n${s}`;
        }
        
        s.id = s.id || hash(s);
        return s;
    });

    if( !data.meta.code || data.meta.code.length < 3 || data.meta.code.length > 256 
        || data.meta.code.match(/^[a-zA-Z0-9_-]+$/)) {
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

    let err;
    if( !data.code || data.code.length < 3 || data.code.length > 256 || data.code.match(/^[a-zA-Z0-9_-]+$/)) {
        err = `Error in ${dirPath}. Package code in package.yaml must be present, it should be between 3-256 character long and it can have only alphanumeric characters with underscore (_) and dash (-).`;
    } else if( !data.title || data.title.length < 3 || data.title.length > 256) {
        err = `Error in ${dirPath}. Package title in package.yaml must be present, it should be between 3-256 character long.`;
    } else if( !data.description) {
        err = `Error in ${dirPath}. Package description in package.yaml must be present.`;
    } else if( data.files && (!Array.isArray( data.files))) {
        err = `Error in ${dirPath}. 'files' must be a list of file paths.`;
    }

    if( err) { throw err; }

    return data;
}

async function inferTopicFiles( dirPath) {
    return await utils.glob( path.join( dirPath, "topics", "*.md"));
}

async function loadPackage( author, dirPath) {
    let p = {meta: {author, dirPath}};

    _.merge(p.meta, await loadPackageYaml(dirPath));

    if( !p.meta.files) {
        p.meta.files = await inferTopicFiles( dirPath);
    }

    if( !p.meta.files || !p.meta.files.length) {
        throw `Error in ${dirPath}. Did not find any topics in the package.`
    }

    p.meta.topics = Promise.all( p.meta.files.map( (filePath, index) => {
        return loadTopicFromFile( p, filePath);
    }));

    p.meta.topics.map( (topic, i) => {
        topic.sections.map( (section, j) => {
            cleanSection( p, topic, section);
        })
    })

    return p;
}

module.exports = {loadPackage};
