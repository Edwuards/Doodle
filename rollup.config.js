export default {
  input: './src/js/index.js',
  output: {
    file: './public/js/index.js',
    format : 'iife',
    name: 'animation',
    globals: {
      'parse-color': 'parseColor'
    }
  },
};
