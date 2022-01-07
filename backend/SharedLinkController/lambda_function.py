from rds_connect import rds_connect
import json
from datetime import date, datetime
import logging
import os
import boto3
import base64
import uuid


#Function that constructs response object
def createResponse(code, body):
    response = {
        'statusCode': code,
        'body': json.dumps(body, default = json_serial)
    }
    return response
    
    
#Function that makes datetime serializable for JSON objects
def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))
    
    
#Function that gets a note for a share_link
def getShareLink(link):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            if link:
                #Query to get Note from db
                query = f"SELECT Note.* FROM ShareLink INNER JOIN Note ON ShareLink.note_id = Note.id WHERE ShareLink.share_link = '{link}'"
                cursor.execute(query)
                row = cursor.fetchall()
                return createResponse(200, row)

                if row != None:
                    return createResponse(200, row)

            else:
                return createResponse(400, "Query Parameter must be integer")
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
        
        
def handler(event, context):
  
    if event['requestContext']['http']['method'] == "GET":
        link = event['queryStringParameters']['n']
        response = getShareLink(link)
        return response
        

    
    return event
    
