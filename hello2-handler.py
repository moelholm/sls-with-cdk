import json

def hello2(event, context):

    print("processing 'Hello World2' request")
    
    body = {
        "message": "Hello World2",
        "input": event
    }

    response = {
        "statusCode": 200,
        "body": json.dumps(body)
    }

    return response