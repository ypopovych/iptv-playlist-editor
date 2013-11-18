#!/bin/sh
PROJDIR=$( cd $(dirname $0)/../ ; pwd -P )

ICONS_DIR=""
XML="$PROJDIR/static/tv.xml"
OUT="$PROJDIR/xmltv_channels.py"

if [ ! -z "$ICONS_DIR" ]; then
    python get_channels_from_xmltv.py -i "$ICONS_DIR" "$XML" "$OUT"
else
    python get_channels_from_xmltv.py "$XML" "$OUT"
fi
