import zipfile
import json

z = zipfile.ZipFile(r'C:\Users\amit1\OneDrive\Desktop\wingman-app\wingman\hero update.zip')
files = z.namelist()

# Group files by directory
dirs = {}
for f in files:
    parts = f.split('/')
    if len(parts) > 0:
        dir_name = parts[0]
        if dir_name not in dirs:
            dirs[dir_name] = []
        dirs[dir_name].append(f)

print(json.dumps(dirs, indent=2))
