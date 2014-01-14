__author__ = 'george'

import mimetypes
import os
import urllib2
from urlparse import parse_qsl
import difflib
from urlparse import urlparse
from settings import (MULTICAST_TO_HTTP_URL, PLAYLISTS_URLS, DEBUG, RADIO_PLAYLISTS_URLS, TV_GUIDE_DATA_URL,
                      TV_TIMESHIFT, TV_TIMESHIFT_MAX_PRIORITY, NAME_SEARCH_PERCENTS)
import re

try:
    from xmltv_channels import XMLTV_CHANNELS
except ImportError:
    XMLTV_CHANNELS = []

try:
    from xmltv_patch_channels import XMLTV_CHANNELS_PATCH
except ImportError:
    XMLTV_CHANNELS_PATCH = {}


def print_unicode(data):
    print unicode(data).encode('utf-8')


mimetypes.init()
STATIC_DIR = os.path.join(os.path.dirname(os.path.realpath(__file__)), 'static')
M3U_RE = re.compile('\s*([\w\-]+?)="(.*?)"', re.I | re.U)


def update_url(url, m_to_http):
    parts = urlparse(url.strip())
    if parts.scheme in ('udp', 'rtp'):
        return m_to_http+"/"+parts.scheme+"/"+parts.netloc.encode("utf-8")+"\n"
    return url.encode("utf-8")+"\n"


def parse_m3u_parameters(line):
    params = {}
    pos = line.rfind(',')
    name = line[pos+1:].strip()
    p = line[8:pos]
    pos = 0
    for c in p:
        try:
            int(c)
        except:
            break
        pos += 1
    for match in M3U_RE.finditer(p[pos:]):
        params[match.group(1)] = match.group(2)
    return params, name, int(p[:pos])


def create_m3u_info_line(name, params):
    line = "#EXTINF:-1"
    for key,param in params.iteritems():
        line += " "+key.encode('utf-8')+'="'+param.encode("utf-8")+'"'
    return line+","+name.encode('utf-8')+"\n"


def radio_playlist(playlist_url, m_to_http=None):
    playlist = urllib2.urlopen(playlist_url).read()
    lines = playlist.decode("utf-8").splitlines()
    response = []
    for line in lines:
        if line.startswith("#EXTINF:"):
            params, name, ident = parse_m3u_parameters(line)
            params['radio'] = "true"
            response.append(create_m3u_info_line(name, params))
        elif not line.startswith('#'):
            if m_to_http is not None:
                response.append(update_url(line, m_to_http))
            else:
                response.append(line.encode("utf-8")+"\n")
    return response


def video_playlist(playlist_url, timeshift, timeshift_max, debug, ns_percents, m_to_http=None):
    playlist = urllib2.urlopen(playlist_url).read()
    lines = playlist.decode("utf-8").splitlines()
    xmltv_chanels_lower = [ch.lower() for ch in XMLTV_CHANNELS]
    response = []
    for line in lines:
        if line.startswith("#EXTINF:"):
            params, name, ident = parse_m3u_parameters(line)

            if timeshift_max:
                if timeshift != 0:
                    params['tvg-shift'] = str(timeshift)
                else:
                    try:
                        del params['tvg-shift']
                    except:
                        pass
            elif timeshift != 0 and not params.has_key("tvg-shift"):
                params['tvg-shift'] = timeshift

            name_patched = False
            try:
                patch = XMLTV_CHANNELS_PATCH[params['tvg-name'].replace('_', ' ')]
                if isinstance(patch, dict):
                    params.update(patch)
                else:
                    params['tvg-name'] = patch
                    name_patched = True
            except KeyError:
                try:
                    patch = XMLTV_CHANNELS_PATCH[name]
                    if isinstance(patch, dict):
                        params.update(patch)
                    else:
                        params['tvg-name'] = patch
                        name_patched = True
                except KeyError:
                    tvg_name = params.get('tvg-name')
                    if tvg_name is not None:
                        names = difflib.get_close_matches(tvg_name.replace('_', ' ').lower(), xmltv_chanels_lower,
                                                          cutoff=ns_percents)
                        if len(names) > 0:
                            name_patched = True
                            tvg_name = XMLTV_CHANNELS[xmltv_chanels_lower.index(names[0])]
                        else:
                            name_patched = False
                            tvg_name = None
                    if tvg_name is None:
                        names = difflib.get_close_matches(name.lower(), xmltv_chanels_lower,
                                                          cutoff=ns_percents)
                        if len(names) > 0:
                            name_patched = True
                            tvg_name = XMLTV_CHANNELS[xmltv_chanels_lower.index(names[0])]
                        else:
                            tvg_name = params.get('tvg-name', name)
                            name_patched = False
                            if debug:
                                print_unicode('Not found: ' + unicode(tvg_name))
                    params['tvg-name'] = tvg_name.strip().replace(' ', '_')
            if name_patched or not params.has_key('tvg-logo'):
                params['tvg-logo'] = params['tvg-name'].strip().replace('/','_').replace(':','_').replace('?', '')

            if debug:
                print_unicode("Name: "+unicode(name)+" TVG: "+unicode(params.get('tvg-name')))

            response.append(create_m3u_info_line(name, params))
        elif not line.startswith("#"):
            if m_to_http is not None:
                response.append(update_url(line, m_to_http))
            else:
                response.append(line.encode("utf-8")+"\n")
    return response


