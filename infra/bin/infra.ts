#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { InfraStack } from '../lib/infra-stack';
import { ServerlessStack } from '../lib/serverless-stack';
import fs = require('fs');
import YAML = require('yaml');

// Parse the "serverless" YAML configuration file
console.info('Parsing serverless configuration');
const serverlessYaml = fs.readFileSync('../serverless.yml', 'utf8')
const serverlessConfig = YAML.parse(serverlessYaml);
serverlessConfig.serviceEnv = 'dev'; // TODO: Fix hardcoded environment config
console.info(`Serverless project name is: ${serverlessConfig.service}`);

// Bring CDK to live
const app = new cdk.App();
new ServerlessStack(app, 'ServerlessStack', { description: 'Serverless global/generic infrastructure' });
new InfraStack(app, 'InfraStack', { description: 'Serverless infrastructure for service \'cautious-invention\'' }, serverlessConfig);
