
# @lowclouds/logtag
Tagged logging that is always available

Do you hate having to comment and uncomment log calls when trying to debug? If so, then this library is for you. It allows you to define up to 511 'components', each with up to 32 tags, which you can individually set or clear from the console while your code is running in a browser. If your code is on the server, well maybe you can hack this to make it work there; I don't know.

This provides two related but independent bits: the LogTag object which does the actual tagged logging, and a build-time macro that can make it more efficient or remove it entirely from the build. The logging part is described first, then the usage of the macro.

First, how to set up and use it.

## Set up and use

Install it in your project with npm
```sh
npm i @lowclouds/logtag
```
Somewhere near the beginning of your app import it, initialize it, and define your tags:
```js
import LogTag from "@lowclouds/logtag"
//....
LogTag.init();
```
Now, for each "component", however you'd like to think of that, maybe a file, or set of files, or a unified bit of functionality, define a set of tags. These correspond to specific logs that you'd like to enable or disable. One tag may be associated with many log statements, and one log statement may be enabled by one or more tags; or only by a specific set of tags. Anyway, before executing a log statement, define the tags like this:


```js
LogTag.defTags('COMP1', ['AREA1', 'AREA2', 'AREA3']);

LogTag.defTags('AFILE', ['TAGSTART', 'TAGMIDDLE', 'TAGEND']);

LogTag.defTags('TRTL', ['INIT', 'DRAW', 'SETTINGS', 'CONTOURS']);
```
The first argument to defTags is a string component name, and the second argument is an array of tag names. I like to keep them all relatively short, but that is personal preference. Now, wherever you have a debug log statement, you can replace it with the following:

```js
LogTag.log(logInfo, COMP1_AREA1, AFILE_TAGMIDDLE, TRTL_CONTOURS);
   or
LogTag.log(logInfo, [COMP1_AREA1, AFILE_TAGMIDDLE, TRTL_CONTOURS]);
```

When you run your code and it hits this line, nothing will log. Yay!

Now, from the console, enter, say:

```js
LogTag.set(TRTL_CONTOURS)
```
Note, that the defTags, above, created a global called, TRTL_CONTOURS, which you can use from the console.

The next time, and every time after, the code reaches the log, it will output to the console. When you're tired of seeing it, turn it off with:

```js
LogTag.clear(TRTL_CONTOURS)
/// or 
LogTag.clearAll();
```

Ok, those are the essentials of usage; how does this work?

## What nasty things are happening here?

### LogTag.init(optional_config)
Well, if you're a purist, we can still get along, but you might not be all that happy about this. LogTag.init(), by default, will put two properties into the global namespace, '**LogTag**', and '**puts**'. These will be **immutable, enumerable constants**. Inserting them in the global scope is the only way you'll be able to access them from the console. (I've done this using DBUS on embedded Linux apps, but you'd need a syslog, too.)

LogTag.init() should only be called once in your app. This is because every method is static and there is only one set of tags for the entire app.

**optional_config** is an object with the following possibilities:

```js
let opts = {
   addLogTagToGlobalScope: boolean, // default true
   addTagsToGlobalScope: boolean,   // default true
   enablePuts: boolean,             // default true
}
```

If you set **addLogTagToGlobalScope** false, then you can't get to it from the console. I suppose, you could add a programming interface to access it from a web page.

If you set **addTagsToGlobalScope** false, then the tags you create will be added to the LogTag object. This will keep your global namespace cleaner, but you'll have longer tag names on the console and in your program, i.e. LogTag.TRTL_CONTOURS. If addLogTagToGlobalScope is false, this happens automatically.

And '**puts**', what is that. It's simply aliased to 'LogTag.log'. I used to program in TCL. Anyway you can write:

```js
puts(my_log, TRTL_INIT); 

  ===

LogTag.log(my_log, TRTL_INIT);
```

