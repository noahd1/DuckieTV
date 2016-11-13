/**
 * Fanart API v3 service
 * docs: http://docs.fanarttv.apiary.io/#
 */
DuckieTV.factory('FanartService', ["$q", "$http", function($q, $http) {
        var endpoint = 'http://webservice.fanart.tv/v3/tv/';
        var API_KEY = "mæ¶ën|{W´íïtßg½÷¾6mÍ9Õýß";

        var cache = {};

        function getUrl(tvdb_id) {
            return [endpoint, tvdb_id, '?api_key=', btoa(API_KEY)].join('');
        }

        var service = {
            initialize: function() {
            
            },
            get: function(tvdb_id) {
                return $q(function(resolve, reject) {
                    if((tvdb_id in cache)) {
                        //console.debug('Using cache', cache[tvdb_id].name);
                        return resolve(cache[tvdb_id]);
                    }
                    return $http.get(getUrl(tvdb_id)).then(function(result) {
                        Object.keys(result.data).forEach(function(key) {
                            // for all but the season posters, keep only the first url
                            if (key !== 'seasonposter' && key !== 'name' && key !== 'thetvdb_id') {
                                var url = result.data[key].slice(0);
                                result.data[key] = [{url: url[0].url}];
                            }
                        });                        
                        //console.debug('Fetched', result.data.name, result.data);
                        cache[tvdb_id] = result.data;
                        service.store();
                        return resolve(result.data);
                    }, function(error) {
                        //console.debug(error.status, error.statusText, error);
                        return resolve(null);
                    });    
                })  
            },
            getTrendingPoster: function(fanart) {
                //console.debug('fanart.getTrendingPoster', fanart);
                if (!fanart) {
                    return null;
                }
                if (!('tvposter' in fanart) && !('clearlogo' in fanart) && ('hdtvlogo' in fanart)) {
                    return fanart.hdtvlogo[0].url.replace('/fanart','/preview');
                }
                if (!('tvposter' in fanart) && ('clearlogo' in fanart)) {
                    return fanart.clearlogo[0].url.replace('/fanart','/preview');
                }
                if ('tvposter' in fanart) {
                    return fanart.tvposter[0].url.replace('/fanart','/preview');
                }

                return null;
            },
            getSeasonPoster: function(seasonnumber, fanart) {
                //console.debug('fanart.getSeasonPoster', seasonnumber, fanart);
                if (!fanart) {
                    return null;
                }
                if(('seasonposter' in fanart)) {
                    var hit = fanart.seasonposter.filter(function(image) {
                        return parseInt(image.season) == parseInt(seasonnumber);
                    });
                    if(hit && hit.length > 0) {
                        return hit[0].url;
                    }
                }
                if(('tvposter' in fanart)) {
                    return fanart.tvposter[0].url.replace('/fanart','/preview');
                }

                return null;
            },
            getEpisodePoster: function(fanart) {
                //console.debug('fanart.getEpisodePoster', fanart);
                if (!fanart) {
                    return null;
                }
                if(('tvthumb' in fanart)) {
                    return fanart.tvthumb[0].url;
                }
                if('hdtvlogo' in fanart) {
                    return fanart.hdtvlogo[0].url;
                }
                return null;
            },
            store: function() {
                localStorage.setItem('fanart.cache', JSON.stringify(cache));
            },
            restore: function() {
                if(localStorage.getItem('fanart.cache')) {
                    console.info('Loading localStorage fanart.cache');
                    cache = JSON.parse(localStorage.getItem('fanart.cache'));
                } else {
                    console.info('Loading file fanart.cache.json');
                    $http.get('fanart.cache.json').then(function(result) {
                        cache = result.data;
                        service.store();
                    });
                }
            }
        };
        service.restore();
        return service;
    }
]);