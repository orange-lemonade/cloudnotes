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
    

#Function that deletes Notes that were marked for deletion and are over 30 days old
def handler(event, context):
    try:
        connection = rds_connect()
        with connection.cursor() as cursor:
            #Query to get Note from db
            table = "Note"
            query = f"SELECT * FROM {table} WHERE deleted = 1"
            cursor.execute(query)
            rows = cursor.fetchall()
            for row in rows:

                deletedDate = row['deleted_on']
                time_between_insertion = datetime.now() - deletedDate

                if  time_between_insertion.days>30:
                    query = (f"DELETE FROM `{table}` WHERE `id`= {row['id']}")
                    cursor.execute(query)
                    return print(f"Deleted Note: {row['id']}")
                    print("The insertion date is older than 30 days")
                    

                else:
                    print ("The insertion date is not older than 30 days")
                    return print(f"Did not delete Note: {row['id']}")
                
                
            return createResponse(200, rows)
        return createResponse(404,"User not found")
    except:
        pass
        print("Error Executing SQL")
        return createResponse(400, "Error Executing SQL Query")
  
    
    return None
    