### LogTag.defTags(component_name, string_array_of_tag_names, scope=theGlobalObject)
Once again, by default, every tag is also injected into the global namespace. Horrors. This means you should also choose your component and tag names carefully. On a side note, having used this technique for 30 years or more, having a single space for all the logtags has proven useful more than once: it's often difficult to track down what the root of a problem is. Turning on tags in multiple interacting parts of code, without flooding yourself with ocean liners of text is so much better than LOGLEVEL=DEBUG.

The LogTag.defTags method creates variables by gluing the component name to the tag name with an underscore, i.e. 

```js
complete_tagname = component_name + '_' + tag_name;
```

LogTag itself creates a component with an empty component_name, which is component zero. You can define tags in this component by supplying an empty component name. There are only 31 available tags in this component because LogTag.ALLOF uses the first tag bit.

Since the generated tags are also immutable constants, if you're using HMR and you redefine the tags in a file that gets replaced, it will break when trying to redefine the constants. You'll need to reload the whole shebang.

You can prevent injecting tags into the global namespace by using the LogTag.init() options above. Morever, you can directly supply any object as the scope for the generated tags. This is used internally to add ALLOF to the LogTag object.

### LogTag.log(stuff, ...tags)

This function tests whether the tags are set and if so, calls console.log(stuff)

**tags** are optional. If not supplied, the call devolves to console.log(stuff).

### LogTag.set(...tags)

LogTag.set accepts an arbitrary number of tags as arguments and then sets them. Sets, as in ORs them into a Uint32Array element. 

**Note**, it is more efficient to supply  tags as separate parameters, although it will accept an array of tags. This applies for clear, isSet, areSet, and log methods also. defTags, above requires an array of tags.

 The single tag defined by LogTag is ALLOF, which is always local to the LogTag object, i.e. LogTag.ALLOF. 

### LogTag.clear(...tag) or LogTag.clearAll()

Clear tags that are set, either singly, or all at once.

```js
LogTag.clear(TRTL_INIT, AFILE_TAGEND); // clear these two tags, if set
LogTag.clearAll();                     // clear all set tags
LogTag.clear();                        // ends up calling clearAll()
```
### LogTag.isSet(tag) or LogTag.areSet(...tags)

Test tag to see if it is set. This is useful if you have to do a lot of work to create the log.

**areSet** will test if **any** of the tags are set, but see ALLOF, below.

```js
if (LogTag.isSet(MY_BLOATEDTAG) {

   //.... do a bunch work to create result ...

   LogTag.log(result_value);
   // or, hey
   puts(result_value);
   // or really, just 
   console.log(result_value);
}
```

### What is LogTag.ALLOF ?

By default, if **any** tag in a log statement is set, the log happens. This is ANYOF mode, but since there are only two modes, ANYOF and ALLOF, we only need to turn one of them off or on. ALLOF it is.

When areSet is operating in ALLOF mode, **all** tags in the log statement must be set before the log happens. This is mostly obscure, but you might find a use for it. To use ALLOF mode, do this:

```js
LogTag.set(LogTag.ALLOF);       // turn it on programmatically, or on console.

puts('intricately related log', [COMPLICATED_A, COMPLICATED_C, OTHER_THING1]);

LogTag.clear(LogTag.ALLOF);     // turn it off programmatically, or on console.
```

Alternately, you can put the ALLOF tag directly in the log statement. Here, it works slightly differently: all tags following LogTag.ALLOF must be set if the log hasn't fired by the time it processes the LogTag.ALLOF tag. 
Example:

```js
puts(interesting_info, [TRTL_SETTINGS, LogTag.ALLOF, NTRP_PROGRESS, NTRP_SETTINGS]);
```
This will log if TRTL_SETTINGS is set, but if not, then only if NTRP_PROGRESS **and** NTRP_SETTINGS are set. Obviously, putting LogTag.ALLOF first in the list of tags will make it operate just like setting LogTag.ALLOF globably. Note that LogTag.ALLOF does not have to be set in this case, its mere presence turns the mode on or off for this one log statement. Indeed, if you use it in the log statement, then it usually **should not** be set.

