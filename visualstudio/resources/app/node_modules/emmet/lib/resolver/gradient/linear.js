/**
 * CSS linear gradient definition
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var stringStream = require('../../assets/stringStream');
	var utils = require('../../utils/common');

	// all directions are expressed in “new style” degrees
	var directions = {
		'bottom': 0,
		'bottom left': 45,
		'left': 90,
		'top left': 135,
		'top': 180,
		'top right': 225,
		'right': 270,
		'bottom right': 315,
		
		'to top': 0,
		'to top right': 45,
		'to right': 90,
		'to bottom right': 135,
		'to bottom': 180,
		'to bottom left': 225,
		'to left': 270,
		'to top left': 315
	};

	var defaultDirections = ['top', 'to bottom', '0deg'];


	var reLinearGradient = /^\s*(\-[a-z]+\-)?(lg|linear\-gradient)\s*\(/i;
	var reDeg = /(\d+)deg/i;
	var reKeyword = /top|bottom|left|right/i;

	function LinearGradient(dfn) {
		this.colorStops = [];
		this.direction = 180;

		// extract tokens
		var stream = stringStream.create(utils.trim(dfn));
		var ch, cur;
		while ((ch = stream.next())) {
			if (stream.peek() == ',') {
				// Is it a first entry? Check if it’s a direction
				cur = stream.current();

				if (!this.colorStops.length && (reDeg.test(cur) || reKeyword.test(cur))) {
					this.direction = resolveDirection(cur);
				} else {
					this.addColorStop(cur);
				}
				
				stream.next();
				stream.eatSpace();
				stream.start = stream.pos;
			} else if (ch == '(') { // color definition, like 'rgb(0,0,0)'
				stream.skipTo(')');
			}
		}
		
		// add last token
		this.addColorStop(stream.current());		
	}

	LinearGradient.prototype = {
		type: 'linear-gradient',
		addColorStop: function(color, ix) {
			color = normalizeSpace(color || '');
			if (!color) {
				return;
			}

			color = this.parseColorStop(color);

			if (typeof ix === 'undefined') {
				this.colorStops.push(color);
			} else {
				this.colorStops.splice(ix, 0, color);
			}
		},

		/**
		 * Parses color stop definition
		 * @param {String} colorStop
		 * @returns {Object}
		 */
		parseColorStop: function(colorStop) {
			colorStop = normalizeSpace(colorStop);
			
			// find color declaration
			// first, try complex color declaration, like rgb(0,0,0)
			var color = null;
			colorStop = colorStop.replace(/^(\w+\(.+?\))\s*/, function(str, c) {
				color = c;
				return '';
			});
			
			if (!color) {
				// try simple declaration, like yellow, #fco, #ffffff, etc.
				var parts = colorStop.split(' ');
				color = parts[0];
				colorStop = parts[1] || '';
			}
			
			var result = {
				color: color
			};
			
			if (colorStop) {
				// there's position in color stop definition
				colorStop.replace(/^(\-?[\d\.]+)([a-z%]+)?$/, function(str, pos, unit) {
					result.position = pos;
					if (~pos.indexOf('.')) {
						unit = '';
					} else if (!unit) {
						unit = '%';
					}
					
					if (unit) {
						result.unit = unit;
					}
				});
			}
			
			return result;
		},

		stringify: function(options) {
			options = options || {};
			var fn = 'linear-gradient';
			if (options.prefix) {
				fn = '-' + options.prefix + '-' + fn;
			}
				
			// transform color-stops
			var parts = this.colorStops.map(function(cs) {
				var pos = cs.position ? ' ' + cs.position + (cs.unit || '') : '';
				return cs.color + pos;
			});

			var dir = stringifyDirection(this.direction, !!options.prefix);
			if (!options.omitDefaultDirection || !~defaultDirections.indexOf(dir)) {
				parts.unshift(dir);
			}

			return fn + '(' + parts.join(', ') + ')';
		},

		stringifyOldWebkit: function() {
			var colorStops = this.colorStops.map(function(item) {
				return utils.clone(item);
			});
			
			// normalize color-stops position
			colorStops.forEach(function(cs) {
				if (!('position' in cs)) // implied position
					return;
				
				if (~cs.position.indexOf('.') || cs.unit == '%') {
					cs.position = parseFloat(cs.position) / (cs.unit == '%' ? 100 : 1);
				} else {
					throw "Can't convert color stop '" + (cs.position + (cs.unit || '')) + "'";
				}
			});
			
			this._fillImpliedPositions(colorStops);
			
			// transform color-stops into string representation
			colorStops = colorStops.map(function(cs, i) {
				if (!cs.position && !i) {
					return 'from(' + cs.color + ')';
				}
				
				if (cs.position == 1 && i == colorStops.length - 1) {
					return 'to(' + cs.color + ')';
				}
				
				return 'color-stop(' + (cs.position.toFixed(2).replace(/\.?0+$/, '')) + ', ' + cs.color + ')';
			});
			
			return '-webkit-gradient(linear, ' 
				+ oldWebkitDirection((this.direction + 180) % 360)
				+ ', '
				+ colorStops.join(', ')
				+ ')';
		},

		/**
		 * Fills-out implied positions in color-stops. This function is useful for
		 * old Webkit gradient definitions
		 */
		_fillImpliedPositions: function(colorStops) {
			var from = 0;
			
			colorStops.forEach(function(cs, i) {
				// make sure that first and last positions are defined
				if (!i) {
					return cs.position = cs.position || 0;
				}
				
				if (i == colorStops.length - 1 && !('position' in cs)) {
					cs.position = 1;
				}
				
				if ('position' in cs) {
					var start = colorStops[from].position || 0;
					var step = (cs.position - start) / (i - from);
					colorStops.slice(from, i).forEach(function(cs2, j) {
						cs2.position = start + step * j;
					});
					
					from = i;
				}
			});
		},

		valueOf: function() {
			return this.stringify();
		}
	};

	function normalizeSpace(str) {
		return utils.trim(str).replace(/\s+/g, ' ');
	}

	/**
	 * Resolves textual direction to degrees
	 * @param  {String} dir Direction to resolve
	 * @return {Number}
	 */
	function resolveDirection(dir) {
		if (typeof dir == 'number') {
			return dir;
		}

		dir = normalizeSpace(dir).toLowerCase();
		if (reDeg.test(dir)) {
			return +RegExp.$1;
		}

		var prefix = /^to\s/.test(dir) ? 'to ' : '';
		var left   = ~dir.indexOf('left')   && 'left';
		var right  = ~dir.indexOf('right')  && 'right';
		var top    = ~dir.indexOf('top')    && 'top';
		var bottom = ~dir.indexOf('bottom') && 'bottom';

		var key = normalizeSpace(prefix + (top || bottom || '') + ' ' + (left || right || ''));
		return directions[key] || 0;
	}

	/**
	 * Tries to find keyword for given direction, expressed in degrees
	 * @param  {Number} dir Direction (degrees)
	 * @param {Boolean} oldStyle Use old style keywords (e.g. "top" instead of "to bottom")
	 * @return {String}     Keyword or <code>Ndeg</code> expression
	 */
	function stringifyDirection(dir, oldStyle) {
		var reNewStyle = /^to\s/;
		var keys = Object.keys(directions).filter(function(k) {
			var hasPrefix = reNewStyle.test(k);
			return oldStyle ? !hasPrefix : hasPrefix;
		});

		for (var i = 0; i < keys.length; i++) {
			if (directions[keys[i]] == dir) {
				return keys[i];
			}
		}

		if (oldStyle) {
			dir = (dir + 270) % 360;
		}

		return dir + 'deg';
	}

	/**
	 * Creates direction definition for old Webkit gradients
	 * @param {String} direction
	 * @returns {String}
	 */
	function oldWebkitDirection(dir) {
		dir = stringifyDirection(dir, true);
		
		if(reDeg.test(dir)) {
			throw "The direction is an angle that can’t be converted.";
		}
		
		var v = function(pos) {
			return ~dir.indexOf(pos) ? '100%' : '0';
		};
		
		return v('left') + ' ' + v('top') + ', ' + v('right') + ' ' + v('bottom');
	}

	return {
		/**
		 * Parses gradient definition into an object.
		 * This object can be used to transform gradient into various
		 * forms
		 * @param  {String} gradient Gradient definition
		 * @return {LinearGradient}
		 */
		parse: function(gradient) {
			// cut out all redundant data
			if (this.isLinearGradient(gradient)) {
				gradient = gradient.replace(/^\s*[\-a-z]+\s*\(|\)\s*$/ig, '');
			} else {
				throw 'Invalid linear gradient definition:\n' + gradient;
			}

			return new LinearGradient(gradient);
		},

		/**
		 * Check if given string can be parsed as linear gradient
		 * @param  {String}  str
		 * @return {Boolean}
		 */
		isLinearGradient: function(str) {
			return reLinearGradient.test(str);
		},

		resolveDirection: resolveDirection,
		stringifyDirection: stringifyDirection
	};
});