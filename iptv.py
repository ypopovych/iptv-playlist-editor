__author__ = 'george'

import mimetypes
import os
import urllib2
from urlparse import parse_qsl
import difflib
from urlparse import urlparse
from settings import MULTICAST_TO_HTTP_URL, PLAYLIST_URL, DEBUG

try:
    from xmltv_channels import XMLTV_CHANNELS
except ImportError:
    XMLTV_CHANNELS = []

try:
    from xmltv_patch_channels import XMLTV_CHANNELS_PATCH
except ImportError:
    XMLTV_CHANNELS_PATCH = {}


mimetypes.init()
STATIC_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')


def static(file, start_response):
    start_response('200 OK', [('Content-Type', mimetypes.guess_type(file)[0])])
    return [open(STATIC_DIR+file).read()]


def main(query, start_response):
    start_response('200 OK', [('Content-Type','audio/x-mpegurl')])
    data = dict(parse_qsl(query))
    try:
        playlist = data["pl"]
    except KeyError:
        playlist = PLAYLIST_URL

    try:
        m_to_http = data["srv"]
    except KeyError:
        m_to_http = MULTICAST_TO_HTTP_URL

    playlist = urllib2.urlopen(playlist).read()
    lines = playlist.decode("utf-8").splitlines()
    response = []
    for line in lines:
        if line.startswith("#EXTINF:"):
            name = line[line.rfind(',')+1:].strip()
            tvg_name = name
            try:
                tvg_name = XMLTV_CHANNELS_PATCH[name]
            except KeyError:
                names = difflib.get_close_matches(name, XMLTV_CHANNELS)
                if len(names) > 0:
                    tvg_name = names[0]
                elif DEBUG:
                    print tvg_name

            icon = tvg_name.strip().replace(' ', '').replace('/','_').encode('utf-8')
            tvg_name = tvg_name.strip().replace(' ', '_').encode('utf-8')
            response.append('#EXTINF:-1 tvg-name="'+tvg_name+'" tvg-logo="'+icon+'",'+name.encode('utf-8')+"\n")
        elif line.startswith("#"):
            response.append(line.encode("utf-8"))
        else:
            if m_to_http is not None:
                parts = urlparse(line.strip())
                if parts.scheme in ('udp', 'rtp'):
                    response.append(m_to_http+"/"+parts.scheme+"/"+parts.netloc.encode("utf-8")+"\n")
                else:
                    response.append(line.encode("utf-8")+"\n")
            else:
                response.append(line.encode("utf-8")+"\n")

    return response


def application(env, start_response):
    if env['PATH_INFO'].startswith('/static'):
        return static(env['PATH_INFO'].replace('/static', ''), start_response)
    else:
        return main(env.get("QUERY_STRING", ""), start_response)

