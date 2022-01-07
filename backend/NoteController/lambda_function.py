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
    
#Function that gets one Note using by id 
def getNote(event, id):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            #Checks if query parameter is valid
            if id.isnumeric():
                #Query to get Note from db
                table = "Note"
                query = f"SELECT * FROM {table} WHERE id = {id}"
                cursor.execute(query)
                row = cursor.fetchone()
                #Check if user making request is allowed to get note
                if row["user_id"] != event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]:
                    return createResponse(403, "Unauthorized Request")
                #Return Note if it exists
                if row != None:
                    return createResponse(200, row)
                else:
                    return createResponse(404, "Note not found")
            else:
                return createResponse(400, "Query Parameter must be integer")

    except:
        pass
        return createResponse(432, "Error Executing SQL Query")


#Function that creates a Note entry
def createNote(data):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            table = "Note"
            logger.info("hello")
            logger.info(data.keys())
            print(data.keys())


            if {'title', 'note_text', 'user_id'} <= data.keys():
                logger.info("hello2")
                #Run SQL Query 
                query = (
                    f"INSERT INTO {table} ({', '.join(data.keys())}) "
                    f"VALUES (%({')s, %('.join(data.keys())})s)")
                # query = "insert into note (user_id, title, note_text) values ('123', 'my note', 'text')"
                logger.info("query" + query)
                cursor.execute(query, data)
                query = (f"SELECT * FROM `{table}` WHERE `id`= LAST_INSERT_ID()")
                cursor.execute(query)
                row = cursor.fetchone() 

                return createResponse(200, row)
            return createResponse(400, "Missing Values for Note")                
            
    except:
        pass
        return createResponse(432, "Error Executing SQL Query")



#Function that updates a Note only if it needs updating
def updateNote(data):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:

            #Run SQL Query
            table = "Note"
            query = (f"SELECT * FROM `{table}` WHERE `id`= {data['id']}")
            cursor.execute(query)
            row = cursor.fetchone()
            #Check if user making request is allowed to get note
            if data["user_id"] != row["user_id"]:
                return createResponse(403, "Unauthorized Request")
               
            #Checks if note needs updating, if not just returns note again
            if (row['title'] != data['title'] or row['note_text'] != data['note_text']):
                #Run query
             
                query = (
                f"UPDATE {table} SET title = '{data['title']}', note_text = '{data['note_text']}' WHERE id = {data['id']}")
                cursor.execute(query)
                query = (f"SELECT * FROM `{table}` WHERE `id`= {data['id']}")
                cursor.execute(query)
                row = cursor.fetchone()

                return createResponse(200, row)
            return createResponse(200, row)
    except:
        pass
        return createResponse(432, "Error Executing SQL Query")


#Function that marks a Note for deletion if it hasn't been marked already
def deleteNote(id, event):
    
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            table = "Note"
            query = (f"SELECT * FROM `{table}` WHERE `id`= {id}")
            cursor.execute(query)
            row = cursor.fetchone()
            #Check if user making request is allowed to get note
            if row["user_id"] != event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]:
                return createResponse(403, "Unauthorized Request")
            #Checks if note is already marked for deletion
            if row['deleted'] != 1:
                query = (
                    f"UPDATE {table} SET deleted = 1 , deleted_on = CURRENT_TIMESTAMP WHERE id = {id}")
                cursor.execute(query)
                query = (f"SELECT * FROM `{table}` WHERE `id`= {id}")
                cursor.execute(query)
                row = cursor.fetchone()
                return createResponse(200, row)

            return createResponse(400, "Note already marked as deleted")
    except:
        pass
        return createResponse(432, "Error Executing SQL Query")

def handler(event, context):
  
    if event['requestContext']['http']['method'] == "GET":
        id = event['queryStringParameters']['id']
        response = getNote(event, id)
        return response
        
    if event['requestContext']['http']['method'] == "POST":
        try:
            data = json.loads(event["body"])
            data['user_id'] = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]

            response = createNote(data)
            
            return response
        except:
            pass
            return createResponse(400, "Invalid JSON")
            
    if event['requestContext']['http']['method'] == "PATCH":
        try:
            # return event
            data = json.loads(event['body'])
            data['user_id'] = event["requestContext"]["authorizer"]["jwt"]["claims"]["sub"]
       
            response = updateNote(data)
            return response
        except:
            pass
            return createResponse(400, "Invalid JSON")
    
    if event['requestContext']['http']['method'] == "DELETE":
        
        id = event['queryStringParameters']['id']
        response = deleteNote(id, event)
        return response
    
    return createResponse(404, "Resource Note Found")
    
