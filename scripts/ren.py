import os
import math


NAMES = ['f', 'l', 'b', 'r', 'u', 'd']
EXT = '.jpg'
DIR = '../img'

files = os.listdir(DIR)
fileCount = len(files)
for i in range(0, (fileCount / 6)):
	dir = DIR + '/p' + str(i)
	if not os.path.exists(dir):
		os.makedirs(dir)

i = 0
for f in files:
	dir = i / 6
	n = i % 6
	src = DIR + '/' + f
	dest = DIR + '/p' + str(dir) + '/' + NAMES[n] + EXT
	print 'Renaming', src, dest
	if not os.path.isdir(src): os.rename(src, dest)
	i = i + 1
	