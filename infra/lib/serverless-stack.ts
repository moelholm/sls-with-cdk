import iam = require('@aws-cdk/aws-iam');
import core = require('@aws-cdk/core');
import s3 = require('@aws-cdk/aws-s3');
import { RemovalPolicy } from '@aws-cdk/core';

const SERVERLESS_IAM_GROUP_NAME = 'serverless';
const SERVERLESS_S3_BUCKET_NAME = 'serverless-deployments-est2019';

export class ServerlessStack extends core.Stack {

  constructor(scope: core.App, id: string, props?: core.StackProps) {
    super(scope, id, props);

    new s3.Bucket(this, SERVERLESS_S3_BUCKET_NAME, {
      versioned: false,
      bucketName: SERVERLESS_S3_BUCKET_NAME,
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: RemovalPolicy.RETAIN
    });

    const group = new iam.Group(this, SERVERLESS_IAM_GROUP_NAME, {
      groupName: SERVERLESS_IAM_GROUP_NAME,
    });

    group.attachInlinePolicy(this.createS3Policy());
    group.attachInlinePolicy(this.createCloudFormationPolicy());
    group.attachInlinePolicy(this.createCloudWatchLogsPolicy());
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

  private createCloudFormationPolicy(): iam.Policy {
    const policyName = 'cloudformation';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['cloudformation:ValidateTemplate'], ['*']),
      ],
    });
  }

  private createCloudWatchLogsPolicy(): iam.Policy {
    const policyName = 'cloudwatch-logs';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['logs:CreateLogGroup'], ['*']),
        this.createPolicyStatement(['logs:DescribeLogGroups'], [`arn:aws:logs:${this.region}:${this.account}:log-group::log-stream:`]),
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