import os
import math

NAMES = ['f', 'l', 'b', 'r', 'u', 'd']
EXT = '.jpg'
DIR = '.'

files = os.listdir(DIR)
fileCount = len(files)
for i in range(0, (fileCount / 6) + 1):
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
	#os.rename(DIR + '/' + f, DIR + '/p' + str(dir) + '/' + NAMES[n] + EXT) 
	i = i + 1
	