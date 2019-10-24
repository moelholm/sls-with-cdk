#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { InfraStack } from '../lib/infra-stack';
import { ServerlessStack } from '../lib/serverless-stack';

const app = new cdk.App();
new ServerlessStack(app, 'ServerlessStack', { description: 'Serverless global/generic infrastructure' });
new InfraStack(app, 'InfraStack', { description: 'Serverless infrastructure specific to service \'cautious-invention\'' });
