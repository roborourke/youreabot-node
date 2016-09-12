var request = require('request');
var _ = require('underscore');

module.exports = function(text, callback) {
  
	if ( ! text ) {
	  return _.isFunction(callback) ? callback('') : '';
	}

	return request( {
	  method: 'POST',
	  url: 'https://api.textrazor.com/',
	  headers: {
	    "x-textrazor-key": process.env.TEXTRAZOR_KEY || ''
	  },
	  form: {
	    text: text,
	    extractors: 'entities,phrases,words'
	  }
	}, function(err, response, body) {
	  var result, nouns, sentences, pithyResponsePrefixes, locations, words, word, noun = [], scathingInsult = '';
	  
	  result = JSON.parse(body);
	  
	  pithyResponsePrefixes = [
			"you're a" //,
			//"your mum's a",
			//"your nan's a",
			//"your dad's a",
			//"your grandad's a",
		];
		
		if ( result && result.ok && result.response.nounPhrases ) {
		  nouns = result.response.nounPhrases;
		  sentences = result.response.sentences;
		  
		  locations = nouns[ _.random(0,nouns.length-1) ];
		  
		  words = sentences
		    .map(sentence => sentence.words)
		    .reduce((prev,current) => prev.concat(current), []);

		  _.each(locations.wordPositions, function(position) {
		    word = _.findWhere(words, { position: position });
			  
			  if ( ! word ) {
			    return;
			  }
			  
			  if ( word.partOfSpeech.match(/^(NN|JJ)/) ) {
			    noun.push(word.lemma);
			  }
			  
			  if ( word.partOfSpeech.match(/^(RB|VBN|VBG|VBD)/) ) {
			    noun.push(word.token);
			  }
		  });
		 
		  if ( noun.length ) {
		    scathingInsult += pithyResponsePrefixes[ _.random(0,pithyResponsePrefixes.length-1) ];
		    if ( noun[0].match(/^[aieou]/) ) {
		      scathingInsult += 'n';
		    }
		    scathingInsult += ' ' + noun.join(' ');
		  }  
		}
		
	  return _.isFunction(callback) ? callback(scathingInsult) : scathingInsult;
	} );

};