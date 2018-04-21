'use strict';

const joi = require('joi');
const path = require('path');
const yaml = require('js-yaml');
const utils = require('./utils');
const Topic = require('./topic');
const _ = require('lodash');

const schema = joi.object().keys({
    code: joi.string().min(3).max(256).regex(/^[a-zA-Z0-9_-]$/).required(),
    title: joi.string().min(3).max(256).required(),
    description: joi.string().required(),
    toc: joi.array().items(joi.string())
});

async function loadPackageYaml( dirPath) {
    const content = await utils.loadFileContent( path.join(dirPath, 'package.yaml'));
    const yamlData = yaml.safeLoad( content);
    const {err, value} = joi.validate( yamlData, schema);
    if( err) {
        throw {
            name: "PackageSchemaValidationError",
            message: `Failed to load package.yaml from ${dirPath}.\n${err}`
        }
    }

    return yamlData;
}

async function inferTopicFiles( dirPath) {
    return await utils.glob( path.join( dirPath, "*", "*.(md|yaml|yml)"));
}

class PirogramPackage {
    constructor( code, title, description, topics) {
        this.code = code; this.title = title;
        this.description = description; this.topics = topics;
    }

    static async loadFromDir( dirPath) {
        const packageData = await loadPackageYaml( dirPath);
        if( packageData.files) {
            packageData.files = await inferTopicFiles( dirPath);
        } else {
            packageData.files = packageData.files.map( (filePath, index) => {
                return path.resolve( path.join(dirPath, filePath));
            })
        }

        const topics = packageData.files.map( (filePath, index) => {
            return Topic.loadFromFile( filePath);
        });

        return new this( packageData.code, packageData.title, packageData.description, topics);
    }
}

module.exports = PirogramPackage;
