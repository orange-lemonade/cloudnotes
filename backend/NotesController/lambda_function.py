from rds_connect import rds_connect
import json
from datetime import date, datetime
import logging
import os
import boto3
import base64

    

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
    
#Function that gets all undeleted notes for user 
def getNotes(user_id):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            #Query to get Note from db
            table = "Note"
            query = f"SELECT * FROM {table} WHERE user_id = '{user_id}' AND deleted = 0"
            cursor.execute(query)
            rows = cursor.fetchall()
            
            return createResponse(200, rows)

    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
    
    
#Function that gets all undeleted notes for a tag
def getNotesForTag(data):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            #Query to get Notes from db
            noteTable = "Note"
            tagTable = "Tag"
            query = f"SELECT Note.* FROM Note INNER JOIN NoteTag ON Note.id=NoteTag.note_id INNER JOIN Tag ON NoteTag.tag_id=Tag.id WHERE Tag.id={data['tag_id']} AND Tag.user_id='{data['user_id']}' AND deleted = 0"
            cursor.execute(query)
            rows = cursor.fetchall()

            return createResponse(200, rows)

    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
        

def handler(event, context):
    if event['requestContext']['http']['method'] == "GET":
        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
        response = getNotes(user_id)
        return response
    
    if event['requestContext']['http']['method'] == "POST":
        try:
            data = json.loads(event['body'])
            data['user_id'] = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
            response = getNotesForTag(data)
            return response
        except:
            pass
            return createResponse(400, "Invalid JSON")
            

    return createResponse(404, "Resources not found")
    
