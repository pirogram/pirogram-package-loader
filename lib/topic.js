'use strict';

const joi = require('joi');
const yaml = require('js-yaml');
const utils = require('./utils');
const hash = require('object-hash');
const {loadSection} = require('./section');
const _ = require('lodash');

const schema = joi.object().keys({
    meta: joi.object().keys({
        code: joi.string().min(3).max(256).regex(/^[a-zA-Z0-9_-]$/).required(),
        title: joi.string().min(3).max(256).required()
    }),
    sections: joi.array().items( joi.object().keys({
        id: joi.string().required(),
        type: joi.string().required()
    }))
});

const filenameRegex = /\/\d*-?([-\w]+)\.md$/;
async function loadTopicYaml( filePath) {
    const content = await utils.loadFileContent( filePath);
    const docs = yaml.safeLoadAll( content);
    const topicData = {meta: docs[0], sections: docs.slice(1)};

    if( !topicData.meta.code) {
        const match = filenameRegex.exec(file);
        topic.meta.code = match ? match[1] : null;
    }

    topicData.meta.title = topicData.meta.title || _.startCase( topic.meta.code.toLowerCase());

    topicData.sections = _.filter( topicData.sections, (s) => { return s != null;}).map((s,i) => {
        if( typeof( s) == "string") {
            s = {type: "markdown", text: s};
        }
        
        s.id = s.id || hash(s);
        return s;
    });

    const {err, value} = joi.validate( yamlData, schema, {allowUnknown: true});
    if( err) {
        throw {
            name: "TopicSchemaValidationError",
            message: `Failed to load topic data from ${filePath}.\n${err}`
        }
    }

    return value;
}

class Topic {
    constructor( meta, sections) {
        this.meta = meta; this.sections = sections;
    }

    static async loadFromFile( filePath) {
        const topicData = await loadTopicYaml( filePath);

        const sections = topicData.sections.map( (section, index) => {
            return loadSection( section);
        });

        return new this( topicData.meta, sections);
    }
}

module.exports = Topic;
