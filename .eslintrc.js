module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "globals": {
        "CONFIG": true,
        "ReS": true,
        "compareDate": true,
        "TE": true,
        "pe": true,
        "to": true,
        "RE": true,
        "ReE": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "rules": {
	    "no-unused-vars": 0,
	    "no-empty": ["error", { "allowEmptyCatch": true }],
        "indent": [
            "error",
            "tab"
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
