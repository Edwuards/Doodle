export default {
  input: './src/js/geometry.js',
  output: {
    file: './public/js/geometry.js',
    format : 'iife',
    name: 'animation',
    globals: {
      'parse-color': 'parseColor'
    }
  },
};
