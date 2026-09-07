import urllib.request
import urllib.error
try:
    req = urllib.request.Request('https://cohabit-api-mo1f.onrender.com/login', data=b'username=test%40example.com&password=test', headers={'Content-Type': 'application/x-www-form-urlencoded'})
    print(urllib.request.urlopen(req).read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print(e.code, e.read().decode('utf-8'))
