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
    
    
#Function that gets all tags for user
def getTags(user_id, note_id = None):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            if note_id != None:
                query = f"SELECT Tag.* FROM Note INNER JOIN NoteTag ON Note.id=NoteTag.note_id INNER JOIN Tag ON NoteTag.tag_id=Tag.id WHERE Note.id={note_id} AND Tag.user_id='{user_id}' AND deleted = 0"
                cursor.execute(query)
                row = cursor.fetchall()
                if row != None:
                    return createResponse(200, row)
                
            #Query to get Tag from db
            table = "Tag"
            query = f"SELECT * FROM {table} WHERE user_id = '{user_id}'"
            cursor.execute(query)
            row = cursor.fetchall()

            if row != None:
                return createResponse(200, row)

    
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
        

#Function that creates a Tag entry
def createTag(data):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            table = "Tag"
        
            query = f"SELECT * FROM Tag WHERE user_id = '{data['user_id']}' AND tag_text REGEXP '{data['tag_text']}'"
            cursor.execute(query)
            row = cursor.fetchone()
            if row == None:
                if {"user_id","tag_text", "note_id"} <= data.keys() and data['tag_text'] != "":
                    note_id = data['note_id']
                    note_tag = {}
                    note_tag['note_id'] = note_id
                    del data['note_id']

                    #Run SQL Query 
                    query = (
                        f"INSERT INTO {table} ({', '.join(data.keys())}) "
                        f"VALUES (%({')s, %('.join(data.keys())})s)")

                    logger.info(query)
                    cursor.execute(query, data)

                    query = (f"SELECT * FROM `{table}` WHERE `id`= LAST_INSERT_ID()")
                    cursor.execute(query)
                    tag = cursor.fetchone()
                    
                    note_tag['tag_id'] = tag['id']
                    #Run SQL Query 
                    table = "NoteTag"
                    query = (
                        f"INSERT INTO {table} ({', '.join(note_tag.keys())}) "
                        f"VALUES (%({')s, %('.join(note_tag.keys())})s)")

                    cursor.execute(query, note_tag)
                    table = "Tag"
                    query = (f"SELECT * FROM `{table}` WHERE `id`= {tag['id']}")
                    cursor.execute(query)
                    row = cursor.fetchone() 
                    return createResponse(200, row)
            else:
                tag_id = row['id']
                note_id = data['note_id']
                note_tag = {}
                note_tag['note_id'] = note_id
                note_tag['tag_id'] = tag_id
                query = f"SELECT * FROM NoteTag WHERE note_id = {note_tag['note_id']} AND tag_id = {note_tag['tag_id']}"
                cursor.execute(query)
                row = cursor.fetchone()
                if row == None:
                    table = "NoteTag"
                    query = (
                        f"INSERT INTO {table} ({', '.join(note_tag.keys())}) "
                        f"VALUES (%({')s, %('.join(note_tag.keys())})s)")
                    cursor.execute(query, note_tag)
                    response = f"Note with ID: {note_tag['note_id']} and Tag with ID: {note_tag['tag_id']} linked"
                    return createResponse(200, response)
                    
                return createResponse(400, "Tag already exists for user and is linked with Note")
                
            return createResponse(400, "Tag already exists for User")                
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")


#Function that updates a Tag only if it needs updating
def updateTag(data):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:

            #Run SQL Query
            table = "Tag"
            
            if not isinstance(data['id'], int):
                return createResponse(400, "ID needs to be an integer")
            
            query = (f"SELECT * FROM `{table}` WHERE `id`= {data['id']}")
            cursor.execute(query)
            row = cursor.fetchone()
            if row['user_id'] != data["user_id"]:
                return(403, "Unauthorized Request")

            if row != None:
                if row['tag_text'] != data['tag_text']:
                    if data['tag_text'] != "":
                        #Run query
                        query = (
                        f"UPDATE {table} SET tag_text = '{data['tag_text']}' WHERE id = {data['id']}")
                        cursor.execute(query)
                        query = (f"SELECT * FROM `{table}` WHERE `id`= {data['id']}")
                        cursor.execute(query)
                        row = cursor.fetchone()
                        
                        return createResponse(200, row)
                    else:
                        return createResponse(400, "Missing Values for Tag")                
                return createResponse(200, row)
            else:
                return createResponse(404, "Tag not found") 
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")


#Function that deletes a Tag
def deleteTag(id, event):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            if id.isnumeric():
                #Query to get Note from db
                table = "Tag"
                query = f"SELECT * FROM {table} WHERE id = {id}"
                cursor.execute(query)
                row = cursor.fetchone()
                if row != None:
                    if row['user_id'] != event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]:
                        return createResponse(403, "Unauthorized Request")
                    query = f"DELETE FROM {table} WHERE id = {id}"
                    cursor.execute(query)
                    return createResponse(200, f"Deleted Tag: {id}")
                else:
                    return createResponse(404, "Tag not found")
            else:
                return createResponse(400, "Query Parameter must be integer")
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
        

def removeTag(data):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            #Query to get Note from db
            table = "Tag"
            query = f"SELECT * FROM {table} WHERE id = {data['tag_id']}"
            cursor.execute(query)
            row = cursor.fetchone()
            if row != None:
                if row['user_id'] != data['user_id']:
                    return createResponse(403, "Unauthorized Request")
                table = "NoteTag"
                query = f"DELETE FROM {table} WHERE note_id = {data['note_id']} AND tag_id = {data['tag_id']}"
                cursor.execute(query)
                return createResponse(200, f"Removed link for Note - {data['note_id']} and Tag - {data['tag_id']}")
            else:
                return createResponse(404, "Tag not found")

    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
        
       
def handler(event, context):
  
    if event['requestContext']['http']['method'] == "GET":
        user_id = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
        if 'queryStringParameters' in event and 'id' in event['queryStringParameters']:
            tag_id = event['queryStringParameters']['id']
            response = getTags(user_id, tag_id)
            return response

        response = getTags(user_id)
        return response
        
    if event['requestContext']['http']['method'] == "POST":
        try:
            data = json.loads(event['body'])
            data['user_id'] = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
            response = createTag(data)
            return response
        except:
            pass
            return createResponse(400, "Invalid JSON")
            
    if event['requestContext']['http']['method'] == "PATCH":
        try:
            data = json.loads(event['body'])
            data['user_id'] = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
            response = updateTag(data)
            return response
        except:
            pass
            return createResponse(400, "Invalid JSON")
            
    if event['requestContext']['http']['method'] == "PUT":
        try:
            data = json.loads(event['body'])
            data['user_id'] = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
            response = removeTag(data)
            return response
        except:
            pass
            return createResponse(400, "Invalid JSON")
    
    if event['requestContext']['http']['method'] == "DELETE":
        id = event['queryStringParameters']['id']
        response = deleteTag(id, event)
        return response
    
    return createResponse(404, "Resource Note Found")
    
