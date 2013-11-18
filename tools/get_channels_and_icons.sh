#!/bin/sh
BASEDIR=$( cd $(dirname $0) ; pwd -P )

ICONS_DIR="
XML="$BASEDIR/static/tv.xml"
OUT="$BASEDIR/xmltv_channels.py"

if [ ! -z "$ICONS_DIR" ]; then
    python get_channels_from_xmltv.py -i "$ICONS_DIR" "$XML" "$OUT"
else
    python get_channels_from_xmltv.py "$XML" "$OUT"
fi
