#!/bin/sh
BASEDIR=$( cd $(dirname $0) ; pwd -P )
URL1="http://www.teleguide.info/download/new3/xmltv.xml.gz"
URL2="http://www.vipiko.tv/get/?cur-xtv-xml"

TEMP="$TMPDIR"

if [ -z "$TMPDIR" ]; then
    TEMP="/tmp"
fi

mkdir $TEMP/xmltv
cd $TEMP/xmltv
curl -o xml.gz $URL1
gunzip xml.gz
curl -o second.xml $URL2
tv_cat xmltv.xml second.xml | tv_sort | tv_grep --on-after now > tv.xml
mv tv.xml $BASEDIR/../static/
cd /
rm -rf $TEMP/xmltv
