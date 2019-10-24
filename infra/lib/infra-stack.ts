import s3 = require('@aws-cdk/aws-s3');
import iam = require('@aws-cdk/aws-iam');
import core = require('@aws-cdk/core');
import { RemovalPolicy } from '@aws-cdk/core';

// Configure this
const SERVERLESS_SERVICE_NAME = 'cautious-invention';
const SERVERLESS_FUNCTION_NAME = 'hello';
const SERVERLESS_ENV = 'dev';

// Derived values
const SERVERLESS_STACK_NAME = `${SERVERLESS_SERVICE_NAME}-${SERVERLESS_ENV}`;
const SERVERLESS_S3_BUCKET_NAME = `${SERVERLESS_SERVICE_NAME}-deployments`;
const SERVERLESS_IAM_GROUP_NAME = `${SERVERLESS_SERVICE_NAME}`;

// Main infrastructure stack
export class InfraStack extends core.Stack {

  constructor(scope: core.App, id: string, props?: core.StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, SERVERLESS_S3_BUCKET_NAME, {
      versioned: false,
      bucketName: SERVERLESS_S3_BUCKET_NAME,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.DESTROY
    });

    const group = new iam.Group(this, SERVERLESS_IAM_GROUP_NAME, {
      groupName: SERVERLESS_IAM_GROUP_NAME,
    });

    group.attachInlinePolicy(this.createCloudFormationPolicy());
    group.attachInlinePolicy(this.createIamPolicy());
    group.attachInlinePolicy(this.createLambdaPolicy());
    group.attachInlinePolicy(this.createS3Policy());
    group.attachInlinePolicy(this.createCloudWatchLogsPolicy());
  }

  private createCloudFormationPolicy(): iam.Policy {
    const policyName = 'cloudformation';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['cloudformation:ValidateTemplate'], ['*']),
        this.createPolicyStatement(['cloudformation:*'], [`arn:aws:cloudformation:${this.region}:${this.account}:stack/${SERVERLESS_STACK_NAME}/*`]),
      ],
    });
  }

  private createIamPolicy(): iam.Policy {
    const policyName = 'iam';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement([
          'iam:GetRole',
          'iam:PassRole',
          'iam:CreateRole',
          'iam:PutRolePolicy',
        ], [`arn:aws:iam::${this.account}:role/${SERVERLESS_STACK_NAME}-${this.region}-lambdaRole`]),
      ],
    });
  }

  private createLambdaPolicy(): iam.Policy {
    const policyName = 'lambda';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement([
          'lambda:CreateFunction',
          'lambda:UpdateFunctionCode',
          'lambda:InvokeFunction',
          'lambda:ListVersionsByFunction',
          'lambda:GetFunction',
          'lambda:UpdateFunctionConfiguration',
          'lambda:GetFunctionConfiguration',
          'lambda:DeleteFunction',
          'lambda:PublishVersion',
          'lambda:DeleteFunctionConcurrency',
          'lambda:PutFunctionConcurrency',
        ], [`arn:aws:lambda:${this.region}:${this.account}:function:${SERVERLESS_STACK_NAME}-${SERVERLESS_FUNCTION_NAME}`]),
      ],
    });
  }

  private createS3Policy(): iam.Policy {
    const policyName = 's3';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['s3:*'], [
          `arn:aws:s3:::${SERVERLESS_S3_BUCKET_NAME}`,
          `arn:aws:s3:::${SERVERLESS_S3_BUCKET_NAME}/*`
        ]),
      ],
    });
  }

  private createCloudWatchLogsPolicy(): iam.Policy {
    const policyName = 'cloudwatch-logs';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['logs:CreateLogGroup'], ['*']),
        this.createPolicyStatement(['logs:DescribeLogStreams'], [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${SERVERLESS_STACK_NAME}-${SERVERLESS_FUNCTION_NAME}:log-stream:`]),
        this.createPolicyStatement(['logs:DescribeLogGroups'], [`arn:aws:logs:${this.region}:${this.account}:log-group::log-stream:`]),
        this.createPolicyStatement([
          'logs:CreateLogStream',
          'logs:FilterLogEvents'
        ], [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${SERVERLESS_STACK_NAME}-${SERVERLESS_FUNCTION_NAME}:*`]),
      ],
    });
  }

  private createPolicyStatement(actions: string[], resources: string[]): iam.PolicyStatement {
    return new iam.PolicyStatement({
      actions: actions,
      resources: resources,
    });
  }
}