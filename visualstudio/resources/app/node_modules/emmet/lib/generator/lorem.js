/**
 * "Lorem ipsum" text generator. Matches <code>lipsum(num)?</code> or 
 * <code>lorem(num)?</code> abbreviation.
 * This code is based on Django's contribution: 
 * https://code.djangoproject.com/browser/django/trunk/django/contrib/webdesign/lorem_ipsum.py
 * <br><br>
 * Examples to test:<br>
 * <code>lipsum</code> – generates 30 words text.<br>
 * <code>lipsum*6</code> – generates 6 paragraphs (autowrapped with &lt;p&gt; element) of text.<br>
 * <code>ol>lipsum10*5</code> — generates ordered list with 5 list items (autowrapped with &lt;li&gt; tag)
 * with text of 10 words on each line.<br>
 * <code>span*3>lipsum20</code> – generates 3 paragraphs of 20-words text, each wrapped with &lt;span&gt; element.
 * Each paragraph phrase is unique.   
 */
if (typeof module === 'object' && typeof define !== 'function') {
	var define = function (factory) {
		module.exports = factory(require, exports, module);
	};
}

define(function(require, exports, module) {
	var prefs = require('../assets/preferences');

	var langs = {
		en: {
			common: ['lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipisicing', 'elit'],
			words: ['exercitationem', 'perferendis', 'perspiciatis', 'laborum', 'eveniet',
				'sunt', 'iure', 'nam', 'nobis', 'eum', 'cum', 'officiis', 'excepturi',
				'odio', 'consectetur', 'quasi', 'aut', 'quisquam', 'vel', 'eligendi',
				'itaque', 'non', 'odit', 'tempore', 'quaerat', 'dignissimos',
				'facilis', 'neque', 'nihil', 'expedita', 'vitae', 'vero', 'ipsum',
				'nisi', 'animi', 'cumque', 'pariatur', 'velit', 'modi', 'natus',
				'iusto', 'eaque', 'sequi', 'illo', 'sed', 'ex', 'et', 'voluptatibus',
				'tempora', 'veritatis', 'ratione', 'assumenda', 'incidunt', 'nostrum',
				'placeat', 'aliquid', 'fuga', 'provident', 'praesentium', 'rem',
				'necessitatibus', 'suscipit', 'adipisci', 'quidem', 'possimus',
				'voluptas', 'debitis', 'sint', 'accusantium', 'unde', 'sapiente',
				'voluptate', 'qui', 'aspernatur', 'laudantium', 'soluta', 'amet',
				'quo', 'aliquam', 'saepe', 'culpa', 'libero', 'ipsa', 'dicta',
				'reiciendis', 'nesciunt', 'doloribus', 'autem', 'impedit', 'minima',
				'maiores', 'repudiandae', 'ipsam', 'obcaecati', 'ullam', 'enim',
				'totam', 'delectus', 'ducimus', 'quis', 'voluptates', 'dolores',
				'molestiae', 'harum', 'dolorem', 'quia', 'voluptatem', 'molestias',
				'magni', 'distinctio', 'omnis', 'illum', 'dolorum', 'voluptatum', 'ea',
				'quas', 'quam', 'corporis', 'quae', 'blanditiis', 'atque', 'deserunt',
				'laboriosam', 'earum', 'consequuntur', 'hic', 'cupiditate',
				'quibusdam', 'accusamus', 'ut', 'rerum', 'error', 'minus', 'eius',
				'ab', 'ad', 'nemo', 'fugit', 'officia', 'at', 'in', 'id', 'quos',
				'reprehenderit', 'numquam', 'iste', 'fugiat', 'sit', 'inventore',
				'beatae', 'repellendus', 'magnam', 'recusandae', 'quod', 'explicabo',
				'doloremque', 'aperiam', 'consequatur', 'asperiores', 'commodi',
				'optio', 'dolor', 'labore', 'temporibus', 'repellat', 'veniam',
				'architecto', 'est', 'esse', 'mollitia', 'nulla', 'a', 'similique',
				'eos', 'alias', 'dolore', 'tenetur', 'deleniti', 'porro', 'facere',
				'maxime', 'corrupti']
		},
		sp: {
			common: ['mujer', 'uno', 'dolor', 'más', 'de', 'poder', 'mismo', 'si'],
			words: ['ejercicio', 'preferencia', 'perspicacia', 'laboral', 'paño',
				'suntuoso', 'molde', 'namibia', 'planeador', 'mirar', 'demás', 'oficinista', 'excepción',
				'odio', 'consecuencia', 'casi', 'auto', 'chicharra', 'velo', 'elixir',
				'ataque', 'no', 'odio', 'temporal', 'cuórum', 'dignísimo',
				'facilismo', 'letra', 'nihilista', 'expedición', 'alma', 'alveolar', 'aparte',
				'león', 'animal', 'como', 'paria', 'belleza', 'modo', 'natividad',
				'justo', 'ataque', 'séquito', 'pillo', 'sed', 'ex', 'y', 'voluminoso',
				'temporalidad', 'verdades', 'racional', 'asunción', 'incidente', 'marejada',
				'placenta', 'amanecer', 'fuga', 'previsor', 'presentación', 'lejos',
				'necesariamente', 'sospechoso', 'adiposidad', 'quindío', 'pócima',
				'voluble', 'débito', 'sintió', 'accesorio', 'falda', 'sapiencia',
				'volutas', 'queso', 'permacultura', 'laudo', 'soluciones', 'entero',
				'pan', 'litro', 'tonelada', 'culpa', 'libertario', 'mosca', 'dictado',
				'reincidente', 'nascimiento', 'dolor', 'escolar', 'impedimento', 'mínima',
				'mayores', 'repugnante', 'dulce', 'obcecado', 'montaña', 'enigma',
				'total', 'deletéreo', 'décima', 'cábala', 'fotografía', 'dolores',
				'molesto', 'olvido', 'paciencia', 'resiliencia', 'voluntad', 'molestias',
				'magnífico', 'distinción', 'ovni', 'marejada', 'cerro', 'torre', 'y',
				'abogada', 'manantial', 'corporal', 'agua', 'crepúsculo', 'ataque', 'desierto',
				'laboriosamente', 'angustia', 'afortunado', 'alma', 'encefalograma',
				'materialidad', 'cosas', 'o', 'renuncia', 'error', 'menos', 'conejo',
				'abadía', 'analfabeto', 'remo', 'fugacidad', 'oficio', 'en', 'almácigo', 'vos', 'pan',
				'represión', 'números', 'triste', 'refugiado', 'trote', 'inventor',
				'corchea', 'repelente', 'magma', 'recusado', 'patrón', 'explícito',
				'paloma', 'síndrome', 'inmune', 'autoinmune', 'comodidad',
				'ley', 'vietnamita', 'demonio', 'tasmania', 'repeler', 'apéndice',
				'arquitecto', 'columna', 'yugo', 'computador', 'mula', 'a', 'propósito',
				'fantasía', 'alias', 'rayo', 'tenedor', 'deleznable', 'ventana', 'cara',
				'anemia', 'corrupto']
		},
		ru: {
			common: ['далеко-далеко', 'за', 'словесными', 'горами', 'в стране', 'гласных', 'и согласных', 'живут', 'рыбные', 'тексты'],
			words: ['вдали', 'от всех', 'они', 'буквенных', 'домах', 'на берегу', 'семантика', 
				'большого', 'языкового', 'океана', 'маленький', 'ручеек', 'даль', 
				'журчит', 'по всей', 'обеспечивает', 'ее','всеми', 'необходимыми', 
				'правилами', 'эта', 'парадигматическая', 'страна', 'которой', 'жаренные', 
				'предложения', 'залетают', 'прямо', 'рот', 'даже', 'всемогущая', 
				'пунктуация', 'не', 'имеет', 'власти', 'над', 'рыбными', 'текстами', 
				'ведущими', 'безорфографичный', 'образ', 'жизни', 'однажды', 'одна', 
				'маленькая', 'строчка','рыбного', 'текста', 'имени', 'lorem', 'ipsum', 
				'решила', 'выйти', 'большой', 'мир', 'грамматики', 'великий', 'оксмокс', 
				'предупреждал', 'о', 'злых', 'запятых', 'диких', 'знаках', 'вопроса', 
				'коварных', 'точках', 'запятой', 'но', 'текст', 'дал', 'сбить', 
				'себя', 'толку', 'он', 'собрал', 'семь', 'своих', 'заглавных', 'букв', 
				'подпоясал', 'инициал', 'за', 'пояс', 'пустился', 'дорогу', 
				'взобравшись', 'первую', 'вершину', 'курсивных', 'гор', 'бросил', 
				'последний', 'взгляд', 'назад', 'силуэт', 'своего', 'родного', 'города', 
				'буквоград', 'заголовок', 'деревни', 'алфавит', 'подзаголовок', 'своего', 
				'переулка', 'грустный', 'реторический', 'вопрос', 'скатился', 'его', 
				'щеке', 'продолжил', 'свой', 'путь', 'дороге', 'встретил', 'рукопись', 
				'она', 'предупредила',  'моей', 'все', 'переписывается', 'несколько', 
				'раз', 'единственное', 'что', 'меня', 'осталось', 'это', 'приставка', 
				'возвращайся', 'ты', 'лучше', 'свою', 'безопасную', 'страну', 'послушавшись', 
				'рукописи', 'наш', 'продолжил', 'свой', 'путь', 'вскоре', 'ему', 
				'повстречался', 'коварный', 'составитель', 'рекламных', 'текстов', 
				'напоивший', 'языком', 'речью', 'заманивший', 'свое', 'агенство', 
				'которое', 'использовало', 'снова', 'снова', 'своих', 'проектах', 
				'если', 'переписали', 'то', 'живет', 'там', 'до', 'сих', 'пор']
		}
	};

	
	prefs.define('lorem.defaultLang', 'en', 
		'Default language of generated dummy text. Currently, <code>en</code>\
		and <code>ru</code> are supported, but users can add their own syntaxes\
		see <a href="http://docs.emmet.io/abbreviations/lorem-ipsum/">docs</a>.');
	prefs.define('lorem.omitCommonPart', false,
		'Omit commonly used part (e.g. “Lorem ipsum dolor sit amet“) from generated text.');
	
	/**
	 * Returns random integer between <code>from</code> and <code>to</code> values
	 * @param {Number} from
	 * @param {Number} to
	 * @returns {Number}
	 */
	function randint(from, to) {
		return Math.round(Math.random() * (to - from) + from);
	}
	
	/**
	 * @param {Array} arr
	 * @param {Number} count
	 * @returns {Array}
	 */
	function sample(arr, count) {
		var len = arr.length;
		var iterations = Math.min(len, count);
		var result = [];
		while (result.length < iterations) {
			var randIx = randint(0, len - 1);
			if (!~result.indexOf(randIx)) {
				result.push(randIx);
			}
		}
		
		return result.map(function(ix) {
			return arr[ix];
		});
	}
	
	function choice(val) {
		if (typeof val === 'string')
			return val.charAt(randint(0, val.length - 1));
		
		return val[randint(0, val.length - 1)];
	}
	
	function sentence(words, end) {
		if (words.length) {
			words[0] = words[0].charAt(0).toUpperCase() + words[0].substring(1);
		}
		
		return words.join(' ') + (end || choice('?!...')); // more dots than question marks
	}
	
	/**
	 * Insert commas at randomly selected words. This function modifies values
	 * inside <code>words</code> array 
	 * @param {Array} words
	 */
	function insertCommas(words) {
		var len = words.length;

		if (len < 2) {
			return;
		}

		var totalCommas = 0;
		if (len > 3 && len <= 6) {
			totalCommas = randint(0, 1);
		} else if (len > 6 && len <= 12) {
			totalCommas = randint(0, 2);
		} else {
			totalCommas = randint(1, 4);
		}

		for (var i = 0, pos, word; i < totalCommas; i++) {
			pos = randint(0, words.length - 2);
			word = words[pos];
			if (word.charAt(word.length - 1) !== ',') {
				words[pos] += ',';
			}
		}
	}
	
	/**
	 * Generate a paragraph of "Lorem ipsum" text
	 * @param {Number} wordCount Words count in paragraph
	 * @param {Boolean} startWithCommon Should paragraph start with common 
	 * "lorem ipsum" sentence.
	 * @returns {String}
	 */
	function paragraph(lang, wordCount, startWithCommon) {
		var data = langs[lang];
		if (!data) {
			return '';
		}

		var result = [];
		var totalWords = 0;
		var words;
		
		wordCount = parseInt(wordCount, 10);
		
		if (startWithCommon && data.common) {
			words = data.common.slice(0, wordCount);
			if (words.length > 5) {
				words[4] += ',';
			}
			totalWords += words.length;
			result.push(sentence(words, '.'));
		}
		
		while (totalWords < wordCount) {
			words = sample(data.words, Math.min(randint(2, 30), wordCount - totalWords));
			totalWords += words.length;
			insertCommas(words);
			result.push(sentence(words));
		}
		
		return result.join(' ');
	}

	return {
		/**
		 * Adds new language words for Lorem Ipsum generator
		 * @param {String} lang Two-letter lang definition
		 * @param {Object} data Words for language. Maight be either a space-separated 
		 * list of words (String), Array of words or object with <code>text</code> and
		 * <code>common</code> properties
		 */
		addLang: function(lang, data) {
			if (typeof data === 'string') {
				data = {
					words: data.split(' ').filter(function(item) {
						return !!item;
					})
				};
			} else if (Array.isArray(data)) {
				data = {words: data};
			}

			langs[lang] = data;
		},
		preprocessor: function(tree) {
			var re = /^(?:lorem|lipsum)([a-z]{2})?(\d*)$/i, match;
			var allowCommon = !prefs.get('lorem.omitCommonPart');
			
			/** @param {AbbreviationNode} node */
			tree.findAll(function(node) {
				if (node._name && (match = node._name.match(re))) {
					var wordCound = match[2] || 30;
					var lang = match[1] || prefs.get('lorem.defaultLang') || 'en';
					
					// force node name resolving if node should be repeated
					// or contains attributes. In this case, node should be outputed
					// as tag, otherwise as text-only node
					node._name = '';
					node.data('forceNameResolving', node.isRepeating() || node.attributeList().length);
					node.data('pasteOverwrites', true);
					node.data('paste', function(i) {
						return paragraph(lang, wordCound, !i && allowCommon);
					});
				}
			});
		}
	};
});
