
// here are the goods
export default class LogTag {
  static #config;
  static #tagSet = 0n;
  static #nextTag = 1n;
  static #tagScope;
  static theGlobalObject;
  static  {
    function check(it) {
      // Math is known to exist as a global in every environment.
      return it && it.Math === Math && it;
    }
    this.theGlobalObject = check(typeof window === "object" && window) || check(typeof self === "object" && self) || check(typeof global === "object" && global) ||
          // This returns undefined when running in strict mode
          function () {
            return this;
          }() || Function("return this")();
    this.#tagScope = this.theGlobalObject;
    this.#config = {
      addLogTagToGlobalScope: true,
      addTagsToGlobalScope: true,
      enablePuts: true
    };
  }

  // only call this once, ok. it will fail if called again
  // decide where to put LogTag itself and any created tags.
  // the default is to hang LogTag and all tags off the global object. however, 
  // you can add LogTag the global scope and hang all the tags off of LogTag
  // if you don't want to pollute the global namespace.
  // if you don't make LogTag global, you'll probably need to provide a programmatic
  // interface, rather than the console, which is where it began.
  static init(opts = {}) {
    let makeLTGlobal = opts?.addLogTagToGlobalScope === undefined ? LogTag.#config.addLogTagToGlobalScope : opts.addLogTagToGlobalScope;
    LogTag.#config.addTagsToGlobalScope = opts?.addTagsToGlobalScope === undefined ? makeLTGlobal : opts.addTagsToGlobalScope;
    LogTag.#tagScope = LogTag.#config.addTagsToGlobalScope ? LogTag.theGlobalObject : LogTag;
    let enablePuts = opts?.enablePuts === undefined ? LogTag.#config.enablePuts : opts.enablePuts;

    if (makeLTGlobal) {
      Object.defineProperty(LogTag.theGlobalObject, "LogTag", {
        value: LogTag, 
        writable: false, 
        configurable: false,
        enumerable: true
      });
    }

    if (enablePuts) {
      //console.log('puts is enabled');
      if (typeof puts === 'undefined') {
        Object.defineProperty(LogTag.theGlobalObject, "puts", {
          value: LogTag.log, 
          writable: false, 
          configurable: false,
          enumerable: true
        });
      }
    } // else {
    //   console.log('puts is NOT enabled');
    // }
    // we could just declare the static value, but this also makes it immutable
    // and creates the initial zeroth component reserved for LogTag
    LogTag.defTags('', ['ALLOF'], LogTag); // LogTag.ALLOF
  }

  static set(...tags) {

    for (const tag of tags) {
      LogTag.#tagSet |= BigInt(tag);  // set bit
    }
    //console.log( `LogTag.#tagSet == ${LogTag.#tagSet}`)  // set bit
  }

  static clear(...tags) {
    if (tags.length) {
      for (const tag of tags) {
        LogTag.#tagSet &= ~BigInt(tag);  // clear bit
      }
    } else {
      LogTag.#tagSet = 0n;
    }
  }

  static clearAll() {
    LogTag.#tagSet = 0n;
  }

  static isSet(tag) {
    return (BigInt(tag) & LogTag.#tagSet) != 0n;
  }

  static areSet(tags) {
    let modeAll = !!LogTag.isSet(LogTag.ALLOF);
    tags = tags.flat();
    for (let i = 0; i < tags.length; i++) {
      //       console.log(`in areSet looking at tag: ${tag}, modeALL: ${modeAll}`);
      const tag = BigInt(tags[i]);
      if (tag == LogTag.ALLOF) {
        modeAll = true;     // all  following tags must be set
        continue;
      } else if (LogTag.isSet(tag)) {
        if( !modeAll) return true;
      } else if (modeAll) {
        return false;
      }
    };
    // console.log('in areSet: done looking at tags')
    // if modeAll is true, any false above returns false, so all tests were true
    // if modeAll is false, then any true above returns true, so all tests must have failed
    return modeAll;
  }

  // doesn't seem to be a way to avoid evaluating o. oh well
  static log(o, ...tags) {
    //      console.log(`log: tags are: ${tags}`);
    if (tags.length == 0 || LogTag.areSet(tags)) {
      console.log(o);
    }
  }

  // component: a string name of the component
  // tags: an array of tag names
  // scope: optional object scope for generated tags, default is the global scope
  // --------------------------------------------------------------------------------
  // for each tagname in tags generate the property and value, making it a [global] constant
  // 
  static defTags(component, tags, scope = LogTag.#tagScope) {
    if (!(typeof component === 'string')) {
      throw new TypeError('component name is not a string', 'LogTag.defTags');
    }
    if (tags.length < 1 ) {
        throw new RangeError(`Wrong number of tags, (${tags.length}), must be >= 1` , 'logtag.js#defTags')
    }

    let map = {};
    tags.forEach( (tag, indx) => { 
      if (! (typeof tag === 'string')) {
          throw new TypeError('tag names must be strings', 'logtag.js#defTags');
      }
      // LogTag.tag instead of LogTag._tag
      let prefix = (component + '_' === '_') ? '' : component + '_'; 
      map[prefix + tag] = LogTag.#nextTag;
      LogTag.#nextTag *= 2n;
    });
    //console.log(`creating classConsts: ${JSON.stringify(map)}`);
    classConst(scope, map);
  }
}


// a sanitized and limited version of classConst
// this will never overwrite an existing property/object
// and it will only accept integer numbers or bigints as values
function classConst (obj, map) {
   Object.keys(map).forEach(key => {
      if (! (typeof obj[key] === 'undefined')) {
         // should we throw or just warn and skip
         //throw new Error(`key, ${key} already exists for object - won't redefine it`, 'logtag.js#classConst');
         console.warn(`key, ${key} already exists for object - won't redefine it`, 'logtag.js#classConst');
      } else {
         let val = map[key];
         if (! ((typeof val === 'number' && Number.isInteger(val)) || typeof val === 'bigint')) {
            throw new Error('key value is not a valid integer Number or BigInt', 'logtag.js#classConst');
         }
         Object.defineProperty(obj, key, {
            value: val,
            writable: false,
            enumerable: true,
            configurable: true
         });
      }
   });
}

