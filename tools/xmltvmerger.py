#!/usr/bin/env python
# -*- coding: utf-8 -*-
#
# $Id: xmltvmerger.py 109 2009-11-04 22:42:49Z jeppenejsum $

"""Køres med ./xmltvmeger.py indfil1 indfil2 udfil
Filterne bør have samme kanaler og kanal id'er"""

import sys
from xml.dom import minidom
from xml.parsers.expat import ExpatError

file1, file2 = None, None

try: file1 = minidom.parse(sys.argv[1])
except IOError: sys.stderr.write("Fil 1 (%s) kunne ikke findes\n" % sys.argv[1])
except ExpatError, message: sys.stderr.write(sys.argv[1]+" "+str(message)+"\n")

try: file2 = minidom.parse(sys.argv[2])
except IOError: sys.stderr.write("Fil 2 (%s) kunne ikke findes\n" % sys.argv[2])
except ExpatError, message: sys.stderr.write(sys.argv[2]+" "+str(message)+"\n")

from shutil import copy
if file1 and not file2:
    copy (sys.argv[1], sys.argv[3])
    sys.exit()
elif file2 and not file1:
    copy (sys.argv[2], sys.argv[3])
    sys.exit()
elif not file1 and not file2:
    f = open(sys.argv[3], "w")
    f.write('<?xml version=\"1.0\" ?><!DOCTYPE tv SYSTEM \'xmltv.dtd\'>\n')
    f.write('<tv generator-info-name="XMLTV" generator-info-url="http://membled.com/work/apps/xmltv/">\n')
    f.write('</tv>\n')
    f.close()
    sys.exit()

# ---------- ---------- Funktioner ---------- ---------- #

def tagname (node):
    '''Modtager f.eks. en <title lang="da"> node, og returnerer ("titleda",<title...>)'''
    tagname = node.tagName
    tagname += "".join([v.value for v in node.attributes.values()])
    return (tagname, node)

def tagdir (nodes):
    '''Laver dic {name:<node>} over <node>s i liste'''
    dic = {}
    for n in nodes:
        if n.nodeType == n.TEXT_NODE: continue
        dic[tagname(n)[0]] = n
    return dic

def getNodesNamed (nodes, name):
    nodes = [n for n in nodes if n.nodeType != n.TEXT_NODE]
    nodes = [n for n in nodes if n.tagName == name]
    return nodes

# ---------- ---------- Merger <channel> tags  ---------- ---------- #
# Indbefatter tilføjelse af <icon> og <display-name> på forskellige sprog.
def decBytes (bytestr):
    a = [c for c in bytestr]
    a.reverse()
    bytestr = "".join(a)
    decoded = 0
    for i in range(len(bytestr)):
        decoded += ord(bytestr[i]) * 256**i
    return decoded

def getSize(d):
    if d[:8] == "\x89PNG\r\n\x1a\n": #png:
        s = (d[16:20], d[20:24])
        return map(decBytes, s)
    elif d[:2] == "\xff\xd8": #jpeg
        e = d[d.find("\xff\xc0"):]
        s = (e[5:7], e[7:9])
        return map(decBytes, s)
    elif d[:3] == "GIF": #gif
        s = (d[7]+d[6], d[9]+d[8])
        return map(decBytes, s)
    else: return (1,1)

file2ChannelDic = {}
for channel in file2.getElementsByTagName("channel"):
    id = channel.attributes["id"].value
    file2ChannelDic[id] = channel

file1ChannelDic = {}
for channel in file1.getElementsByTagName("channel"):
    id = channel.attributes["id"].value
    file1ChannelDic[id] = channel
    
    if not id in file2ChannelDic:
        continue

    file1tagnames = [tagname(n)[0] for n in getNodesNamed(channel.childNodes, "display-name")]
    file2tagnames = [tagname(n) for n in getNodesNamed(file2ChannelDic[id].childNodes, "display-name")]
    for file2tagname, file2node in file2tagnames:
        if not file2tagname in file1tagnames:
            channel.appendChild(file2node)
    
    f1icons = getNodesNamed(channel.childNodes, "icon")
    f2icons = getNodesNamed(file2ChannelDic[id].childNodes, "icon")
    if len(f1icons) == 0 and len(f2icons) > 0:
        channel.appendChild(f2icons[0])
    elif len(f1icons) > 0 and len(f2icons) > 0:
        from urllib import urlopen
        product = lambda (x,y): x*y
        size = lambda d: product(getSize(d))
        size1 = size(urlopen(f1icons[0].attributes["src"].value).read())
        size2 = size(urlopen(f2icons[0].attributes["src"].value).read())
        if size2 > size1:
            f1icons[0].attributes["src"] = f2icons[0].attributes["src"]

