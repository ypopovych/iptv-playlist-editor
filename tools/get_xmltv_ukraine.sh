#!/bin/sh
BASEDIR=$( cd $(dirname $0) ; pwd -P )
URL1="http://www.teleguide.info/download/new3/xmltv.xml.gz"
URL2="http://www.vipiko.tv/get?act-xtv-tgz"

TEMP="$TMPDIR"

if [ -z "$TMPDIR" ]; then
    TEMP="/tmp"
fi

mkdir $TEMP/xmltv
cd $TEMP/xmltv
curl -L -o xmltv.xml.gz $URL1
gunzip xmltv.xml.gz
curl -L -o second.tgz $URL2
tar zxvf second.tgz
cat xmltv.xml | tv_sort --by-channel > tg.xml
cat tvguide.xml | tv_sort --by-channel > vp.xml
python $BASEDIR/merge_xmltv_ids.py -i tg.xml -m vp.xml -o vp_fixed.xml
cd $BASEDIR
perl tv_merge -i $TEMP/xmltv/tg.xml -m $TEMP/xmltv/vp_fixed.xml -o $TEMP/xmltv/temp.xml
cd $TEMP/xmltv
cat temp.xml | tv_sort --by-channel  > tv.xml
mv tv.xml $BASEDIR/../static/
cd /
rm -rf $TEMP/xmltv
