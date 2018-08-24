var client = require('redis').createClient('redis://h:pfa32d86610f60f897ee0702482e41cc8ec66524df29453a1ab46fdbc2cf039da@ec2-107-23-150-142.compute-1.amazonaws.com:50419');

client.on('connect', function() {
	console.log('Redis client connected');
});

client.on('error', function (err) {
	console.log('Something went wrong ' + err);
});

client.set('my test key', 'my test value', redis.print);
client.get('my test key', function (error, result) {
	if (error) {
		console.log(error);
		throw error;
	}
	console.log('GET result ->' + result);
});