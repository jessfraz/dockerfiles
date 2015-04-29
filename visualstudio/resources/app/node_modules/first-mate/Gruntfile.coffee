module.exports = (grunt) ->
  grunt.initConfig
    pkg: grunt.file.readJSON('package.json')

    coffee:
      glob_to_multiple:
        expand: true
        cwd: 'src'
        src: ['*.coffee']
        dest: 'lib'
        ext: '.js'

    coffeelint:
      options:
        no_empty_param_list:
          level: 'error'
        max_line_length:
          level: 'ignore'

      src: ['src/*.coffee']
      test: ['spec/*.coffee']
      gruntfile: ['Gruntfile.coffee']
      benchmark: ['benchmark/*.coffee']

    peg:
      glob_to_multiple:
        expand: true
        cwd: 'src'
        src: ['*.pegjs']
        dest: 'lib'
        ext: '.js'

    shell:
      test:
        command: 'node --harmony_collections node_modules/.bin/jasmine-focused --coffee --captureExceptions spec'
        options:
          stdout: true
          stderr: true
          failOnError: true

      'update-atomdoc':
        command: 'npm update grunt-atomdoc'
        options:
          stdout: true
          stderr: true
          failOnError: true

  grunt.loadNpmTasks('grunt-contrib-coffee')
  grunt.loadNpmTasks('grunt-shell')
  grunt.loadNpmTasks('grunt-coffeelint')
  grunt.loadNpmTasks('grunt-peg')
  grunt.loadNpmTasks('grunt-atomdoc')

  grunt.registerTask 'clean', ->
    require('rimraf').sync('lib')
    require('rimraf').sync('api.json')

  grunt.registerTask('lint', ['coffeelint'])
  grunt.registerTask('default', ['coffee', 'peg', 'lint'])
  grunt.registerTask('prepublish', ['clean', 'coffee', 'peg', 'lint', 'shell:update-atomdoc', 'atomdoc'])
  grunt.registerTask('test', ['default', 'shell:test'])
