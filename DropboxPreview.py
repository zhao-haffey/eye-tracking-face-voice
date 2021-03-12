import eel
import glob
import io
import json
import os
import platform
import shutil


eel.init('web') #allowed_extensions=[".js",".html"]
eel.start('kitten/index.html', port=8000)
