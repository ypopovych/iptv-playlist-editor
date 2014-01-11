__author__ = 'george'

DEBUG = False

# URL for udpxy or something. Must be full url
MULTICAST_TO_HTTP_URL = None

# URLs for playlists download
PLAYLISTS_URLS = ()

# URLs for playlists with radio
RADIO_PLAYLISTS_URLS = ()

# URL for tv program data. Must be None if not needed. {{STATIC}} can be used for this server static dir
TV_GUIDE_DATA_URL = "{{STATIC}}/tv.xml"

# TVG Timeshift
TV_TIMESHIFT = 0

# TVG timeshift max priority. If True - TV_TIMESHIFT will replace all playlist timeshift values.
TV_TIMESHIFT_MAX_PRIORITY = False
