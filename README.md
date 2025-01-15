# @lowclouds/logtag
Tagged logging that is always available

Note: if you started with the 0.1.0 version, please use this version instead to avoid some invisible failures.

Do you hate having to comment and uncomment log calls when trying to debug? If so, then this library is for you. It allows you to define tags, which you can individually set or clear from the console while your code is running in a browser. If your code is on the server, well maybe you can hack this to make it work there; I don't know.

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
LogTag.log(logInfo, [COMP1_AREA1, AFILE_TAGMIDDLE, TRTL_CONTOURS]);
   or
LogTag.log(logInfo, COMP1_AREA1, AFILE_TAGMIDDLE, TRTL_CONTOURS);
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
Well, if you're a purist, we can still get along, but you might not be all that happy about this. LogTag.init(), by default, will put two properties into the global namespace, '**LogTag**', and '**puts**'. These will be **immutable, enumerable constants**. Inserting them in the global scope is the only way you'll be able to access them from the console. 

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

You can use an empty component_name, if you like, in which case the leading "_" is removed from tag_name.

The generated tags are also immutable constants, so, if you're using HMR and you redefine the tags in a file that gets replaced, it will break when trying to redefine the constants. You'll need to reload the whole shebang.

By default, the tags are injected into the global namespace, but using the LogTag.init() options above, you can modify that. Morever, you can directly supply any object as the scope for the generated tags. This is used internally to add ALLOF to the LogTag object.

### LogTag.log(stuff, ...tags)

This function tests whether the tags are set and if so, calls console.log(stuff)

**tags** are optional. If not supplied, the call devolves to console.log(stuff).

### LogTag.set(...tags)

LogTag.set accepts an arbitrary number of tags as arguments and then sets them. Sets, as in ors them into a BigInt. 

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

**areSet** will test if all of an array of tags are set

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

When areSet is operating in ALLOF mode, all tags in the log statement must be set before the log happens. This is mostly obscure, but you might find a use for it. To use ALLOF mode, do this:

```js
LogTag.set(LogTag.ALLOF);       // turn it on programmatically, or on console.

puts('intricately related log', [COMPLICATED_A, COMPLICATED_C, OTHER_THING1]);

LogTag.clear(LogTag.ALLOF);     // turn it off programmatically, or on console.
```

Alternately, you can put the ALLOF tag directly in the log statement. Here, it works slightly differently: all tags following LogTag.ALLOF must be set if the log hasn't fired by the time it processes the LogTag.ALLOF tag. Example:

```js
puts(interesting_info, [TRTL_SETTINGS, LogTag.ALLOF, NTRP_PROGRESS, NTRP_SETTINGS]);
```
This will log if TRTL_SETTINGS is set, but if not, then only if NTRP_PROGRESS **and** NTRP_SETTINGS are set. Obviously, putting LogTag.ALLOF first in the list of tags will make it operate just like setting LogTag.ALLOF globably. Note that LogTag.ALLOF does not have to be set in this case, its mere presence turns the mode on or off for this one log statement. Indeed, if you use it in the log statement, then it usually **should not** be set.

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

I haven't totally figured out how to make macros work in Javascript, yet, but I do have a working version of a 'puts' Babel plugin macro that will produce this transformation at build time. Still working out how to put it into an  existing project.

 There is also an old cpp.js library that will support this macro, and that is why LogTag.log() takes only two args, instead of a bunch of args. cpp.js does not support variadic macros - it barely supports function macros. Anyway, if you want to use this functionality, but lose it in production code, I'd recommend looking into cpp.js.

With respect to speed, the first try at this library using Uint32 ArrayBuffers had a fundamental flaw that limited you to 5 components with 32 tags each, and it failed silently when exceeding that limit. For that reason, this current version uses BigInts which I have used successfully, but still with fewer overall tags. Since BigInt operations aren't constant time, you could get some performance degradation using many (large) tags. I haven't quantified the penalty. It would be straight-foreward to create a correct, and constant time, version with the penalty of more complex tags or limited tags. Two possible notions each requiring separate component and area parameters:

```js
   LogTag.log(stuff, component, ...tags)

// or

   LogTag.log(stuff, ...tags)

// where each tag is either an object or array containing:

   {component: ckey, tag: areaBit}

// or maybe

   [component, ...tags]
```

These would be a bit clumsier to type, and to parse using a macro, but could actually support a large number of components and still be pretty speedy. 
