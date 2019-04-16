import  commonjs  from 'rollup-plugin-commonjs';
import  resolve  from 'rollup-plugin-node-resolve';

export default[{
  input: './js/src/externals.js',
  output: {
    file: './js/dist/externals.js',
    format: 'iife',
    name: 'parseColor'
  },
  plugins:[
    commonjs(),
    resolve()
  ]
},{
  input: './js/src/build.js',
  output: {
    file: './js/dist/animations.js',
    format : 'iife',
    name: 'animation',
    globals: {
      'parse-color': 'parseColor'
    }
  },
  external:['parse-color']
}];
