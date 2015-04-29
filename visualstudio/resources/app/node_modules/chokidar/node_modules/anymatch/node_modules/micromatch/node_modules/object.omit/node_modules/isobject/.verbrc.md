# {%= name %} {%= badge("fury") %}

> {%= description %}

## Install
{%= include("install", {save: 'save'}) %}

## Usage

```js
var isObject = require('isobject');
console.log(isObject(null));
//=> 'false'
console.log(isObject([]));
//=> 'false'
console.log(isObject({}));
//=> 'true'
```

## Author
{%= include("author") %}

## License
{%= copyright() %}
{%= license() %}

***

{%= include("footer") %}