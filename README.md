# hotpack-eslint

eslint  plugin for [hotpack](https://github.com/duhongwei/hotpack)

## usage
```js
import  babel from '@duhongwei/hotpack-eslint'
export default {
  {
    name: 'eslint',
    use: eslint,
    opt: {
      //eslint options,default is {}
      eslintOpt: { },
      /**
       * default value is 0
       * 
       * 0 no abort 
       * 1 abort program if there are errors
       * 2 abort program if there are wainings or errors
      */
      abort:0
    }
  }
}
```

### eslintOpt
the same as eslint constructor options

```js
const eslint = new ESLint(options);
```

[detail](https://eslint.org/docs/developer-guide/nodejs-api#-new-eslintoptions)
