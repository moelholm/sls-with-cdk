# Infrastructure code

This directory contains the AWS CDK infrastructure code that must be run before you can
deploy the application services (lambda functions i.e.). It configures the following:

- An S3 bucket: this is where _serverless_ installs deployments
- 2 x IAM Groups: `serverless` and a project specific  one.

The first group contains generic permissions required by serverless: access to the S3 bucket etc.).

The second group contains permissions specific to the serverless project: access to the cloud 
formation stack, lambda function, cloudwatch log group, etc.

PRO-TIP: Find the core infrastructure code in `lib/serverless-stack.ts` and `lib/infra-stack.ts`. All
other files are basically AWS CDK framework related files caused by the typescript runtime
environment.

This module comes with a skeleton for unit tests (using _jest_). But non are implemented.

## A few useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
