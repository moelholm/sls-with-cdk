# Infrastructure code

This directory contains the AWS CDK infrastructure code that must be run before you can
deploy the application services (lambda functions i.e.). More concretely it configures the following:

- S3 bucket `cautious-invention-deployments`: this is where _serverless_ installs generated AWS CloudFormation scripts
- IAM Group `cautious-invention`: this group is configured with the IAM permissions required by the _serverless_ CLI tool

Find the core infrastructure code in `lib/infra-stack.ts`.

This module comes with a skeleton for unit tests (using _jest_). But non are implemented.

## Instructions

Generate the AWS CloudFormation template and install it into your AWS account.

Create an IAM user and add it to the IAM Group. 

Use that IAM user when working with the _serverless_ CLI.

## A few useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
