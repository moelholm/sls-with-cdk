import json

def hello(event, context):

    print("processing 'Hello World' request")
    
    body = {
        "message": "Hello World",
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response