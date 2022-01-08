import pymysql
import logging
import sys
import os


def rds_connect():

    # rds settings
    rds_host = os.environ.get("RDS_DB_HOSTNAME")
    name = os.environ.get("RDS_DB_USERNAME")
    password = os.environ.get("RDS_DB_PASSWORD")
    db_name = os.environ.get("RDS_DB_NAME")
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    try:
        connection = pymysql.connect(host=rds_host, user=name,
                                     passwd=password, db=db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, autocommit=True)
        logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")
        return connection
    except pymysql.MySQLError as e:
        logger.error(
            "ERROR: Unexpected error: Could not connect to MySQL instance.")
        logger.error(e)
        print(e)
        sys.exit()
        return None
