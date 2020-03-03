var HelperNamespace = (function () {
  /**
   * @desc Build a list of all the files that are children of a directory
   * @param {string} dir The directory to search
   * @param {list} filelist The list of the directories/files already detected
   * @param {string} ext The extension to filter for the files
   */
  function walkSync(dir, filelist, ext) {
    var path = path || require('path');
    var fs = fs || require('fs'),
      files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        filelist = walkSync(path.join(dir, file), filelist, ext);
      }
      else {
        if (file.indexOf(ext) > 0)
          filelist.push(path.join(dir, file));
      }
    });
    return filelist;
  }

  /**
   * @desc search in the file in parameter to detect the tags
   */
  function searchInFile(path, regex) {
    var fs = fs || require('fs');
    // load the file
    var fileContent = fs.readFileSync(path, 'utf8');
    var strArray = [];
    // match all the groups
    var match = regex.exec(fileContent);
    while (match != null) {
      strArray.push(match[1].replace(/\s+/g, ' '));
      match = regex.exec(fileContent);
    }
    return strArray;
  }

  /** Locale-aware sort */
  function localeSort(a, b) { return a.localeCompare(b); }

  // '.t("")' or '{t("")' or ' t("")' or '(t("")' or '[t("")'
  // '.t(``)' or '{t(``)' or ' t(``)' or '(t(``)' or '[t(``)'
  // Also finds ' t("some {{data}}", \n {data})'
  var T_REGEX = /[.{[(\s]t\(["`]([\w\s{}().,:'\-=\\?\/%!]*)["`],*\s*.*\)/g;

  // '``'
  var C_REGEX = /[`]([\w\s{}().,:'\-=\/\\?"+!]*)[`].*/g;

  /** Some additional phrases the regex can't find. */
  var EXTRA_TAGS = [
    "Fun", "Warn", "Controls", "Device", "Farm Designer", "on",
    "Map Points", "Spread", "Row Spacing", "Height", "Taxon",
    "Growing Degree Days", "Svg Icon", "Invalid date", "yes", "Tools",
    "Messages", "Sequence Editor", "Commands", "Regimen Editor", "Scheduler",
    "Farmware List", "SYNC NOW", "Test", "SYNCING", "SYNCED", "UNKNOWN",
    "Else Execute", "Connecting FarmBot to the Internet", "move to home",
    "emergency stop", "SYNC ERROR", "inactive", "error", "No messages.",
    "back to regimens", "back to sequences", "back to farmware list",
    "Verify Password",
  ];

  /**
   * Get all the tags in the files with extension .ts of the current project
   */
  function getAllTags() {
    var srcPath = __dirname + '/../../../frontend';

    var listFilteredFiles = walkSync(srcPath, [], '.ts');
    var allTags = listFilteredFiles.map(function (x) {
      return searchInFile(x, T_REGEX);
    });
    var constantsTags = searchInFile(srcPath + '/constants.ts', C_REGEX);

    // flatten list of list in a simple list
    var flatAllTags = [].concat.apply([], allTags);
    var flatConstantsTags = [].concat.apply([], constantsTags);
    var flatExtraTags = [].concat.apply([], EXTRA_TAGS);
    var flattenedTags = [].concat.apply([],
      [flatAllTags, flatConstantsTags, flatExtraTags]);

    // distinct
    var uniq = Array.from(new Set(flattenedTags));

    var sorted = uniq.sort(localeSort);

    return sorted;
  }

  /**
   * For debugging
   */
  function logAllTags() {
    console.dir(getAllTags());
  }

  /** For debugging. Replace all characters except whitespace and {{ words }} */
  function repl(string, character) {
    var parts = string.split("{{");
    if (parts.length < 2) { return string.replace(/\S/g, character); }
    var insideAndAfter = parts[1].split("}}");
    var before = parts[0].replace(/\S/g, character);
    var inside = insideAndAfter[0];
    var after = insideAndAfter[1].replace(/\S/g, character);
    var firstPart = [before, inside].join("{{");
    return [firstPart, after].join("}}");
  }

  /** For debugging. Replace all translations with a debug string. */
  function replaceWithDebugString(key, debugString, debugStringOption) {
    var debugChar = debugString[0];
    switch (debugStringOption) {
      case 'r': return debugString; // replace with: string as provided
      case 's': return debugChar; // single character
      case 'n': return repl(key, debugChar); // maintain whitespace
      case 'l': return debugChar.repeat(key.length); // replace whitespace
      default: return key;
    }
  }

  var metrics = [];
  /** Generate translation summary data for all languages. */
  function generateMetrics() {
    var languageCodes = walkSync(__dirname, [], '.json')
      .filter(function (s) { return !s.includes('en.js'); })
      .filter(function (s) { return !(s.includes('metrics') || s.includes('.md')); })
      .map(function (s) { return s.slice(-'en.json'.length, -'.json'.length); });
    var fs = fs || require('fs');
    var markdown = '';
    languageCodes.map(function (lang) {
      return createOrUpdateTranslationFile(lang, true);
    });
    // console.log(metrics);
    // var jsonMetrics = JSON.stringify(metrics, undefined, 2);
    // fs.writeFileSync(__dirname + '/metrics.json', jsonMetrics);
    markdown += '# Translation summary\n\n';
    markdown += '_This summary was automatically generated by running the';
    markdown += ' language helper._\n\n';
    markdown += 'Auto-sort and generate translation file contents using:\n\n';
    markdown += '```bash\nnode public/app-resources/languages/_helper.js en\n```\n\n';
    markdown += 'Where `en` is your language code.\n\n';
    markdown += 'Translation file format can be checked using:\n\n';
    markdown += '```bash\nnpm run translation-check\n```\n\n';
    markdown += '_Note: If using Docker, add `sudo docker-compose run web`';
    markdown += ' before the commands.\nFor example, `sudo docker-compose';
    markdown += ' run web npm run translation-check`._\n\n';
    markdown += 'See the [README](https://github.com/FarmBot/Farmbot-Web-App';
    markdown += '#translating-the-web-app-into-your-language) for contribution';
    markdown += ' instructions.\n\n';
    markdown += 'Total number of phrases identified by the language helper';
    markdown += ' for translation: __' + metrics[0].current + '__\n\n';
    markdown += '|Language|Percent translated';
    markdown += '|Translated|Untranslated|Other Translations|\n';
    markdown += '|:---:|---:|---:|---:|---:|\n';
    metrics.map(function (langMetrics) {
      markdown += '|' + langMetrics.language;
      markdown += '|' + langMetrics.percent + '%';
      markdown += '|' + langMetrics.translated;
      markdown += '|' + langMetrics.untranslated;
      markdown += '|' + langMetrics.orphans;
      markdown += '|\n';
    });
    markdown += '\n**Percent translated** refers to the percent of phrases';
    markdown += ' identified by the\nlanguage helper that have been';
    markdown += ' translated. Additional phrases not identified\n';
    markdown += 'by the language helper may exist in the Web App.\n\n';
    markdown += '\n**Untranslated** includes phrases not yet translated';
    markdown += ' or phrases that do not\nneed translation. Phrases that are';
    markdown += ' identical before and after translation\ncan be moved to';
    markdown += ' `translated` to indicate translation status to the language';
    markdown += '\nhelper.\n\n';
    markdown += '**Other Translations** include translated phrases';
    markdown += ' that do not match any of\nthe phrases identified by the';
    markdown += ' language helper. These are usually phrases\nnot identified';
    markdown += ' by the language helper or phrases that have been changed';
    markdown += '\nor removed from the Web App.';
    markdown += '\n';
    fs.writeFileSync(__dirname + '/translation_metrics.md', markdown);
  }

  /** Print some translation file status metrics. */
  function generateSummary(args) {
    // {foundTags, unmatchedTags, untranslated, translated, countExisting, langCode}
    var current = Object.keys(args.foundTags).length;
    var orphans = Object.keys(args.unmatchedTags).length;
    var untranslated = Object.keys(args.untranslated).length;
    var translated = Object.keys(args.translated).length;
    var total = untranslated + translated + orphans;
    var percent = Math.round(translated / current * 100);
    var existingUntranslated = args.countExisting - translated;
    if (!args.metricsOnly) {
      console.log(current + ' strings found.');
      console.log('  ' + args.countExisting + ' existing items match.');
      console.log('    ' + translated + ' existing translations match.');
      console.log('    ' + existingUntranslated + ' existing untranslated items.');
      console.log('  ' + (current - args.countExisting) + ' new items added.');
      console.log(percent + '% of found strings translated.');
      console.log(orphans + ' unused, outdated, or extra items.');
      console.log('Updated file (' + args.langCode + '.js) with ' + total + ' items.');
    }
    return {
      percent: percent, orphans: orphans, total: total, untranslated: untranslated,
      current: current, translated: translated, language: args.langCode
    };
  }

  /**
   * Create the translation file or update it with new tags
   * The tags are in the following order:
   * 1. New tags in English that need to be translated (ASC)
   * 2. Tags already translated that match an existing tag in src (ASC)
   * 3. Tags already in the file before but not found at the moment in src (ASC)
   * @param {string} lang The short name of the language.
   */
  function createOrUpdateTranslationFile(lang, metricsOnly) {
    lang = lang || 'en';

    // check current file entry
    var langFilePath = __dirname + '/' + lang + '.json';
    var fs = fs || require('fs');

    try {
      var columnsResult = HelperNamespace.getAllTags();

      var jsonCurrentTagData = {};
      columnsResult.forEach(function (column) {
        jsonCurrentTagData[column] = column;
      });

      var ordered = {};
      var translatedKeys = [];
      var fileContent;
      try {
        // check the file can be opened
        var stats = fs.statSync(langFilePath);

        // load the file
        fileContent = fs.readFileSync(langFilePath, 'utf8');
        if (lang == 'en') {
          console.log('Current file (' + lang + '.json) content: ');
          console.log(fileContent);
          console.log('Try entering a language code.');
          console.log('For example: node _helper.js en');
          if (!metricsOnly) { generateMetrics(); }
          return;
        }
      }
      catch (e) {
        if (!metricsOnly) {
          console.log('we will create the file: ' + langFilePath);
        }
        // If there is no current file, we will create it
      }

      try {
        if (fileContent != undefined) {
          var jsonParsed = JSON.parse(fileContent);
          translatedKeys.push.apply(
            translatedKeys, Object.keys(JSON.parse(fileContent).translated));
          var combinedContent = jsonParsed.translated;
          if ('untranslated' in jsonParsed) {
            for (var untranslated_key in jsonParsed.untranslated) {
              combinedContent[untranslated_key] = jsonParsed.untranslated[untranslated_key];
            }
          }
          if ('other_translations' in jsonParsed) {
            for (var other_key in jsonParsed.other_translations) {
              combinedContent[other_key] = jsonParsed.other_translations[other_key];
            }
          }
          var count = Object.keys(combinedContent).length;
          if (!metricsOnly) {
            console.log('Loaded file ' + lang + '.json with ' + count + ' items.');
          }

          Object.keys(combinedContent).sort(localeSort).forEach(function (key) {
            ordered[key] = combinedContent[key];
          });
        }
      } catch (e) {
        if (!metricsOnly) {
          console.log('file: ' + langFilePath + ' contains an error: ' + e);
        }
        // If there is an error with the current file content, abort
        return;
      }

      // For debugging
      var debug = process.argv[3];
      var debugOption = process.argv[4];

      // merge new tags with existing translation
      var untranslated = {};
      var translated = {};
      var other_translations = {};
      var existing = 0;
      // all current tags in English
      Object.keys(jsonCurrentTagData).sort(localeSort).map(function (key) {
        untranslated[key] = jsonCurrentTagData[key];
        if (debug) {
          untranslated[key] = replaceWithDebugString(key, debug, debugOption);
        }
      });
      for (var key in ordered) {
        // replace current tag with an existing translation
        if (untranslated.hasOwnProperty(key)) {
          existing++;
          if ((key !== ordered[key]) || translatedKeys.includes(key)) {
            delete untranslated[key];
            translated[key] = ordered[key];
            if (debug) {
              translated[key] = replaceWithDebugString(key, debug, debugOption);
            }
          }
        }
        // if the tag doesn't exist but a translation exists,
        // put the key/value at the end of the json
        else {
          other_translations[key] = ordered[key];
        }
      }

      var summaryData = generateSummary({
        langCode: lang, untranslated: untranslated,
        foundTags: jsonCurrentTagData, unmatchedTags: other_translations,
        translated: translated, countExisting: existing,
        metricsOnly: metricsOnly
      });
      if (metricsOnly) { metrics.push(summaryData); }

      var jsonContent = {
        translated: translated,
        untranslated: untranslated,
        other_translations: other_translations,
      };
      var stringJson = JSON.stringify(jsonContent, null, 2);
      stringJson += '\n';

      if (!metricsOnly) { fs.writeFileSync(langFilePath, stringJson); }
    } catch (e) {
      if (!metricsOnly) {
        console.log('file: ' + langFilePath + '. error append: ' + e);
      }
    }
    if (!metricsOnly) { generateMetrics(); }
  }

  // public functions
  return {
    logAllTags: logAllTags,
    getAllTags: getAllTags,
    createOrUpdateTranslationFile: createOrUpdateTranslationFile
  };
})();

// Need to run this cmd in this folder: node _helper.js
var language = process.argv[2];
HelperNamespace.createOrUpdateTranslationFile(language, false);
