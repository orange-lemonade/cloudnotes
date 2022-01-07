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
    
    
#Function that gets the share_link for a note
def getShareLink(note_id, event):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            if note_id:
                #Query to get Note from db
                query = f"SELECT * FROM ShareLink WHERE note_id = {note_id}"
                cursor.execute(query)
                row = cursor.fetchone()
                if row != None:
                    query = f"SELECT ShareLink.* FROM Note INNER JOIN ShareLink ON Note.id = ShareLink.note_id WHERE Note.id = {note_id}"
                    cursor.execute(query)
                    row = cursor.fetchone()
                    #Checks if user is authorized to make request
                    if row != None:
                        return createResponse(200, row)

            else:
                return createResponse(400, "Query Parameter must be integer")
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
        


#Function that creates the share_link for a note
def createShareLink(data):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            table = "ShareLink"
            
            query = f"SELECT * FROM ShareLink WHERE note_id = {data['note_id']}"


            cursor.execute(query)
            row = cursor.fetchone()
            if row == None:
                if {"note_id"} <= data.keys():
                    data['share_link'] = str(uuid.uuid4())
                    #Run SQL Query 
                    query = (
                        f"INSERT INTO {table} ({', '.join(data.keys())}) "
                        f"VALUES (%({')s, %('.join(data.keys())})s)")

                    logger.info(query)
                    cursor.execute(query, data)

                    query = (f"SELECT * FROM `{table}` WHERE `id`= LAST_INSERT_ID()")
                    cursor.execute(query)
                    share_link = cursor.fetchone()
                
                    return createResponse(200, share_link)
                
            return createResponse(400, "ShareLink already exists for Note")                
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")


#Function that updates the share_link for a note
def updateShareLink(id):
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            table = "ShareLink"
            
            query = f"SELECT * FROM {table} WHERE id = {id}"

            cursor.execute(query)
            row = cursor.fetchone()
            if row != None:
                updated_link = str(uuid.uuid4())
                #Run SQL Query 
                
                query = f"UPDATE {table} SET share_link = '{updated_link}' WHERE id = {id}"

                logger.info(query)
                cursor.execute(query)

                query = (f"SELECT * FROM `{table}` WHERE `id`= {id}")
                cursor.execute(query)
                share_link = cursor.fetchone()
                
                return createResponse(200, share_link)
                
            return createResponse(400, "ShareLink doesn't exist")                
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")


#Function that deletes the share_link for a note
def deleteShareLink(id):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            if id.isnumeric():
                #Query to get Note from db
                table = "ShareLink"
                query = f"SELECT * FROM {table} WHERE id = {id}"
                cursor.execute(query)
                row = cursor.fetchone()

                if row != None:
                    query = f"DELETE FROM {table} WHERE id = {id}"
                    cursor.execute(query)
                    return createResponse(200, f"Deleted ShareLink: {id}")
                else:
                    return createResponse(404, "ShareLink not found")
            else:
                return createResponse(400, "Query Parameter must be integer")
    except:
        pass
        return createResponse(400, "Error Executing SQL Query")
        
        
def handler(event, context):

    if event['requestContext']['http']['method'] == "GET":
        note_id = event['queryStringParameters']['note_id']
        response = getShareLink(note_id, event)
        return response
        
    if event['requestContext']['http']['method'] == "POST":
        try:
            data = json.loads(event['body'])
            response = createShareLink(data)
            return response
        except:
            pass
            return createResponse(400, "Invalid JSON")
            
    if event['requestContext']['http']['method'] == "PATCH":
        try:
            id = event['queryStringParameters']['id']
            response = updateShareLink(id)
            return response
    
        except:
            pass
            return createResponse(400, "Invalid Query Parameter")
    
    if event['requestContext']['http']['method'] == "DELETE":
        id = event['queryStringParameters']['id']
        response = deleteShareLink(id)
        return response
    
    return event
    
