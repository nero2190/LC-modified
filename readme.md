# Dev environment for LaunchCart DEMO 2019
The environment is to use for cording LaunchCart DEMO 2019.  

## Requirement
* Node.js
* npm

## Configuration files
* package.json
* gulpfile.js - This file will give you a taste of what gulp does.
* .browserslistrc - The config to share target browsers and Node.js versions between different front-end tools. https://www.npmjs.com/package/browserslist
* tsconfig.json - The presence of a tsconfig.json file in a directory indicates that the directory is the root of a TypeScript project. https://www.typescriptlang.org/tsconfig

## Installation
* Run the following command in terminal  
  ```npm i```

## Comand
* ```npx gulp``` - build the publish files and start the server for development
* ```npx gulp build``` - only build the publish files

## Directory structure
```
/
├── templates/ - contain the LaunchCart template files
├── dev_src/ - contain the development files  
│   ├── pug/   - html templates by Pug  
│   │   └── _include/ - common included files (_header, _footer, _layout etc.)  
│   ├── scss/  - scss files  
│   │   ├── styles.scss - import scss files  
│   │   ├── base/       - common base files
│   │   │   ├── _base.scss      - common elements styles  
│   │   │   ├── _variable.scss  - common variable  
│   │   │   ├── _mixin.scss     - common mixin  
│   │   │   └── _keyframes.scss - common keyframes for animation  
│   │   ├── layout/    - layout styles (_header, _footer, _layout etc.)  
│   │   └── component/ - other component files (plugins styles etc.)  
│   ├── ts/    - typescript files  
│   │   ├── common.ts - base file 
│   │   └── modules/  - 
│   │       ├── window.d.ts    - script for declare window object  
│   │       ├── checkDevice.ts - script for responsive design  
│   │       ├── header.ts      - script for the control of header   
│   │       ├── animation.ts   - script for animation  
│   │       └── component.ts   - other script  
│   ├── js/    - javascript files  
│   │   └── lib/ - libliry and plugin script files (jQuery, Slick etc.)  
│   └── files/ - other files (images, fonts etc.)  
├── dist/ - contain the builded publish files from dev_src/
│   └── assets/ - assets  
│       ├── css/ - css files
│       ├── js/  - js files
│       └── img/ - image files
└── templates/ - LC design templates (master template)
    ├── index/    - インデックス テンプレート
    ├── archive/  - アーカイブ テンプレート
    ├── module/   - モジュール テンプレート
    ├── system/   - システム テンプレート
    └── user/     - ユーザー テンプレート  
```