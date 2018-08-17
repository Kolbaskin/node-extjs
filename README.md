node-extjs
==========

Sencha's (http://www.sencha.com) ExtJS 4 library running under NodeJS (http://www.nodejs.org)

Only includes those objects and components necessary to use ExtJS as a core library with Node.

Also includes some custom extensions to ExtJS to further enhance the library. These are slightly opinionated 
but work.

This utilizes Node's built-in CommonJS loader system to properly load the necessary ExtJS source files. This retains the full stack trace in errors (other implementations have used eval to load the library).


Installation
------------

(Requires NodeJS 0.6.x or higher)

	npm install node-extjs-core

Usage 
--------------

	require("node-extjs-core");
	
	Ext.BaseDir = __dirname;

    Ext.Loader.setConfig({
        enabled: true,
        paths: {
            Lib: Ext.BaseDir + '/lib',
        }
    });
    
    const MyClass = Ext.create('Lib.MyClass');
    
    MyClass.doSomething(...).then(...)

lib/MyClass.js 
--------------
    Ext.define('Lib.MyClass', {
        
        async doSomething(params) {
            .....
            return <result>
        }
        
    })

License
-------

ExtJS is a fully licensed product for use in commercial projects or under GPL for open source projects. It is assumed that if you're using node-extjs that you will conform to the licensing requirements of Sencha (http://www.sencha.com/products/extjs/license/);


