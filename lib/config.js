var environments = {};

environments.staging = {
    'port': 3000,
    'envName': 'staging',
    'hashingSecret': 'thisIsASecret'
}

environments.production = {
    'port': 5000,
    'envName': 'production',
    'hashingSecret': 'thisIsASecret'
}

var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';

var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport;