#!/bin/sh
PROJDIR=$( cd $(dirname $0)/../ ; pwd -P )

ICONS_DIR=""
XML="$PROJDIR/static/tv.xml"
OUT="$PROJDIR/xmltv_channels.py"
SCRIPT="$PROJDIR/tools/get_channels_from_xmltv.py"

if [ ! -z "$ICONS_DIR" ]; then
    python "$SCRIPT" -i "$ICONS_DIR" "$XML" "$OUT"
else
    python "$SCRIPT" "$XML" "$OUT"
fi
