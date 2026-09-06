import pymysql

# Enable PyMySQL as MySQL driver for Django
pymysql.install_as_MySQLdb()

# Enable compatibility for MySQL 8.0.x with Django 6.x
try:
    from django.db.backends.mysql.base import DatabaseWrapper
    DatabaseWrapper.check_database_version_supported = lambda self: None
except Exception:
    pass
