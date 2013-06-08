var redis = require('redis').createClient();
	redis.dynfunc = function(){};//stub

exports.list = function(req, res){
	redis.keys(req.params.q+'*',function(err,reply){
		res.send(reply.slice(0,100));
	});
};
//determine key based on redis type
//call appropriate redis method
exports.getKey = function(req, res){
	redis.type(req.params.key,function(err,reply){
		var params = [];

		/*
		 visual redis administration
		*/
		var transform = function(s){ return s;}

		switch(reply){
			case 'zset':
				redis.dynfunc = redis.zrange;
				params = ['0', '-1', 'withscores'];
				transform = function(l){
					var objs=[];
					for(var i=1;i<l.length;i+=2){
						objs.push({
							key:l[i-1],
							value:l[i]
						})
					}
					return objs;
				}
			break;
			case 'hash':
				redis.dynfunc = redis.hgetall;
			break;
			case 'string':
				redis.dynfunc = redis.get;
			break;
			case 'list':
				redis.dynfunc = redis.lrange;
				params = ['0','100'];
			break;
			case 'set':
				redis.dynfunc = redis.smembers;
			break;
		}
		params.unshift(req.params.key)

		redis.dynfunc(params,function(e,r){
			res.send( transform(r) );
		});
	});
};