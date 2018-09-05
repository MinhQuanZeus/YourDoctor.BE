var client = require('redis').createClient('redis://h:pfa32d86610f60f897ee0702482e41cc8ec66524df29453a1ab46fdbc2cf039da@ec2-107-23-150-142.compute-1.amazonaws.com:50419');

client.on('connect', function() {
});

client.on('error', function (err) {
});

client.get('my test key', function (error, result) {
	if (error) {
		throw error;
	}
});