def static(fl, start_response):
    old_fl = fl
    fl = os.path.join(STATIC_DIR, fl.replace("../", ''))
    if os.path.isfile(fl):
        start_response('200 OK', [('Content-Type', mimetypes.guess_type(fl)[0])])
        return [open(fl).read()]
    elif os.path.isdir(fl):
        start_response('403 Forbidden', [('Content-Type', 'text/plain')])
        return ["You can't list files in this directory"]

    start_response('404 Not Found', [('Content-Type', 'text/plain')])
    return ['File: '+old_fl+" not found on the server"]


def main(query, start_response, static_url):
    data = dict(parse_qsl(query))
    try:
        debug = (data['d'] == '1')
    except KeyError:
        debug = DEBUG

    if debug:
        print_unicode(data)
        print_unicode("Static url: "+static_url)
        start_response('200 OK', [('Content-Type','text/plain')])
    else:
        start_response('200 OK', [('Content-Type','audio/x-mpegurl')])

    try:
        playlists = data["pl"]
        if isinstance(playlists, basestring):
            playlists = [playlists]
    except KeyError:
        playlists = PLAYLISTS_URLS

    try:
        m_to_http = data["srv"]
    except KeyError:
        m_to_http = MULTICAST_TO_HTTP_URL

    try:
        r_playlists = data["rpl"]
        if isinstance(r_playlists, basestring):
            playlists = [r_playlists]
    except KeyError:
        r_playlists = RADIO_PLAYLISTS_URLS

    try:
        tv_guide_url = data['tvg']
    except KeyError:
        tv_guide_url = TV_GUIDE_DATA_URL

    try:
        timeshift = int(data['ts'])
    except KeyError:
        timeshift = TV_TIMESHIFT

    try:
        timeshift_max = (data['tsm'] == '1')
    except KeyError:
        timeshift_max = TV_TIMESHIFT_MAX_PRIORITY

    try:
        ns_percents = float(data['np'])
    except:
        ns_percents = NAME_SEARCH_PERCENTS

    if tv_guide_url is not None:
        tv_guide_url = tv_guide_url.replace("{{STATIC}}", static_url)
        response = ['#EXTM3U tvg-url="'+tv_guide_url+'"\n']
    else:
        response = ['#EXTM3U\n']

    for playlist in playlists:
        response.extend(video_playlist(playlist, timeshift, timeshift_max, debug, ns_percents, m_to_http))

    for playlist in r_playlists:
        response.extend(radio_playlist(playlist, m_to_http))

    return response


def application(env, start_response):
    if env['PATH_INFO'].startswith('/static'):
        return static(env['PATH_INFO'][8:], start_response)
    else:
        return main(env.get("QUERY_STRING", ""), start_response,
                    env.get('UWSGI_SCHEME', 'http')+"://"+env.get("HTTP_HOST", "")+env.get('PATH_INFO', '/')+"static")
