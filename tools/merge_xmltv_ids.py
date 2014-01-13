# -*- coding: utf-8 -*-
__author__ = 'yegor'

import getopt
import sys
import difflib

try:
    import xml.etree.cElementTree as ET
except ImportError:
    import xml.etree.ElementTree as ET


def print_unicode_array(array):
    return "["+u', '.join(array)+"]"


def clean_name(name):
    return name.lower().replace(u'канал', '').replace('channel', '').strip()


def check_name(name, names):
    matches = difflib.get_close_matches(name, names, cutoff=0.95)
    return matches[0] if len(matches) > 0 else None


def get_empty_id(ids, last_id):
    last_id += 1
    while ids.has_key(str(last_id)):
        last_id += 1
    return last_id


def get_channels_dicts(input_xml):
    root = None
    names = None
    icon = None
    channels = {}
    ids = {}
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
                ident = elem.get('id')
                for name in names:
                    channels[name] = {'id': ident, 'icon': icon}
                ids[ident] = {'names': names, 'icon': icon}
            elif elem.tag == "display-name":
                names.append(clean_name(elem.text))
            elif elem.tag == "icon":
                icon = elem.get('src')
            root.clear()
            elem.clear()
    return channels, ids


def update_channels_ids(input, output, channels, ids):
    input = open(input, "rt")
    output = open(output, "wt")
    output.write('<?xml version="1.0" encoding="UTF-8" ?>\n<tv>\n')
    root = None
    fixed_ids = {}
    last_id = 1000000
    channels_names = channels.keys()
    for event, elem in ET.iterparse(input, events=("start", "end")):
        if event == "start":
            if root is None:
                root = elem
        if event == "end":
            if elem.tag == "channel":
                names = [clean_name(el.text) for el in elem.findall('display-name')]
                print "Element names:", print_unicode_array(names)
                try:
                    ident = elem.get('id')
                    ch = ids[ident]
                    name = None
                    ch_names = ch.get('names', [])
                    print "The same id:", ident
                    for name in names:
                        name = check_name(name, ch_names)
                        if name is not None:
                            break
                    if name is None:
                        print "Different channels with the same id, names:",print_unicode_array(names), \
                            'ch_names:',print_unicode_array(ch_names)
                        last_id = get_empty_id(ids, last_id)
                        print "Updated to id: ", str(last_id)
                        fixed_ids[ident] = str(last_id)
                        elem.set('id', str(last_id))
                except KeyError:
                    name = None
                    for name in names:
                        name = check_name(name, channels_names)
                        if name is not None:
                            break
                    if name is not None:
                        ch = channels[name]
                        ident = ch['id']
                        elem_id = elem.get('id')
                        print "Updated id from:", elem_id, 'to:', ident, "names:", print_unicode_array(names),\
                            " ch: ", print_unicode_array(ids[ident]['names'])
                        fixed_ids[elem.get('id')] = ident
                        elem.set('id', ident)
                output.write(ET.tostring(elem, encoding="utf-8"))
                elem.clear()
            elif elem.tag == "programme":
                try:
                    new_id = fixed_ids[elem.get('channel')]
                    elem.set('channel', new_id)
                except:
                    pass
                output.write(ET.tostring(elem, encoding="utf-8"))
                elem.clear()
            root.clear()
    output.write('</tv>')
    input.close()
    output.close()


def usage():
    print "Use 'python merge_xmltv_ids.py -i input_xml -m modified_xml -o modified_output_xml"


def main(argv):
    try:
        opts, args = getopt.getopt(argv, "hi:m:o:", ["help"])
    except getopt.GetoptError:
        usage()
        sys.exit(2)
    if len(argv) == 0:
        usage()
        sys.exit()

    input_file = None
    output_file = None
    modified_file = None

    for opt, arg in opts:
        if opt in ('-h', '--help'):
            usage()
            sys.exit()
        elif opt == '-m':
            modified_file = arg
        elif opt == '-i':
            input_file = arg
        elif opt == "-o":
            output_file = arg

    channels, ids = get_channels_dicts(input_file)
    update_channels_ids(modified_file, output_file, channels, ids)


if __name__ == "__main__":
    main(sys.argv[1:])