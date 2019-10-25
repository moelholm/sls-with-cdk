# sls-with-cdk

This example combines a _serverless framework_ project with an _AWS CDK_ project. It applies 
the _principle of least privilege_ for granting permissions.

- _serverless framework_ is used to develop/deploy a few simple AWS Lambda functions.
This code is based on _Python 3.x_
- _AWS CDK_ is used to develop/deploy the AWS infrastructure required by the _serverless framework_.
This code is based on _Typescript_

## Background
My impression is that many developers tend to use admin privileged AWS IAM users (😱) for working 
with serverless technologies. Simply because it is the easy way and "it just works". 

This project doesn't do that. Instead it attempts to apply the _principle of least privilege_: It 
uses AWS (IAM) groups granted only permissions with the least privileges necessary in order to work. 
Where possible, it also attempts to scope the permissions to the most specific AWS resources 
necessary.

Examine this repository, because:

- You want to see what permissions _serverless framework_ requires. Then use this as inspiration for
configuring it in your own project

- You want to see what infrastructure code with AWS CDK looks like.

_It is possible to narrow the privileges a bit more (for S3 for example). Ping me on
Twitter/Email if you have some ideas for improving this. Or better yet; create a PR._

## About the code

### Serverless framework application code

- `./hello-handler.py` and `./hello2-handler.py` - these are 2 x "Hello World"(ish) AWS Lambda 
functions

-  `./serverless.yml` - the _serverless framework_ specific configuration file

### Infrastructure code

The infrastructure code is based on AWS CDK and implemented with Typescript. The AWS CDK
is then used to generate normal AWS CloudFormation templates.

- `./infra/bin/infra.ts` - the main infrastructure script defining which AWS CloudFormation stacks
gets installed

 - `./infra/lib/serverless-stack.ts` - defines an AWS CloudFormation stack which creates the AWS
 S3 bucket used by _serverless framework_. It also creates an AWS IAM group containing a few 
 basic permissions required by _serverless framework_ - these permissions are not specific to the 
 concrete _serverless framework_ project

 - `./infra/lib/infra-stack.ts` - defines an AWS CloudFormation stack which creates the AWS IAM 
 group specific to the _serverless framework_ project. The group is assigned specific AWS IAM 
 permissions (not admin power 😱). The code is dynamic: it adapts the infrastructure to the 
 configuration in _serverless.yml_. It uses information such as the service name and the function
 names when generating the infrastructure. A remarkable difference to traditional declarative 
 approaches, such as AWS CloudFormation or Terraform.

Assign the generated IAM groups to your favorite AWS IAM User (app user). You can then use that user
for working with the _serverless framework_ tool. 

## Try it (only 2 super simple steps 😇)

Complete the following to steps in order to test this.

### Prerequisites

Firstly, ensure that you have the following tools installed:

- `npm` - the node package manager etc. (used by the AWS CDK implementation in this project)
- `sls` - the _serverless framework_ tool (this is the framework used for working with the AWS 
Lambda functions in this project)

### Step 1) Install the infrastructure

This step requires a privileged user (admin for example). 

- From the `infra` directory, run `cdk synth` to generate the AWS CloudFormation template
- Install the generated  `./infra/cdk.out/*.template.json ` CloudFormation templates into your AWS account.
Can be done with the AWS CDK tool `cdk`, the AWS CLI tool `aws`, the AWS Web console, etc.
- Create an IAM user and add it to the IAM Groups. 
- Use that IAM user when working with the _serverless_ CLI.

### Step 2) Play with serverless

Use the IAM user you configured in the previous step. Notice that this user has the least privileges
necessary in order for it to operate on the current serverless service. This is the cool part 🤩**.

From the root directory (the one containing this document):

- Run `sls deploy` to deploy the serverless service (it produces and installs an AWS CloudFormation template)
- Run `sls invoke -f hello` to run the AWS Lambda function called `hello`
- Run `sls logs -f hello` to show the logs for the current function (logs can be a bit delayed in AWS CloudWatch Logs)
- Run `sls remove` to undeploy the serverless service (it uninstalls the AWS CloudFormation template)

** Cool? Well the idea is that AWS credentials can be leaked (like any other credentials) ... if that
happens, then the leaked credentials only contains permissions to manage the current service. Not
admin permissions (which can be misused to a much higher degree).

### TODO

- pylint
- infra: implement unit tests