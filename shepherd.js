const fs = require('fs-extra')

process.settings.bases = []

module.exports = (shepherd) => {
  const dist = 'dist'

  const { copy, babel, compass, cleancss, concat } = shepherd.chains

  const srcPath = {
    resource: '{app/images/**/*,app/*}',
    options_js: 'app/scripts/{common,options}.js',
    background_js: 'app/scripts/background.js',
    content_js: '{app/scripts/{common,content}.js,node_modules/jquery/dist/jquery.js}',
    css: 'app/styles/**/*'
  }

  shepherd.task('copyResource', () => {
    return shepherd.src(srcPath.resource)
      .then(copy(dist, { bases: ['app/'] }))
      .then(shepherd.dest())
  })

  const scripts = (src, filename) => {
    return shepherd.src(src)
      .then(babel({
        perferSyntax: ['.js'],
        compileOptions: {
          presets: ['stage-0', 'es2015', 'es2015-loose'],
          plugins: []
        }
      }))
      .then(concat(`${dist}/scripts/${filename}`, {
        order: [
          'node_modules/jquery/dist/jquery.js',
          'app/scripts/common.js',
          '...'
        ]
      }))
      .then(shepherd.dest())
  }

  shepherd.task('background_js', () => scripts(srcPath.background_js, 'background.js'))
  shepherd.task('options_js', () => scripts(srcPath.options_js, 'options.js'))
  shepherd.task('content_js', () => scripts(srcPath.content_js, 'content.js'))

  shepherd.task('script', ['background_js', 'options_js', 'content_js'])

  shepherd.task('css', () => {
    return shepherd.src(srcPath.css)
      .then(compass())
      .then(copy(dist, { bases: ['app/'] }))
      .then(cleancss())
      .then(shepherd.dest())
  })

  shepherd.task('clean', () => {
    return Promise.resolve(
      fs.emptyDirSync(dist)
    )
  })

  shepherd.task('default', ['clean'], () => {
    return shepherd.run(['copyResource', 'script', 'css'])
  })

  shepherd.task('watch', ['clean'], () => {
    shepherd.watch(srcPath.resource, ['copyResource'])
    shepherd.watch('app/scripts/**/*', ['script'])
    shepherd.watch(srcPath.css, ['css'])
  })
}
