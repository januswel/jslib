/*
 * html-template.js
 * Last Change: 2014 Aug 02.
 *
 * LICENSE
 *  New BSD License: http://opensource.org/licenses/bsd-license.php
 *
 *  Copyright (c) 2009, janus_wel<janus.wel.3@gmailcom>
 *  All rights reserved.
 *
 *  Redistribution and use in source and binary forms, with or
 *  without modification, are permitted provided that the following
 *  conditions are met:
 *
 *      * Redistributions of source code must retain the above
 *        copyright notice, this list of conditions and the
 *        following disclaimer.
 *      * Redistributions in binary form must reproduce the above
 *        copyright notice, this list of conditions and the following
 *        disclaimer in the documentation and/or other materials
 *        provided with the distribution.
 *      * Neither the name of the <ORGANIZATION> nor the names of its
 *        contributors may be used to endorse or promote products
 *        derived from this software without specific prior written
 *        permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND
 *  CONTRIBUTORS "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES,
 *  INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 *  MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 *  DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS
 *  BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED
 *  TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 *  DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 *  ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 *  OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY
 *  OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 *  POSSIBILITY OF SUCH DAMAGE.
 *
 *
 * SYNOPSIS
 *  This module is the emulation of Perl HTML::Template with E4X, so work with Firefox3 only.
 *
 *      refer: http://search.cpan.org/~samtregar/HTML-Template-2.9/Template.pm
 *
 *
 * USAGE
 *  - To get object.
 *
 *      var ht = HTMLTemplateFactory();
 *      var ht = HTMLTemplateFactory(template); // with template assignment
 *
 *  - To set template.
 *
 *      ht.template(template);
 *
 *  - To generate output.
 *
 *      var result = ht.output(data);
 *
 *  - You can use another data to template seted previously.
 *    this way is faster than setting template each time.
 *
 *      var anotherResult = ht.output(anotherData);
 *
 *  - Above sequense is chainable.
 *
 *      var result = HTMLTemplateFactory(template).output(data);
 *
 *
 * EXAMPLE
 *  // Template definition. It's easy to use CDATA section like below.
 *  var template = <><![CDATA[
 *  <table>
 *      <caption><TMPL_VAR NAME="caption" /></caption>
 *      <thead>
 *          <tr>
 *              <td>No.</td>
 *              <td>Name</td>
 *              <td>Description</td>
 *          </tr>
 *      </thead>
 *      <tbody>
 *          <TMPL_LOOP NAME="tableList">
 *          <tr>
 *              <td><TMPL_VAR NAME="name" /></td>
 *              <td><TMPL_VAR NAME="description" /></td>
 *          </tr>
 *          </TMPL_LOOP>
 *      </tbody>
 *  </table>
 *  ]]></>;
 *
 *  // Data definition.
 *  var data = {
 *      caption: 'actual person is not related this data',
 *      tableList: [
 *          {
 *              name:        'Larry',
 *              description: 'funny uncle',
 *          },
 *          {
 *              name:        'Matz',
 *              description: 'evangelist',
 *          },
 *          {
 *              name:        'Stroustrup',
 *              description: 'craftsman',
 *          },
 *      ],
 *  };
 *
 *  // Generate.
 *  var result = HTMLTemplateFactory(template).output(data);
 *
 * */

function HTMLTemplateFactory(template) {
    // stuff functions ---
    // TMPL_LOOP
    function tmplLoop(data, action) {
        var result = <></>;
        for (var i=0, l=data.length ; i<l ; ++i) result += action(data[i]);
        return result;
    }
    // TMPL_IF, TMPL_ELSE
    function tmplIf(flag, trueAction, elseAction) {
        if (flag) return trueAction();
        else if (elseAction) return elseAction();
        return '';
    }
    // TMPL_UNLESS, TMPL_ELSE
    function tmplUnless(flag, action, elseAction) {
        if (!flag) return action();
        else if (elseAction) return elseAction();
        return '';
    }

    // stuff class ---
    // prefix operation
    function Prefix() {
        this.level = 0;
        this._make(this.level);
        this.root = this.name;
    }
    Prefix.prototype = {
        raise: function () {
            this._make(++this.level);
            return this.name;
        },
        cut: function () {
            this._make(--this.level);
            return this.name;
        },
        _make: function (level) { this.name = 'p' + level.toString(10); },
    }

    // constants ---
    const tmplRegExp = new RegExp(
        '(?:' + [
            '<TMPL_(?:LOOP|IF|UNLESS)\\s+NAME="\\w+">',
            '<\\/TMPL_LOOP>',
            '<TMPL_VAR\\s+NAME="\\w+"\\s+\\/>',
        ].join('|') + ')'
    );

    // private variables ---
    var privateTemplate;
    var privateFunction;
    var isConverted = false;

    // private methods ---
    function convertToFunction() {
        if (!privateTemplate) return;
        if (isConverted && privateFunction) return privateFunction;

        // preprocess to process line oriented
        // in passing, replace stateless token
        var lines = privateTemplate.toString()
                                   .replace(/<TMPL_ELSE>/g, '</>;}, function () { return <>')
                                   .replace(/<\/TMPL_(?:IF|UNLESS)>/g, '</>;})}')
                                   .split(/\n/);

        var p = new Prefix();
        var replaced = [];
        for (var i=0, l=lines.length ; i<l ; ++i) {
            var line = lines[i];
            while (tmplRegExp.test(line)) {
                // prefix is change by TMPL_LOOP
                line = line.replace(/<TMPL_LOOP NAME="(\w+)">/, function (_, arrayName) {
                    return ['{tmplLoop(', p.name, '.', arrayName, ', function (', p.raise(), ') { return <>'].join('');
                });
                line = line.replace(/<\/TMPL_LOOP>/, function () {
                    p.cut();
                    return '</>;})}';
                });

                // TMPL_IF, TMPL_UNLESS, TMPL_VAR is statefull
                line = line.replace(/<TMPL_IF NAME="(\w+)">/, function (_, boolName) {
                    return ['{tmplIf(', p.name, '.', boolName, ', function () { return <>'].join('');
                });
                line = line.replace(/<TMPL_UNLESS NAME="(\w+)">/, function (_, boolName) {
                    return ['{tmplUnless(', p.name, '.', boolName, ', function () { return <>'].join('');
                });
                line = line.replace(/<TMPL_VAR NAME="(\w+)" \/>/, function (_, variableName) {
                    return ['{', p.name, '.', variableName, '}'].join('');
                });
            }

            replaced.push(line);
        }

        // build template function by Function constructor
        privateFunction = Function(
            p.root,
            'tmplLoop',
            'tmplIf',
            'tmplUnless',
            ['return <>', replaced.join("\n"), '</>;'].join('')
        );

        // set convert flag
        isConverted = true;

        return privateFunction;
    }

    // main class definition ---
    function HTMLTemplate() { this.initialize.apply(this, arguments); }
    HTMLTemplate.prototype = {
        initialize: function (tempalte) {
            if (template) privateTemplate = template;
            return this;    // for chainable
        },
        template: function (newTemplate) {
            privateTemplate = newTemplate;
            isConverted = false;
            return this;    // for chainable
        },
        output: function (data) {
            var f = convertToFunction();
            if (f instanceof Function) return f(data, tmplLoop, tmplIf, tmplUnless);
            else throw new Error('check template.');
        },
    };

    // generate and return object
    return new HTMLTemplate(template);

} // function HTMLTemplateFactory () {

// vim: sw=4 sts=4 ts=4 et
