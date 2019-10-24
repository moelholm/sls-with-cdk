import iam = require('@aws-cdk/aws-iam');
import core = require('@aws-cdk/core');

// Configure this
const SERVERLESS_SERVICE_NAME = 'cautious-invention';
const SERVERLESS_FUNCTION_NAME = 'hello';
const SERVERLESS_ENV = 'dev';

// Derived values
const SERVERLESS_STACK_NAME = `${SERVERLESS_SERVICE_NAME}-${SERVERLESS_ENV}`;
const SERVERLESS_IAM_GROUP_NAME = `${SERVERLESS_SERVICE_NAME}`;

// Main infrastructure stack
export class InfraStack extends core.Stack {

  constructor(scope: core.App, id: string, props?: core.StackProps) {
    super(scope, id, props);

    const group = new iam.Group(this, SERVERLESS_IAM_GROUP_NAME, {
      groupName: SERVERLESS_IAM_GROUP_NAME,
    });

    group.attachInlinePolicy(this.createCloudFormationPolicy());
    group.attachInlinePolicy(this.createIamPolicy());
    group.attachInlinePolicy(this.createLambdaPolicy());
    group.attachInlinePolicy(this.createCloudWatchLogsPolicy());
  }

  private createCloudFormationPolicy(): iam.Policy {
    const policyName = 'cloudformation';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
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
          'iam:DeleteRolePolicy',
          'iam:DeleteRole',
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

  private createCloudWatchLogsPolicy(): iam.Policy {
    const policyName = 'cloudwatch-logs';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['logs:DescribeLogStreams', 'logs:DeleteLogGroup'], [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${SERVERLESS_STACK_NAME}-${SERVERLESS_FUNCTION_NAME}:log-stream:`]),
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