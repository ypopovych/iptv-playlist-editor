__author__ = 'george'
import sys
import getopt
import urllib2
import os
from cStringIO import StringIO

try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET

from PIL import Image


def parse(input_xml, output_py, icon_dir):
    root = None
    output_py = open(output_py, "wt")
    names = None
    icon = None
    output_py.write("# -*- coding: utf-8 -*-\nXMLTV_CHANNELS = [\n")
    input_xml = open(input_xml, "rt")
    for event, elem in ET.iterparse(input_xml, events=("start", "end")):
        if event == "start":
            if root is None:
                root = elem
            if elem.tag == "channel":
                names = []
                icon = None
        if event == "end":
            if elem.tag == "channel":
                img = None
                for name in names:
                    output_py.write("    u'"+name.encode('utf-8')+"',\n")
                    if img is None:
                        if icon_dir is not None and icon is not None:
                            print "Icon updated", icon
                            ext = icon[icon.rfind('.'):].lower()
                            if ext != ".png":
                                try:
                                    buff = StringIO(urllib2.urlopen(icon).read())
                                    img = Image.open(buff)
                                except Exception, e:
                                    print "Load failed:", icon, "error: ", e
                            else:
                                try:
                                    img = urllib2.urlopen(icon).read()
                                except Exception, e:
                                    print "Load failed:", icon, "error: ", e
                    if img is not None:
                        icn_path = os.path.join(icon_dir, name.strip().replace(' ', '').replace('/','_'))+'.png'
                        print "Write to file:", icn_path
                        if isinstance(img, Image.Image):
                            try:
                                img.save(icn_path)
                            except Exception, e:
                                print "Save failed:", icon, "error: ", e
                        else:
                            try:
                                icn = open(icn_path, 'wb')
                                icn.write(img)
                                icn.close()
                            except Exception, e:
                                print "Write failed:", icon, "error: ", e
            elif elem.tag == "display-name":
                names.append(elem.text)
            elif elem.tag == "icon":
                icon = elem.get('src')
            root.clear()
            elem.clear()
    output_py.write("]\n")
    output_py.close()
    input_xml.close()


def usage():
    print "Use: python get_channels_from_xmltv.py <xmltv_file_path> <xmltv_channels.py_path>"
    print 'Add "-i <icons_output_dir>" if xmltv file contains icons'


def main(argv):
    if len(argv) == 0:
        usage()
        sys.exit()

    try:
        opts, args = getopt.getopt(argv, "i:h", ["help"])
    except:
        usage()
        sys.exit(2)

    icons_dir = None

    for opt, arg in opts:
        if opt in ("-h", "--help"):
            usage()
            sys.exit()
        elif opt == "-i":
            icons_dir = arg

    parse(args[0], args[1], icons_dir)


if __name__ == "__main__":
    main(sys.argv[1:])