# The puts macro
When you install logtag, its dependencies will pull in the chunks of babel needed to use the macro. If you download the project from github, you'll need node v22 to run the macro tests.

**Important: create a babel.config.json file!!!**

There is a sample-babel-config.json file in the package directory which you can copy and rename into your project root, or use it as a template to modify existing your babel config. If you forget this step, **nothing** will happen.

## Configuration
This is installed alongside logtag.js as puts.macro. puts.macro is a babel-plugin-macro which can morph the puts(...) call at build time to optimize the test, to swap out either the test or the log function, or to remove the entire call. It supports the following options:

    * testFn: <string> defaults to 'LogTag.areSet',
    * logFn: <string> defaults to 'console.log',
    * doRemove: <boolean> defaults to false

These are set in your babel.config.js file like so:

```js
  ...
   plugins: [
      {
         "macros", puts: {doRemove: false, testFn: 'LogTag.areSet', logFn: 'console.log'},
      },
   ],
...
```
Configuration can be done in webpack.config.js, too. Not sure how other bundlers deal with babel.

## Usage

### Default 
To use the macro in a file where you have puts(....) calls, insert

```js
import {puts} from '@lowclouds/logtag/puts.macro' 
  ...
puts('useful info', MY_TAG);
  ...   
```
By default, every puts call will be transformed into this:

```js
LogTag.areSet(tags...) ? console.log('useful info') : void 0;
```
### Specify a different log function

If you configure the log function to be say, {logFn: 'myLogger'}, then you will get this, instead:

```js
LogTag.areSet(tags...) ? myLogger('useful info') : void 0;
```
### Specify a different test function
Likewise, setting {testFn: 'myTest'} will give you:

```js
myTest(tags...) ? console.log('useful info') : void 0;
```
Your test function will be passed in the 'tag' arguments, over which you have complete control.  **Note** that the puts macro is completely separate from the LogTag object - it just looks for a call expression named 'puts' - so you can implement whatever testing, tagging, and logging functions you want as long as you call it with 'puts(...)' and have a test and log function.

### Remove from output entirely

Finally, setting {doRemove: true} will remove the entire statement from the generated file.

### Manual testing

From the command line, you can invoke 
```js
npx ./node_modules/.bin/babel yourSrc --out-dir somepath
```
to transform the file(s) for inspection.

## Am I missing something?

Yes. This design started while debugging realtime firmware in printers, with three primary goals:

  * Isolation - when lots of things are happening quickly, limiting logs to exactly what you need is critical, both for understanding and to keep things from bogging down and breaking.
  * Speed - i.e. testing of tags should be quick
  * Ability to compile it away in production

The last two are related because a key part of the implementation was a macro that 

   * could be defined away, and 
   * performed the log tag tests before evaluating the log value. In other words, the macro turned

```js
puts(info, [t1,t2,..., t3]);
/// into 
if (LogTag.areSet([t1,t2,...,t3]) {puts(info);}
// which is clumsy to type in every time
```

It's still true, that I don't know how to integrate into arbitrary build environments, but babel will correctly transform the files. I'm hoping you'll tell me how to configure this for your build and I'll include that info here.

With respect to speed, the first try at this library using Uint32 ArrayBuffers had a fundamental flaw that limited you to 5 components with 32 tags each, and it failed silently when exceeding that limit. The second version, 0.2.0 used a BigInt implementation. Version 0.3.0 reverts to using a working version of Uint32Array buffers, with up to 511 components, and is nearly 4x faster than the straight BigInt version. 

This version is slightly slower than the 0.3.1 because of support for both arrays of tags or separate tag parameters in the method calls. It is more robust and forgiving, though, and the penalty is small (on the order of 0.00001 sec/call, so once again: since the external interface is backward compatible, I recommend using this version.

