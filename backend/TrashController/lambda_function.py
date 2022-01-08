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
        'body': json.dumps(body, default = json_serial),
    }
    return response
    
#Function that makes datetime serializable for JSON objects
def json_serial(obj):
    if isinstance(obj, (datetime, date)):
        return obj.isoformat()
    raise TypeError ("Type %s not serializable" % type(obj))
    
#Function that gets all notes from trash
def getNotesFromTrash(user_id):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            #Query to get Note from db
            table = "Note"
            query = f"SELECT * FROM {table} WHERE user_id = '{user_id}' AND deleted = 1"
            cursor.execute(query)
            rows = cursor.fetchall()
            return createResponse(200, rows)
        return createResponse(404,"User not found")
    except:
        pass
        return createResponse(432, "Error Executing SQL Query")



#Function that perm deletes a note from trash
def deleteNoteFromTrash(id, event):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            table = "Note"
            query = (f"SELECT * FROM `{table}` WHERE `id`= {id}")
            cursor.execute(query)
            row = cursor.fetchone()
            #Check if user making request is allowed to delete note
            if row["user_id"] != event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]:
                return createResponse(403, "Unauthorized Request")
            if row != None:
                if row['deleted'] == 1:
                    query = (f"DELETE FROM `{table}` WHERE `id`= {id}")
                    cursor.execute(query)
                    # row = cursor.fetchone()
                    return createResponse(200, f"Deleted Note: {id}")
                else:
                    return createResponse(400, "Tried to delete note not marked for deletion")
            else:
                return createResponse(404, "Note not found")
            return createResponse(400, "Invalid Request")
            
        return createResponse(404, "Note not found")
    except:
        pass
        return createResponse(432, "Error Executing SQL Query")

#Function that restores a note from trash
def restoreNoteFromTrash(id, event):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            table = "Note"
            query = (f"SELECT * FROM `{table}` WHERE `id`= {id}")
            cursor.execute(query)
            row = cursor.fetchone()
            #Check if user making request is allowed to restore note
            if row["user_id"] != event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]:
                return createResponse(403, "Unauthorized Request")
            if row != None:
                if row['deleted'] == 1:
                    query = (f"UPDATE {table} SET deleted = 0 , deleted_on = NULL WHERE id = {id}")
                    cursor.execute(query)
                    query = (f"SELECT * {table} WHERE id = {id}")
                    cursor.execute(query)
                    row = cursor.fetchone()
                    return createResponse(200, row)
                else:
                    return createResponse(400, "Tried to restore a note not in trash")
            else:
                return createResponse(404, "Note not found")
            return createResponse(400, "Invalid Request")
            
        return createResponse(404, "Note not found")
    except:
        pass
        return createResponse(432, "Error Executing SQL Query")
        


def handler(event, context):
    if event["requestContext"]["http"]["method"] == "GET":
        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
        response = getNotesFromTrash(user_id)
        return response
        
            
    if event["requestContext"]["http"]["method"] == "PATCH":
        return event
        id = event["queryStringParameters"]["id"]
        response = restoreNoteFromTrash(id, event)
        return response
    
    if event["requestContext"]["http"]["method"]  == "DELETE":
        id = event["queryStringParameters"]["id"]
        response = deleteNoteFromTrash(id, event)

        return response
    
    return createResponse(404, "Resource Note Found")
    
