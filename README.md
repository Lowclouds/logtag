# @lowclouds/logtag
Tagged logging that is always available

Do you hate having to comment and uncomment log calls when trying to debug? If so, then this library is for you. It allows you to define up to 255 'components', each with up to 32 tags, which you can individually set or clear from the console while your code is running in a browser. If your code is on the server, well maybe you can hack this to make it work there; I don't know.

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
```

When you run your code and it hits this line, nothing will log. Yay!

Now, from the console, enter, say:

```js
LogTag.set(TRTL_CONTOURS)
```
Note, that the defTags, above, created a global called, TRTL_CONTOURS, which you can use from the console.

The next time, and every time after, the code reaches the log, 'string log' will output to the console. When you're tired of seeing it, turn it off with:

```js
LogTag.clear(TRTL_CONTOURS)
/// or 
LogTag.clearAll();
```

Ok, those are the essentials of usage; how does this work?

## What nasty things are happening here?

### LogTag.init(optional_config)
Well, if you're a purist, we can still get along, but you might not be all that happy about this. LogTag.init(), by default, will put two properties into the global namespace, '**LogTag**', and '**puts**'. Not only that, but they will be **immutable constants**, but enumerable. That's the only way you'll be able to see them from the console. You can import LogTag into each file that uses it, but LogTag.init() should only be called once in your app. This is because every method is static and there is only one set of tags for the entire app. 

**optional_config** is an object with the following possibilities:

```js
let opts = {
   addLogTagToGlobalScope: boolean, // default true
   addTagsToGlobalScope: boolean,   // default true
   enablePuts: boolean,             // default true
}
```

If you set **addLogTagToGlobalScope** false, then you can't get to it from the console. I suppose, you could add a programming interface to access it. More later.

If you set **addTagsToGlobalScope** false, then the tags will be added to the LogTag object. This will keep your global namespace cleaner, but you'll have longer tag names on the console and in your program, i.e. LogTag.TRTL_CONTOURS. If addLogTagToGlobalScope is false, this happens automatically.

And '**puts**', what is that. It's simply aliased to 'console.log'. I used to program in TCL, so you can write:

```js
puts(my_log, TRTL_INIT); 
```

### LogTag.defTags(component_name, string_array_of_tag_names)
Note, too, that, again, by default, every tag is also injected into the global namespace. Horrors. This means you should also choose your component and tag names carefully.

The LogTag.defTags method creates variables by gluing the component name to the tag anme with an underscore, i.e. 

```js
complete_tagname = component_name + '_' + tag_name;
```
The generated tags are also immutable constants, so, if you're using HMR and you redefine the tags in a file that gets replaced, it will break when trying to redefine the constants. You'll need to reload the whole shebang. I might try to work around this.


### LogTag.log(stuff, [tags])

This function tests whether the tags are set and if so, calls console.log(stuff)

**tags** is optional. If not supplied, the call devolves to console.log(stuff).

If supplied, it must be an array of one or more tags as defined by defTags. Rationale for requiring an array is later under **Am I missing something?**, below.

### LogTag.set(...tags)

Contrary to defTags(...) and log(...), set accepts an arbitrary number of tags as arguments and then sets them. Sets as in ors them into a Uint32. In the original implementation of this, I used BigInts, but didn't really need the range per component, although I quickly overran 32bit integers. So this implementation uses Uint32Arrays with one Uint32 per component. Each component can then have 32 unique tags; if you need more per 'component', you'll need to break it into sections: 'PART1', ..., 'PARTN'. With 255 possible components, it should be enough for most mortals. 

On a side note, component zero is reserved for LogTag, which has a single tag, ALLOF, which is local to the LogTag object, i.e. LogTag.ALLOF. 31 whole bits and an array slot wasted! More later.

### LogTag.clear(...tag) or LogTag.clearAll()

Clear tags that are set, either singly, or all at once.

```js
LogTag.clear(TRTL_INIT, AFILE_TAGEND); // clear these two tags, if set
LogTag.clearAll();                     // clear all set tags
LogTag.clear();                        // ends up calling clearAll()
```
### LogTag.isSet(tag) or LogTag.areSet(tags)

Test tag to see if it is set. This is useful if you have to do a lot of work to create the log:
**areSet** will test if all of an array of tags are set

```js
if (LogTag.isSet(MY_BLOATEDTAG) {

   //.... do a bunch work to create result ...

   LogTag.log(result_value);
   // or really, just 
   console.log(result_value);
   // or, hey
   puts(result_value);
}
```

### What is LogTag.ALLOF ?

By default, if **any** tag in a log statement is set, the log happens. This is ANYOF mode, but since there are only two modes, ANYOF and ALLOF, we only need to turn one of them off or on. ALLOF it is.

When areSet is operating in ALLOF mode, all tags in the log statement must be set before the log happens. This is mostly obscure, but you might find a use for it. To us ALLOF mode, do this:

```js
LogTag.set(LogTag.ALLOF);       // turn it on programmatically, or on console.

puts('intricately related log', [COMPLICATED_A, COMPLICATED_C, OTHER_THING1]);

LogTag.clear(LogTag.ALLOF);     // turn it off programmatically, or on console.
```

Alternately, you can put the ALLOF tag directly in the log statement. Here, it works slightly differently: all tags following LogTag.ALLOF must be set if the log hasn't fired by the time it processes the LogTag.ALLOF tag. Example:

```js
puts(interesting_info, [TRTL_SETTINGS, LogTag.ALLOF, NTRP_PROGRESS, NTRP_SETTINGS]);
```
This will log if TRTL_SETTINGS is set, but if not, then only if NTRP_PROGRESS **and** NTRP_SETTINGS are set. Obviously, putting LogTag.ALLOF first in the list of tags will make it operate just like setting LogTag.ALLOF globably. In other words. LogTag.ALLOF does not have to be set in this case, its mere presence turns the mode on or off for this one log statement.

## Am I missing something?

Yes. This design started while debugging realtime firmware in printers, with three primary goals:

  * Isolation - when lots of things are happening quickly, limiting logs to exactly what you need is critical, both for understanding and to keep things from bogging down and breaking.
  * Speed - i.e. testing of tags should be quick
  * Ability to compile it away in production

The last two are related because a key part of the implementation was a macro that a) could be defined away, and b) performed the log tag tests before evaluating the string argument. In other words, the macro turned

```js
puts(info, [t1,t2,..., t3]);
/// into 
if (LogTag.areSet([t1,t2,...,t3]) {puts(info);}
```

I haven't figured out how to make macros work in Javascript, yet. There is an old cpp.js library that will support this macro, and that is why LogTag.log() takes only two args, instead of a bunch of args. cpp.js does not support variadic macros - it barely supports function macros. Anyway, if you want to use this functionality; but lose it in production code, I'd recommend looking into cpp.js. Or, better yet, tell me how to get Babel macros to work.
