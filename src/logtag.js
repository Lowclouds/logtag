
function check(it) {
   // Math is known to exist as a global in every environment.
   return it && it.Math === Math && it;
}

const theGlobalObject =
      check(typeof window === "object" && window) ||
      check(typeof self === "object" && self) ||
      check(typeof global === "object" && global) ||
      // This returns undefined when running in strict mode
      (function () {
         return this;
      })() ||
      Function("return this")();

const maxComponents = 256;
const tagsPerComponent = 32;
const bytesPerComponent = 4;

// here are the goods
export default class LogTag {
   static #components = [];
   static #buffer = new ArrayBuffer(0, {maxByteLength: bytesPerComponent * maxComponents});
   static #tagSets = new Uint32Array(LogTag.#buffer);
   static #tagScope = theGlobalObject;
   static #config = {
      addLogTagToGlobalScope: true,
      addTagsToGlobalScope: true,
      enablePuts: true
   }

   // only call this once, ok. it will fail if called again
   // decide where to put LogTag itself and any created tags.
   // the default is to hang LogTag and all tags off the global object. however, 
   // you can add LogTag the global scope and hang all the tags off of LogTag
   // if you don't want to pollute the global namespace.
   // if you don't make LogTag global, you'll probably need to provide a programmatic
   // interface, rather than the console, which is where it began.
   static init (opts = {}) {
      let makeLTGlobal = 
          (opts?.addLogTagToGlobalScope === undefined) ? LogTag.#config.addLogTagToGlobalScope : opts.addLogTagToGlobalScope;
      LogTag.#config.addTagsToGlobalScope = 
         (opts?.addTagsToGlobalScope === undefined) ? makeLTGlobal : opts.addTagsToGlobalScope;
      LogTag.#tagScope = (LogTag.#config.addTagsToGlobalScope) ? theGlobalObject : LogTag;

      let enablePuts = (opts?.enablePuts === undefined) ? LogTag.#config.enablePuts : opts.enablePuts;

      if (makeLTGlobal) {
         Object.defineProperty(theGlobalObject, "LogTag", {
            value: LogTag, 
            writable: false, 
            configurable: false,
            enumerable: true
         });
      }

      if (enablePuts) {
         if (! (typeof puts === undefined)) {
            Object.defineProperty(theGlobalObject, "puts", {
               value: LogTag.log, 
               writable: false, 
               configurable: false,
               enumerable: true
            });
         }
      }
      // we could just declare the static value, but this also makes it immutable
      // and creates the initial zeroth component reserved for LogTag
      LogTag.defTags('', ['ALLOF'], LogTag); // LogTag.ALLOF
   }

   static set(...tags) {

      for (const tag of tags) {
        // if (tag == LogTag.ALLOF) {
         let cmpnt = tag & 255
         let effectiveTag = tag >> 8;
         //console.log('in set, setting tag: ' + tag + ', cmpnt: ' + cmpnt + ', eff tag: ' + effectiveTag);
         if (! (typeof LogTag.#components[cmpnt]) === 'string') {
            throw new Error(`unknown component: ${cmpnt} in tag, ${tag}`, 'logtag.js#set');
         }
         LogTag.#tagSets[cmpnt] |= effectiveTag;  // set bit
      }
   }
   static clear(...tags) {
      if (tags.length) {
         for (const tag of tags) {
            let cmpnt = tag & 255;
            let effectiveTag = tag >> 8
            if (! (typeof LogTag.#components[cmpnt] === 'string')) {
               throw new Error(`unknown component: ${cmpnt} in tag, ${tag}`, 'logtag.js#clear');
            }
            LogTag.#tagSets[cmpnt] &= ~effectiveTag;  // clear bit
         }
      } else {
         LogTag.clearAll();
      }
   }

   static clearAll() {
      for (let c = 0; c < LogTag.#components.length; c++) {
         LogTag.#tagSets[c] = 0;
      }
   }

   static isSet(tag) {
      let cmpnt = tag & 255;
      let effectiveTag = tag >> 8;

//      console.log(`component: ${cmpnt}, effectiveTag: ${effectiveTag}, isSet: ${!! effectiveTag & LogTag.#tagSets[cmpnt]}`);

      if (! typeof LogTag.#components[cmpnt] === 'string') {
         throw new Error(`unknown component with key: ${cmpnt} and tag, ${tag}`, './src/logtag.js');
      }
      return (effectiveTag & LogTag.#tagSets[cmpnt]) != 0;
   }

   static areSet(tags) {
      let modeAll = !!LogTag.isSet(LogTag.ALLOF);

      for (let i = 0; i < tags.length; i++) {
         let tag = tags[i];

//       console.log(`in areSet looking at tag: ${tag}, modeALL: ${modeAll}`);

         if (tag == LogTag.ALLOF) {
            modeAll = true;     // all  following tags must be set
            continue;
         } else {
            if (LogTag.isSet(tag)) {
//               console.log(`${tag} is set, !modeAll is ${! modeAll}`);
               if (! modeAll) {return true;}
            } else {
//               console.log(`${tag} is not set, modeAll is ${!!modeAll}`);
               if (!! modeAll) {return false;}
            }
         }
      };
//      console.log('in areSet: done looking at tags')
      // if modeAll is true, any false above returns false, so all tests were true
      // if modeAll is false, then any true above returns true, so all tests must have failed
      return modeAll;
   }

   // doesn't seem to be a way to avoid evaluating o. oh well
   static log(o, tags=[]) {
//      console.log(`log: tags are: ${tags}`);
      if (tags && !Array.isArray(tags)) tags = [tags];
      if (tags.length == 0 || LogTag.areSet(tags)) {
         console.log(o);
         return true;
      }
      return false;
   }

   // returns component key for name, 
   // aka, array index of component
   static #getComponent(name) {

      //console.log(`in getComponent with name: ${name}`);

      let cmpnts = LogTag.#components;
      if (cmpnts.length === maxComponents) {
         return maxComponents;
      }
      let indx = cmpnts.indexOf(name);

//      console.log(`in getComponent with name: ${name}, indx: ${indx}`);

      if (indx === -1) {
         let abuf = LogTag.#buffer;
         cmpnts.push(name);
         abuf.resize(abuf.byteLength + bytesPerComponent);
         indx = cmpnts.length -1;
//         console.log(`added component name: ${name}, indx: ${indx}, cmpnts length: ${cmpnts.length}`);
      } 
      return indx;
   }
   // component: a string name of the component
   // tags: an array of tag names
   // scope: optional object scope for generated tags, default is the global scope
   // --------------------------------------------------------------------------------
   // for each tagname in tags generate the property and value, making it a [global] constant
   // Optionally, and invisibly, add component to components, get its value, 0<=v<maxComponents,
   // 
   // @TODO: keep track of tag names or, at least, count of defined tags/component
   // in order to support live adding of new tags - eh, seems unlikely, but... maybe with HMR...
   static defTags(component, tags, scope=LogTag.#tagScope) {
      if (! typeof component === 'string') {
         throw new TypeError('component name is not a string', 'LogTag.defTags');
      }
      let componentKey = LogTag.#getComponent(component);
      switch (componentKey) {
      case maxComponents:
         throw new RangeError(`Can't add component: there are already ${maxComponents}`, 'LogTag.defTags');
      default:
         if (tags.length < 1 || tags.length > 32) {
            throw new RangeError(`Wrong number of tags, (${tags.length}), must be >= 1 and <= 32`, 'logtag.js#defTags')
         }
         const offset = 8;        // first byte is reserved for component ==> 256 components
         let map = {};
         tags.forEach( (tag, indx) => { 
            if (! (typeof tag === 'string')) {
               throw new TypeError('tag names must be strings', 'logtag.js#defTags');
            }
            // LogTag.tag instead of LogTag._tag
            let prefix = (component + '_' === '_') ? '' : component + '_'; 
            map[prefix + tag] = componentKey | (2**(indx+offset)); 
         });
         classConst(scope, map);
      }
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

