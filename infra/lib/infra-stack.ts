import iam = require('@aws-cdk/aws-iam');
import core = require('@aws-cdk/core');

// Main infrastructure stack - specific to the serverless project configuration
export class InfraStack extends core.Stack {

  private serverlessService: string;
  private serverlessEnv: string;
  private serverlessStackName: string;

  constructor(scope: core.App, id: string, props: core.StackProps, serverlessConfig: any) {
    super(scope, id, props);

    // Get serverless project information - so that it can be used to name AWS resources
    this.serverlessService = serverlessConfig.service;
    this.serverlessEnv = serverlessConfig.serviceEnv;
    this.serverlessStackName = `${this.serverlessService}-${this.serverlessEnv}`;

    // Group containing permissions for a specific serverless service in a specific environment
    const groupName = `${this.serverlessService}-${this.serverlessEnv}`;
    const group = new iam.Group(this, groupName, {
      groupName: groupName,
    });
    //      Policies for the entire service
    group.attachInlinePolicy(this.createIamPolicy());
    group.attachInlinePolicy(this.createCloudFormationPolicy());
    for (const functionName of Object.keys(serverlessConfig.functions)) {
      //    Policies per function in the service
      group.attachInlinePolicy(this.createLambdaPolicy(functionName));
      group.attachInlinePolicy(this.createCloudWatchLogsPolicy(functionName));
    }
  }

  private createCloudFormationPolicy(): iam.Policy {
    const policyName = 'cloudformation';
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['cloudformation:*'], [`arn:aws:cloudformation:${this.region}:${this.account}:stack/${this.serverlessStackName}/*`]),
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
        ], [`arn:aws:iam::${this.account}:role/${this.serverlessStackName}-${this.region}-lambdaRole`]),
      ],
    });
  }

  private createLambdaPolicy(functionName: string): iam.Policy {
    const policyName = `lambda-${functionName}`;
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
        ], [`arn:aws:lambda:${this.region}:${this.account}:function:${this.serverlessStackName}-${functionName}`]),
      ],
    });
  }

  private createCloudWatchLogsPolicy(functionName: string): iam.Policy {
    const policyName = `cloudwatch-logs-${functionName}`;
    return new iam.Policy(this, policyName, {
      policyName: policyName,
      statements: [
        this.createPolicyStatement(['logs:DescribeLogStreams', 'logs:DeleteLogGroup'], [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${this.serverlessStackName}-${functionName}:log-stream:`]),
        this.createPolicyStatement([
          'logs:CreateLogStream',
          'logs:FilterLogEvents'
        ], [`arn:aws:logs:${this.region}:${this.account}:log-group:/aws/lambda/${this.serverlessStackName}-${functionName}:*`]),
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