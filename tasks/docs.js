var gulp = require('gulp')
var config = require('../gulpconfig.js')
var esdoc = require('gulp-esdoc')

gulp.task('_docs', ['_docs_api'])

gulp.task('_docs_api', function() {
  return gulp.src('source/')
    .pipe(esdoc({
      lint: false,
      destination: 'build/docs/api',
      plugins: [
        {name:'./tasks/esdoc-plugins/properMembers.js'},
        {name:'./tasks/esdoc-plugins/forceTags.js'},
      ]
    }))
});