# ---------- ---------- Funktioner ---------- ---------- #

import time
def parseTime (s):
    '''Oversætter fra xmltv's tidsformat til unixtimestamp'''
    s = s.split()[0]
    # Fixme: Hvis en grabber udnytter sig af dtd'ens mulighed for f.eks. kun at specificere %Y%m, vil strptime kommer med fejl. Det er der ingen af dem, der gør.
    if len(s)==12:
        return time.mktime(time.strptime(s,"%Y%m%d%H%M")) 
    else:
        return time.mktime(time.strptime(s,"%Y%m%d%H%M%S")) 

def notime (programme):
    '''Tester om et program starter tidligere eller samtidigt med, at det slutter'''
    if not programme.attributes.has_key("stop"):
        return False
    elif programme.attributes["stop"].value == "":
        return False
    t_start = parseTime(programme.attributes["start"].value)
    t_end = parseTime(programme.attributes["stop"].value)
    return t_end <= t_start

def getFileProgrammes (file):
    '''Laver {"channelid":[programmes]} fra en dom'''
    fileProgrammes = {}
    for programme in file.getElementsByTagName("programme"):
        if notime(programme):
            continue
        channel = programme.attributes["channel"].value
        if not channel in fileProgrammes:
            fileProgrammes[channel] = [programme]
        else: fileProgrammes[channel].append(programme)
    return fileProgrammes

# ---------- ---------- Merger <programme> tags  ---------- ---------- #

file1Programmes = getFileProgrammes(file1)
file2Programmes = getFileProgrammes(file2)

#For hver kanal fil2 har, som fil1 ikke har, skal kanalerne+programmerne kopieres over.
f1tv = file1.getElementsByTagName("tv")[0]

# Kopier kanaler fra 2 som ikke er i 1
for channel in file2.getElementsByTagName("channel"):
    id = channel.attributes["id"].value
    if not id in file1ChannelDic:
        f1tv.insertBefore(channel, f1tv.firstChild)

for channel, f2progs in file2Programmes.iteritems():
    if not channel in file1Programmes:
        for programme in f2progs:
            f1tv.appendChild(programme)
            #Bemærk: Bliver ikke tilføjet til file1Programmes.
            #Ingen grund til at næste del, mergedelen, skal sammenligne ens programmer

#Merger programmer
for channel, f1progs in file1Programmes.iteritems():
    if not file2Programmes.has_key(channel):
        continue
    f2progs = file2Programmes[channel]
    
    #Udkommenter disse to for ikke at sortere.
    #I skrivenestund, er ahot og tv-guiden ikke kronologiske, så sortering er nødvendig
    #Burde måske udføres af grabberen, for mindre cpu brug, men det her er mere sikkert
    f1progs.sort(key=lambda x: int(x.attributes["start"].value.split(None, 1)[0]))
    f2progs.sort(key=lambda x: int(x.attributes["start"].value.split(None, 1)[0]))
    
    i = -1 #i styrer hvor henne vi er i f2progs.
    for f1prog in f1progs:
        i += 1
        if i >= len(f2progs): break
        f2prog = f2progs[i]
        
        t1 = parseTime(f1prog.attributes["start"].value)
        t2 = parseTime(f2prog.attributes["start"].value)
        
        def func ():
            global t1, t2, i, f2progs, f2prog
            while t1 > t2:
                i += 1
                if i >= len(f2progs): return False
                f2prog = f2progs[i]
                t2 = parseTime(f2prog.attributes["start"].value)
            return True
        
        if not func():
            break
        
