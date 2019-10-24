# cautious-invention

This example combines a _serverless_ project with an _AWS CDK_ project. 

- _serverless_ is used to develop/deploy AWS Lambda functions. This code is based _Python 3.x_.
- _AWS CDK_ is used to develop/deploy the AWS infrastructure required by _serverless_. This code is based on _Typescript_.

I have this impression that people tend to use ADMIN privileged IAM users for working with 
serverless technologies. Simply because it is the easy way and "it just works". 

This project doesn't do that. Instead it attempts to apply the _principle of least privilege_. 
Basically meaning: it uses an AWS (IAM) user account with _serverless_ that is granted only 
permissions with the least privileges necessary in order to work. Where possible,
it also attempts to scope the permissions to the most specific AWS resources necessary.

_It is likely possible to narrow the privileges a bit more. Ping me on Twitter/Email if you 
have some ideas for that._

### TODO

- pylint
- infra: implement unit tests