
<!-- TITLE/ -->

# getmac

<!-- /TITLE -->


<!-- BADGES/ -->

[![Build Status](https://img.shields.io/travis/bevry/getmac/master.svg)](http://travis-ci.org/bevry/getmac "Check this project's build status on TravisCI")
[![NPM version](https://img.shields.io/npm/v/getmac.svg)](https://npmjs.org/package/getmac "View this project on NPM")
[![NPM downloads](https://img.shields.io/npm/dm/getmac.svg)](https://npmjs.org/package/getmac "View this project on NPM")
[![Dependency Status](https://img.shields.io/david/bevry/getmac.svg)](https://david-dm.org/bevry/getmac)
[![Dev Dependency Status](https://img.shields.io/david/dev/bevry/getmac.svg)](https://david-dm.org/bevry/getmac#info=devDependencies)<br/>
[![Gratipay donate button](https://img.shields.io/gratipay/bevry.svg)](https://www.gratipay.com/bevry/ "Donate weekly to this project using Gratipay")
[![Flattr donate button](https://img.shields.io/badge/flattr-donate-yellow.svg)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](https://img.shields.io/badge/bitcoin-donate-yellow.svg)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](https://img.shields.io/badge/wishlist-donate-yellow.svg)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

<!-- /BADGES -->


<!-- DESCRIPTION/ -->

Get the mac address of the current machine you are on

<!-- /DESCRIPTION -->


<!-- INSTALL/ -->

## Install

### [NPM](http://npmjs.org/)
- Use: `require('getmac')`
- Install: `npm install --save getmac`

<!-- /INSTALL -->


## Usage

### CLI

1. Install Globally: `install -g getmac`
2. Run with:  `getmac-node`

### API

``` javascript
// Fetch the computer's mac address
require('getmac').getMac(function(err,macAddress){
	if (err)  throw err
	console.log(macAddress)
})

// Validate that an address is a mac address
if ( require('getmac').isMac("e4:ce:8f:5b:a7:fc") ) {
	console.log('valid mac')
}
else {
	console.log('invalid mac')
}
```



<!-- HISTORY/ -->

## History
[Discover the change history by heading on over to the `HISTORY.md` file.](https://github.com/bevry/getmac/blob/master/HISTORY.md#files)

<!-- /HISTORY -->


<!-- CONTRIBUTE/ -->

## Contribute

[Discover how you can contribute by heading on over to the `CONTRIBUTING.md` file.](https://github.com/bevry/getmac/blob/master/CONTRIBUTING.md#files)

<!-- /CONTRIBUTE -->


<!-- BACKERS/ -->

## Backers

### Maintainers

These amazing people are maintaining this project:

- Benjamin Lupton <b@lupton.cc> (https://github.com/balupton)

### Sponsors

No sponsors yet! Will you be the first?

[![Gratipay donate button](https://img.shields.io/gratipay/bevry.svg)](https://www.gratipay.com/bevry/ "Donate weekly to this project using Gratipay")
[![Flattr donate button](https://img.shields.io/badge/flattr-donate-yellow.svg)](http://flattr.com/thing/344188/balupton-on-Flattr "Donate monthly to this project using Flattr")
[![PayPayl donate button](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=QB8GQPZAH84N6 "Donate once-off to this project using Paypal")
[![BitCoin donate button](https://img.shields.io/badge/bitcoin-donate-yellow.svg)](https://coinbase.com/checkouts/9ef59f5479eec1d97d63382c9ebcb93a "Donate once-off to this project using BitCoin")
[![Wishlist browse button](https://img.shields.io/badge/wishlist-donate-yellow.svg)](http://amzn.com/w/2F8TXKSNAFG4V "Buy an item on our wishlist for us")

### Contributors

These amazing people have contributed code to this project:

- [Benjamin Lupton](https://github.com/balupton) <b@lupton.cc> — [view contributions](https://github.com/bevry/getmac/commits?author=balupton)

[Become a contributor!](https://github.com/bevry/getmac/blob/master/CONTRIBUTING.md#files)

<!-- /BACKERS -->


<!-- LICENSE/ -->

## License

Unless stated otherwise all works are:

- Copyright &copy; 2013+ Bevry Pty Ltd <us@bevry.me> (http://bevry.me)

and licensed under:

- The incredibly [permissive](http://en.wikipedia.org/wiki/Permissive_free_software_licence) [MIT License](http://opensource.org/licenses/mit-license.php)

<!-- /LICENSE -->


