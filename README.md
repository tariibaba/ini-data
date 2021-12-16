# ini-data
Parse INI configuration data to Javascript objects

## Usage
Let's say you have this INI file (named **config.ini**):

```
; this is a comment
key = value

[details]
user = root
password = thepassword
```

You can parse the file into an object like so:

```javascript
const fs = require('fs');
const iniConfig = require('ini-data');

const text = fs.readFileSync('ini.config', 'utf-8');
const obj = iniConfig.parse(text);

console.log(obj.key);  // value
console.log(obj.details.password);  // thepassword
```