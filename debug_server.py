__author__ = 'george'

from wsgiref.simple_server import make_server
from iptv import application

print "Starting on port 8000"
make_server('', 8000, application).serve_forever()