#        Det her kan da ikke være nødvendigt?        
#        for prog in (f1prog, f2prog):
#            if prog.attributes.has_key("stop") and \
#                    prog.attributes["stop"].value == "":
#                del prog.attributes["stop"]
        
        if t2 > t1:
            i -= 1
            continue
        
        #Hvis f1prog er kortere end f2prog, skal f2prog hoppe 1 tilbage
        if f1prog.attributes.has_key("stop") and \
           f2prog.attributes.has_key("stop") and \
           parseTime(f1prog.attributes["stop"].value) - t1 < \
           parseTime(f2prog.attributes["stop"].value) - t2:
            i -= 1
            continue
        
        #Slut på sammensætning af programmer. Start på dataoverføring.
        
        #Overførning af sluttid.
        if not f1prog.attributes.has_key("stop") and \
               f2prog.attributes.has_key("stop"):
            f1prog.attributes["stop"] = f2prog.attributes["stop"]
        
        #Overførning af showview
        if not f1prog.attributes.has_key("showview") and \
               f2prog.attributes.has_key("showview"):
            f1prog.attributes["showview"] = f2prog.attributes["showview"]
        
        #Overføring af manglende tags + overføring af tags med flest childnodes
        file1tagnames = tagdir(f1prog.childNodes)
        file2tagnames = tagdir(f2prog.childNodes)
        for name, node in file2tagnames.iteritems():
            if not file1tagnames.has_key(name):
                f1prog.appendChild(node)
            elif len(node.childNodes) > len(file1tagnames[name].childNodes):
                f1prog.removeChild(file1tagnames[name])
                f1prog.appendChild(node)
        
        #Funktioner til valg af korteste/længste beskrivelse
        def getText (element):
            """Henter tekst fra tekstchildnodes"""
            l = [n.wholeText for n in element.childNodes if n.nodeType == n.TEXT_NODE]
            return "".join(l).strip()
        
        def setText (element, text):
            """Sætter teksten på første node"""
            if len(element.childNodes) <= 0:
                element.appendChild(file1.createTextNode(text))
            else: element.firstChild.replaceWholeText(text)
        
        def compare (elem1, elem2, method):
            elem1Text = getText(elem1)
            elem2Text = getText(elem2)
            if not elem1Text: return elem2Text
            if not elem2Text: return elem1Text
            v1 = len(elem1Text); v2 = len(elem2Text)
            if method(v1, v2) == v1:
                return elem1Text
            else: return elem2Text

        def best (tagName, method):
            f2dir = {}
            for f2elem in f2prog.getElementsByTagName(tagName):
                if not f2elem.attributes.has_key("lang"):
                    f2dir["default"] = f2elem
                else: f2dir[f2elem.attributes["lang"].value] = f2elem
                
            for f1elem in f1prog.getElementsByTagName(tagName):
                if not f1elem.attributes.has_key("lang") and \
                        f2dir.has_key("default"):
                    setText(f1elem, compare(f1elem, f2dir["default"], method))
                elif f1elem.attributes.has_key("lang") and \
                        f2dir.has_key(f1elem.attributes["lang"].value):
                    setText(f1elem, compare(f1elem, f2dir[f1elem.attributes["lang"].value], method))
        
        #Vælg korteste/længste udgave af forskellige tags.
        #Udkommenter for bare at bruge fil1's udgave
        best("desc", max)
        #best("category", max)
        #best("title", min)
        #best("sub-title", min)
        #Gem sidste sluttidspunktså vi senere kan kopiere programmer fra prog2 til prog1, 
        #som starter efter sidste program i prog1
        if f1prog.attributes.has_key("stop"):
            slut1=parseTime(f1prog.attributes["stop"].value)
        else:
            slut1=t1
    #Kopier programmer fra file2 til file1, som starter efter sidste program i file1:
    while 1:
        i += 1
        if i >= len(f2progs): break
        f2prog = f2progs[i]
        t2 = parseTime(f2prog.attributes["start"].value)
        if t2>=slut1:
            file1.documentElement.appendChild(f2prog)

from codecs import open
outfile = open(sys.argv[3], "w", "utf-8")
outfile.write(file1.toxml())
outfile.close()
